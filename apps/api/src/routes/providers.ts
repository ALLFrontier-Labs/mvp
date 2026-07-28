import { FastifyInstance } from 'fastify';
import { pool } from '../db/client';

export async function providersRoute(app: FastifyInstance) {
  // Public — no auth needed, this is a catalog page
  app.get('/v1/providers', { config: { public: true } }, async (_req, reply) => {
    const r = await pool.query(`
      SELECT
        id, name, endpoint, adapter_type, response_type,
        cost_per_call_usd, is_active,
        (api_key_encrypted != 'PLACEHOLDER') AS has_key
      FROM providers
      ORDER BY endpoint, id
    `);
    return reply.send({
      providers: r.rows.map(p => ({
        id:               p.id,
        name:             p.name,
        endpoint:         p.endpoint,
        adapter_type:     p.adapter_type,
        response_type:    p.response_type,
        cost_per_call_usd: parseFloat(p.cost_per_call_usd),
        is_live:          p.is_active && p.has_key,
      })),
    });
  });
}
