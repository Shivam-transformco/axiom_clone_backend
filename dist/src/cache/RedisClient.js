"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCache = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class RedisCache {
    client;
    defaultTTL;
    constructor(url = process.env.REDIS_URL || 'redis://localhost:6379', ttlSeconds = Number(process.env.CACHE_TTL_SECONDS || 30)) {
        this.client = new ioredis_1.default(url, { lazyConnect: true, maxRetriesPerRequest: 0, retryStrategy: () => null });
        // Prevent unhandled error event noise when Redis isn't available in dev
        this.client.on('error', () => {
            // swallow errors; we'll fall back to in-memory
        });
        this.defaultTTL = ttlSeconds;
    }
    async connect() {
        try {
            await this.client.connect();
            return true;
        }
        catch (e) {
            try {
                this.client.disconnect();
            }
            catch (_) {
                // ignore
            }
            console.warn('Redis unavailable, using in-memory cache');
            return false;
        }
    }
    async get(key) {
        const v = await this.client.get(key);
        return v ? JSON.parse(v) : null;
    }
    async set(key, value, ttlSeconds = this.defaultTTL) {
        await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    }
}
exports.RedisCache = RedisCache;
