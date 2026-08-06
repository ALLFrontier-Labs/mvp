import axios from 'axios';
import type { ProviderAdapter, SearchResult } from '../types';
import { ProviderError } from '../types';

export const exaAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    try {
    if (!params.query) throw new ProviderError('exa requires params.query', false);
    const r = await axios.post(
      'https://api.exa.ai/search',
      {
        query:      params.query,
        numResults: params.max_results || 5,
        type:       params.type || 'neural',
        contents:   { text: { maxCharacters: params.max_chars || 1000 } },
      },
      { headers: { 'x-api-key': apiKey }, timeout: 15000 }
    );
    const result: SearchResult = {
      results: (r.data.results || []).map((x: any) => ({
        title:   x.title || '',
        url:     x.url,
        snippet: x.text || '',
        score:   x.score,
      })),
    };
    return { type: 'sync', result };
  } catch (err: any) {
      if (err instanceof ProviderError) throw err;
      const status = err.response?.status;
      const isQuota = status === 401 || status === 402 || status === 403 || status === 429;
      throw new ProviderError(`API Error: ${err.message}`, isQuota);
    }
  },
};
