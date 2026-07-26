import axios from 'axios';
import type { ProviderAdapter, BrowserResult } from '../types';

export const browserbaseAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.project_id) throw new Error('browserbase requires params.project_id');
    const r = await axios.post(
      'https://www.browserbase.com/v1/sessions',
      {
        projectId:       params.project_id,
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
