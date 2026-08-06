import axios from 'axios';
import type { ProviderAdapter, SearchResult } from '../types';
import { ProviderError } from '../types';

export const braveAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!apiKey || apiKey === 'PLACEHOLDER' || apiKey.startsWith('sk-test')) {
      throw new ProviderError('Brave Search API key is not configured or requires a valid BYOK key', true);
    }

    try {
      const query = params.query || params.q || '';
      if (!query) throw new ProviderError('Brave Search requires a query parameter', false);

      const r = await axios.get(
        'https://api.search.brave.com/res/v1/web/search',
        {
          params: { q: query, count: params.limit || 5 },
          headers: { 'Accept': 'application/json', 'X-Subscription-Token': apiKey },
          timeout: 15000,
        }
      );

      const webResults = r.data?.web?.results || [];
      const results = webResults.map((item: any) => ({
        title: item.title || '',
        url: item.url || '',
        snippet: item.description || '',
      }));

      const result: SearchResult = { results };
      return { type: 'sync', result };
    } catch (err: any) {
      if (err instanceof ProviderError) throw err;
      const status = err.response?.status;
      const isQuota = status === 401 || status === 402 || status === 403 || status === 429 || !status;
      throw new ProviderError(`Brave Search API Error: ${err.message}`, isQuota);
    }
  },
};
