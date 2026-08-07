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
import { providersRoute } from './routes/providers';
import { keysRoute }      from './routes/keys';
import { documentRoute }  from './routes/document';
import { logger } from './lib/logger';
import { RequestValidationError } from './lib/validation';

Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV });

const app = Fastify({
  logger: false, // We use our own structured logger
  connectionTimeout: 0,
  // connectionTimeout: 0 disables Fastify's connection timeout.
  // Needed for sync providers like Firecrawl that may take 30s+.
});

// ── Allowed Origins — strict whitelist ────────────────────────────────────────
const ALLOWED_ORIGINS = new Set([
  'https://www.litedaemon.xyz',
  'https://litedaemon.xyz',
  'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
]);

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  // Allow *.vercel.app deployments (exact suffix match)
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.vercel.app') && url.protocol === 'https:') return true;
  } catch {
    // Invalid URL — reject
  }
  return false;
}

async function main() {
  await app.register(rawBody);
  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin) return cb(null, true);

      if (isAllowedOrigin(origin)) {
        cb(null, true);
      } else {
        logger.warn('cors_rejected', { origin });
        cb(new Error(`CORS: Origin not allowed`), false);
      }
    },
  });

  // ── Security Headers — injected on every response ───────────────────────────
  app.addHook('onSend', async (_req, reply, payload) => {
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '0'); // Modern browsers — CSP is the real protection
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
    reply.header('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none'; form-action 'self'");
    return payload;
  });

  // ── Global IP Rate Limiting (DDoS protection) ──────────────────────────────
  // In-memory rate limiter for basic DDoS protection — 200 req/min per IP
  const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
  const GLOBAL_LIMIT = 200;
  const GLOBAL_WINDOW_MS = 60_000;

  app.addHook('onRequest', async (req, reply) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const ipStr = Array.isArray(ip) ? ip[0] : String(ip);
    const now = Date.now();

    let entry = ipRequestCounts.get(ipStr);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + GLOBAL_WINDOW_MS };
      ipRequestCounts.set(ipStr, entry);
    }
    entry.count++;

    if (entry.count > GLOBAL_LIMIT) {
      logger.warn('global_rate_limit_exceeded', { ip: ipStr });
      reply.code(429).send({
        error: 'too_many_requests',
        message: 'Rate limit exceeded. Please slow down.',
        retry_after_seconds: Math.ceil((entry.resetAt - now) / 1000),
      });
      return;
    }
  });

  // Periodic cleanup of IP rate limit map (every 5 minutes)
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of ipRequestCounts) {
      if (now > entry.resetAt) ipRequestCounts.delete(ip);
    }
  }, 300_000);

  // ── Auth Endpoint Rate Limiting (brute-force protection) ────────────────────
  const authIpCounts = new Map<string, { count: number; resetAt: number }>();
  const AUTH_LIMIT = 10; // 10 auth attempts per minute per IP
  const AUTH_WINDOW_MS = 60_000;

  app.addHook('onRequest', async (req, reply) => {
    const url = req.url || '';
    if (!url.includes('/v1/auth/')) return; // Only rate-limit auth endpoints

    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const ipStr = Array.isArray(ip) ? ip[0] : String(ip);
    const now = Date.now();

    let entry = authIpCounts.get(ipStr);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + AUTH_WINDOW_MS };
      authIpCounts.set(ipStr, entry);
    }
    entry.count++;

    if (entry.count > AUTH_LIMIT) {
      logger.warn('auth_rate_limit_exceeded', { ip: ipStr, path: url });
      reply.code(429).send({
        error: 'too_many_auth_attempts',
        message: 'Too many authentication attempts. Please wait before trying again.',
        retry_after_seconds: Math.ceil((entry.resetAt - now) / 1000),
      });
      return;
    }
  });

  // Cleanup auth rate limit map every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of authIpCounts) {
      if (now > entry.resetAt) authIpCounts.delete(ip);
    }
  }, 300_000);

  // ── Global Error Handler — clean JSON, no internal details leaked ───────────
  app.setErrorHandler((error: any, _req, reply) => {
    // Handle validation errors with proper status code
    if (error instanceof RequestValidationError) {
      return reply.code(422).send({
        error: 'validation_error',
        message: error.message,
        fields: error.fields,
      });
    }

    // Log error safely — never expose internals to client
    logger.error('unhandled_request_error', error, {
      statusCode: error.statusCode,
    });

    const status = (error.statusCode as number) ?? 500;
    const safeMessage = status >= 500
      ? 'Internal Server Error'
      : (error.message as string) || 'Request failed';

    reply.code(status).send({ error: safeMessage });
  });

  app.addHook('preHandler', authHook);

  app.register(authRoute);
  app.register(scrapeRoute);
  app.register(searchRoute);
  app.register(browserRoute);
  app.register(executeRoute);
  app.register(documentRoute);
  app.register(jobsRoute);
  app.register(usageRoute);
  app.register(providersRoute);
  app.register(keysRoute);

  // Public — no API key exists yet for a health check
  app.get('/health', { config: { public: true } }, async () => ({ ok: true, ts: Date.now() }));

  const port = Number(process.env.PORT) || 3000;
  await app.listen({ port, host: '0.0.0.0' });
  logger.info('server_started', { port, env: process.env.NODE_ENV });

  startOrphanJobReconciliation();
}

main().catch((err) => {
  logger.error('server_startup_failed', err);
  process.exit(1);
});
