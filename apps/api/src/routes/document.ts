import { FastifyInstance } from 'fastify';
import { pool }             from '../db/client';
import { checkRateLimit }   from '../services/rateLimit';
import { autoRun }          from '../services/autoRoute';

export async function documentRoute(app: FastifyInstance) {
  app.post('/v1/document', async (req, reply) => {
    const user = req.user;
    let providerId = 'auto';
    let overrideKey: string | undefined = (req.headers['x-provider-key'] || req.headers['x-api-key-override']) as string | undefined;
    let mergedParams: Record<string, any> = {};

    if ((req as any).isMultipart && (req as any).isMultipart()) {
      const parts = (req as any).parts();
      let fileBuffer: Buffer | null = null;
      let fileName = 'document.pdf';

      for await (const part of parts) {
        if (part.type === 'file') {
          fileName = part.filename;
          fileBuffer = await part.toBuffer();
        } else {
          if (part.fieldname === 'provider') providerId = (part.value as string) || 'auto';
          else if (part.fieldname === 'format') mergedParams.format = part.value;
          else if (part.fieldname === 'schema') mergedParams.schema = part.value;
          else if (part.fieldname === 'file_url') mergedParams.file_url = part.value;
        }
      }

      if (fileBuffer) {
        mergedParams.file_base64 = fileBuffer.toString('base64');
        mergedParams.file_name = fileName;
      }
    } else {
      const body = (req.body || {}) as any;
      providerId = body.provider || 'auto';
      mergedParams = body.params || body;
    }

    if (!mergedParams.file_url && !mergedParams.file_base64) {
      return reply.code(422).send({ error: 'validation_error', message: 'file or file_url is required' });
    }

    const rl = await checkRateLimit(user.id, user.plan);
    reply.header('X-RateLimit-Limit',     rl.limit);
    reply.header('X-RateLimit-Remaining', rl.remaining);
    reply.header('X-RateLimit-Reset',     rl.resetAt);
    if (!rl.ok) {
      return reply.code(429).send({ error: 'rate_limit_exceeded', retry_after: rl.resetAt - Math.floor(Date.now() / 1000) });
    }

    try {
      const { result, provider, duration_ms, routedVia, attemptsCount } = await autoRun('document', mergedParams, user.id, overrideKey, providerId);

      reply.header('X-LiteDaemon-Routed-Via',      routedVia);
      reply.header('X-LiteDaemon-Key-Attempts',    attemptsCount);

      const jr = await pool.query(
        `INSERT INTO jobs (user_id, provider_id, endpoint, params, status, is_byok)
         VALUES ($1, $2, 'document', $3, 'completed', true) RETURNING id`,
        [user.id, provider.id, JSON.stringify(mergedParams)]
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
        error: (err as any).code || 'document_parse_failed',
        message: err.message,
      });
    }
  });
}
