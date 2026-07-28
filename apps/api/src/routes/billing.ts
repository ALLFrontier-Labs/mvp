import { FastifyInstance } from 'fastify';
import { getCheckoutUrl, calcCheckoutPrice, verifyLSSignature, handleOrderCreated } from '../services/billing';

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

  // LemonSqueezy calls this directly — it sends X-Signature, never a Bearer
  // token, so this route must be marked public or authHook rejects it before
  // signature verification ever runs.
  app.post('/v1/webhooks/lemonsqueezy', { config: { public: true, rawBody: true } }, async (req, reply) => {
    const sig = req.headers['x-signature'] as string;
    if (!sig || !verifyLSSignature(req.rawBody as Buffer, sig))
      return reply.code(401).send({ error: 'invalid_signature' });

    const body = req.body as any;
    if (body?.meta?.event_name === 'order_created') {
      await handleOrderCreated(body);
    }
    return reply.send({ received: true });
  });
}
