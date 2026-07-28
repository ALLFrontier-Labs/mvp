// services/autoRoute.ts — Smart provider routing for `provider: "auto"` calls
import { pool }               from '../db/client';
import { getAdapter }         from '../adapters/index';
import { resolveProviderKey } from './byok';
import { calculateCharge }    from './billing';
import { debitLedger }        from './ledger';
import type { LDProvider }    from '../types';

export interface AutoRouteResult {
  result:       any;
  provider:     LDProvider;
  apiKey:       string;
  isByok:       boolean;
  charge:       number;
  duration_ms:  number;
}

// Returns live providers for an endpoint, cheapest first
export async function getLiveProviders(endpoint: string): Promise<LDProvider[]> {
  const r = await pool.query(
    `SELECT * FROM providers
     WHERE endpoint   = $1
       AND is_active  = true
       AND is_live    = true
     ORDER BY cost_per_call_usd ASC`,
    [endpoint],
  );
  return r.rows as LDProvider[];
}

// Try providers one by one (cheapest first) until one succeeds.
// Does NOT create job or debit wallet — caller does that after success.
export async function autoRun(
  endpoint: string,
  params:   Record<string, any>,
  userId:   string,
): Promise<AutoRouteResult> {
  const providers = await getLiveProviders(endpoint);

  if (providers.length === 0)
    throw new Error(`No live providers available for endpoint: /v1/${endpoint}`);

  const errors: string[] = [];

  for (const provider of providers) {
    const { apiKey, isByok } = await resolveProviderKey(userId, provider.api_key_encrypted, provider.id);
    const adapter = getAdapter(provider.adapter_type);
    const started = Date.now();

    try {
      const res    = await adapter.run(params, apiKey);
      const result = (res as any).result ?? res;
      const charge = isByok ? 0 : calculateCharge(parseFloat(provider.cost_per_call_usd));

      return {
        result,
        provider,
        apiKey,
        isByok,
        charge,
        duration_ms: Date.now() - started,
      };
    } catch (err: any) {
      // Log error and try next provider
      errors.push(`${provider.id}: ${err.message || 'unknown error'}`);
      continue;
    }
  }

  throw new Error(`All providers failed.\n${errors.join('\n')}`);
}
