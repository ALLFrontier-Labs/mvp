import Redis from 'ioredis';

// ── Graceful degradation: Redis is optional ───────────────────────────────────
// If REDIS_URL is not set (or the connection fails), we fall back to a no-op
// cache so that auth still works via Postgres. This means every auth request
// hits the DB instead of cache, which is slower but always correct.

let _redis: Redis | null = null;

if (process.env.REDIS_URL) {
  try {
    _redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // don't retry — fail fast and use DB fallback
      lazyConnect: true,
    });

    _redis.on('error', (err) => {
      console.warn('[Redis] Connection error — falling back to DB auth:', err.message);
    });

    _redis.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });
  } catch (e) {
    console.warn('[Redis] Failed to initialize — falling back to DB auth');
    _redis = null;
  }
} else {
  console.warn('[Redis] REDIS_URL not set — caching disabled, auth will use DB directly');
}

// ── Drop-in redis wrapper with graceful no-op fallback ────────────────────────
export const redis = {
  async get(key: string): Promise<string | null> {
    if (!_redis) return null;
    try { return await _redis.get(key); }
    catch { return null; }
  },
  async set(key: string, value: string, ...args: any[]): Promise<void> {
    if (!_redis) return;
    try { await (_redis as any).set(key, value, ...args); }
    catch { /* ignore */ }
  },
  async del(key: string): Promise<void> {
    if (!_redis) return;
    try { await _redis.del(key); }
    catch { /* ignore */ }
  },
};
