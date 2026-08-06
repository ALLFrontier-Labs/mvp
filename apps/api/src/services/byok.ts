// services/byok.ts — Bring Your Own Keys service (Multi-Key Prioritization & Fallbacks)
import { pool }             from '../db/client';
import { encrypt, decrypt } from './encryption';
import { logger }           from '../lib/logger';

export type KeyType = 'prioritized' | 'fallback';

export interface UserByokKey {
  id:             string;
  provider_id:    string;
  key_type:       KeyType;
  priority_order: number;
  label:          string | null;
  is_active:      boolean;
  last_used_at:   string | null;
  created_at:     string;
  key_hint:       string;
}

export interface DecryptedUserKey {
  id:             string;
  provider_id:    string;
  rawKey:         string;
  key_type:       KeyType;
  priority_order: number;
}

// ── Get all BYOK keys for a user & provider, sorted by key_type and priority_order
export async function getProviderKeysForUser(
  userId:     string,
  providerId: string,
): Promise<DecryptedUserKey[]> {
  const r = await pool.query(
    `SELECT id, provider_id, api_key_encrypted, key_type, priority_order
     FROM user_provider_keys
     WHERE user_id = $1 AND provider_id = $2 AND is_active = true
     ORDER BY 
       CASE WHEN key_type = 'prioritized' THEN 1 ELSE 2 END,
       priority_order ASC,
       created_at ASC`,
    [userId, providerId],
  );

  return r.rows.map(row => ({
    id:             row.id,
    provider_id:    row.provider_id,
    rawKey:         decrypt(row.api_key_encrypted),
    key_type:       row.key_type as KeyType,
    priority_order: row.priority_order,
  }));
}

// ── Touch last_used_at timestamp on key execution ────────────────────────────
export function markKeyUsed(keyId: string): void {
  pool.query(
    `UPDATE user_provider_keys SET last_used_at = NOW() WHERE id = $1`,
    [keyId],
  ).catch((err) => logger.warn('byok_key_last_used_update_failed', { error: err.message, keyId }));
}

// ── Add a BYOK key for a provider ─────────────────────────────────────────────
export async function addByokKey(
  userId:     string,
  providerId: string,
  rawKey:     string,
  keyType:    KeyType = 'prioritized',
  label?:     string,
): Promise<UserByokKey> {
  const encrypted = encrypt(rawKey);

  // Calculate next priority_order for this section
  const orderRes = await pool.query(
    `SELECT COALESCE(MAX(priority_order), -1) + 1 AS next_order
     FROM user_provider_keys
     WHERE user_id = $1 AND provider_id = $2 AND key_type = $3`,
    [userId, providerId, keyType],
  );
  const nextOrder = orderRes.rows[0]?.next_order ?? 0;

  const r = await pool.query(
    `INSERT INTO user_provider_keys (user_id, provider_id, api_key_encrypted, key_type, priority_order, label)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id::text AS id, provider_id, key_type, priority_order, label, is_active, last_used_at, created_at`,
    [userId, providerId, encrypted, keyType, nextOrder, label ?? null],
  );

  const row = r.rows[0];
  return {
    id:             row.id,
    provider_id:    row.provider_id,
    key_type:       row.key_type as KeyType,
    priority_order: row.priority_order,
    label:          row.label,
    is_active:      row.is_active,
    last_used_at:   row.last_used_at,
    created_at:     row.created_at,
    key_hint:       'sk-••••••••••••••••••••',
  };
}

// ── Delete a BYOK key by ID ──────────────────────────────────────────────────
export async function deleteByokKey(userId: string, keyId: string): Promise<boolean> {
  try {
    const r = await pool.query(
      `DELETE FROM user_provider_keys WHERE (id::text = $1 OR provider_id = $1) AND user_id = $2 RETURNING id`,
      [keyId, userId],
    );
    return (r.rowCount ?? 0) > 0;
  } catch (e) {
    return false;
  }
}

// ── Reorder keys within a key_type section ────────────────────────────────────
export async function reorderByokKeys(
  userId:     string,
  providerId: string,
  keyType:    KeyType,
  orderedIds: string[],
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < orderedIds.length; i++) {
      await client.query(
        `UPDATE user_provider_keys
         SET priority_order = $1
         WHERE id::text = $2 AND user_id = $3 AND provider_id = $4 AND key_type = $5`,
        [i, orderedIds[i], userId, providerId, keyType],
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── List all BYOK keys for a user (safe — never exposes raw or encrypted key) ─
export async function listByokKeys(userId: string) {
  const r = await pool.query(
    `SELECT
       upk.id::text AS id,
       upk.provider_id,
       upk.key_type,
       upk.priority_order,
       upk.label,
       upk.is_active,
       upk.last_used_at,
       upk.created_at,
       p.name              AS provider_name,
       p.endpoint,
       p.adapter_type,
       p.cost_per_call_usd AS platform_cost_usd
     FROM user_provider_keys upk
     JOIN providers p ON p.id = upk.provider_id
     WHERE upk.user_id = $1
     ORDER BY 
       p.endpoint, p.name,
       CASE WHEN upk.key_type = 'prioritized' THEN 1 ELSE 2 END,
       upk.priority_order ASC`,
    [userId],
  );

  return r.rows.map(row => ({
    id:                row.id,
    provider_id:       row.provider_id,
    provider_name:     row.provider_name,
    endpoint:          row.endpoint,
    adapter_type:      row.adapter_type,
    key_type:          row.key_type as KeyType,
    priority_order:    row.priority_order,
    label:             row.label,
    is_active:         row.is_active,
    last_used_at:      row.last_used_at,
    created_at:        row.created_at,
    platform_cost_usd: parseFloat(row.platform_cost_usd),
    key_hint:          'sk-••••••••••••••••••••',
  }));
}
