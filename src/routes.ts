import type { Express, Request, Response } from 'express';
import { getTokens } from './services/aggregator';
import { z } from 'zod';

const querySchema = z.object({
  q: z.string().optional(),
  limit: z.string().transform((v) => Number(v)).optional(),
  cursor: z.string().optional(),
  sortBy: z.enum(['volume', 'price', 'priceChange', 'marketCap']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
  period: z.enum(['1h', '24h', '7d']).optional(),
  minChange: z.string().transform((v) => Number(v)).optional(),
  minVolume: z.string().transform((v) => Number(v)).optional()
});

export function registerRoutes(app: Express) {
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.get('/tokens', async (req: Request, res: Response) => {
    try {
      const parsed = querySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
      }
      const { q, limit, cursor, sortBy, sortDir, period, minChange, minVolume } = parsed.data;
      const { items, nextCursor } = await getTokens({ q, limit: limit ?? 30, cursor, sortBy, sortDir, period, minChange, minVolume });
      res.json({ items, nextCursor });
    } catch (err: any) {
      console.error('/tokens error', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
