import { FastifyInstance } from 'fastify';
import { pool }             from '../db/client';
import { debitLedger, InsufficientFundsError } from '../services/ledger';
import { checkRateLimit }   from '../services/rateLimit';
import { autoRun }          from '../services/autoRoute';

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

    // Pre-check wallet balance prior to proxying (Call #1 Fee Engine)
    const userRes = await pool.query('SELECT balance_usd FROM users WHERE id = $1', [user.id]);
    const currentBalance = parseFloat(userRes.rows[0]?.balance_usd || '0');
    if (currentBalance <= 0) {
      return reply.code(402).send({
        error: 'insufficient_balance',
        message: 'Insufficient prepaid balance to cover 5% BYOK gateway routing fee. Please top up your wallet.',
        current_balance_usd: currentBalance,
      });
    }

    try {
      const { result, provider, charge, duration_ms, routedVia, attemptsCount } = await autoRun('scrape', params, user.id, overrideKey);

      reply.header('X-LiteDaemon-Routed-Via',       routedVia);
      reply.header('X-LiteDaemon-Key-Attempts',     attemptsCount);
      reply.header('X-LiteDaemon-Wallet-Deducted',  `$${charge.toFixed(6)}`);

      // Record job and debit gateway fee
      const jr = await pool.query(
        `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, cost_usd, is_byok)
         VALUES ($1, $2, 'scrape', $3, 'completed', $4, true) RETURNING id`,
        [user.id, provider.id, JSON.stringify(params), charge]
      );
      const jobId = jr.rows[0].id;

      if (charge > 0) {
        try {
          await debitLedger(user.id, charge, provider.id, jobId, `${provider.name} scrape gateway fee — ${params.url || 'request'}`);
        } catch (err: any) {
          if (err instanceof InsufficientFundsError) {
            return reply.code(402).send({ error: 'insufficient_balance', message: err.message, required_usd: charge });
          }
        }
      }

      await pool.query(`UPDATE jobs SET result=$1, completed_at=NOW() WHERE id=$2`, [JSON.stringify(result), jobId]);
      return reply.send({
        job_id: jobId,
        status: 'completed',
        provider: provider.id,
        result,
        cost_usd: charge,
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
