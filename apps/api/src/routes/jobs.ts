import { FastifyInstance } from 'fastify';
import { pool }        from '../db/client';
import { getAdapter }  from '../adapters/index';
import { decrypt }     from '../services/encryption';

export async function jobsRoute(app: FastifyInstance) {
  // List recent jobs
  app.get('/v1/jobs', async (req, reply) => {
    const { limit = '20', offset = '0', endpoint } = req.query as any;
    const lim  = Math.min(parseInt(limit)  || 20, 50);
    const off  = parseInt(offset) || 0;
    const r = await pool.query(
      `SELECT id, provider_id, endpoint, status, cost_usd, created_at, completed_at,
              EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000 AS duration_ms
       FROM jobs
       WHERE user_id = $1 ${endpoint ? `AND endpoint = '${endpoint}'` : ''}
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, lim, off]
    );
    return reply.send({
      jobs:  r.rows.map(j => ({
        job_id:       j.id,
        provider:     j.provider_id,
        endpoint:     j.endpoint,
        status:       j.status,
        cost_usd:     parseFloat(j.cost_usd),
        duration_ms:  j.duration_ms,
        created_at:   j.created_at,
        completed_at: j.completed_at,
      })),
      total: parseInt(r.rowCount as any),
    });
  });

  app.get('/v1/jobs/:id', async (req, reply) => {
    const { id } = req.params as any;

    const r = await pool.query(
      `SELECT j.*, p.adapter_type, p.api_key_encrypted
       FROM jobs j
       JOIN providers p ON p.id = j.provider_id
       WHERE j.id = $1 AND j.user_id = $2`,
      [id, req.user.id]
    );
    if (!r.rows[0]) return reply.code(404).send({ error: 'job_not_found' });
    const job = r.rows[0];

    // Terminal states — return cached result
    if (['completed', 'failed'].includes(job.status))
      return reply.send({
        job_id:   id,
        status:   job.status,
        provider: job.provider_id,
        result:   job.result,
        cost_usd: parseFloat(job.cost_usd),
      });

    // Proxy status check to provider
    const adapter = getAdapter(job.adapter_type);
    if (!adapter.status) return reply.send({ job_id: id, status: job.status });
    const apiKey = decrypt(job.api_key_encrypted);

    try {
      const s = await adapter.status(job.provider_job_id, apiKey);

      if (s.status === 'completed') {
        await pool.query(
          `UPDATE jobs SET status='completed', result=$1, completed_at=NOW() WHERE id=$2`,
          [JSON.stringify(s.result), id]
        );
        return reply.send({ job_id: id, status: 'completed', provider: job.provider_id, result: s.result, cost_usd: parseFloat(job.cost_usd) });
      }

      if (s.status === 'failed') {
        // Per billing policy: no refund on provider-side failure
        await pool.query(`UPDATE jobs SET status='failed', completed_at=NOW() WHERE id=$1`, [id]);
        return reply.send({ job_id: id, status: 'failed', provider: job.provider_id, error: s.error, cost_usd: parseFloat(job.cost_usd) });
      }

      return reply.send({ job_id: id, status: 'running', provider: job.provider_id });
    } catch (err: any) {
      // Provider status check failed — job still running
      return reply.send({ job_id: id, status: 'running', note: 'status check error: ' + err.message });
    }
  });
}
