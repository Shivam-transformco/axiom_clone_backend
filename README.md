# Axiom Realtime Aggregation Service

A Node.js + TypeScript service that aggregates real-time meme coin data from multiple DEX sources with caching and WebSocket updates.

## Features
- Aggregates from DexScreener, GeckoTerminal, with Jupiter price enrichment
- Caching with Redis (fallback to in-memory) and configurable TTL
- REST API: `GET /tokens` with filtering, sorting, cursor pagination
- WebSocket updates on price/volume changes via Socket.io
- Polling scheduler to refresh and push updates

## Running locally
1. Copy `.env.example` to `.env` and adjust if needed
2. Install dependencies
```bash
npm install
```
3. Start dev server
```bash
npm run dev
```
Server runs at `http://localhost:${PORT||4000}`. WebSocket endpoint is the same origin.

## API
- `GET /tokens`
  - Query: `q`, `limit`, `cursor`, `sortBy` (volume|price|priceChange|marketCap), `sortDir` (asc|desc), `period` (1h|24h|7d)

## WebSocket Events
- `tokens:init` { items, ts }
- `tokens:update` { updates, ts }

## Design
- Axios with retry + exponential backoff for rate limits and transient errors
- Merge duplicate tokens by `token_address`; prefer max liquidity/volume; latest timestamp
- Redis cache key strategy for discover and query results
- Scheduler compares snapshots and emits granular update events

## Tests
```bash
npm test
```

## Deployment
- Can be deployed to free hosts (e.g., Render, Railway, Fly.io)
- Expose `PORT`, `REDIS_URL`, `CACHE_TTL_SECONDS`, `POLL_INTERVAL_MS`, `ALLOWED_ORIGINS`

