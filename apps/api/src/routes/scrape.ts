import { FastifyInstance } from 'fastify';
import { pool }             from '../db/client';
import { getAdapter }       from '../adapters/index';
import { debitLedger, InsufficientFundsError } from '../services/ledger';
import { calculateCharge }  from '../services/billing';
import { checkRateLimit }   from '../services/rateLimit';
import { resolveProviderKey } from '../services/byok';
import { autoRun }          from '../services/autoRoute';
import type { LDProvider }  from '../types';

export async function scrapeRoute(app: FastifyInstance) {
  app.post('/v1/scrape', async (req, reply) => {
    const user = req.user;
    const { provider: providerId = 'auto', params = {} } = req.body as any;
    const overrideKey = (req.headers['x-provider-key'] || req.headers['x-api-key-override']) as string | undefined;

    // Rate limit
    const rl = await checkRateLimit(user.id, user.plan);
    reply.header('X-RateLimit-Limit',     rl.limit);
    reply.header('X-RateLimit-Remaining', rl.remaining);
    reply.header('X-RateLimit-Reset',     rl.resetAt);
    if (!rl.ok)
      return reply.code(429).send({ error: 'rate_limit_exceeded', retry_after: rl.resetAt - Math.floor(Date.now() / 1000) });

    // ── AUTO routing — try cheapest live provider first ─────────────────────
    if (!providerId || providerId === 'auto') {
      try {
        const { result, provider, isByok, charge, duration_ms, routedVia, fallbackReason, walletDeducted } = await autoRun('scrape', params, user.id, overrideKey);

        // Attach routing transparency headers
        reply.header('X-LiteDaemon-Routed-Via',       routedVia);
        reply.header('X-LiteDaemon-Fallback-Reason',  fallbackReason);
        reply.header('X-LiteDaemon-Wallet-Deducted',  `$${walletDeducted.toFixed(6)}`);

        // Debit wallet (skip if BYOK)
        if (!isByok && charge > 0) {
          try {
            // Create job + debit atomically
            const jr = await pool.query(
              `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, cost_usd, is_byok)
               VALUES ($1, $2, 'scrape', $3, 'pending', $4, $5) RETURNING id`,
              [user.id, provider.id, JSON.stringify(params), charge, false]
            );
            const jobId = jr.rows[0].id;
            await debitLedger(user.id, charge, provider.id, jobId, `${provider.name} scrape (auto) — ${params.url || 'request'}`);
            await pool.query(`UPDATE jobs SET status='completed', result=$1, completed_at=NOW() WHERE id=$2`, [JSON.stringify(result), jobId]);
            return reply.send({ job_id: jobId, status: 'completed', provider: provider.id, provider_auto: true, result, cost_usd: charge, duration_ms, routed_via: routedVia });
          } catch (err: any) {
            if (err instanceof InsufficientFundsError)
              return reply.code(402).send({ error: 'insufficient_balance', required_usd: charge });
            throw err;
          }
        } else {
          // BYOK — no wallet debit
          const jr = await pool.query(
            `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, cost_usd, is_byok)
             VALUES ($1, $2, 'scrape', $3, 'completed', $4, true) RETURNING id`,
            [user.id, provider.id, JSON.stringify(params), 0]
          );
          const jobId = jr.rows[0].id;
          await pool.query(`UPDATE jobs SET result=$1, completed_at=NOW() WHERE id=$2`, [JSON.stringify(result), jobId]);
          return reply.send({ job_id: jobId, status: 'completed', provider: provider.id, provider_auto: true, result, cost_usd: 0, duration_ms, routed_via: routedVia });
        }
      } catch (err: any) {
        // Surface strict-mode or non-billing failures with appropriate status codes
        const code = (err as any).statusCode === 429 ? 429 : (err as any).code === 'BYOK_STRICT_FAILURE' ? 429 : 502;
        return reply.code(code).send({ error: 'auto_route_failed', message: err.message, code: (err as any).code });
      }
    }

    // ── Specific provider path ───────────────────────────────────────────────
    const pr = await pool.query(
      `SELECT * FROM providers WHERE id = $1 AND endpoint = 'scrape' AND is_active = true`,
      [providerId]
    );
    if (!pr.rows[0]) return reply.code(404).send({ error: 'provider_not_found' });
    const provider = pr.rows[0] as LDProvider;

    const { apiKey, isByok } = await resolveProviderKey(user.id, provider.api_key_encrypted, providerId, overrideKey);
    const charge = isByok ? 0 : calculateCharge(parseFloat(provider.cost_per_call_usd));

    const jr = await pool.query(
      `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, cost_usd, is_byok)
       VALUES ($1, $2, 'scrape', $3, 'pending', $4, $5) RETURNING id`,
      [user.id, providerId, JSON.stringify(params), charge, isByok]
    );
    const jobId = jr.rows[0].id;

    if (!isByok) {
      try {
        await debitLedger(user.id, charge, providerId, jobId, `${provider.name} scrape — ${params.url || params.actor_id || 'request'}`);
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

      if (res.type === 'sync') {
        await pool.query(`UPDATE jobs SET status='completed', result=$1, completed_at=NOW() WHERE id=$2`, [JSON.stringify(res.result), jobId]);
        return reply.send({ job_id: jobId, status: 'completed', provider: providerId, result: res.result, cost_usd: charge, duration_ms: Date.now() - started });
      } else {
        await pool.query(`UPDATE jobs SET status='running', provider_job_id=$1 WHERE id=$2`, [res.provider_job_id, jobId]);
        return reply.code(202).send({ job_id: jobId, status: 'running', provider: providerId, provider_job_id: res.provider_job_id, cost_usd: charge });
      }
    } catch (err: any) {
      await pool.query(`UPDATE jobs SET status='failed', result=$1, completed_at=NOW() WHERE id=$2`, [JSON.stringify({ error: err.message }), jobId]);
      return reply.code(502).send({ error: 'provider_error', message: err.message });
    }
  });
}
