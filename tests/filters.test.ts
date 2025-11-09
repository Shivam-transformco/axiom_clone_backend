import { applyFilters } from '../src/utils/filters';
import type { TokenData } from '../src/utils/types';

test('filters by minVolume', () => {
  const items: TokenData[] = [
    { token_address: 'a', token_name: 'A', token_ticker: 'A', price_sol: 1, volume_sol: 100 },
    { token_address: 'b', token_name: 'B', token_ticker: 'B', price_sol: 1, volume_sol: 10000 },
  ];
  const out = applyFilters(items, { minVolume: 1000 });
  expect(out.map((i) => i.token_address)).toEqual(['b']);
});

test('filters by minChange period 1h', () => {
  const items: TokenData[] = [
    { token_address: 'a', token_name: 'A', token_ticker: 'A', price_sol: 1, price_1hr_change: 3 },
    { token_address: 'b', token_name: 'B', token_ticker: 'B', price_sol: 1, price_1hr_change: 10 },
  ];
  const out = applyFilters(items, { period: '1h', minChange: 5 });
  expect(out.map((i) => i.token_address)).toEqual(['b']);
});

test('filters gracefully when fields missing', () => {
  const items: TokenData[] = [
    { token_address: 'a', token_name: 'A', token_ticker: 'A', price_sol: 1 },
    { token_address: 'b', token_name: 'B', token_ticker: 'B', price_sol: 1, price_24h_change: 7 },
  ];
  const out = applyFilters(items, { period: '24h', minChange: 5 });
  expect(out.map((i) => i.token_address)).toEqual(['b']);
});
