import type { Period, TokenData } from './types.js';

export function applySorting(
  items: TokenData[],
  sortBy: 'volume' | 'price' | 'priceChange' | 'marketCap',
  sortDir: 'asc' | 'desc',
  period?: Period
): TokenData[] {
  const dir = sortDir === 'asc' ? 1 : -1;
  const arr = [...items];
  arr.sort((a, b) => {
    const av = getValue(a, sortBy, period);
    const bv = getValue(b, sortBy, period);
    if (av == null && bv == null) return 0;
    if (av == null) return 1; // push undefined down
    if (bv == null) return -1;
    return av > bv ? dir : av < bv ? -dir : 0;
  });
  return arr;
}

function getValue(item: TokenData, by: 'volume' | 'price' | 'priceChange' | 'marketCap', period?: Period): number | undefined {
  switch (by) {
    case 'volume':
      return item.volume_sol;
    case 'price':
      return item.price_sol;
    case 'marketCap':
      return item.market_cap_sol;
    case 'priceChange':
      if (period === '1h') return item.price_1hr_change;
      if (period === '24h') return item.price_24h_change;
      if (period === '7d') return item.price_7d_change;
      return item.price_24h_change ?? item.price_1hr_change ?? item.price_7d_change;
  }
}
