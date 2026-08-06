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
    // Dodo Payments signature verification (if DODO_WEBHOOK_SECRET is provided)
    const secret = process.env.DODO_WEBHOOK_SECRET;
    if (secret) {
      const signature = req.headers['dodo-signature'] as string;
      if (!signature) {
        return reply.code(401).send({ error: 'missing_signature' });
      }
      
      const payload = req.rawBody as Buffer;
      const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      
      // Use timing-safe comparison to prevent timing attacks
      const sigBuffer = Buffer.from(signature, 'utf8');
      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        console.error('[Webhook] Invalid signature. Expected:', expectedSignature, 'Got:', signature);
        return reply.code(401).send({ error: 'invalid_signature' });
      }
    }

    const body = req.body as any;
    if (body?.type === 'payment.succeeded') {
      await handleDodoPaymentSucceeded(body);
    }
    
    return reply.send({ received: true });
  });
}
