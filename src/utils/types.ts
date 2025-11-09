export type Period = '1h' | '24h' | '7d';

export interface TokenData {
  token_address: string;
  token_name: string;
  token_ticker: string;
  price_sol: number;
  market_cap_sol?: number;
  volume_sol?: number;
  liquidity_sol?: number;
  transaction_count?: number;
  price_1hr_change?: number;
  price_24h_change?: number;
  price_7d_change?: number;
  protocol?: string;
  source?: string;
  updated_at?: number; // epoch ms
}

export interface AggregationQuery {
  q?: string;
  limit: number;
  cursor?: string;
  sortBy?: 'volume' | 'price' | 'priceChange' | 'marketCap';
  sortDir?: 'asc' | 'desc';
  period?: Period;
  minChange?: number;
  minVolume?: number;
}
