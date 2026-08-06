import axios from 'axios';
import type { ProviderAdapter, SearchResult } from '../types';
import { ProviderError } from '../types';

export const tavilyAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    try {
    if (!params.query) throw new ProviderError('tavily requires params.query', false);
    const r = await axios.post(
      'https://api.tavily.com/search',
      {
        query:        params.query,
        search_depth: params.search_depth || 'basic',
        max_results:  params.max_results || 5,
        include_answer: true,
      },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 15000 }
    );
    const result: SearchResult = {
      results: (r.data.results || []).map((x: any) => ({
        title:   x.title,
        url:     x.url,
        snippet: x.content || x.snippet || '',
        score:   x.score,
      })),
      answer: r.data.answer || undefined,
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
