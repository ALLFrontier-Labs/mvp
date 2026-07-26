import axios from 'axios';
import type { ProviderAdapter, SearchResult } from '../types';

export const exaAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.query) throw new Error('exa requires params.query');
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
  },
};
