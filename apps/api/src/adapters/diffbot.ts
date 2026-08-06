import axios from 'axios';
import type { ProviderAdapter, DocumentResult } from '../types';
import { ProviderError } from '../types';

export const diffbotAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    try {
      // NOTE: Best-effort implementation placeholder. 
      // Replace with actual Diffbot API payload mapping.
      const r = await axios.post(
        'https://api.diffbot.com/v3/article',
        { ...params },
        { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 45000 }
      );

      const result: DocumentResult = { content: 'Mock parsed text', format: 'markdown', metadata: {} };
      return { type: 'sync', result };
    } catch (err: any) {
      if (err instanceof ProviderError) throw err;
      const status = err.response?.status;
      const isQuota = status === 401 || status === 402 || status === 403 || status === 429;
      throw new ProviderError(`Diffbot API Error: ${err.message}`, isQuota);
    }
  },
};
