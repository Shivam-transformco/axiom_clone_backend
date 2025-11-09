import Redis from 'ioredis';

export class RedisCache {
  private client: Redis;
  private defaultTTL: number;

  constructor(url = process.env.REDIS_URL || 'redis://localhost:6379', ttlSeconds = Number(process.env.CACHE_TTL_SECONDS || 30)) {
    this.client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 0, retryStrategy: () => null });
    // Prevent unhandled error event noise when Redis isn't available in dev
    this.client.on('error', () => {
      // swallow errors; we'll fall back to in-memory
    });
    this.defaultTTL = ttlSeconds;
  }

  async connect(): Promise<boolean> {
    try {
      await this.client.connect();
      return true;
    } catch (e) {
      try {
        this.client.disconnect();
      } catch (_) {
        // ignore
      }
      console.warn('Redis unavailable, using in-memory cache');
      return false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const v = await this.client.get(key);
    return v ? (JSON.parse(v) as T) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds = this.defaultTTL) {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }
}
