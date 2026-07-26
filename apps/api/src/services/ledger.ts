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
  userId:      string,
  amountUsd:   number,
  providerId:  string,
  jobId:       string,
  description: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock user row exclusively for this transaction
    const lock = await client.query(
      `SELECT id, balance_usd FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );
    if (!lock.rows[0]) throw new Error('User not found');

    const balance    = parseFloat(lock.rows[0].balance_usd);
    const required   = Math.round(amountUsd * 1e8) / 1e8; // normalize precision

    if (balance < required) {
      await client.query('ROLLBACK');
      throw new InsufficientFundsError(
        `Wallet balance $${balance} is less than required $${required}`
      );
    }

    const newBalance = Math.round((balance - required) * 1e8) / 1e8;

    // Deduct from wallet
    await client.query(
      `UPDATE users SET balance_usd = $1 WHERE id = $2`,
      [newBalance, userId]
    );

    // Append immutable ledger entry — never delete or update these rows
    await client.query(
      `INSERT INTO ledger_entries
         (user_id, type, direction, amount_usd, provider_id, job_id, description, balance_after)
       VALUES ($1, 'debit', 'debit', $2, $3, $4, $5, $6)`,
      [userId, required, providerId, jobId, description, newBalance]
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
