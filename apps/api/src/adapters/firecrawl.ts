import axios from 'axios';
import type { ProviderAdapter, ScrapeResult } from '../types';
import { ProviderError } from '../types';

export const firecrawlAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    try {
    if (!params.url) throw new ProviderError('firecrawl requires params.url', false);
    const r = await axios.post(
      'https://api.firecrawl.dev/v1/scrape',
      {
        url:             params.url,
        formats:         params.formats || ['markdown'],
        onlyMainContent: params.onlyMainContent ?? true,
      },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 45000 }
    );
    if (!r.data.success) throw new ProviderError(r.data.error || 'Firecrawl returned success=false', false);

    const result: ScrapeResult = {
      content:  r.data.data?.markdown || r.data.data?.html || '',
      metadata: {
        title:      r.data.data?.metadata?.title,
        url:        r.data.data?.metadata?.url || params.url,
        word_count: r.data.data?.markdown?.split(/\s+/).length,
      },
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
