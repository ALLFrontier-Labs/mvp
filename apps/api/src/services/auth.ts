// services/auth.ts
import crypto from 'crypto';
import { pool }  from '../db/client';
import { redis } from '../redis/client';
import { logger } from '../lib/logger';

// ── CRITICAL: No default fallback — crash on startup if salt is missing ───────
const SALT = process.env.API_KEY_SALT;
if (!SALT) {
  throw new Error('FATAL: API_KEY_SALT environment variable is required. Cannot start without it.');
}

// Maximum number of active API keys per user — prevents unbounded key accumulation
const MAX_ACTIVE_KEYS_PER_USER = 10;

export function generateApiKey(): { raw: string; hash: string } {
  const raw  = 'ld_' + crypto.randomBytes(48).toString('hex'); // 99-char key
  const hash = crypto.createHash('sha256').update(SALT + raw).digest('hex');
  return { raw, hash };
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, hash] = storedHash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
}

// ── Enforce API key limit per user — deactivate oldest keys if over limit ─────
async function enforceKeyLimit(userId: string, client?: any): Promise<void> {
  const db = client || pool;
  const countRes = await db.query(
    `SELECT COUNT(*) AS cnt FROM api_keys WHERE user_id = $1 AND is_active = true`,
    [userId]
  );
  const count = parseInt(countRes.rows[0]?.cnt || '0');

  if (count >= MAX_ACTIVE_KEYS_PER_USER) {
    // Deactivate the oldest keys beyond the limit (keep the newest MAX - 1 to make room)
    await db.query(
      `UPDATE api_keys SET is_active = false
       WHERE id IN (
         SELECT id FROM api_keys
         WHERE user_id = $1 AND is_active = true
         ORDER BY created_at ASC
         LIMIT $2
       )`,
      [userId, count - MAX_ACTIVE_KEYS_PER_USER + 1]
    );
    logger.info('api_keys_pruned', { userId, deactivated: count - MAX_ACTIVE_KEYS_PER_USER + 1 });
  }
}

