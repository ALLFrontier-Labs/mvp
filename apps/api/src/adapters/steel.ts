import axios from 'axios';
import type { ProviderAdapter, BrowserResult } from '../types';

export const steelAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    const r = await axios.post(
      'https://api.steel.dev/v1/sessions',
      {
        useProxy:       params.proxy ?? false,
        solveCaptcha:   params.solve_captcha ?? true,
        sessionTimeout: params.timeout_ms || 300000,
      },
      { headers: { 'steel-api-key': apiKey }, timeout: 15000 }
    );
    const result: BrowserResult = {
      session_id:  r.data.id,
      connect_url: r.data.cdpUrl || r.data.connectUrl,
      debug_url:   r.data.debugUrl || undefined,
    };
    return { type: 'sync', result };
  },
};
