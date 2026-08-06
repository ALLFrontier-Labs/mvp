import axios from 'axios';
import type { ProviderAdapter, DocumentResult } from '../types';
import { ProviderError } from '../types';

export const unstructuredAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    try {
      // NOTE: Best-effort implementation placeholder. 
      // Replace with actual Unstructured API payload mapping.
      const r = await axios.post(
        'https://api.unstructured.io/general/v0/general',
        { ...params },
        { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 45000 }
      );

      const result: DocumentResult = { content: 'Mock parsed text', format: 'markdown', metadata: {} };
      return { type: 'sync', result };
    } catch (err: any) {
      if (err instanceof ProviderError) throw err;
      const status = err.response?.status;
      const isQuota = status === 401 || status === 402 || status === 403 || status === 429;
      throw new ProviderError(`Unstructured API Error: ${err.message}`, isQuota);
    }
  },
};
