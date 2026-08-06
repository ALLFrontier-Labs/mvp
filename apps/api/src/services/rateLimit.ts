// services/rateLimit.ts — Per-user rate limiting with Redis + in-memory fallback
import { redis } from '../redis/client';
import { logger } from '../lib/logger';

const LIMITS: Record<string, number> = { free: 100, pro: 1000, enterprise: 10000 };

// ── In-memory fallback when Redis is unavailable ──────────────────────────────
// SECURITY: When Redis is down, enforce a conservative in-memory rate limit
// instead of allowing unlimited traffic (previous behavior returned 0, which
// allowed all traffic through unchecked)
const memoryFallback = new Map<string, { count: number; resetAt: number }>();
const FALLBACK_WINDOW_MS = 60_000;

// Clean up memory fallback every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryFallback) {
    if (now > entry.resetAt) memoryFallback.delete(key);
  }
}, 300_000);

export async function checkRateLimit(userId: string, plan: string) {
  const limit  = LIMITS[plan] || 100;
  const window = Math.floor(Date.now() / 60000);
  const key    = `rate:${userId}:${window}`;

  // Try Redis first
  const n = await redis.incr(key);

  if (n > 0) {
    // Redis is working
    if (n === 1) await redis.expire(key, 60);
    return {
      ok:        n <= limit,
      remaining: Math.max(0, limit - n),
      resetAt:   (window + 1) * 60,
      limit,
    };
  }

  // Redis returned 0 (meaning it's down) — use in-memory fallback
  const now = Date.now();
  const memKey = `${userId}:${window}`;
  let entry = memoryFallback.get(memKey);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + FALLBACK_WINDOW_MS };
    memoryFallback.set(memKey, entry);
  }
  entry.count++;

  if (entry.count === 1) {
    logger.warn('rate_limit_redis_fallback', { userId });
  }

  return {
    ok:        entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt:   (window + 1) * 60,
    limit,
  };
}
