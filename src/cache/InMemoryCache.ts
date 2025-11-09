export class InMemoryCache {
  private store = new Map<string, { value: any; expiresAt: number }>();
  constructor(private ttlSeconds = Number(process.env.CACHE_TTL_SECONDS || 30)) {}

  async get<T>(key: string): Promise<T | null> {
    const hit = this.store.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return hit.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = this.ttlSeconds) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }
}
