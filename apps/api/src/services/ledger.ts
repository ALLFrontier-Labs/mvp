// services/ledger.ts
import { pool } from '../db/client';
import { bustAuthCache } from './auth';

export class InsufficientFundsError extends Error {
  constructor(msg: string) { super(msg); this.name = 'InsufficientFundsError'; }
}

// ── ATOMIC DEBIT — SELECT FOR UPDATE ─────────────────────────────────────────
// Uses PostgreSQL row-level locking to guarantee correctness under concurrency.
// SELECT FOR UPDATE acquires an exclusive lock on the user row for the duration
// of the transaction. No other transaction can read or write this row until
// COMMIT or ROLLBACK — eliminates concurrent overdraft.
export async function debitLedger(
  userId:          string,
  amountUsd:       number,
  providerId:      string,
  jobId:           string,
  description:     string,
  rawProviderCost?: number
): Promise<void> {
  // BYOK or $0 call — strictly skip wallet debit & ledger entry
  if (!amountUsd || amountUsd <= 0) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock user row exclusively for this transaction
    const lock = await client.query(
      `SELECT id, balance_usd FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );
    if (!lock.rows[0]) {
      await client.query('ROLLBACK');
      throw new Error('User not found');
    }

    const balance  = parseFloat(lock.rows[0].balance_usd);
    const required = Math.round(amountUsd * 1e8) / 1e8; // normalize precision

    if (balance < required) {
      await client.query('ROLLBACK');
      throw new InsufficientFundsError(
        `Wallet balance $${balance.toFixed(6)} is less than required $${required.toFixed(6)}`
      );
    }

    // Atomic conditional UPDATE — guarantees protection against concurrent overdrafts
    const updateRes = await client.query(
      `UPDATE users
       SET balance_usd = balance_usd - $1, credit_balance = balance_usd - $1
       WHERE id = $2 AND balance_usd >= $1
       RETURNING balance_usd`,
      [required, userId]
    );

    if (updateRes.rows.length === 0) {
      await client.query('ROLLBACK');
      throw new InsufficientFundsError(
        `Atomic debit failed: Wallet balance is less than required $${required.toFixed(6)}`
      );
    }

    const newBalance = parseFloat(updateRes.rows[0].balance_usd);
    const rawCost = rawProviderCost || Math.round((amountUsd / 1.05) * 1e8) / 1e8;
    const markup  = Math.round((required - rawCost) * 1e8) / 1e8;

    // Append immutable ledger entry — never delete or update these rows
    await client.query(
      `INSERT INTO ledger_entries
         (user_id, type, direction, amount_usd, raw_provider_cost, markup_amount, total_deducted, provider_id, job_id, description, balance_after)
       VALUES ($1, 'debit', 'debit', $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, required, rawCost, markup, required, providerId, jobId, description, newBalance]
    );

    await client.query('COMMIT');

    // Bust auth cache so next request reads fresh balance
    bustAuthCache(userId).catch(() => {});
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release(); // always return connection to pool
  }
}

// ── CREDIT (deposit) ──────────────────────────────────────────────────────────
export async function creditLedger(
  userId:      string,
  amountUsd:   number,
  description: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const lock = await client.query(
      `SELECT id, balance_usd FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );
    if (!lock.rows[0]) throw new Error('User not found');

    const balance    = parseFloat(lock.rows[0].balance_usd);
    const newBalance = Math.round((balance + amountUsd) * 1e8) / 1e8;

    await client.query(
      `UPDATE users SET balance_usd = $1 WHERE id = $2`,
      [newBalance, userId]
    );

    await client.query(
      `INSERT INTO ledger_entries
         (user_id, type, direction, amount_usd, description, balance_after)
       VALUES ($1, 'deposit', 'credit', $2, $3, $4)`,
      [userId, amountUsd, description, newBalance]
    );

    await client.query('COMMIT');
    bustAuthCache(userId).catch(() => {});
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
