import axios from 'axios';
import type { ProviderAdapter, SearchResult } from '../types';
import { ProviderError } from '../types';

export const zenserpAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    try {
      // NOTE: Best-effort implementation placeholder. 
      // Replace with actual Zenserp API payload mapping.
      const r = await axios.post(
        'https://app.zenserp.com/api/v2/search',
        { ...params },
        { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 45000 }
      );

      const result: SearchResult = { results: [{ title: 'Mock Result', url: 'https://example.com', snippet: 'Mock snippet' }] };
      return { type: 'sync', result };
    } catch (err: any) {
      if (err instanceof ProviderError) throw err;
      const status = err.response?.status;
      const isQuota = status === 401 || status === 402 || status === 403 || status === 429;
      throw new ProviderError(`Zenserp API Error: ${err.message}`, isQuota);
    }
  },
};
