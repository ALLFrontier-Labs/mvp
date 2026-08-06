import { FastifyInstance } from 'fastify';
import { getCheckoutUrl, calcCheckoutPrice, handleDodoPaymentSucceeded } from '../services/billing';
import crypto from 'crypto';

export async function billingRoute(app: FastifyInstance) {
  app.get('/v1/billing/checkout', async (req, reply) => {
    const { amount } = req.query as any;
    const creditAmount = parseFloat(amount);
    if (isNaN(creditAmount) || creditAmount < 5 || creditAmount > 999)
      return reply.code(422).send({ error: 'invalid_amount', message: 'Amount must be between $5 and $999' });

    try {
      const checkout_url    = await getCheckoutUrl(req.user.id, creditAmount);
      const checkout_price  = calcCheckoutPrice(creditAmount);
      return reply.send({ checkout_url, checkout_price, credit_amount: creditAmount });
    } catch (err: any) {
      return reply.code(500).send({ error: err.message || 'Failed to create checkout' });
    }
  });

  // Dodo Payments Webhook
  app.post('/v1/webhooks/dodo', { config: { public: true, rawBody: true } }, async (req, reply) => {
    console.log('[Webhook] Received Dodo webhook attempt', req.headers);
    const secret = process.env.DODO_WEBHOOK_SECRET;
    
    let eventBody: any;
    
    if (secret && req.rawBody) {
      try {
        const payloadStr = req.rawBody.toString('utf8');
        eventBody = dodo.webhooks.unwrap(payloadStr, {
          headers: req.headers as Record<string, string>,
          key: secret
        });
      } catch (err: any) {
        console.error('[Webhook] Invalid signature:', err.message);
        return reply.code(401).send({ error: 'invalid_signature' });
      }
    } else {
      eventBody = req.body;
    }

    if (eventBody?.type === 'payment.succeeded') {
      await handleDodoPaymentSucceeded(eventBody);
    }
    
    return reply.send({ received: true });
  });
}
