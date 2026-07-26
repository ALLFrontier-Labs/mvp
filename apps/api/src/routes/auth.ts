import { FastifyInstance } from 'fastify';
import { createUser } from '../services/auth';

export async function authRoute(app: FastifyInstance) {
  // A new developer has no API key yet, so this route must be marked public —
  // otherwise the global authHook rejects the request before it ever reaches
  // this handler. See Section 12 for how authHook checks this config flag.
  app.post('/v1/auth/signup', { config: { public: true } }, async (req, reply) => {
    const { email } = req.body as any;
    if (!email) return reply.code(422).send({ error: 'validation_error', fields: ['email is required'] });

    try {
      const apiKey = await createUser(email);
      return reply.send({
        api_key: apiKey,
        message: 'Save this key now — it will not be shown again.',
      });
    } catch (e: any) {
      if (e.code === '23505') // Postgres unique_violation on users.email
        return reply.code(409).send({ error: 'email_already_registered' });
      throw e;
    }
  });
}
