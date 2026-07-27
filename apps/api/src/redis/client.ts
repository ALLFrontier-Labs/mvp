import Redis from 'ioredis';

// ── Graceful degradation: Redis is optional ───────────────────────────────────
// If REDIS_URL is not set (or the connection fails), we fall back to a no-op
// cache so that auth still works via Postgres. Rate limiting is also skipped
// gracefully when Redis is unavailable.

let _redis: Redis | null = null;

if (process.env.REDIS_URL) {
  try {
    _redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // fail fast — don't block requests waiting for Redis
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

  async set(key: string, value: string, mode?: string, duration?: number): Promise<void> {
    if (!_redis) return;
    try {
      if (mode && duration !== undefined) {
        await _redis.set(key, value, mode as any, duration);
      } else {
        await _redis.set(key, value);
      }
    } catch { /* ignore */ }
  },

  async del(key: string): Promise<void> {
    if (!_redis) return;
    try { await _redis.del(key); }
    catch { /* ignore */ }
  },

  // incr: increment a counter, returns 0 (allowing all traffic) if Redis is down
  async incr(key: string): Promise<number> {
    if (!_redis) return 0;
    try { return await _redis.incr(key); }
    catch { return 0; }
  },

  // expire: set TTL on a key — silently skipped if Redis is down
  async expire(key: string, seconds: number): Promise<void> {
    if (!_redis) return;
    try { await _redis.expire(key, seconds); }
    catch { /* ignore */ }
  },
};
