import axios from 'axios';
import type { ProviderAdapter } from '../types';
import { ProviderError } from '../types';

export const scrapingbeeAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!apiKey || apiKey === 'PLACEHOLDER' || apiKey.startsWith('sk-test')) {
      throw new ProviderError('Scrapingbee API key is not configured on this gateway or requires a valid BYOK key', true);
    }

    try {
      // Wire API call for Scrapingbee
      const r = await axios.post(
        'https://api.scrapingbee.com/v1/execute',
        { ...params },
        { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 15000 }
      );

      return { type: 'sync', result: r.data };
    } catch (err: any) {
      if (err instanceof ProviderError) throw err;
      const status = err.response?.status;
      const isQuota = status === 401 || status === 402 || status === 403 || status === 429 || !status;
      throw new ProviderError(`Scrapingbee API Error: ${err.message}`, isQuota);
    }
  },
};
