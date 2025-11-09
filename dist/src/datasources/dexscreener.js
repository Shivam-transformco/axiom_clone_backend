"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchDexScreener = searchDexScreener;
const httpClient_1 = require("../http/httpClient");
async function searchDexScreener(query) {
    const url = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`;
    const data = await (0, httpClient_1.getJson)(url);
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
        };
    });
    return dedupeByAddress(mapped);
}
function dedupeByAddress(list) {
    const m = new Map();
    for (const t of list) {
        if (!m.has(t.token_address))
            m.set(t.token_address, t);
    }
    return Array.from(m.values());
}
