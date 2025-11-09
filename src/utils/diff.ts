import type { TokenData } from './types';
import type { TokenUpdateEvent } from '../ws/server';

export function diffTokens(prev: Map<string, TokenData>, next: TokenData[]): TokenUpdateEvent[] {
  const updates: TokenUpdateEvent[] = [];
  for (const t of next) {
    const p = prev.get(t.token_address);
    if (!p) continue;
    const changed: TokenUpdateEvent['fields'] = {};

    if (numberChanged(p.price_sol, t.price_sol, 0.002)) {
      changed.price_sol = t.price_sol;
    }
    if (numberChanged(p.volume_sol, t.volume_sol, 0.01)) {
      changed.volume_sol = t.volume_sol;
    }
    if (numberChanged(p.market_cap_sol, t.market_cap_sol, 0.01)) {
      changed.market_cap_sol = t.market_cap_sol;
    }
    if (numberChanged(p.liquidity_sol, t.liquidity_sol, 0.01)) {
      changed.liquidity_sol = t.liquidity_sol;
    }
    if (numberChanged(p.transaction_count, t.transaction_count, 0)) {
      changed.transaction_count = t.transaction_count;
    }

    if (Object.keys(changed).length) {
      updates.push({ token_address: t.token_address, fields: changed, updated_at: Date.now() });
    }
  }
  return updates;
}

function numberChanged(a?: number, b?: number, relThreshold = 0): boolean {
  if (a == null && b == null) return false;
  if (a == null || b == null) return true;
  if (a === 0) return Math.abs(b) > 0;
  const rel = Math.abs(b - a) / Math.abs(a);
  return rel > relThreshold;
}
