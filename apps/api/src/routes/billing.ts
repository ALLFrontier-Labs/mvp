import { FastifyInstance } from 'fastify';
import { getCheckoutUrl, verifyLSSignature, handleOrderCreated } from '../services/billing';

export async function billingRoute(app: FastifyInstance) {
  app.get('/v1/billing/checkout', async (req, reply) => {
    const { amount } = req.query as any;
    if (!['10', '25', '50', '100'].includes(amount))
      return reply.code(422).send({ error: 'invalid_amount', valid: [10, 25, 50, 100] });
    return reply.send({ checkout_url: getCheckoutUrl(req.user.id, amount) });
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
