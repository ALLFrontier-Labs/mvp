import axios from 'axios';
import type { ProviderAdapter, SearchResult } from '../types';

export const serperAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.query) throw new Error('serper requires params.query');
    const r = await axios.post(
      'https://google.serper.dev/search',
      { q: params.query, num: params.max_results || 10 },
      { headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' }, timeout: 10000 }
    );
    const result: SearchResult = {
      results: (r.data.organic || []).map((x: any) => ({
        title:   x.title,
        url:     x.link,
        snippet: x.snippet || '',
        score:   x.position ? 1 / x.position : undefined,
      })),
      answer: r.data.answerBox?.answer || r.data.answerBox?.snippet || undefined,
    };
    return { type: 'sync', result };
  },
};
