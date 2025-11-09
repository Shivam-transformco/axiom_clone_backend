import { getTokens } from '../src/services/aggregator';

// Mock data sources to avoid network
jest.mock('../src/datasources/geckoterminal', () => ({
  listGeckoSolanaTokens: async () => ({
    items: [
      { token_address: 'x', token_name: 'X', token_ticker: 'X', price_sol: 1, volume_sol: 100, updated_at: 1 },
      { token_address: 'y', token_name: 'Y', token_ticker: 'Y', price_sol: 2, volume_sol: 200, updated_at: 1 },
    ],
  }),
}));

jest.mock('../src/datasources/dexscreener', () => ({
  searchDexScreener: async (_q: string) => ([
    { token_address: 'x', token_name: 'X', token_ticker: 'X', price_sol: 1.1, volume_sol: 150, liquidity_sol: 50, updated_at: 2, source: 'dexscreener' },
    { token_address: 'z', token_name: 'Z', token_ticker: 'Z', price_sol: 3, volume_sol: 50, updated_at: 2, source: 'dexscreener' },
  ]),
}));

jest.mock('../src/datasources/jupiter', () => ({
  getJupiterPrices: async (_ids: string[]) => ({ x: 1.2, y: 2.3, z: 3.4 }),
}));

test('discover path returns gecko tokens enriched with jupiter and filtered', async () => {
  const { items } = await getTokens({ limit: 10, sortBy: 'price', sortDir: 'desc', minVolume: 150 });
  expect(items.find((i) => i.token_address === 'x')).toBeDefined();
  expect(items.find((i) => i.token_address === 'y')).toBeDefined();
  // Enrichment overwrote prices
  expect(items.find((i) => i.token_address === 'x')!.price_sol).toBe(1.2);
});

test('search path merges duplicates and prefers max volume/liquidity', async () => {
  const { items } = await getTokens({ q: 'x', limit: 10, sortBy: 'volume', sortDir: 'desc' });
  const x = items.find((i) => i.token_address === 'x');
  expect(x).toBeDefined();
  expect(x!.volume_sol).toBe(150); // from dexscreener mock
  expect(x!.liquidity_sol).toBe(50);
});
