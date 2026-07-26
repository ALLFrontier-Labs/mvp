import axios from 'axios';
import type { ProviderAdapter, ScrapeResult } from '../types';

export const spiderAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.url) throw new Error('spider requires params.url');
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
  },
};
