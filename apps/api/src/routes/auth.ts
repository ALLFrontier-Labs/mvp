import { FastifyInstance } from 'fastify';
import { pool } from '../db/client';
import { createUser } from '../services/auth';

export async function authRoute(app: FastifyInstance) {
  app.post('/v1/auth/signup', { config: { public: true } }, async (req, reply) => {
    const { email } = req.body as any;
    if (!email) return reply.code(422).send({ error: 'validation_error', fields: ['email is required'] });

    try {
      const apiKey = await createUser(email);
      return reply.send({
        api_key: apiKey,
        message: 'Save this key now — it will not be shown again.',
      });
    } catch (e: any) {
      if (e.code === '23505')
        return reply.code(409).send({ error: 'email_already_registered' });
      throw e;
    }
  });

  // Account profile + usage in one call — used by Settings page
  app.get('/v1/me', async (req, reply) => {
    const u = req.user;
    const [user, usage] = await Promise.all([
      pool.query(`SELECT email, plan, created_at, balance_usd FROM users WHERE id = $1`, [u.id]),
      pool.query(`SELECT total_calls, billed_calls, total_spent_usd FROM user_usage WHERE user_id = $1`, [u.id]),
    ]);
    const row  = user.rows[0];
    const stat = usage.rows[0] || { total_calls: 0, billed_calls: 0, total_spent_usd: 0 };
    return reply.send({
      email:           row.email,
      plan:            row.plan,
      created_at:      row.created_at,
      balance_usd:     parseFloat(row.balance_usd),
      total_calls:     parseInt(stat.total_calls),
      billed_calls:    parseInt(stat.billed_calls),
      total_spent_usd: parseFloat(stat.total_spent_usd),
    });
  });
}

