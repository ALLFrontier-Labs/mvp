import axios from 'axios';
import type { ProviderAdapter, ExecuteResult } from '../types';
import { ProviderError } from '../types';

export const daytonaAdapter: ProviderAdapter = {
  async run(params, apiKey) {
    if (!params.code) throw new ProviderError('daytona requires params.code', false);

    const language = params.language || 'python';
    const isPlaceholder = !apiKey || apiKey === 'PLACEHOLDER' || apiKey.startsWith('sk-test');

    if (!isPlaceholder) {
      try {
        const createRes = await axios.post(
          'https://api.daytona.io/v1/workspace',
          { target: 'local', language },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 20000,
          }
        );

        const workspaceId = createRes.data?.id || createRes.data?.workspaceId;

        if (workspaceId) {
          try {
            const cmd = language === 'python'
              ? `python3 -c ${JSON.stringify(params.code)}`
              : language === 'javascript' || language === 'node'
              ? `node -e ${JSON.stringify(params.code)}`
              : params.code;

            const execRes = await axios.post(
              `https://api.daytona.io/v1/workspace/${workspaceId}/exec`,
              { command: cmd, env: params.env || {} },
              {
                headers: { 'Authorization': `Bearer ${apiKey}` },
                timeout: params.timeout_ms || 30000,
              }
            );

            const result: ExecuteResult = {
              stdout:    execRes.data?.stdout || execRes.data?.output || '',
              stderr:    execRes.data?.stderr || '',
              exit_code: execRes.data?.exitCode ?? 0,
            };
            return { type: 'sync', result };
          } finally {
            axios.delete(`https://api.daytona.io/v1/workspace/${workspaceId}`, {
              headers: { 'Authorization': `Bearer ${apiKey}` },
              timeout: 10000,
            }).catch(() => {});
          }
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          throw new ProviderError('Daytona API key invalid or unauthorized', true);
        }
      }
    }

    throw new ProviderError('Daytona API key is not configured or requires a valid BYOK key', true);
  },
};
