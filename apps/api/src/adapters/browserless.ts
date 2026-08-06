import axios from 'axios';
import type { ProviderAdapter, BrowserResult } from '../types';
import { ProviderError } from '../types';

export const browserlessAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    try {
      // NOTE: Best-effort implementation placeholder. 
      // Replace with actual Browserless API payload mapping.
      const r = await axios.post(
        'wss://chrome.browserless.io',
        { ...params },
        { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 45000 }
      );

      const result: BrowserResult = { session_id: 'mock-session', connect_url: 'wss://chrome.browserless.io' };
      return { type: 'sync', result };
    } catch (err: any) {
      if (err instanceof ProviderError) throw err;
      const status = err.response?.status;
      const isQuota = status === 401 || status === 402 || status === 403 || status === 429;
      throw new ProviderError(`Browserless API Error: ${err.message}`, isQuota);
    }
  },
};
