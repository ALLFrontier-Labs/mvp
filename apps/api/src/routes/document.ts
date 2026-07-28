import { FastifyInstance } from 'fastify';
import { pool }             from '../db/client';
import { getAdapter }       from '../adapters/index';
import { debitLedger, InsufficientFundsError } from '../services/ledger';
import { calculateCharge }  from '../services/billing';
import { checkRateLimit }   from '../services/rateLimit';
import { resolveProviderKey } from '../services/byok';
import { autoRun }          from '../services/autoRoute';
import type { LDProvider }  from '../types';

export async function documentRoute(app: FastifyInstance) {
  app.post('/v1/document', async (req, reply) => {
    const user = req.user;
    const body = (req.body || {}) as any;
    const { provider: providerId = 'auto', params = {} } = body;
    const overrideKey = (req.headers['x-provider-key'] || req.headers['x-api-key-override']) as string | undefined;

    // Normalizing parameters (supports top-level file_url/file_b64/format/schema or nested params)
    const mergedParams = {
      file_url: body.file_url || params.file_url || body.url || params.url,
      file_b64: body.file_b64 || params.file_b64,
      format:   body.format || params.format || 'markdown',
      schema:   body.schema || params.schema,
      ...params,
    };

    if (!mergedParams.file_url && !mergedParams.file_b64) {
      return reply.code(422).send({
        error: 'validation_error',
        fields: ['file_url or file_b64 is required for document parsing'],
      });
    }

    // Rate limiting
    const rl = await checkRateLimit(user.id, user.plan);
    reply.header('X-RateLimit-Limit',     rl.limit);
    reply.header('X-RateLimit-Remaining', rl.remaining);
    reply.header('X-RateLimit-Reset',     rl.resetAt);
    if (!rl.ok) {
      return reply.code(429).send({
        error: 'rate_limit_exceeded',
        retry_after: rl.resetAt - Math.floor(Date.now() / 1000),
      });
    }

    // ── AUTO Routing Path ───────────────────────────────────────────────────
    if (!providerId || providerId === 'auto') {
      try {
        const { result, provider, isByok, charge, duration_ms } = await autoRun('document', mergedParams, user.id, overrideKey);

        if (!isByok && charge > 0) {
          try {
            const jr = await pool.query(
              `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, cost_usd, is_byok)
               VALUES ($1, $2, 'document', $3, 'pending', $4, false) RETURNING id`,
              [user.id, provider.id, JSON.stringify(mergedParams), charge]
            );
            const jobId = jr.rows[0].id;

            await debitLedger(
              user.id, charge, provider.id, jobId,
              `${provider.name} document parse (auto) — ${mergedParams.file_url || 'file upload'}`
            );

            await pool.query(
              `UPDATE jobs SET status='completed', result=$1, completed_at=NOW() WHERE id=$2`,
              [JSON.stringify(result), jobId]
            );

            return reply.send({
              job_id: jobId,
              status: 'completed',
              provider: provider.id,
              provider_auto: true,
              result,
              cost_usd: charge,
              duration_ms,
            });
          } catch (err: any) {
            if (err instanceof InsufficientFundsError) {
              return reply.code(402).send({ error: 'insufficient_balance', required_usd: charge });
            }
            throw err;
          }
        } else {
          // BYOK — $0 cost
          const jr = await pool.query(
            `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, cost_usd, is_byok)
             VALUES ($1, $2, 'document', $3, 'completed', 0, true) RETURNING id`,
            [user.id, provider.id, JSON.stringify(mergedParams)]
          );
          const jobId = jr.rows[0].id;
          await pool.query(`UPDATE jobs SET result=$1, completed_at=NOW() WHERE id=$2`, [JSON.stringify(result), jobId]);

          return reply.send({
            job_id: jobId,
            status: 'completed',
            provider: provider.id,
            provider_auto: true,
            result,
            cost_usd: 0,
            duration_ms,
          });
        }
      } catch (err: any) {
        return reply.code(502).send({ error: 'auto_route_failed', message: err.message });
      }
    }

    // ── Specific Provider Path ───────────────────────────────────────────────
    const pr = await pool.query(
      `SELECT * FROM providers WHERE id = $1 AND endpoint = 'document' AND is_active = true`,
      [providerId]
    );
    if (!pr.rows[0]) return reply.code(404).send({ error: 'provider_not_found', message: `No active document provider found: ${providerId}` });

    const provider = pr.rows[0] as LDProvider;

    const { apiKey, isByok } = await resolveProviderKey(user.id, provider.api_key_encrypted, providerId, overrideKey);
    const charge = isByok ? 0 : calculateCharge(parseFloat(provider.cost_per_call_usd));

    const jr = await pool.query(
      `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, cost_usd, is_byok)
       VALUES ($1, $2, 'document', $3, 'pending', $4, $5) RETURNING id`,
      [user.id, providerId, JSON.stringify(mergedParams), charge, isByok]
    );
    const jobId = jr.rows[0].id;

    if (!isByok) {
      try {
        await debitLedger(
          user.id, charge, providerId, jobId,
          `${provider.name} document parse — ${mergedParams.file_url || 'file upload'}`
        );
      } catch (err: any) {
        await pool.query(`DELETE FROM jobs WHERE id = $1`, [jobId]);
        if (err instanceof InsufficientFundsError) {
          return reply.code(402).send({ error: 'insufficient_balance', required_usd: charge });
        }
        throw err;
      }
    }

    const adapter = getAdapter(provider.adapter_type);
    const started = Date.now();

    try {
      const res = await adapter.run(mergedParams, apiKey);
      const result = (res as any).result || res;

      await pool.query(
        `UPDATE jobs SET status='completed', result=$1, completed_at=NOW() WHERE id=$2`,
        [JSON.stringify(result), jobId]
      );

      return reply.send({
        job_id: jobId,
        status: 'completed',
        provider: providerId,
        result,
        cost_usd: charge,
        duration_ms: Date.now() - started,
      });
    } catch (err: any) {
      await pool.query(`UPDATE jobs SET status='failed', result=$1, completed_at=NOW() WHERE id=$2`, [JSON.stringify({ error: err.message }), jobId]);
      return reply.code(502).send({ error: 'provider_error', message: err.message });
    }
  });
}
