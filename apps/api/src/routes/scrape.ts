import { FastifyInstance } from 'fastify';
import { pool }             from '../db/client';
import { debitLedger, InsufficientFundsError } from '../services/ledger';
import { checkRateLimit }   from '../services/rateLimit';
import { autoRun }          from '../services/autoRoute';
import { preCheckAndEvaluateByok } from '../services/byokPricing';

export async function scrapeRoute(app: FastifyInstance) {
  app.post('/v1/scrape', async (req, reply) => {
    const user = req.user;
    const { provider: providerId = 'auto', params = {} } = req.body as any;
    const overrideKey = (req.headers['x-provider-key'] || req.headers['x-api-key-override']) as string | undefined;

    // Rate limit check
    const rl = await checkRateLimit(user.id, user.plan);
    reply.header('X-RateLimit-Limit',     rl.limit);
    reply.header('X-RateLimit-Remaining', rl.remaining);
    reply.header('X-RateLimit-Reset',     rl.resetAt);
    if (!rl.ok) {
      return reply.code(429).send({ error: 'rate_limit_exceeded', retry_after: rl.resetAt - Math.floor(Date.now() / 1000) });
    }

    // Pre-check BYOK monthly allowance & wallet balance
    const targetProvider = providerId === 'auto' ? 'firecrawl' : providerId;
    const byokEval = await preCheckAndEvaluateByok(user.id, targetProvider);
    if (!byokEval.allowed && byokEval.errorResponse) {
      return reply.code(byokEval.errorResponse.statusCode).send(byokEval.errorResponse.payload);
    }

    try {
      const { result, provider, charge: baseCharge, duration_ms, routedVia, attemptsCount } = await autoRun('scrape', params, user.id, overrideKey);
      const finalCharge = byokEval.isFreeCall ? 0 : baseCharge;

      reply.header('X-LiteDaemon-Routed-Via',       routedVia);
      reply.header('X-LiteDaemon-Key-Attempts',     attemptsCount);
      reply.header('X-LiteDaemon-Wallet-Deducted',  `$${finalCharge.toFixed(6)}`);

      // Record job and debit gateway fee
      const jr = await pool.query(
        `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, cost_usd, is_byok)
         VALUES ($1, $2, 'scrape', $3, 'completed', $4, true) RETURNING id`,
        [user.id, provider.id, JSON.stringify(params), finalCharge]
      );
      const jobId = jr.rows[0].id;

      if (finalCharge > 0) {
        try {
          await debitLedger(user.id, finalCharge, provider.id, jobId, `${provider.name} scrape gateway fee — ${params.url || 'request'}`);
        } catch (err: any) {
          if (err instanceof InsufficientFundsError) {
            return reply.code(402).send({ error: 'insufficient_balance', message: err.message, required_usd: finalCharge });
          }
        }
      }

      await pool.query(`UPDATE jobs SET result=$1, completed_at=NOW() WHERE id=$2`, [JSON.stringify(result), jobId]);
      return reply.send({
        job_id: jobId,
        status: 'completed',
        provider: provider.id,
        result,
        cost_usd: finalCharge,
        duration_ms,
        routed_via: routedVia,
      });
    } catch (err: any) {
      const status = (err as any).statusCode || (err as any).code === 'BYOK_KEY_REQUIRED' ? 401 : 502;
      return reply.code(status).send({
        error: (err as any).code || 'scrape_failed',
        message: err.message,
      });
    }
  });
}
