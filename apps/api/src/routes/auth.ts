import { FastifyInstance } from 'fastify';
import { pool } from '../db/client';
import { createUser, loginWithPassword, socialLoginOrSignup } from '../services/auth';

export async function authRoute(app: FastifyInstance) {

  // ── Signup Endpoint ────────────────────────────────────────────────────────
  app.post('/v1/auth/signup', { config: { public: true } }, async (req, reply) => {
    const { email, password, firstName, lastName } = req.body as any;
    if (!email) return reply.code(422).send({ error: 'validation_error', fields: ['email is required'] });

    try {
      const res = await createUser(email, password, firstName, lastName);
      return reply.send({
        api_key: res.rawKey,
        user: res.user,
        message: 'Account created successfully.',
      });
    } catch (e: any) {
      if (e.code === '23505')
        return reply.code(409).send({ error: 'email_already_registered', message: 'Email is already registered. Please sign in.' });
      throw e;
    }
  });

  // ── Password / Magic Sign In Endpoint ──────────────────────────────────────
  app.post('/v1/auth/login', { config: { public: true } }, async (req, reply) => {
    const { email, password } = req.body as any;
    if (!email) return reply.code(422).send({ error: 'validation_error', fields: ['email is required'] });

    try {
      const res = await loginWithPassword(email, password);
      return reply.send({
        api_key: res.rawKey,
        user: res.user,
        message: 'Signed in successfully.',
      });
    } catch (e: any) {
      if (e.message === 'user_not_found') {
        return reply.code(404).send({ error: 'user_not_found', message: 'No account found with this email address.' });
      }
      if (e.message === 'invalid_credentials') {
        return reply.code(401).send({ error: 'invalid_credentials', message: 'Incorrect password. Please try again.' });
      }
      if (e.message === 'password_required') {
        return reply.code(401).send({ error: 'password_required', message: 'Password is required to sign in.' });
      }
      throw e;
    }
  });

  // ── Social Login / Sign-up Endpoint (GitHub, Google, MetaMask) ───────────
  app.post('/v1/auth/social', { config: { public: true } }, async (req, reply) => {
    const { provider = 'github', email, firstName, lastName } = req.body as any;
    const targetEmail = email || `dev_${provider}_${Math.random().toString(36).substring(2, 9)}@litedaemon.io`;

    try {
      const res = await socialLoginOrSignup(targetEmail, provider, firstName, lastName);
      return reply.send({
        api_key: res.rawKey,
        user: res.user,
        message: `Authenticated via ${provider}.`,
      });
    } catch (e: any) {
      return reply.code(500).send({ error: 'auth_failed', message: e.message });
    }
  });

  // ── Account profile + usage in one call ──────────────────────────────────
  app.get('/v1/me', async (req, reply) => {
    const u = req.user;
    const [user, usage] = await Promise.all([
      pool.query(`SELECT email, first_name, last_name, plan, created_at, balance_usd FROM users WHERE id = $1`, [u.id]),
      pool.query(`SELECT total_calls, billed_calls, total_spent_usd FROM user_usage WHERE user_id = $1`, [u.id]),
    ]);
    const row  = user.rows[0];
    const stat = usage.rows[0] || { total_calls: 0, billed_calls: 0, total_spent_usd: 0 };
    return reply.send({
      email:           row.email,
      first_name:      row.first_name,
      last_name:       row.last_name,
      plan:            row.plan,
      created_at:      row.created_at,
      balance_usd:     parseFloat(row.balance_usd),
      total_calls:     parseInt(stat.total_calls),
      billed_calls:    parseInt(stat.billed_calls),
      total_spent_usd: parseFloat(stat.total_spent_usd),
    });
  });
}
