import axios from 'axios';
import type { ProviderAdapter, SearchResult } from '../types';

export const tavilyAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.query) throw new Error('tavily requires params.query');
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
  },
};
