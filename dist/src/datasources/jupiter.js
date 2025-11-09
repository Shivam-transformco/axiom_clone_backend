"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJupiterPrices = getJupiterPrices;
const httpClient_1 = require("../http/httpClient");
async function getJupiterPrices(ids) {
    if (!ids.length)
        return {};
    const unique = Array.from(new Set(ids));
    const url = `https://price.jup.ag/v4/price?ids=${encodeURIComponent(unique.join(','))}`;
    const data = await (0, httpClient_1.getJson)(url);
    const out = {};
    for (const k of Object.keys(data.data || {})) {
        out[k] = data.data[k].price;
    }
    return out;
}
