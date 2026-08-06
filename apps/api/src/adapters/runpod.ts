import axios from 'axios';
import type { ProviderAdapter, ExecuteResult } from '../types';
import { ProviderError } from '../types';

export const runpodAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    try {
      // NOTE: Best-effort implementation placeholder. 
      // Replace with actual RunPod API payload mapping.
      const r = await axios.post(
        'https://api.runpod.ai/v2',
        { ...params },
        { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 45000 }
      );

      const result: ExecuteResult = { stdout: 'Mock execution output', stderr: '', exit_code: 0 };
      return { type: 'sync', result };
    } catch (err: any) {
      if (err instanceof ProviderError) throw err;
      const status = err.response?.status;
      const isQuota = status === 401 || status === 402 || status === 403 || status === 429;
      throw new ProviderError(`RunPod API Error: ${err.message}`, isQuota);
    }
  },
};
