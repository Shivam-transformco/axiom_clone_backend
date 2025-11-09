"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokens = getTokens;
const InMemoryCache_1 = require("../cache/InMemoryCache");
const RedisClient_1 = require("../cache/RedisClient");
const geckoterminal_1 = require("../datasources/geckoterminal");
const dexscreener_1 = require("../datasources/dexscreener");
const jupiter_1 = require("../datasources/jupiter");
const pagination_1 = require("../utils/pagination");
const sorting_1 = require("../utils/sorting");
const filters_1 = require("../utils/filters");
const memoryCache = new InMemoryCache_1.InMemoryCache();
const redisCache = new RedisClient_1.RedisCache();
let useRedis = false;
let triedConnect = false;
function cache() {
    return useRedis ? redisCache : memoryCache;
}
function mergeTokens(lists) {
    const map = new Map();
    for (const list of lists) {
        for (const t of list) {
            const existing = map.get(t.token_address);
            if (!existing) {
                map.set(t.token_address, { ...t });
            }
            else {
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
async function getTokens(query) {
    if (!triedConnect) {
        triedConnect = true;
        if (process.env.NODE_ENV !== 'test') {
            useRedis = await redisCache.connect();
        }
        else {
            useRedis = false;
        }
    }
    const { q, limit, cursor, sortBy = 'volume', sortDir = 'desc', period, minChange, minVolume } = query;
    const cacheKey = q
        ? `tokens:q:${q}:p:${period || 'na'}:mc:${minChange || 'na'}:mv:${minVolume || 'na'}`
        : `tokens:discover:p:${period || 'na'}:mc:${minChange || 'na'}:mv:${minVolume || 'na'}`;
    const c = cache();
    let items = await c.get(cacheKey);
    if (!items) {
        const lists = [];
        if (q && q.trim().length > 0) {
            // DexScreener search for query
            const ds = await safeCall(() => (0, dexscreener_1.searchDexScreener)(q), []);
            lists.push(ds);
        }
        else {
            // Discover: use geckoterminal first page
            const g = await safeCall(() => (0, geckoterminal_1.listGeckoSolanaTokens)(1), { items: [] });
            lists.push(g.items);
            // Fallback if empty: broad DexScreener search to keep list populated
            if (!g.items.length) {
                const dsFallback = await safeCall(() => (0, dexscreener_1.searchDexScreener)('sol'), []);
                lists.push(dsFallback);
            }
        }
        items = mergeTokens(lists);
        // Enrich with Jupiter prices when possible (use token_address)
        try {
            const ids = items.map((i) => i.token_address).slice(0, 250); // limit
            const prices = await (0, jupiter_1.getJupiterPrices)(ids);
            items = items.map((i) => ({ ...i, price_sol: prices[i.token_address] ?? i.price_sol }));
        }
        catch (_) {
            // ignore enrichment failure
        }
        // Apply filters before caching to keep cache relevant to query shape
        items = (0, filters_1.applyFilters)(items, { period, minChange, minVolume });
        await c.set(cacheKey, items);
    }
    // Sorting and pagination applied on cached result
    const sorted = (0, sorting_1.applySorting)(items, sortBy, sortDir, period);
    const paged = (0, pagination_1.applyPagination)(sorted, limit, cursor);
    return paged;
}
async function safeCall(fn, fallback) {
    try {
        return await fn();
    }
    catch (e) {
        return fallback;
    }
}
