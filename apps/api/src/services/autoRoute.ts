// services/autoRoute.ts — BYOK & Fail-Safe Managed Fallback Engine
// Architecture modeled after OpenRouter's BYOK routing:
//   1. If user has a BYOK key → try it first (zero wallet cost)
//   2. If BYOK fails with billing/auth error (401/402/403/429) → check strictMode
//      - strictMode=true  → surface error immediately (Strict Isolation)
//      - strictMode=false → silently fall back to LiteDaemon Managed Pool
//   3. If BYOK fails with non-billing error (5xx, scraper block, runtime error) →
//      surface error immediately — NO fallback (not a billing failure)
import { pool }               from '../db/client';
import { getAdapter }         from '../adapters/index';
import { resolveProviderKey } from './byok';
import { calculateCharge }    from './billing';
import type { LDProvider }    from '../types';

// ── Routing metadata attached to every result ──────────────────────────────
export type RoutedVia       = 'BYOK-Direct' | 'Managed-Fallback' | 'Managed-Primary';
export type FallbackReason  = 'NONE' | 'BYOK_KEY_EXHAUSTED_429' | 'BYOK_KEY_INVALID_401' | 'BYOK_KEY_PAYMENT_402';

export interface AutoRouteResult {
  result:          any;
  provider:        LDProvider;
  apiKey:          string;
  isByok:          boolean;
  charge:          number;
  duration_ms:     number;
  routedVia:       RoutedVia;
  fallbackReason:  FallbackReason;
  walletDeducted:  number;   // 0.00 if BYOK, actual charge if managed
}

// ── BYOK billing-error classifier ─────────────────────────────────────────
// ONLY these status codes should trigger a managed-pool fallback.
// Any other failure (5xx, scraper block, runtime error) → propagate directly.
const BILLING_ERROR_CODES = new Set([401, 402, 403, 429]);

function extractStatusCode(err: any): number | null {
  // Try to parse HTTP status code from error message or property
  if (err.statusCode) return Number(err.statusCode);
  if (err.status)     return Number(err.status);
  if (err.code)       return Number(err.code);

  // Parse from message strings like "401 Unauthorized", "HTTP 429", "status 402"
  const match = String(err.message || '').match(/\b(401|402|403|429)\b/);
  if (match) return parseInt(match[1], 10);
  return null;
}

function isBillingError(err: any): boolean {
  const code = extractStatusCode(err);
  return code !== null && BILLING_ERROR_CODES.has(code);
}

function fallbackReasonForCode(err: any): FallbackReason {
  const code = extractStatusCode(err);
  if (code === 429) return 'BYOK_KEY_EXHAUSTED_429';
  if (code === 401 || code === 403) return 'BYOK_KEY_INVALID_401';
  if (code === 402) return 'BYOK_KEY_PAYMENT_402';
  return 'NONE';
}

// ── Returns live platform providers for an endpoint, cheapest first ────────
export async function getLiveProviders(endpoint: string): Promise<LDProvider[]> {
  const r = await pool.query(
    `SELECT * FROM providers
     WHERE endpoint   = $1
       AND is_active  = true
     ORDER BY cost_per_call_usd ASC`,
    [endpoint],
  );
  return r.rows as LDProvider[];
}

// ── Core routing engine ────────────────────────────────────────────────────
// Does NOT create job or debit wallet — caller does that after success.
export async function autoRun(
  endpoint:    string,
  params:      Record<string, any>,
  userId:      string,
  overrideKey?: string,
): Promise<AutoRouteResult> {

  const providers = await getLiveProviders(endpoint);

  if (providers.length === 0)
    throw new Error(`No live providers available for endpoint: /v1/${endpoint}`);

  const errors: string[] = [];

  for (const provider of providers) {
    const { apiKey, isByok, strictMode } = await resolveProviderKey(
      userId,
      provider.api_key_encrypted,
      provider.id,
      overrideKey,
    );

    const adapter = getAdapter(provider.adapter_type);
    const started = Date.now();

    // ── CASE A: BYOK key ───────────────────────────────────────────────────
    if (isByok) {
      try {
        const res    = await adapter.run(params, apiKey);
        const result = (res as any).result ?? res;

        return {
          result,
          provider,
          apiKey,
          isByok:         true,
          charge:         0,
          duration_ms:    Date.now() - started,
          routedVia:      'BYOK-Direct',
          fallbackReason: 'NONE',
          walletDeducted: 0,
        };
      } catch (byokErr: any) {
        const billing = isBillingError(byokErr);
        const reason  = fallbackReasonForCode(byokErr);

        if (strictMode) {
          // STRICT ISOLATION: user wants hard failure, no fallback at all
          // Surface with a clear error regardless of error type
          throw Object.assign(
            new Error(`BYOK key failed (Strict Isolation enabled): ${byokErr.message}`),
            { code: 'BYOK_STRICT_FAILURE', reason, statusCode: extractStatusCode(byokErr) ?? 429 },
          );
        }

        if (!billing) {
          // Non-billing failure (scraper block, runtime error, 5xx infra) —
          // DO NOT fallback. This is not a key/quota problem.
          throw Object.assign(
            new Error(`Provider error (not a billing failure, no fallback): ${byokErr.message}`),
            { code: 'PROVIDER_ERROR_NO_FALLBACK', reason: 'NONE' },
          );
        }

        // Billing / quota failure + strict=false → fall through to managed pool
        errors.push(`BYOK:${provider.id}: ${byokErr.message} [falling back to managed pool]`);

        // Try managed platform key for THIS same provider first
        try {
          const managedKey = await resolveProviderKey(userId, provider.api_key_encrypted, provider.id);
          // If the BYOK key failed, we want the platform key directly — skip BYOK
          const platformKey = (await import('../db/client')).pool
            .query('SELECT api_key_encrypted FROM providers WHERE id = $1', [provider.id])
            .then(r => r.rows[0]?.api_key_encrypted);

          // Use platform encrypted key directly
          const { decrypt } = await import('./encryption');
          const rawPlatformKey = decrypt(await platformKey);

          const fallbackStarted = Date.now();
          const fallbackRes     = await adapter.run(params, rawPlatformKey);
          const fallbackResult  = (fallbackRes as any).result ?? fallbackRes;
          const charge          = calculateCharge(parseFloat(provider.cost_per_call_usd));

          return {
            result:         fallbackResult,
            provider,
            apiKey:         rawPlatformKey,
            isByok:         false,
            charge,
            duration_ms:    Date.now() - fallbackStarted,
            routedVia:      'Managed-Fallback',
            fallbackReason: reason,
            walletDeducted: charge,
          };
        } catch (fallbackErr: any) {
          errors.push(`Managed-Fallback:${provider.id}: ${fallbackErr.message}`);
          continue; // Try next provider
        }
      }
    }

    // ── CASE B: Platform managed key (no BYOK) ────────────────────────────
    try {
      const res    = await adapter.run(params, apiKey);
      const result = (res as any).result ?? res;
      const charge = calculateCharge(parseFloat(provider.cost_per_call_usd));

      return {
        result,
        provider,
        apiKey,
        isByok:         false,
        charge,
        duration_ms:    Date.now() - started,
        routedVia:      'Managed-Primary',
        fallbackReason: 'NONE',
        walletDeducted: charge,
      };
    } catch (err: any) {
      errors.push(`${provider.id}: ${err.message || 'unknown error'}`);
      continue;
    }
  }

  throw new Error(`All providers failed.\n${errors.join('\n')}`);
}
