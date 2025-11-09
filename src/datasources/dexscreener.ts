import { getJson } from '../http/httpClient';
import type { TokenData } from '../utils/types';

interface DexPair {
  baseToken: { address: string; name: string; symbol: string };
  priceUsd?: string;
  liquidity?: { base?: number; quote?: number; usd?: number };
  fdv?: number;
  volume?: { h24?: number; h6?: number; h1?: number };
  txns?: { h24?: { buys: number; sells: number } };
  chainId?: string;
  dexId?: string;
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
}

interface DexSearchResp { pairs?: DexPair[] }

export async function searchDexScreener(query: string): Promise<TokenData[]> {
  const url = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`;
  const data = await getJson<DexSearchResp>(url);
  const pairs = data.pairs || [];
  const mapped = pairs.map((p) => {
    const priceUsd = p.priceUsd ? Number(p.priceUsd) : undefined;
    return {
      token_address: p.baseToken.address,
      token_name: p.baseToken.name,
      token_ticker: p.baseToken.symbol,
      price_sol: priceUsd ? priceUsd : 0, // USD as placeholder when SOL unavailable
      market_cap_sol: p.fdv,
      volume_sol: p.volume?.h24,
      liquidity_sol: p.liquidity?.usd,
      transaction_count: p.txns?.h24 ? p.txns.h24.buys + p.txns.h24.sells : undefined,
      price_1hr_change: p.priceChange?.h1,
      price_24h_change: p.priceChange?.h24,
      protocol: `${p.dexId || ''}`,
      source: 'dexscreener',
      updated_at: Date.now()
    } as TokenData;
  });
  return dedupeByAddress(mapped);
}

function dedupeByAddress(list: TokenData[]): TokenData[] {
  const m = new Map<string, TokenData>();
  for (const t of list) {
    if (!m.has(t.token_address)) m.set(t.token_address, t);
  }
  return Array.from(m.values());
}
