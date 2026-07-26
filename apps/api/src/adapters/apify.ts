import axios from 'axios';
import type { ProviderAdapter, ScrapeResult } from '../types';

export const apifyAdapter: ProviderAdapter = {
  // run() returns Apify run_id immediately in < 300ms
  async run(params, apiKey) {
    if (!params.actor_id) throw new Error('apify requires params.actor_id');
    if (!params.run_input && !params.url)
      throw new Error('apify requires either params.run_input or params.url');
    const r = await axios.post(
      `https://api.apify.com/v2/acts/${encodeURIComponent(params.actor_id)}/runs`,
      params.run_input || { startUrls: [{ url: params.url }] },
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
