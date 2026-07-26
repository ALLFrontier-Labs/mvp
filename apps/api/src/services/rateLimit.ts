// services/rateLimit.ts
import { redis } from '../redis/client';
const LIMITS: Record<string, number> = { free: 100, pro: 1000, enterprise: 10000 };

export async function checkRateLimit(userId: string, plan: string) {
  const limit  = LIMITS[plan] || 100;
  const window = Math.floor(Date.now() / 60000);
  const key    = `rate:${userId}:${window}`;
  const n      = await redis.incr(key);
  if (n === 1) await redis.expire(key, 60);
  return {
    ok:        n <= limit,
    remaining: Math.max(0, limit - n),
    resetAt:   (window + 1) * 60,
    limit,
  };
}
