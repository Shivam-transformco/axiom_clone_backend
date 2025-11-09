"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCache = void 0;
class InMemoryCache {
    ttlSeconds;
    store = new Map();
    constructor(ttlSeconds = Number(process.env.CACHE_TTL_SECONDS || 30)) {
        this.ttlSeconds = ttlSeconds;
    }
    async get(key) {
        const hit = this.store.get(key);
        if (!hit)
            return null;
        if (Date.now() > hit.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return hit.value;
    }
    async set(key, value, ttlSeconds = this.ttlSeconds) {
        this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
}
exports.InMemoryCache = InMemoryCache;
