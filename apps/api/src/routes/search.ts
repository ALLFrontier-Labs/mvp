import { FastifyInstance } from 'fastify';
import { pool }            from '../db/client';
import { getAdapter }      from '../adapters/index';
import { debitLedger, InsufficientFundsError } from '../services/ledger';
import { calculateCharge } from '../services/billing';
import { checkRateLimit }  from '../services/rateLimit';
import { resolveProviderKey } from '../services/byok';
import { autoRun }         from '../services/autoRoute';
import type { LDProvider } from '../types';

export async function searchRoute(app: FastifyInstance) {
  app.post('/v1/search', async (req, reply) => {
    const user = req.user;
    const { provider: providerId = 'auto', params = {} } = req.body as any;

    if (!params.query)
      return reply.code(422).send({ error: 'validation_error', fields: ['params.query is required'] });

    const rl = await checkRateLimit(user.id, user.plan);
    reply.header('X-RateLimit-Limit',     rl.limit);
    reply.header('X-RateLimit-Remaining', rl.remaining);
    reply.header('X-RateLimit-Reset',     rl.resetAt);
    if (!rl.ok)
      return reply.code(429).send({ error: 'rate_limit_exceeded', retry_after: rl.resetAt - Math.floor(Date.now() / 1000) });

    // ── AUTO routing ────────────────────────────────────────────────────────
    if (!providerId || providerId === 'auto') {
      try {
        const { result, provider, isByok, charge, duration_ms } = await autoRun('search', params, user.id);

        if (!isByok && charge > 0) {
          try {
            const jr = await pool.query(
              `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, cost_usd, is_byok) VALUES ($1, $2, 'search', $3, 'pending', $4, false) RETURNING id`,
              [user.id, provider.id, JSON.stringify(params), charge]
            );
            const jobId = jr.rows[0].id;
            await debitLedger(user.id, charge, provider.id, jobId, `${provider.name} search (auto) — ${params.query}`);
            await pool.query(`UPDATE jobs SET status='completed', result=$1, completed_at=NOW() WHERE id=$2`, [JSON.stringify(result), jobId]);
            return reply.send({ job_id: jobId, status: 'completed', provider: provider.id, provider_auto: true, result, cost_usd: charge, duration_ms });
          } catch (err: any) {
            if (err instanceof InsufficientFundsError)
              return reply.code(402).send({ error: 'insufficient_balance', required_usd: charge });
            throw err;
          }
        } else {
          const jr = await pool.query(
            `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, cost_usd, is_byok) VALUES ($1, $2, 'search', $3, 'completed', 0, true) RETURNING id`,
            [user.id, provider.id, JSON.stringify(params)]
          );
          const jobId = jr.rows[0].id;
          await pool.query(`UPDATE jobs SET result=$1, completed_at=NOW() WHERE id=$2`, [JSON.stringify(result), jobId]);
          return reply.send({ job_id: jobId, status: 'completed', provider: provider.id, provider_auto: true, result, cost_usd: 0, duration_ms });
        }
      } catch (err: any) {
        return reply.code(502).send({ error: 'auto_route_failed', message: err.message });
      }
    }

    // ── Specific provider ───────────────────────────────────────────────────
    const pr = await pool.query(
      `SELECT * FROM providers WHERE id = $1 AND endpoint = 'search' AND is_active = true`,
      [providerId]
    );
    if (!pr.rows[0]) return reply.code(404).send({ error: 'provider_not_found' });
    const provider = pr.rows[0] as LDProvider;

    const { apiKey, isByok } = await resolveProviderKey(user.id, provider.api_key_encrypted, providerId);
    const charge = isByok ? 0 : calculateCharge(parseFloat(provider.cost_per_call_usd));

    const jr = await pool.query(
      `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, cost_usd, is_byok) VALUES ($1, $2, 'search', $3, 'pending', $4, $5) RETURNING id`,
      [user.id, providerId, JSON.stringify(params), charge, isByok]
    );
    const jobId = jr.rows[0].id;

    if (!isByok) {
      try {
        await debitLedger(user.id, charge, providerId, jobId, `${provider.name} search — ${params.query}`);
      } catch (err: any) {
        await pool.query(`DELETE FROM jobs WHERE id = $1`, [jobId]);
        if (err instanceof InsufficientFundsError)
          return reply.code(402).send({ error: 'insufficient_balance', required_usd: charge });
        throw err;
      }
    }

    const adapter = getAdapter(provider.adapter_type);
    const started = Date.now();

    try {
      const res = await adapter.run(params, apiKey);
      await pool.query(`UPDATE jobs SET status='completed', result=$1, completed_at=NOW() WHERE id=$2`, [JSON.stringify((res as any).result), jobId]);
      return reply.send({ job_id: jobId, status: 'completed', provider: providerId, result: (res as any).result, cost_usd: charge, duration_ms: Date.now() - started });
    } catch (err: any) {
      await pool.query(`UPDATE jobs SET status='failed', completed_at=NOW() WHERE id=$1`, [jobId]);
      return reply.code(502).send({ error: 'provider_error', message: err.message });
    }
  });
}
