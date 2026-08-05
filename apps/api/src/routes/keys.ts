// routes/keys.ts — BYOK multi-key management endpoints
import { FastifyInstance } from 'fastify';
import { pool }            from '../db/client';
import { 
  listByokKeys, 
  addByokKey, 
  deleteByokKey, 
  reorderByokKeys,
  KeyType 
} from '../services/byok';

export async function keysRoute(app: FastifyInstance) {

  // ── GET /v1/keys — List all BYOK keys for the authenticated user ───────────
  app.get('/v1/keys', async (req, reply) => {
    const keys = await listByokKeys(req.user.id);
    return reply.send({ keys });
  });

  // ── POST /v1/keys — Add a new BYOK key for a provider ─────────────────────
  app.post('/v1/keys', async (req, reply) => {
    const { provider_id, api_key, key_type = 'prioritized', label } = req.body as any;

    if (!provider_id || typeof provider_id !== 'string')
      return reply.code(422).send({ error: 'validation_error', message: 'provider_id is required' });
    if (!api_key || typeof api_key !== 'string' || api_key.trim().length < 4)
      return reply.code(422).send({ error: 'validation_error', message: 'api_key must be at least 4 characters' });
    if (key_type !== 'prioritized' && key_type !== 'fallback')
      return reply.code(422).send({ error: 'validation_error', message: 'key_type must be prioritized or fallback' });

    // Ensure provider exists
    const pr = await pool.query(
      `SELECT id, name, endpoint FROM providers WHERE id = $1 AND is_active = true`,
      [provider_id],
    );
    if (!pr.rows[0])
      return reply.code(404).send({ error: 'provider_not_found', message: `No active provider with id: ${provider_id}` });

    const key = await addByokKey(req.user.id, provider_id, api_key.trim(), key_type as KeyType, label);

    return reply.code(201).send({
      message:     `BYOK key saved for ${pr.rows[0].name}`,
      key,
    });
  });

  // ── PUT /v1/keys/reorder — Update priority order of keys ──────────────────
  app.put('/v1/keys/reorder', async (req, reply) => {
    const { provider_id, key_type, ordered_ids } = req.body as any;

    if (!provider_id || !key_type || !Array.isArray(ordered_ids))
      return reply.code(422).send({ error: 'validation_error', message: 'provider_id, key_type, and ordered_ids array required' });

    await reorderByokKeys(req.user.id, provider_id, key_type as KeyType, ordered_ids);
    return reply.send({ message: 'Key priority order updated', provider_id, key_type });
  });

  // ── DELETE /v1/keys/:key_id — Remove a specific BYOK key ──────────────────
  app.delete('/v1/keys/:key_id', async (req, reply) => {
    const { key_id } = req.params as { key_id: string };
    const deleted = await deleteByokKey(req.user.id, key_id);

    if (!deleted)
      return reply.code(404).send({ error: 'key_not_found', message: `No BYOK key found with id: ${key_id}` });

    return reply.send({ message: 'BYOK key deleted successfully', key_id });
  });

  // ── POST /v1/keys/verify — Format validation for a provider key ────────────
  // NOTE: This performs key format validation only. Live provider connectivity
  // testing requires adapter-specific health check methods (future improvement).
  app.post('/v1/keys/verify', async (req, reply) => {
    const { provider_id, api_key } = req.body as any;
    if (!provider_id || !api_key) {
      return reply.code(422).send({ error: 'validation_error', message: 'provider_id and api_key are required' });
    }

    const start = Date.now();

    if (typeof api_key !== 'string' || api_key.trim().length < 4) {
      return reply.code(400).send({ 
        error: 'invalid_key', 
        message: 'Invalid API Key: Key is too short (minimum 4 characters).',
        valid: false,
        latency_ms: Date.now() - start,
      });
    }

    // Verify provider exists
    const pr = await pool.query(
      `SELECT id, name FROM providers WHERE id = $1 AND is_active = true`,
      [provider_id],
    );
    if (!pr.rows[0]) {
      return reply.code(404).send({
        valid: false,
        message: `Unknown provider: ${provider_id}`,
        latency_ms: Date.now() - start,
      });
    }

    const latency_ms = Date.now() - start;
    return reply.send({
      valid: true,
      message: `Key format accepted for ${pr.rows[0].name}. Key will be tested on first use.`,
      latency_ms,
    });
  });
}
