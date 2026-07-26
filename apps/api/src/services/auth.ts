// services/auth.ts
import crypto from 'crypto';
import { pool }  from '../db/client';
import { redis } from '../redis/client';

const SALT = process.env.API_KEY_SALT!;

export function generateApiKey(): { raw: string; hash: string } {
  const raw  = 'ld_' + crypto.randomBytes(48).toString('hex'); // 99-char key
  const hash = crypto.createHash('sha256').update(SALT + raw).digest('hex');
  return { raw, hash };
}

export async function createUser(email: string): Promise<string> {
  const { raw, hash } = generateApiKey();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const u = await client.query(
      `INSERT INTO users (email) VALUES ($1) RETURNING id`, [email]
    );
    await client.query(
      `INSERT INTO api_keys (user_id, key_hash, name) VALUES ($1, $2, 'Default')`,
      [u.rows[0].id, hash]
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
  return raw; // Show once — never stored plain
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
