import { FastifyInstance } from 'fastify';
import { getCheckoutUrl, calcCheckoutPrice, handleDodoPaymentSucceeded } from '../services/billing';
import { logger } from '../lib/logger';
import { validateAmount } from '../lib/validation';
import { dodo } from '../lib/dodo';

export async function billingRoute(app: FastifyInstance) {
  app.get('/v1/billing/checkout', async (req, reply) => {
    const { amount } = req.query as any;

    let creditAmount: number;
    try {
      creditAmount = validateAmount(amount, 5, 999, 'amount');
    } catch (e: any) {
      return reply.code(422).send({ error: 'invalid_amount', message: e.message });
    }

    try {
      const checkout_url    = await getCheckoutUrl(req.user.id, creditAmount);
      const checkout_price  = calcCheckoutPrice(creditAmount);
      logger.billing('checkout_created', req.user.id, creditAmount);
      return reply.send({ checkout_url, checkout_price, credit_amount: creditAmount });
    } catch (err: any) {
      logger.error('checkout_failed', err, { userId: req.user.id });
      return reply.code(500).send({ error: err.message || 'Failed to create checkout' });
    }
  });

  // Dodo Payments Webhook
  app.post('/v1/webhooks/dodo', { config: { public: true, rawBody: true } }, async (req, reply) => {
    const secret = process.env.DODO_WEBHOOK_SECRET;

    // SECURITY: Reject webhooks entirely if secret is not configured
    if (!secret) {
      logger.error('webhook_secret_missing', new Error('DODO_WEBHOOK_SECRET not configured'));
      return reply.code(503).send({ error: 'webhook_not_configured' });
    }

    if (!req.rawBody) {
      logger.warn('webhook_missing_body');
      return reply.code(400).send({ error: 'missing_body' });
    }

    let eventBody: any;

    try {
      const payloadStr = req.rawBody.toString('utf8');
      eventBody = dodo.webhooks.unwrap(payloadStr, {
        headers: req.headers as Record<string, string>,
        key: secret
      });
    } catch (err: any) {
      logger.warn('webhook_invalid_signature', { errorType: err.name });
      return reply.code(401).send({ error: 'invalid_signature' });
    }

    // Log webhook event type (never the full payload)
    logger.webhook(eventBody?.type || 'unknown', {
      hasMetadata: !!eventBody?.data?.metadata,
    });

    if (eventBody?.type === 'payment.succeeded') {
      try {
        await handleDodoPaymentSucceeded(eventBody);
      } catch (err: any) {
        logger.error('webhook_processing_failed', err);
        // Return 200 to Dodo so they don't retry endlessly, but log the error
      }
    }
    
    return reply.send({ received: true });
  });
}
