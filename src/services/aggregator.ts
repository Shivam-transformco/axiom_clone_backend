import { InMemoryCache } from '../cache/InMemoryCache';
import { RedisCache } from '../cache/RedisClient';
import { listGeckoSolanaTokens } from '../datasources/geckoterminal';
import { searchDexScreener } from '../datasources/dexscreener';
import { getJupiterPrices } from '../datasources/jupiter';
import type { AggregationQuery, TokenData } from '../utils/types';
import { applyPagination } from '../utils/pagination';
import { applySorting } from '../utils/sorting';
import { applyFilters } from '../utils/filters';

const memoryCache = new InMemoryCache();
const redisCache = new RedisCache();
let useRedis = false;
let triedConnect = false;

function cache() {
  return useRedis ? redisCache : (memoryCache as { get<T>(k: string): Promise<T | null>; set<T>(k: string, v: T, ttl?: number): Promise<void> });
}

function mergeTokens(lists: TokenData[][]): TokenData[] {
  const map = new Map<string, TokenData>();
  for (const list of lists) {
    for (const t of list) {
      const existing = map.get(t.token_address);
      if (!existing) {
        map.set(t.token_address, { ...t });
      } else {
        map.set(t.token_address, {
          ...existing,
          ...t,
          // choose max liquidity and volume when available
          liquidity_sol: Math.max(existing.liquidity_sol || 0, t.liquidity_sol || 0) || existing.liquidity_sol || t.liquidity_sol,
          volume_sol: Math.max(existing.volume_sol || 0, t.volume_sol || 0) || existing.volume_sol || t.volume_sol,
          updated_at: Math.max(existing.updated_at || 0, t.updated_at || 0)
        });
      }
    }
  }
  return Array.from(map.values());
}

export async function getTokens(query: AggregationQuery): Promise<{ items: TokenData[]; nextCursor?: string }> {
  if (!triedConnect) {
    triedConnect = true;
    if (process.env.NODE_ENV !== 'test') {
      useRedis = await redisCache.connect();
    } else {
      useRedis = false;
    }
  }
  const { q, limit, cursor, sortBy = 'volume', sortDir = 'desc', period, minChange, minVolume } = query;

  const cacheKey = q
    ? `tokens:q:${q}:p:${period || 'na'}:mc:${minChange || 'na'}:mv:${minVolume || 'na'}`
    : `tokens:discover:p:${period || 'na'}:mc:${minChange || 'na'}:mv:${minVolume || 'na'}`;
  const c = cache();
  let items = await c.get<TokenData[]>(cacheKey);

  if (!items) {
    const lists: TokenData[][] = [];

    if (q && q.trim().length > 0) {
      // DexScreener search for query
      const ds = await safeCall(() => searchDexScreener(q), []);
      lists.push(ds);
    } else {
      // Discover: use geckoterminal first page
      const g = await safeCall(() => listGeckoSolanaTokens(1), { items: [] });
      lists.push(g.items);
      // Fallback if empty: broad DexScreener search to keep list populated
      if (!g.items.length) {
        const dsFallback = await safeCall(() => searchDexScreener('sol'), []);
        lists.push(dsFallback);
      }
    }

    items = mergeTokens(lists);

    // Enrich with Jupiter prices when possible (use token_address)
    try {
      const ids = items.map((i) => i.token_address).slice(0, 250); // limit
      const prices = await getJupiterPrices(ids);
      items = items.map((i) => ({ ...i, price_sol: prices[i.token_address] ?? i.price_sol }));
    } catch (_) {
      // ignore enrichment failure
    }

    // Apply filters before caching to keep cache relevant to query shape
    items = applyFilters(items, { period, minChange, minVolume });
    await c.set(cacheKey, items);
  }

  // Sorting and pagination applied on cached result
  const sorted = applySorting(items, sortBy, sortDir, period);
  const paged = applyPagination(sorted, limit, cursor);
  return paged;
}

async function safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    return fallback;
  }
}
