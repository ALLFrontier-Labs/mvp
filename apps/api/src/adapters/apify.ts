import axios from 'axios';
import type { ProviderAdapter, ScrapeResult } from '../types';

export const apifyAdapter: ProviderAdapter = {
  // run() returns Apify run_id immediately in < 300ms
  async run(params, apiKey) {
    // Default to website-content-crawler — no extra permissions needed
    const actorId = params.actor_id || 'apify/website-content-crawler';
    const runInput = params.run_input || {
      startUrls: [{ url: params.url || 'https://example.com' }],
      maxCrawlDepth: 0,
      maxCrawlPages: 1,
    };
    const r = await axios.post(
      `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs`,
      runInput,
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 15000 }
    );
    return { type: 'async', provider_job_id: r.data.data.id };
  },

  // status() called by GET /v1/jobs/:id on each developer poll
  async status(run_id, apiKey) {
    const s = await axios.get(
      `https://api.apify.com/v2/actor-runs/${run_id}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    const st = s.data.data.status;
    if (st === 'SUCCEEDED') {
      const items = await axios.get(
        `https://api.apify.com/v2/actor-runs/${run_id}/dataset/items`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      const text = items.data.map((i: any) => i.markdown || i.text || JSON.stringify(i)).join('\n\n');
      const result: ScrapeResult = {
        content:  text,
        metadata: { url: `apify-run:${run_id}`, word_count: text.split(/\s+/).length },
      };
      return { status: 'completed', result };
    }
    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(st))
      return { status: 'failed', error: `Apify run ${st} — run_id: ${run_id}` };
    return { status: 'running' };
  },
};
