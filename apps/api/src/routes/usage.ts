import { FastifyInstance } from 'fastify';
import { pool } from '../db/client';

export async function usageRoute(app: FastifyInstance) {
  app.get('/v1/usage', async (req, reply) => {
    const u = req.user;
    const [stats, balance] = await Promise.all([
      pool.query(`SELECT * FROM user_usage WHERE user_id = $1`, [u.id]),
      pool.query(`SELECT balance_usd FROM users WHERE id = $1`, [u.id]),
    ]);
    const s = stats.rows[0] || { total_calls: 0, billed_calls: 0, total_spent_usd: 0 };
    return reply.send({
      total_calls:     parseInt(s.total_calls),
      billed_calls:    parseInt(s.billed_calls),
      total_spent_usd: parseFloat(s.total_spent_usd),
      balance_usd:     parseFloat(balance.rows[0]?.balance_usd || '0'),
    });
  });
}
