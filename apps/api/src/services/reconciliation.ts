// services/reconciliation.ts
import { pool }       from '../db/client';
import { getAdapter } from '../adapters/index';
import { decrypt }    from './encryption';
import { logger }     from '../lib/logger';

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // every hour

async function reconcileOrphanedJobs(): Promise<void> {
  const stale = await pool.query(
    `SELECT j.id, j.provider_job_id, p.adapter_type, p.api_key_encrypted
     FROM jobs j
     JOIN providers p ON p.id = j.provider_id
     WHERE j.status = 'running'
       AND j.provider_job_id IS NOT NULL
       AND j.created_at < NOW() - INTERVAL '4 hours'`
  );

  for (const job of stale.rows) {
    try {
      const adapter = getAdapter(job.adapter_type);
      if (!adapter.status) continue;

      const s = await adapter.status(job.provider_job_id, decrypt(job.api_key_encrypted));
      if (s.status === 'completed') {
        await pool.query(
          `UPDATE jobs SET status='completed', result=$1, completed_at=NOW() WHERE id=$2`,
          [JSON.stringify(s.result), job.id]
        );
      } else {
        await pool.query(`UPDATE jobs SET status='failed', completed_at=NOW() WHERE id=$1`, [job.id]);
      }
    } catch {
      await pool.query(`UPDATE jobs SET status='failed', completed_at=NOW() WHERE id=$1`, [job.id]);
    }
  }

  if (stale.rows.length > 0) {
    logger.info('reconciliation_completed', { resolvedCount: stale.rows.length });
  }
}

export function startOrphanJobReconciliation(): void {
  setInterval(reconcileOrphanedJobs, CHECK_INTERVAL_MS);
  logger.info('reconciliation_scheduled', { intervalMs: CHECK_INTERVAL_MS });
}
