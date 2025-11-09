import type { Period, TokenData } from './types';

export interface FilterOptions {
  period?: Period;
  minChange?: number; // percentage e.g., 5 means >= +5%
  minVolume?: number; // absolute volume threshold (in same units as volume_sol)
}

export function applyFilters(items: TokenData[], opts: FilterOptions): TokenData[] {
  const { period, minChange, minVolume } = opts;
  return items.filter((t) => {
    if (minVolume != null && t.volume_sol != null && t.volume_sol < minVolume) return false;
    if (minChange != null) {
      const change = pickChange(t, period);
      if (change == null || change < minChange) return false;
    }
    return true;
  });
}

function pickChange(t: TokenData, period?: Period): number | undefined {
  if (period === '1h') return t.price_1hr_change;
  if (period === '24h') return t.price_24h_change;
  if (period === '7d') return t.price_7d_change;
  return t.price_24h_change ?? t.price_1hr_change ?? t.price_7d_change;
}