// ── Create user (Supports optional password & names) ──────────────────────────
export async function createUser(
  email: string,
  password?: string,
  firstName?: string,
  lastName?: string
): Promise<{ rawKey: string; user: { id: string; email: string; firstName?: string; lastName?: string } }> {
  const { raw, hash } = generateApiKey();
  const passwordHash = password ? hashPassword(password) : null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const u = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name`,
      [email.toLowerCase().trim(), passwordHash, firstName || null, lastName || null]
    );

    const user = u.rows[0];

    await client.query(
      `INSERT INTO api_keys (user_id, key_hash, name) VALUES ($1, $2, 'Default Key')`,
      [user.id, hash]
    );

    await client.query('COMMIT');
    logger.info('user_created', { userId: user.id });

    client.release(); // CRITICAL: Release on success
    return {
      rawKey: raw,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    };
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch (_) {} // Ignore rollback errors on broken sockets
    client.release(true); // CRITICAL: Destroy the socket instead of returning it poisoned
    throw e;
  }
}

// ── Login with email & password ─────────────────────────────────────────────
export async function loginWithPassword(email: string, password?: string): Promise<{ rawKey: string; user: any }> {
  const cleanedEmail = email.toLowerCase().trim();
  const r = await pool.query(
    `SELECT id, email, password_hash, first_name, last_name, balance_usd, plan, is_active
     FROM users
     WHERE email = $1`,
    [cleanedEmail]
  );

  const user = r.rows[0];
  if (!user || !user.is_active) {
    throw new Error('user_not_found');
  }

  // If password was set, verify it
  if (user.password_hash) {
    if (!password) throw new Error('password_required');
    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) throw new Error('invalid_credentials');
  } else if (password) {
    // User exists without password set (e.g. initial API signup) -> set password now!
    const newHash = hashPassword(password);
    await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [newHash, user.id]);
  }

  // Enforce key limit before creating new session key
  await enforceKeyLimit(user.id);

  // Generate a fresh session key so user never gets stuck!
  const { raw, hash } = generateApiKey();
  await pool.query(
    `INSERT INTO api_keys (user_id, key_hash, name) VALUES ($1, $2, 'Session Key')`,
    [user.id, hash]
  );

  logger.info('user_login', { userId: user.id, method: 'password' });

  return {
    rawKey: raw,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      balanceUsd: parseFloat(user.balance_usd),
      plan: user.plan,
    },
  };
}

// ── Social / One-Click Login ────────────────────────────────────────────────
// SECURITY NOTE: This must ONLY be called from server-side verified OAuth flows
// (e.g., after verifying a Google access_token server-side). It must NEVER be
// exposed to unauthenticated public endpoints without prior token verification.
export async function socialLoginOrSignup(
  email: string,
  provider: string,
  firstName?: string,
  lastName?: string
): Promise<{ rawKey: string; user: any }> {
  const cleanedEmail = email.toLowerCase().trim();
  const client = await pool.connect();

  try {
    const existing = await client.query(`SELECT id, email FROM users WHERE email = $1`, [cleanedEmail]);

    if (existing.rows[0]) {
      const user = existing.rows[0];
      await enforceKeyLimit(user.id);

      const { raw, hash } = generateApiKey();
      await client.query(
        `INSERT INTO api_keys (user_id, key_hash, name) VALUES ($1, $2, $3)`,
        [user.id, hash, `${provider} Login Key`]
      );
      logger.info('user_social_login', { userId: user.id, provider });
      return { rawKey: raw, user };
    } else {
      try {
        const result = await createUser(cleanedEmail, undefined, firstName, lastName);
        logger.info('user_social_signup', { userId: result.user.id, provider });
        return { rawKey: result.rawKey, user: result.user };
      } catch (createUserErr: any) {
        if (createUserErr.code === '23505') {
          const existingAgain = await client.query(`SELECT id, email FROM users WHERE email = $1`, [cleanedEmail]);
          if (existingAgain.rows[0]) {
            const user = existingAgain.rows[0];
            await enforceKeyLimit(user.id);
            const { raw, hash } = generateApiKey();
            await client.query(
              `INSERT INTO api_keys (user_id, key_hash, name) VALUES ($1, $2, $3)`,
              [user.id, hash, `${provider} Login Key`]
            );
            logger.info('user_social_login_after_race_condition', { userId: user.id, provider });
            return { rawKey: raw, user };
          }
        }
        throw createUserErr;
      }
    }
  } catch (e: any) {
    logger.error('socialLoginOrSignup_failed', e);
    throw e;
  } finally {
    client.release();
  }
}

// Called on every request — must resolve in under 10ms
export async function validateApiKey(raw: string) {
  const hash  = crypto.createHash('sha256').update(SALT + raw).digest('hex');
  const cache = `auth:${hash}`;

  const hit = await redis.get(cache);
  if (hit) return JSON.parse(hit);

  const r = await pool.query(
    `SELECT u.id, u.email, u.balance_usd, u.plan
     FROM api_keys k
     JOIN users u ON u.id = k.user_id
     WHERE k.key_hash = $1
       AND k.is_active = true
       AND u.is_active = true`,
    [hash]
  );
  if (!r.rows[0]) return null;

  // Update last_used_at async — don't block the request
  pool.query(`UPDATE api_keys SET last_used_at = NOW() WHERE key_hash = $1`, [hash]).catch(() => {});

  await redis.set(cache, JSON.stringify(r.rows[0]), 'EX', 300);
  return r.rows[0];
}

export async function bustAuthCache(userId: string): Promise<void> {
  const r = await pool.query(
    `SELECT key_hash FROM api_keys WHERE user_id = $1 AND is_active = true`, [userId]
  );
  for (const row of r.rows) {
    await redis.del(`auth:${row.key_hash}`);
  }
}

// Fastify preHandler hook — add via app.addHook('preHandler', authHook)
// Routes registered with { config: { public: true } } skip validation entirely.
export async function authHook(req: any, reply: any): Promise<void> {
  if (req.routeOptions?.config?.public === true) return;
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer '))
    return reply.code(401).send({ error: 'invalid_api_key' });
  const user = await validateApiKey(h.slice(7));
  if (!user) return reply.code(401).send({ error: 'invalid_api_key' });
  req.user = user;
}
