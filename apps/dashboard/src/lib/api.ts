import { GATEWAY_URL } from './constants';

let API_BASE = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_GATEWAY_URL || GATEWAY_URL;
if (API_BASE && !API_BASE.startsWith('http')) {
  API_BASE = 'https://' + API_BASE;
}
if (!API_BASE.endsWith('/v1') && !API_BASE.includes('litedaemon.xyz')) {
  API_BASE = API_BASE.replace(/\/$/, '') + '/v1';
}

export function getStoredApiKey(): string | null {
  return localStorage.getItem('litedaemon_api_key');
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem('litedaemon_api_key', key);
}

export function clearStoredApiKey(): void {
  localStorage.removeItem('litedaemon_api_key');
}

async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const apiKey = getStoredApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(`API Parse Error (Status ${res.status}): Body="${text.substring(0, 100)}" - URL: ${API_BASE}${endpoint}`);
  }

  if (!res.ok) {
    const error = new Error(data.message || data.error || `Request failed with status ${res.status}`);
    (error as any).status = res.status;
    (error as any).code = data.error;
    (error as any).data = data;
    throw error;
  }

  return data;
}

export const api = {
  listProviders: async () => {
    return apiRequest<{
      providers: Array<{
        id: string;
        name: string;
        endpoint: string;
        adapter_type: string;
        response_type: 'sync' | 'async';
        cost_per_call_usd: number;
        is_live: boolean;
      }>;
    }>('/providers');
  },

  signup: async (email: string, password?: string, firstName?: string, lastName?: string) => {
    return apiRequest<{ api_key: string; user: any; message: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
  },

  getMe: async () => {
    return apiRequest<{
      email: string;
      created_at: string;
      total_calls: number;
    }>('/me');
  },

  getUsage: async () => {
    return apiRequest<{
      total_calls: number;
    }>('/usage');
  },

  getJob: async (id: string) => {
    return apiRequest<{
      job_id: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      provider: string;
      endpoint?: string;
      duration_ms?: number;
      routing_type?: string;
      attempts?: number;
      params?: any;
      created_at?: string;
      result?: any;
      cost_usd?: number;
      error?: string;
    }>(`/jobs/${id}`);
  },

  listJobs: async (limit = 20, offset = 0) => {
    return apiRequest<{
      jobs: Array<{
        job_id: string;
        provider: string;
        endpoint: string;
        status: 'pending' | 'running' | 'completed' | 'failed';
        cost_usd: number;
        duration_ms?: number;
        created_at: string;
        completed_at?: string;
      }>;
      total: number;
    }>(`/jobs?limit=${limit}&offset=${offset}`);
  },

  getCheckoutUrl: async (amount: string) => {
    return apiRequest<{ checkout_url: string }>(`/billing/checkout?amount=${amount}`);
  },

  scrape: async (provider: string, params: Record<string, any>) => {
    return apiRequest('/scrape', {
      method: 'POST',
      body: JSON.stringify({ provider, params }),
    });
  },

  search: async (provider: string, params: Record<string, any>) => {
    return apiRequest('/search', {
      method: 'POST',
      body: JSON.stringify({ provider, params }),
    });
  },

  browser: async (provider: string, params: Record<string, any>) => {
    return apiRequest('/browser', {
      method: 'POST',
      body: JSON.stringify({ provider, params }),
    });
  },

  execute: async (provider: string = 'e2b', params: Record<string, any>) => {
    return apiRequest('/execute', {
      method: 'POST',
      body: JSON.stringify({ provider, params }),
    });
  },

  document: async (provider: string = 'auto', params: Record<string, any>) => {
    return apiRequest('/document', {
      method: 'POST',
      body: JSON.stringify({ provider, params }),
    });
  },

  executeEndpoint: async (endpoint: string, params: any) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return apiRequest(cleanEndpoint, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // ── BYOK — Bring Your Own Keys ──────────────────────────────────────────
  listKeys: async () => {
    return apiRequest<{
      keys: Array<{
        id: string;
        provider_id: string;
        provider_name: string;
        endpoint: string;
        adapter_type: string;
        key_type: 'prioritized' | 'fallback';
        priority_order: number;
        label: string | null;
        is_active: boolean;
        last_used_at: string | null;
        created_at: string;
        platform_cost_usd: number;
        key_hint: string;
      }>;
    }>('/keys');
  },

  addKey: async (provider_id: string, api_key: string, key_type: 'prioritized' | 'fallback' = 'prioritized', label?: string) => {
    return apiRequest<{ message: string; key: any }>('/keys', {
      method: 'POST',
      body: JSON.stringify({ provider_id, api_key, key_type, label }),
    });
  },

  reorderKeys: async (provider_id: string, key_type: 'prioritized' | 'fallback', ordered_ids: string[]) => {
    return apiRequest<{ message: string }>('/keys/reorder', {
      method: 'PUT',
      body: JSON.stringify({ provider_id, key_type, ordered_ids }),
    });
  },

  deleteKey: async (key_id: string) => {
    return apiRequest<{ message: string; key_id: string }>(`/keys/${key_id}`, {
      method: 'DELETE',
    });
  },

  verifyKey: async (provider_id: string, api_key: string) => {
    // Client-side pre-validation before hitting the server
    if (!api_key || api_key.trim().length < 4) {
      return { valid: false, message: 'Invalid API Key: Key is too short or empty.' };
    }

    try {
      return await apiRequest<{ valid: boolean; message?: string; latency_ms?: number }>('/keys/verify', {
        method: 'POST',
        body: JSON.stringify({ provider_id, api_key }),
      });
    } catch (err: any) {
      // Propagate actual server errors — do NOT fake success
      return {
        valid: false,
        message: err.message || `Verification failed for ${provider_id}`,
        latency_ms: undefined,
      };
    }
  },


  // ── Auth Endpoints ──────────────────────────────────────────────────────

  login: async (email: string, password?: string) => {
    return apiRequest<{ api_key: string; user: any; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  googleExchange: async (code: string, redirectUri: string) => {
    return apiRequest<{ api_key: string; user: any; message: string }>('/auth/google/exchange', {
      method: 'POST',
      body: JSON.stringify({ code, redirectUri }),
    });
  },

  /** Regenerate Master API Key — deactivates all existing keys server-side */
  regenerateKey: async () => {
    return apiRequest<{ api_key: string; message: string; deactivated_keys: number }>('/auth/regenerate', {
      method: 'POST',
    });
  },
};
