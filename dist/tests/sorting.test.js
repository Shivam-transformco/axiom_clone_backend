"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sorting_1 = require("../src/utils/sorting");
test('sort by price desc', () => {
    const items = [
        { token_address: 'a', token_name: 'A', token_ticker: 'A', price_sol: 1 },
        { token_address: 'b', token_name: 'B', token_ticker: 'B', price_sol: 3 },
        { token_address: 'c', token_name: 'C', token_ticker: 'C', price_sol: 2 }
    ];
    const out = (0, sorting_1.applySorting)(items, 'price', 'desc');
    expect(out.map((i) => i.token_address)).toEqual(['b', 'c', 'a']);
});
test('sort by volume asc with undefined last', () => {
    const items = [
        { token_address: 'a', token_name: 'A', token_ticker: 'A', price_sol: 1, volume_sol: undefined },
        { token_address: 'b', token_name: 'B', token_ticker: 'B', price_sol: 3, volume_sol: 10 },
        { token_address: 'c', token_name: 'C', token_ticker: 'C', price_sol: 2, volume_sol: 5 }
    ];
    const out = (0, sorting_1.applySorting)(items, 'volume', 'asc');
    expect(out.map((i) => i.token_address)).toEqual(['c', 'b', 'a']);
});
