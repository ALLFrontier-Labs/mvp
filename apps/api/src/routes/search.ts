import { FastifyInstance } from 'fastify';
import { pool }             from '../db/client';
import { checkRateLimit }   from '../services/rateLimit';
import { autoRun }          from '../services/autoRoute';

export async function searchRoute(app: FastifyInstance) {
  app.post('/v1/search', async (req, reply) => {
    const user = req.user;
    const { provider: providerId = 'auto', params = {} } = req.body as any;
    const overrideKey = (req.headers['x-provider-key'] || req.headers['x-api-key-override']) as string | undefined;

    if (!params.query) {
      return reply.code(422).send({ error: 'validation_error', fields: ['params.query is required'] });
    }

    const rl = await checkRateLimit(user.id, user.plan);
    reply.header('X-RateLimit-Limit',     rl.limit);
    reply.header('X-RateLimit-Remaining', rl.remaining);
    reply.header('X-RateLimit-Reset',     rl.resetAt);
    if (!rl.ok) {
      return reply.code(429).send({ error: 'rate_limit_exceeded', retry_after: rl.resetAt - Math.floor(Date.now() / 1000) });
    }

    try {
      const { result, provider, duration_ms, routedVia, attemptsCount } = await autoRun('search', params, user.id, overrideKey, providerId);

      reply.header('X-LiteDaemon-Routed-Via',      routedVia);
      reply.header('X-LiteDaemon-Key-Attempts',    attemptsCount);

      const jr = await pool.query(
        `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, is_byok)
         VALUES ($1, $2, 'search', $3, 'completed', true) RETURNING id`,
        [user.id, provider.id, JSON.stringify(params)]
      );
      const jobId = jr.rows[0].id;

      await pool.query(`UPDATE jobs SET result=$1, completed_at=NOW() WHERE id=$2`, [JSON.stringify(result), jobId]);
      return reply.send({
        job_id: jobId,
        status: 'completed',
        provider: provider.id,
        result,
        duration_ms,
        routed_via: routedVia,
      });
    } catch (err: any) {
      const status = (err as any).statusCode || ((err as any).code === 'BYOK_KEY_REQUIRED' ? 401 : 502);
      return reply.code(status).send({
        error: (err as any).code || 'search_failed',
        message: err.message,
      });
    }
  });
}
