import axios from 'axios';
import type { ProviderAdapter, ScrapeResult } from '../types';
import { ProviderError } from '../types';

export const jinaAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    try {
    if (!params.url) throw new ProviderError('jina requires params.url', false);
    const r = await axios.get(`https://r.jina.ai/${params.url}`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'text/plain' },
      timeout: 20000,
    });
    const result: ScrapeResult = {
      content:  r.data as string,
      metadata: { url: params.url, word_count: (r.data as string).split(/\s+/).length },
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
