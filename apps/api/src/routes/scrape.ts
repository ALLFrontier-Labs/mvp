import { FastifyInstance } from 'fastify';
import { pool }             from '../db/client';
import { getAdapter }       from '../adapters/index';
import { debitLedger, InsufficientFundsError } from '../services/ledger';
import { calculateCharge }  from '../services/billing';
import { checkRateLimit }   from '../services/rateLimit';
import { resolveProviderKey } from '../services/byok';
import type { LDProvider }  from '../types';

export async function scrapeRoute(app: FastifyInstance) {
  app.post('/v1/scrape', async (req, reply) => {
    const user = req.user;
    const { provider: providerId, params = {} } = req.body as any;

    if (!providerId)
      return reply.code(422).send({ error: 'validation_error', fields: ['provider is required'] });

    // Rate limit
    const rl = await checkRateLimit(user.id, user.plan);
    reply.header('X-RateLimit-Limit',     rl.limit);
    reply.header('X-RateLimit-Remaining', rl.remaining);
    reply.header('X-RateLimit-Reset',     rl.resetAt);
    if (!rl.ok)
      return reply.code(429).send({ error: 'rate_limit_exceeded', retry_after: rl.resetAt - Math.floor(Date.now() / 1000) });

    // Load provider
    const pr = await pool.query(
      `SELECT * FROM providers WHERE id = $1 AND endpoint = 'scrape' AND is_active = true`,
      [providerId]
    );
    if (!pr.rows[0]) return reply.code(404).send({ error: 'provider_not_found' });
    const provider = pr.rows[0] as LDProvider;

    // BYOK: use user's own key if available — zero platform cost
    const { apiKey, isByok } = await resolveProviderKey(user.id, provider.api_key_encrypted, providerId);
    const charge = isByok ? 0 : calculateCharge(parseFloat(provider.cost_per_call_usd));

    // Insert job record
    const jr = await pool.query(
      `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, cost_usd, is_byok)
       VALUES ($1, $2, 'scrape', $3, 'pending', $4, $5) RETURNING id`,
      [user.id, providerId, JSON.stringify(params), charge, isByok]
    );
    const jobId = jr.rows[0].id;

    // Deduct wallet only for platform-key calls
    if (!isByok) {
      try {
        await debitLedger(
          user.id, charge, providerId, jobId,
          `${provider.name} scrape — ${params.url || params.actor_id || 'request'}`
        );
      } catch (err: any) {
        await pool.query(`DELETE FROM jobs WHERE id = $1`, [jobId]);
        if (err instanceof InsufficientFundsError)
          return reply.code(402).send({ error: 'insufficient_balance', required_usd: charge });
        throw err;
      }
    }

    // Call adapter with resolved key (BYOK or platform)
    const adapter = getAdapter(provider.adapter_type);
    const started = Date.now();

    try {
      const res = await adapter.run(params, apiKey);

      if (res.type === 'sync') {
        await pool.query(
          `UPDATE jobs SET status='completed', result=$1, completed_at=NOW() WHERE id=$2`,
          [JSON.stringify(res.result), jobId]
        );
        return reply.send({
          job_id:      jobId,
          status:      'completed',
          provider:    providerId,
          result:      res.result,
          cost_usd:    charge,
          duration_ms: Date.now() - started,
        });
      } else {
        // Async provider (Apify) — returns job_id
        await pool.query(
          `UPDATE jobs SET status='running', provider_job_id=$1 WHERE id=$2`,
          [res.provider_job_id, jobId]
        );
        return reply.code(202).send({
          job_id:          jobId,
          status:          'running',
          provider:        providerId,
          provider_job_id: res.provider_job_id,
          cost_usd:        charge,
        });
      }
    } catch (err: any) {
      // Provider was reached (we got an error back), mark failed — no refund per billing policy
      await pool.query(
        `UPDATE jobs SET status='failed', result=$1, completed_at=NOW() WHERE id=$2`,
        [JSON.stringify({ error: err.message }), jobId]
      );
      return reply.code(502).send({ error: 'provider_error', message: err.message });
    }
  });
}
