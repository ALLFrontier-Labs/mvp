import { FastifyInstance } from 'fastify';
import { pool }        from '../db/client';
import { getAdapter }  from '../adapters/index';
import { decrypt }     from '../services/encryption';

export async function jobsRoute(app: FastifyInstance) {
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
