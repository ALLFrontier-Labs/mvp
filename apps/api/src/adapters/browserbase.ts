import axios from 'axios';
import type { ProviderAdapter, BrowserResult } from '../types';

// ── Auto-discover default project ID from Browserbase API ────────────────────
// Cached in memory after first fetch — no DB lookup needed.
let _cachedProjectId: string | null = null;

async function getDefaultProjectId(apiKey: string): Promise<string> {
  if (_cachedProjectId) return _cachedProjectId;
  const r = await axios.get('https://api.browserbase.com/v1/projects', {
    headers: { 'x-bb-api-key': apiKey },
    timeout: 8000,
  });
  const id = r.data?.[0]?.id;
  if (!id) throw new Error('No Browserbase projects found — check your API key');
  _cachedProjectId = id;
  return id;
}

export const browserbaseAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    // Use provided project_id, or auto-discover from Browserbase account
    const projectId = params.project_id || await getDefaultProjectId(apiKey);

    const r = await axios.post(
      'https://www.browserbase.com/v1/sessions',
      {
        projectId,
        browserSettings: {
          viewport:    { width: 1920, height: 1080 },
          fingerprint: { devices: ['desktop'], locales: ['en-US'] },
        },
      },
      { headers: { 'x-bb-api-key': apiKey }, timeout: 15000 }
    );

    const result: BrowserResult = {
      session_id:  r.data.id,
      connect_url: r.data.connectUrl,
      debug_url:   r.data.debuggerUrl || undefined,
    };
    return { type: 'sync', result };
  },
};
