// routes/keys.ts — BYOK key management endpoints
import { FastifyInstance }                                    from 'fastify';
import { pool }                                              from '../db/client';
import { listByokKeys, upsertByokKey, deleteByokKey }        from '../services/byok';

export async function keysRoute(app: FastifyInstance) {

  // ── GET /v1/keys — List all BYOK keys for the authenticated user ───────────
  app.get('/v1/keys', async (req, reply) => {
    const keys = await listByokKeys(req.user.id);
    return reply.send({ keys });
  });

  // ── POST /v1/keys — Add or replace a BYOK key ──────────────────────────────
  app.post('/v1/keys', async (req, reply) => {
    const { provider_id, api_key, label } = req.body as any;

    if (!provider_id || typeof provider_id !== 'string')
      return reply.code(422).send({ error: 'validation_error', message: 'provider_id is required' });
    if (!api_key || typeof api_key !== 'string' || api_key.trim().length < 8)
      return reply.code(422).send({ error: 'validation_error', message: 'api_key must be at least 8 characters' });

    // Ensure provider exists and is active
    const pr = await pool.query(
      `SELECT id, name, endpoint FROM providers WHERE id = $1 AND is_active = true`,
      [provider_id],
    );
    if (!pr.rows[0])
      return reply.code(404).send({ error: 'provider_not_found', message: `No active provider with id: ${provider_id}` });

    await upsertByokKey(req.user.id, provider_id, api_key.trim(), label);

    return reply.code(201).send({
      message:     `BYOK key saved for ${pr.rows[0].name}`,
      provider_id,
      endpoint:    pr.rows[0].endpoint,
      byok_active: true,
    });
  });

  // ── DELETE /v1/keys/:provider_id — Remove a BYOK key ──────────────────────
  app.delete('/v1/keys/:provider_id', async (req, reply) => {
    const { provider_id } = req.params as { provider_id: string };
    const deleted = await deleteByokKey(req.user.id, provider_id);
    if (!deleted)
      return reply.code(404).send({ error: 'key_not_found', message: `No BYOK key found for provider: ${provider_id}` });
    return reply.send({ message: `BYOK key removed for ${provider_id}`, provider_id, byok_active: false });
  });
}
