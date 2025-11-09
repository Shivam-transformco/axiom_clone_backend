"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const aggregator_1 = require("./services/aggregator");
const zod_1 = require("zod");
const querySchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    limit: zod_1.z.string().transform((v) => Number(v)).optional(),
    cursor: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['volume', 'price', 'priceChange', 'marketCap']).optional(),
    sortDir: zod_1.z.enum(['asc', 'desc']).optional(),
    period: zod_1.z.enum(['1h', '24h', '7d']).optional(),
    minChange: zod_1.z.string().transform((v) => Number(v)).optional(),
    minVolume: zod_1.z.string().transform((v) => Number(v)).optional()
});
function registerRoutes(app) {
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok' });
    });
    app.get('/tokens', async (req, res) => {
        try {
            const parsed = querySchema.safeParse(req.query);
            if (!parsed.success) {
                return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
            }
            const { q, limit, cursor, sortBy, sortDir, period, minChange, minVolume } = parsed.data;
            const { items, nextCursor } = await (0, aggregator_1.getTokens)({ q, limit: limit ?? 30, cursor, sortBy, sortDir, period, minChange, minVolume });
            res.json({ items, nextCursor });
        }
        catch (err) {
            console.error('/tokens error', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}
