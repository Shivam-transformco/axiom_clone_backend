"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const diff_1 = require("../src/utils/diff");
test('diff detects price and volume changes over thresholds', () => {
    const prev = new Map([
        ['a', { token_address: 'a', token_name: 'A', token_ticker: 'A', price_sol: 100, volume_sol: 1000 }],
    ]);
    const next = [
        { token_address: 'a', token_name: 'A', token_ticker: 'A', price_sol: 102.5, volume_sol: 1200 }, // +2.5% price, +20% volume
    ];
    const updates = (0, diff_1.diffTokens)(prev, next);
    expect(updates).toHaveLength(1);
    expect(updates[0].fields.price_sol).toBeCloseTo(102.5);
    expect(updates[0].fields.volume_sol).toBeCloseTo(1200);
});
test('diff ignores tiny changes under thresholds', () => {
    const prev = new Map([
        ['a', { token_address: 'a', token_name: 'A', token_ticker: 'A', price_sol: 100, volume_sol: 1000 }],
    ]);
    const next = [
        { token_address: 'a', token_name: 'A', token_ticker: 'A', price_sol: 100.1, volume_sol: 1005 }, // +0.1% price, +0.5% volume
    ];
    const updates = (0, diff_1.diffTokens)(prev, next);
    expect(updates).toHaveLength(0);
});
