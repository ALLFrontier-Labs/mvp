// services/autoRoute.ts — Pure BYOK Multi-Key Gateway & Router
// Architecture:
//   1. Per-request override key (`X-Provider-Key` header) takes top priority.
//   2. User's configured BYOK keys for the target provider are tried in sequence:
//      - Prioritized Keys (Key #1 -> Key #2 -> Key #3...)
//      - Fallback Keys (tried if all Prioritized Keys hit 401/402/403/429 errors)
//   3. On non-quota errors (5xx/runtime errors/scraping blocks), surface error directly.
//   4. No platform reseller keys are used — guarantees ToS compliance.

import { pool }                   from '../db/client';
import { getAdapter }             from '../adapters/index';
import { getProviderKeysForUser, markKeyUsed } from './byok';
import { calculateCharge }        from './billing';
import type { LDProvider }        from '../types';

export type RoutedVia = 'BYOK-Header-Override' | 'BYOK-Prioritized' | 'BYOK-Fallback';

export interface AutoRouteResult {
  result:           any;
  provider:         LDProvider;
  apiKey:           string;
  charge:           number;
  duration_ms:      number;
  routedVia:        RoutedVia;
  attemptsCount:    number;
  keyIdUsed?:       string;
}

const QUOTA_AUTH_STATUS_CODES = new Set([401, 402, 403, 429]);

function isQuotaOrAuthError(err: any): boolean {
  if (err.statusCode && QUOTA_AUTH_STATUS_CODES.has(Number(err.statusCode))) return true;
  if (err.status && QUOTA_AUTH_STATUS_CODES.has(Number(err.status))) return true;
  
  const msg = String(err.message || '');
  const match = msg.match(/\b(401|402|403|429)\b/);
  return match !== null;
}

// ── Returns live tool providers for an endpoint ────────────────────────────
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
export async function autoRun(
  endpoint:    string,
  params:      Record<string, any>,
  userId:      string,
  overrideKey?: string,
): Promise<AutoRouteResult> {

  const providers = await getLiveProviders(endpoint);
  if (providers.length === 0) {
    throw new Error(`No active tool providers configured for endpoint: /v1/${endpoint}`);
  }

  // CASE 1: Header Key Override (X-Provider-Key)
  if (overrideKey && overrideKey.trim().length > 0) {
    const provider = providers[0];
    const adapter  = getAdapter(provider.adapter_type);
    const started  = Date.now();
    const cleanKey = overrideKey.trim();

    const res    = await adapter.run(params, cleanKey);
    const result = (res as any).result ?? res;
    const charge = calculateCharge(provider.id);

    return {
      result,
      provider,
      apiKey: cleanKey,
      charge,
      duration_ms: Date.now() - started,
      routedVia: 'BYOK-Header-Override',
      attemptsCount: 1,
    };
  }

  // CASE 2: Iterate over live providers for this endpoint, trying user BYOK keys
  const routingErrors: string[] = [];
  let attemptsCount = 0;

  for (const provider of providers) {
    const userKeys = await getProviderKeysForUser(userId, provider.id);
    if (userKeys.length === 0) {
      routingErrors.push(`${provider.name} (${provider.id}): No BYOK keys configured by user`);
      continue;
    }

    const adapter = getAdapter(provider.adapter_type);

    for (const keyObj of userKeys) {
      attemptsCount++;
      const started = Date.now();

      try {
        const res    = await adapter.run(params, keyObj.rawKey);
        const result = (res as any).result ?? res;
        const charge = calculateCharge(provider.id);

        markKeyUsed(keyObj.id);

        return {
          result,
          provider,
          apiKey: keyObj.rawKey,
          charge,
          duration_ms: Date.now() - started,
          routedVia: keyObj.key_type === 'prioritized' ? 'BYOK-Prioritized' : 'BYOK-Fallback',
          attemptsCount,
          keyIdUsed: keyObj.id,
        };
      } catch (err: any) {
        const isQuota = isQuotaOrAuthError(err);
        routingErrors.push(`Key [${keyObj.key_type}:${keyObj.id.slice(0, 6)}] for ${provider.id} failed: ${err.message}`);

        if (isQuota) {
          // Quota / Rate-limit / Auth error -> failover to next key in list
          continue;
        } else {
          // Execution / Scraper block / Runtime error -> surface directly to caller
          throw Object.assign(
            new Error(`Provider error on ${provider.name}: ${err.message}`),
            { code: 'PROVIDER_EXECUTION_ERROR', provider: provider.id, originalError: err.message },
          );
        }
      }
    }
  }

  // If we reach here, all user BYOK keys failed or no BYOK key was set up
  const err = new Error(
    `BYOK Key Required / All Keys Failed.\n${routingErrors.join('\n')}\nPlease configure active BYOK API keys in your dashboard at /app/keys`
  );
  (err as any).code = 'BYOK_KEY_REQUIRED';
  (err as any).statusCode = 401;
  throw err;
}
