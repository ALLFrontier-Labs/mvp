import axios from 'axios';
import type { ProviderAdapter, ScrapeResult } from '../types';
import { ProviderError } from '../types';

export const scrapeDoAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    try {
      // NOTE: Best-effort implementation placeholder. 
      // Replace with actual Scrape.do API payload mapping.
      const r = await axios.post(
        'https://api.scrape.do/',
        { ...params },
        { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 45000 }
      );

      const result: ScrapeResult = { content: 'Mock scraped data', metadata: {} };
      return { type: 'sync', result };
    } catch (err: any) {
      if (err instanceof ProviderError) throw err;
      const status = err.response?.status;
      const isQuota = status === 401 || status === 402 || status === 403 || status === 429;
      throw new ProviderError(`Scrape.do API Error: ${err.message}`, isQuota);
    }
  },
};
