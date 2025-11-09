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
- `GET /health`
- `GET /tokens`
  - Query params:
    - `q`: string (search query; when omitted, discover mode is used)
    - `limit`: number (default 30)
    - `cursor`: string (opaque base64 cursor)
    - `sortBy`: `volume | price | priceChange | marketCap` (default `volume`)
    - `sortDir`: `asc | desc` (default `desc`)
    - `period`: `1h | 24h | 7d` (affects `priceChange` selection)
    - `minChange`: number (percentage threshold; e.g., `5` means >= +5%)
    - `minVolume`: number (absolute volume threshold)

Example:
```bash
curl "http://localhost:4000/tokens?sortBy=marketCap&sortDir=desc&period=24h&minChange=5&minVolume=10000&limit=20"
```

## WebSocket Events
- `tokens:init` — initial payload after connection
  ```json
  { "items": TokenData[], "ts": 1730000000000 }
  ```
- `tokens:update` — batched field-level diffs
  ```json
  { "updates": [{ "token_address": "...", "fields": {"price_sol": 1.23}, "updated_at": 1730000000000 }], "ts": 1730000000001 }
  ```

A simple demo client is served at `/` (open two tabs to observe live updates).

## Configuration
- `PORT` (default `4000`)
- `REDIS_URL` (optional; falls back to in-memory if unavailable)
- `CACHE_TTL_SECONDS` (default `30`)
- `POLL_INTERVAL_MS` (default `5000`)
- `ALLOWED_ORIGINS` (comma-separated list for CORS)

## Rate limiting & resilience
- All outbound HTTP uses axios with retries and exponential backoff on `429/5xx`.
- DexScreener 300 req/min limit respected via caching and polling cadence.
- Discover path falls back to DexScreener search if GeckoTerminal returns empty.

## Tests
```bash
npm test
```
The suite covers pagination, sorting, filters, diffing, aggregator behavior, and health.

## Postman/Insomnia
Import `postman_collection.json`. Set `BASE_URL` variable (e.g., `http://localhost:4000`).

## Deployment (Render, Free Tier)
This repo includes `Dockerfile` and `render.yaml` for a one-click style deploy.

1. Push this repo to GitHub (done)
2. Create a Render account and select "New +" → "Web Service"
3. Connect this GitHub repo and choose "Use Docker" (Render will detect `Dockerfile`)
4. Environment variables (recommended):
   - `PORT=10000` (Render maps traffic to this port)
   - `CACHE_TTL_SECONDS=30`
   - `POLL_INTERVAL_MS=5000`
   - `ALLOWED_ORIGINS=*`
   - Optional: `REDIS_URL` if you attach a Redis instance
5. Click "Create Web Service" and wait for the build to finish
6. Verify health: `https://<your-render-subdomain>.onrender.com/health`
7. Tokens API: `https://<your-render-subdomain>.onrender.com/tokens?limit=20`
8. Open `https://<your-render-subdomain>.onrender.com/` in two browser tabs to see WS updates

After deployment, update this README with your public URL:
- Public URL: https://<your-render-subdomain>.onrender.com

## Demo video (1–2 min) — outline
1. Load `GET /tokens` in Postman with different query params (5–10 rapid calls to show response times)
2. Open two browser tabs at the public URL and show `tokens:init` followed by `tokens:update` events (use DevTools Network/WS)
3. Brief architecture walk-through:
   - `src/services/aggregator.ts` (merge logic + caching + enrichment)
   - `src/scheduler/poller.ts` (poll + diff)
   - `src/ws/server.ts` (Socket.io events)
   - `src/utils/*` (sorting, filters, pagination, diff)
4. Mention rate limit handling/backoff and Redis fallback
5. Show health endpoint and note environment variables

## Project structure
- `src/index.ts` — Express server + Socket.io and static demo
- `src/routes.ts` — REST endpoints
- `src/services/aggregator.ts` — aggregation, caching, enrichment, filters, sorting, pagination
- `src/datasources/*` — DexScreener, GeckoTerminal, Jupiter
- `src/scheduler/poller.ts` — polling scheduler + diff emission
- `src/utils/*` — helpers
- `public/index.html` — demo client
- `tests/*` — Jest tests (12+)
- `render.yaml`, `Dockerfile` — deployment
- `postman_collection.json` — API collection

## Notes
- If Redis is not available, the service logs a single fallback message and uses in-memory cache.
- For production, attach Redis and tune `POLL_INTERVAL_MS`/`CACHE_TTL_SECONDS` based on throughput.
