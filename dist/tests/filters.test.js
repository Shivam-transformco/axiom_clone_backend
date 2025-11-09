"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filters_1 = require("../src/utils/filters");
test('filters by minVolume', () => {
    const items = [
        { token_address: 'a', token_name: 'A', token_ticker: 'A', price_sol: 1, volume_sol: 100 },
        { token_address: 'b', token_name: 'B', token_ticker: 'B', price_sol: 1, volume_sol: 10000 },
    ];
    const out = (0, filters_1.applyFilters)(items, { minVolume: 1000 });
    expect(out.map((i) => i.token_address)).toEqual(['b']);
});
test('filters by minChange period 1h', () => {
    const items = [
        { token_address: 'a', token_name: 'A', token_ticker: 'A', price_sol: 1, price_1hr_change: 3 },
        { token_address: 'b', token_name: 'B', token_ticker: 'B', price_sol: 1, price_1hr_change: 10 },
    ];
    const out = (0, filters_1.applyFilters)(items, { period: '1h', minChange: 5 });
    expect(out.map((i) => i.token_address)).toEqual(['b']);
});
test('filters gracefully when fields missing', () => {
    const items = [
        { token_address: 'a', token_name: 'A', token_ticker: 'A', price_sol: 1 },
        { token_address: 'b', token_name: 'B', token_ticker: 'B', price_sol: 1, price_24h_change: 7 },
    ];
    const out = (0, filters_1.applyFilters)(items, { period: '24h', minChange: 5 });
    expect(out.map((i) => i.token_address)).toEqual(['b']);
});
