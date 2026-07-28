import axios from 'axios';
import type { ProviderAdapter, DocumentResult } from '../types';

export const firecrawlParseAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    const targetUrl = params.file_url || params.url;
    if (!targetUrl && !params.file_b64) {
      throw new Error('firecrawl_parse requires params.file_url or params.file_b64');
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
      throw new Error(r.data.error || 'Firecrawl Document Parse returned error');
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
  },
};
