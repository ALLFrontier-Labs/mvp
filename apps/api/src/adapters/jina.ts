import axios from 'axios';
import type { ProviderAdapter, ScrapeResult } from '../types';

export const jinaAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.url) throw new Error('jina requires params.url');
    const r = await axios.get(`https://r.jina.ai/${params.url}`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'text/plain' },
      timeout: 20000,
    });
    const result: ScrapeResult = {
      content:  r.data as string,
      metadata: { url: params.url, word_count: (r.data as string).split(/\s+/).length },
    };
    return { type: 'sync', result };
  },
};
