import axios from 'axios';
import type { ProviderAdapter, ExecuteResult } from '../types';

export const e2bAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.code) throw new Error('e2b requires params.code');

    // Step 1: Create sandbox
    const create = await axios.post(
      'https://api.e2b.dev/sandboxes',
      { template: params.template || 'base', timeout: Math.floor((params.timeout_ms || 30000) / 1000) },
      { headers: { 'X-API-Key': apiKey }, timeout: 15000 }
    );
    const sandboxId: string = create.data.sandboxId;

    try {
      // Step 2: Execute code
      const exec = await axios.post(
        `https://api.e2b.dev/sandboxes/${sandboxId}/process`,
        {
          cmd: params.language === 'python' ? `python3 -c "${params.code.replace(/"/g, '\\"')}"` : params.code,
          envs: params.env || {},
        },
        { headers: { 'X-API-Key': apiKey }, timeout: params.timeout_ms || 30000 }
      );
      const result: ExecuteResult = {
        stdout:    exec.data.stdout || '',
        stderr:    exec.data.stderr || '',
        exit_code: exec.data.exitCode ?? 0,
      };
      return { type: 'sync', result };
    } finally {
      // ALWAYS destroy sandbox — prevent runaway compute charges
      try {
        await axios.delete(`https://api.e2b.dev/sandboxes/${sandboxId}`, {
          headers: { 'X-API-Key': apiKey },
          timeout: 10000,
        });
      } catch { /* log but do not propagate */ }
    }
  },
};
