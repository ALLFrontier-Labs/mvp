// src/lib/api.ts

const API_BASE = 'https://mvp-production-c1e8.up.railway.app/v1';

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

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
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
      plan: string;
      created_at: string;
      balance_usd: number;
      total_calls: number;
      billed_calls: number;
      total_spent_usd: number;
    }>('/me');
  },

  getUsage: async () => {
    return apiRequest<{
      total_calls: number;
      billed_calls: number;
      total_spent_usd: number;
      balance_usd: number;
    }>('/usage');
  },

  getJob: async (id: string) => {
    return apiRequest<{
      job_id: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      provider: string;
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

  // ── BYOK — Bring Your Own Keys ──────────────────────────────────────────
  listKeys: async () => {
    return apiRequest<{
      keys: Array<{
        provider_id: string;
        provider_name: string;
        endpoint: string;
        adapter_type: string;
        label: string | null;
        is_active: boolean;
        last_used_at: string | null;
        created_at: string;
        platform_cost_usd: number;
        key_hint: string;
      }>;
    }>('/keys');
  },

  addKey: async (provider_id: string, api_key: string, label?: string) => {
    return apiRequest<{ message: string; provider_id: string; byok_active: boolean }>('/keys', {
      method: 'POST',
      body: JSON.stringify({ provider_id, api_key, label }),
    });
  },

  deleteKey: async (provider_id: string) => {
    return apiRequest<{ message: string; provider_id: string }>(`/keys/${provider_id}`, {
      method: 'DELETE',
    });
  },

  setKeyStrictMode: async (provider_id: string, strict: boolean) => {
    return apiRequest<{ message: string; provider_id: string; strict_mode: boolean }>(`/keys/${provider_id}/strict`, {
      method: 'PATCH',
      body: JSON.stringify({ strict }),
    });
  },

  // ── Auth Endpoints ──────────────────────────────────────────────────────

  login: async (email: string, password?: string) => {
    return apiRequest<{ api_key: string; user: any; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  socialAuth: async (provider: 'github' | 'google' | 'metamask', email?: string, firstName?: string, lastName?: string) => {
    return apiRequest<{ api_key: string; user: any; message: string }>('/auth/social', {
      method: 'POST',
      body: JSON.stringify({ provider, email, firstName, lastName }),
    });
  },
};
