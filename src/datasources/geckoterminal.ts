import { getJson } from '../http/httpClient';
import type { TokenData } from '../utils/types';

interface GeckoToken {
  id: string;
  attributes: {
    address: string;
    name: string;
    symbol: string;
    price_usd?: string;
    fdv_usd?: string;
    volume_usd?: string;
    market_cap_usd?: string;
  };
}

interface GeckoResp {
  data: GeckoToken[];
  links?: { next?: string };
}

export async function listGeckoSolanaTokens(page = 1): Promise<{ items: TokenData[]; nextPage?: number }> {
  const url = `https://api.geckoterminal.com/api/v2/networks/solana/tokens?page=${page}`;
  const data = await getJson<GeckoResp>(url);
  const items: TokenData[] = (data.data || []).map((t) => ({
    token_address: t.attributes.address,
    token_name: t.attributes.name,
    token_ticker: t.attributes.symbol,
    price_sol: t.attributes.price_usd ? Number(t.attributes.price_usd) : 0,
    market_cap_sol: t.attributes.market_cap_usd ? Number(t.attributes.market_cap_usd) : undefined,
    volume_sol: t.attributes.volume_usd ? Number(t.attributes.volume_usd) : undefined,
    protocol: 'geckoterminal',
    source: 'geckoterminal',
    updated_at: Date.now()
  }));
  const nextPage = data.links?.next ? page + 1 : undefined;
  return { items, nextPage };
}
