"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listGeckoSolanaTokens = listGeckoSolanaTokens;
const httpClient_1 = require("../http/httpClient");
async function listGeckoSolanaTokens(page = 1) {
    const url = `https://api.geckoterminal.com/api/v2/networks/solana/tokens?page=${page}`;
    const data = await (0, httpClient_1.getJson)(url);
    const items = (data.data || []).map((t) => ({
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
