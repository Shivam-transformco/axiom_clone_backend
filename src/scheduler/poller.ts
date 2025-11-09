import { getTokens } from '../services/aggregator';
import type { WsServer } from '../ws/server';
import { diffTokens } from '../utils/diff';
import type { TokenData } from '../utils/types';

const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 5000);

let prevMap: Map<string, TokenData> | null = null;
let started = false;

export async function startPoller(ws: WsServer) {
  if (started) return;
  started = true;

  // Prime once and emit initial
  try {
    const { items } = await getTokens({ limit: 30, sortBy: 'volume', sortDir: 'desc' });
    ws.emitInitial(items);
    prevMap = new Map(items.map((t) => [t.token_address, t]));
  } catch (e) {
    // ignore startup failure; next tick will try again
  }

  setInterval(async () => {
    try {
      const { items } = await getTokens({ limit: 60, sortBy: 'volume', sortDir: 'desc' });
      if (!prevMap) {
        ws.emitInitial(items);
        prevMap = new Map(items.map((t) => [t.token_address, t]));
        return;
      }
      const updates = diffTokens(prevMap, items);
      if (updates.length) ws.emitUpdates(updates);
      prevMap = new Map(items.map((t) => [t.token_address, t]));
    } catch (e) {
      // swallow errors to keep polling alive
    }
  }, POLL_INTERVAL_MS);
}
