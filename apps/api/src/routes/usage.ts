import { FastifyInstance } from 'fastify';
import { pool } from '../db/client';

export async function usageRoute(app: FastifyInstance) {
  app.get('/v1/usage', async (req, reply) => {
    const u = req.user;
    const [userRes, stats] = await Promise.all([
      pool.query(`SELECT monthly_call_count, balance_usd FROM users WHERE id = $1`, [u.id]),
      pool.query(`SELECT * FROM user_usage WHERE user_id = $1`, [u.id]),
    ]);
    const user = userRes.rows[0] || { monthly_call_count: 0, balance_usd: '0' };
    const s = stats.rows[0] || { total_calls: 0, billed_calls: 0, total_spent_usd: 0 };
    
    const monthlyCallCount = parseInt(user.monthly_call_count || '0', 10);
    const post100BilledCalls = Math.max(0, monthlyCallCount - 100);

    return reply.send({
      total_calls:     monthlyCallCount,
      billed_calls:    post100BilledCalls,
      total_spent_usd: parseFloat(s.total_spent_usd || '0'),
      balance_usd:     parseFloat(user.balance_usd || '0'),
    });
  });
}
