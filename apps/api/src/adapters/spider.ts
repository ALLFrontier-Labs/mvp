import axios from 'axios';
import type { ProviderAdapter, ScrapeResult } from '../types';
import { ProviderError } from '../types';

export const spiderAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    try {
    if (!params.url) throw new ProviderError('spider requires params.url', false);
    const r = await axios.post(
      'https://api.spider.cloud/crawl',
      { url: params.url, limit: params.limit || 1, return_format: 'markdown' },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 30000 }
    );
    const page = Array.isArray(r.data) ? r.data[0] : r.data;
    const result: ScrapeResult = {
      content:  page?.content || page?.markdown || '',
      metadata: { url: page?.url || params.url, title: page?.metadata?.title },
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
