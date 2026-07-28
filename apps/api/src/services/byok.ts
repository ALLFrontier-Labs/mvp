// services/byok.ts — Bring Your Own Keys service
import { pool }             from '../db/client';
import { encrypt, decrypt } from './encryption';

// ── Resolve the effective API key for a provider (BYOK first, then platform) ─
export interface ResolvedKey {
  apiKey: string;
  isByok: boolean;
}

export async function resolveProviderKey(
  userId: string,
  platformEncryptedKey: string,
  providerId: string,
  overrideKey?: string,
): Promise<ResolvedKey> {
  // Priority 1: Per-request header key override (e.g. X-Provider-Key)
  if (overrideKey && overrideKey.trim().length > 0) {
    return { apiKey: overrideKey.trim(), isByok: true };
  }

  // Priority 2: Stored BYOK vault key for user
  const r = await pool.query(
    `SELECT api_key_encrypted FROM user_provider_keys
     WHERE user_id = $1 AND provider_id = $2 AND is_active = true`,
    [userId, providerId],
  );

  if (r.rows[0]) {
    // Update last_used_at async — never block the request path
    pool.query(
      `UPDATE user_provider_keys SET last_used_at = NOW() WHERE user_id = $1 AND provider_id = $2`,
      [userId, providerId],
    ).catch(() => {});

    return { apiKey: decrypt(r.rows[0].api_key_encrypted), isByok: true };
  }

  // Priority 3: Fallback to LiteDaemon platform key
  return { apiKey: decrypt(platformEncryptedKey), isByok: false };
}

// ── Add or replace a BYOK key for a provider ─────────────────────────────────
export async function upsertByokKey(
  userId: string,
  providerId: string,
  rawKey: string,
  label?: string,
): Promise<void> {
  const encrypted = encrypt(rawKey);
  await pool.query(
    `INSERT INTO user_provider_keys (user_id, provider_id, api_key_encrypted, label)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, provider_id)
     DO UPDATE SET api_key_encrypted = EXCLUDED.api_key_encrypted,
                   label             = EXCLUDED.label,
                   is_active         = true`,
    [userId, providerId, encrypted, label ?? null],
  );
}

// ── Remove a BYOK key ─────────────────────────────────────────────────────────
export async function deleteByokKey(userId: string, providerId: string): Promise<boolean> {
  const r = await pool.query(
    `DELETE FROM user_provider_keys WHERE user_id = $1 AND provider_id = $2 RETURNING id`,
    [userId, providerId],
  );
  return (r.rowCount ?? 0) > 0;
}

// ── List all BYOK keys for a user (safe — never returns raw or encrypted key) ─
export async function listByokKeys(userId: string) {
  const r = await pool.query(
    `SELECT
       upk.provider_id,
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
     ORDER BY p.endpoint, p.name`,
    [userId],
  );
  return r.rows.map(row => ({
    provider_id:      row.provider_id,
    provider_name:    row.provider_name,
    endpoint:         row.endpoint,
    adapter_type:     row.adapter_type,
    label:            row.label,
    is_active:        row.is_active,
    last_used_at:     row.last_used_at,
    created_at:       row.created_at,
    platform_cost_usd: parseFloat(row.platform_cost_usd),
    // Never expose the encrypted or raw key — just signal key exists
    key_hint:         'sk-••••••••••••••••••••',
  }));
}
