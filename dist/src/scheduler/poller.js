"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPoller = startPoller;
const aggregator_1 = require("../services/aggregator");
const diff_1 = require("../utils/diff");
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 5000);
let prevMap = null;
let started = false;
async function startPoller(ws) {
    if (started)
        return;
    started = true;
    // Prime once and emit initial
    try {
        const { items } = await (0, aggregator_1.getTokens)({ limit: 30, sortBy: 'volume', sortDir: 'desc' });
        ws.emitInitial(items);
        prevMap = new Map(items.map((t) => [t.token_address, t]));
    }
    catch (e) {
        // ignore startup failure; next tick will try again
    }
    setInterval(async () => {
        try {
            const { items } = await (0, aggregator_1.getTokens)({ limit: 60, sortBy: 'volume', sortDir: 'desc' });
            if (!prevMap) {
                ws.emitInitial(items);
                prevMap = new Map(items.map((t) => [t.token_address, t]));
                return;
            }
            const updates = (0, diff_1.diffTokens)(prevMap, items);
            if (updates.length)
                ws.emitUpdates(updates);
            prevMap = new Map(items.map((t) => [t.token_address, t]));
        }
        catch (e) {
            // swallow errors to keep polling alive
        }
    }, POLL_INTERVAL_MS);
}
