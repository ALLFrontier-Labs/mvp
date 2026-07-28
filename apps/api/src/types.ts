// src/types.ts
import 'fastify';

// ── Unified response schemas ──────────────────────────────────────────────────

export interface ScrapeResult {
  content:  string;
  metadata: {
    title?:        string;
    url?:          string;
    word_count?:   number;
    source_format?: string;
  };
}

export interface SearchResult {
  results: Array<{
    title:    string;
    url:      string;
    snippet:  string;
    score?:   number;
  }>;
  answer?: string;
}

export interface BrowserResult {
  session_id:  string;
  connect_url: string;
  debug_url?:  string;
}

export interface ExecuteResult {
  stdout:    string;
  stderr:    string;
  exit_code: number;
}

export interface DocumentResult {
  content:          string;
  format:           'markdown' | 'json';
  structured_data?: any;
  metadata: {
    file_name?:     string;
    page_count?:    number;
    source_format?: string;
  };
}

export type UnifiedResult = ScrapeResult | SearchResult | BrowserResult | ExecuteResult | DocumentResult;

// ── Adapter return types ──────────────────────────────────────────────────────

export interface SyncRunResult  { type: 'sync';  result: UnifiedResult }
export interface AsyncRunResult { type: 'async'; provider_job_id: string }
export type RunResult = SyncRunResult | AsyncRunResult;

export interface StatusResult {
  status:   'running' | 'completed' | 'failed';
  result?:  UnifiedResult;
  error?:   string;
}

// ── Adapter interface ─────────────────────────────────────────────────────────

export interface ProviderAdapter {
  run(params: Record<string, any>, apiKey: string): Promise<RunResult>;
  status?(provider_job_id: string, apiKey: string): Promise<StatusResult>;
}

// ── Domain types ──────────────────────────────────────────────────────────────

export interface LDUser {
  id:          string;
  email:       string;
  balance_usd: string;  // string because pg returns NUMERIC as string
  plan:        string;
}

export interface LDProvider {
  id:                string;
  name:              string;
  endpoint:          string;
  adapter_type:      string;
  response_type:     'sync' | 'async';
  api_key_encrypted: string;
  cost_per_call_usd: string;
}

// ── Fastify request augmentation ──────────────────────────────────────────────

declare module 'fastify' {
  interface FastifyRequest {
    user: LDUser;
  }
}
