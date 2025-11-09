import type { Server } from 'socket.io';
import type { TokenData } from '../utils/types';

export interface WsServer {
  emitInitial(tokens: TokenData[]): void;
  emitUpdates(updates: TokenUpdateEvent[]): void;
}

export interface TokenUpdateEvent {
  token_address: string;
  fields: Partial<Pick<TokenData, 'price_sol' | 'volume_sol' | 'market_cap_sol' | 'liquidity_sol' | 'transaction_count'>>;
  updated_at: number;
}

export function createWsServer(io: Server): WsServer {
  io.on('connection', (socket) => {
    // In a real app, we could join rooms by query, chain, etc.
    socket.emit('hello', { ts: Date.now() });
  });

  return {
    emitInitial(tokens: TokenData[]) {
      io.emit('tokens:init', { items: tokens, ts: Date.now() });
    },
    emitUpdates(updates: TokenUpdateEvent[]) {
      if (!updates.length) return;
      io.emit('tokens:update', { updates, ts: Date.now() });
    }
  };
}
