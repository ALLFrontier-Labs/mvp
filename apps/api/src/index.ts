import 'dotenv/config';
import Fastify from 'fastify';
import rawBody from 'fastify-raw-body';
import cors from '@fastify/cors';
import * as Sentry from '@sentry/node';
import { authHook } from './services/auth';
import { startOrphanJobReconciliation } from './services/reconciliation';
import { authRoute } from './routes/auth';
import { scrapeRoute } from './routes/scrape';
import { searchRoute } from './routes/search';
import { browserRoute } from './routes/browser';
import { executeRoute } from './routes/execute';
import { jobsRoute } from './routes/jobs';
import { usageRoute } from './routes/usage';
import { billingRoute } from './routes/billing';

Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV });

const app = Fastify({
  logger: process.env.NODE_ENV !== 'production',
  connectionTimeout: 0,
  // connectionTimeout: 0 disables Fastify's connection timeout.
  // Needed for sync providers like Firecrawl that may take 30s+.
});

async function main() {
  await app.register(rawBody);
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin || origin.endsWith('.vercel.app')) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'), false);
      }
    },
  });

  // Global error handler — return clean JSON for all unhandled errors
  app.setErrorHandler((error, _req, reply) => {
    console.error('[Fastify error]', error);
    const status = error.statusCode ?? 500;
    reply.code(status).send({ error: error.message || 'Internal Server Error' });
  });

  app.addHook('preHandler', authHook);

  app.register(authRoute);
  app.register(scrapeRoute);
  app.register(searchRoute);
  app.register(browserRoute);
  app.register(executeRoute);
  app.register(jobsRoute);
  app.register(usageRoute);
  app.register(billingRoute);

  // Public — no API key exists yet for a health check
  app.get('/health', { config: { public: true } }, async () => ({ ok: true, ts: Date.now() }));

  const port = Number(process.env.PORT) || 3000;
  await app.listen({ port, host: '0.0.0.0' });
  console.log('LiteDaemon API running on port', port);

  startOrphanJobReconciliation();
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
