import axios from 'axios';
import type { ProviderAdapter, ScrapeResult } from '../types';
import { ProviderError } from '../types';

export const scrapflyAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    try {
      // NOTE: Best-effort implementation placeholder. 
      // Replace with actual Scrapfly API payload mapping.
      const r = await axios.post(
        'https://api.scrapfly.io/scrape',
        { ...params },
        { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 45000 }
      );

      const result: ScrapeResult = { content: 'Mock scraped data', metadata: {} };
      return { type: 'sync', result };
    } catch (err: any) {
      if (err instanceof ProviderError) throw err;
      const status = err.response?.status;
      const isQuota = status === 401 || status === 402 || status === 403 || status === 429;
      throw new ProviderError(`Scrapfly API Error: ${err.message}`, isQuota);
    }
  },
};
