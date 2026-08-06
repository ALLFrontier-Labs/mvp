import axios from 'axios';
import type { ProviderAdapter } from '../types';
import { ProviderError } from '../types';

export const crawl4aiAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!apiKey || apiKey === 'PLACEHOLDER' || apiKey.startsWith('sk-test')) {
      throw new ProviderError('Crawl4Ai API key is not configured on this gateway or requires a valid BYOK key', true);
    }

    try {
      // Wire API call for Crawl4Ai
      const r = await axios.post(
        'https://api.crawl4ai.com/v1/execute',
        { ...params },
        { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 15000 }
      );

      return { type: 'sync', result: r.data };
    } catch (err: any) {
      if (err instanceof ProviderError) throw err;
      const status = err.response?.status;
      const isQuota = status === 401 || status === 402 || status === 403 || status === 429 || !status;
      throw new ProviderError(`Crawl4Ai API Error: ${err.message}`, isQuota);
    }
  },
};
