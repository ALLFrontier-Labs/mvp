import axios from 'axios';
import type { ProviderAdapter, ScrapeResult } from '../types';

export const firecrawlAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.url) throw new Error('firecrawl requires params.url');
    const r = await axios.post(
      'https://api.firecrawl.dev/v1/scrape',
      {
        url:             params.url,
        formats:         params.formats || ['markdown'],
        onlyMainContent: params.onlyMainContent ?? true,
      },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 45000 }
    );
    if (!r.data.success) throw new Error(r.data.error || 'Firecrawl returned success=false');

    const result: ScrapeResult = {
      content:  r.data.data?.markdown || r.data.data?.html || '',
      metadata: {
        title:      r.data.data?.metadata?.title,
        url:        r.data.data?.metadata?.url || params.url,
        word_count: r.data.data?.markdown?.split(/\s+/).length,
      },
    };
    return { type: 'sync', result };
  },
};
