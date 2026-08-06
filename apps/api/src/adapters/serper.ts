import axios from 'axios';
import type { ProviderAdapter, SearchResult } from '../types';
import { ProviderError } from '../types';

export const serperAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    try {
    if (!params.query) throw new ProviderError('serper requires params.query', false);
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
  } catch (err: any) {
      if (err instanceof ProviderError) throw err;
      const status = err.response?.status;
      const isQuota = status === 401 || status === 402 || status === 403 || status === 429;
      throw new ProviderError(`API Error: ${err.message}`, isQuota);
    }
  },
};
