import axios from 'axios';
import type { ProviderAdapter, DocumentResult } from '../types';
import { ProviderError } from '../types';

export const firecrawlParseAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    try {
    const targetUrl = params.file_url || params.url;
    if (!targetUrl && !params.file_b64) {
      throw new ProviderError('firecrawl_parse requires params.file_url or params.file_b64', false);
    }

    const wantJson = params.format === 'json' || !!params.schema;
    const formats = wantJson ? ['extract', 'markdown'] : ['markdown'];

    const body: Record<string, any> = {
      formats,
      onlyMainContent: true,
    };

    if (targetUrl) {
      body.url = targetUrl;
    }

    if (params.schema) {
      body.extract = {
        schema: params.schema,
      };
    }

    const r = await axios.post(
      'https://api.firecrawl.dev/v1/scrape',
      body,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 60000,
      }
    );

    if (!r.data.success && !r.data.data) {
      throw new ProviderError(r.data.error || 'Firecrawl Document Parse returned error', false);
    }

    const d = r.data.data || {};
    const markdown = d.markdown || d.content || d.html || '';
    const structuredData = d.extract || d.json || null;

    const result: DocumentResult = {
      content: markdown,
      format: wantJson ? 'json' : 'markdown',
      structured_data: structuredData,
      metadata: {
        file_name: d.metadata?.title || targetUrl?.split('/').pop() || 'document',
        page_count: d.metadata?.pageCount || d.metadata?.pages || 1,
        source_format: targetUrl?.split('.').pop()?.toLowerCase() || 'pdf',
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
