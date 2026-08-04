/**
 * Usage & Reset Controller
 * Location: lib/billing/usage.ts
 *
 * Handles:
 * 1. 30-day / calendar-month billing reset engine
 * 2. Pre-call balance auto-charge evaluation
 * 3. HTTP 402 Insufficient Balance rejection before calling provider
 * 4. Atomic ledger entry logging with raw cost, 5% markup, and total deducted
 */

import 'dotenv/config';
import { calculateCallCost, CallCostResult } from './calculator';
import { pool } from '../../db/client';
import { bustAuthCache } from '../../services/auth';

export class InsufficientFundsError extends Error {
  public statusCode: number = 402;
  public error: string = 'insufficient_balance';
  public requiredUsd: number;
  public currentBalance: number;

  constructor(message: string, requiredUsd: number = 0, currentBalance: number = 0) {
    super(message);
    this.name = 'InsufficientFundsError';
    this.requiredUsd = requiredUsd;
    this.currentBalance = currentBalance;
  }
}

export interface UserBillingState {
  id: string;
  monthly_call_count: number;
  billing_period_start: Date;
  balance_usd: number;
  credit_balance: number;
}

export interface ProcessCallResult extends CallCostResult {
  userId: string;
  previousCallCount: number;
  newCallCount: number;
  balanceBefore: number;
  balanceAfter: number;
  resetOccurred: boolean;
  ledgerEntryId?: string;
}

export interface ProcessCallUsageOptions {
  providerId?: string;
  jobId?: string;
  description?: string;
  customNow?: Date;
  inMemoryUser?: UserBillingState;
}

/**
 * Verifies if a new billing period has started (> 30 days or calendar month boundary).
 */
export function shouldResetBillingPeriod(billingPeriodStart: Date | string, now: Date = new Date()): boolean {
  const startDate = new Date(billingPeriodStart);
  if (isNaN(startDate.getTime())) return false;

  const diffMs = now.getTime() - startDate.getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  if (diffMs >= thirtyDaysMs) return true;

  // Calendar month boundary check
  const isNewCalendarMonth =
    now.getUTCFullYear() > startDate.getUTCFullYear() ||
    (now.getUTCFullYear() === startDate.getUTCFullYear() && now.getUTCMonth() > startDate.getUTCMonth());

  return isNewCalendarMonth;
}

/**
 * Core Controller: Checks billing reset, evaluates call cost, enforces 402 balance checks,
 * updates user call count / balance, and logs ledger entries.
 */
export async function processCallUsage(
  userId: string,
  providerRawCost: number,
  options: ProcessCallUsageOptions = {}
): Promise<ProcessCallResult> {
  const now = options.customNow || new Date();
  const providerId = options.providerId || 'gateway';
  const jobId = options.jobId || null;
  const description = options.description || `Tool call via ${providerId}`;

  // IN-MEMORY / MOCK BRANCH (Used for Unit Tests without PostgreSQL)
  if (options.inMemoryUser) {
    const user = options.inMemoryUser;
    const resetOccurred = shouldResetBillingPeriod(user.billing_period_start, now);

    if (resetOccurred) {
      user.monthly_call_count = 0;
      user.billing_period_start = new Date(now);
    }

    const previousCallCount = user.monthly_call_count;
    const costResult = calculateCallCost(providerRawCost, previousCallCount);

    if (!costResult.isFree) {
      if (user.balance_usd < costResult.finalCharge) {
        throw new InsufficientFundsError(
          `Payment Required: Balance $${user.balance_usd.toFixed(4)} is less than required charge $${costResult.finalCharge.toFixed(4)}`,
          costResult.finalCharge,
          user.balance_usd
        );
      }
      user.balance_usd = Math.round((user.balance_usd - costResult.finalCharge) * 1e6) / 1e6;
      user.credit_balance = user.balance_usd;
    }

    user.monthly_call_count += 1;

    return {
      ...costResult,
      userId: user.id,
      previousCallCount,
      newCallCount: user.monthly_call_count,
      balanceBefore: user.balance_usd + (costResult.isFree ? 0 : costResult.finalCharge),
      balanceAfter: user.balance_usd,
      resetOccurred,
    };
  }

  // DATABASE TRANSACTION BRANCH
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Acquire exclusive row lock for safety under concurrency
    const lockRes = await client.query(
      `SELECT id, balance_usd, credit_balance, monthly_call_count, billing_period_start
       FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );

    if (!lockRes.rows[0]) {
      await client.query('ROLLBACK');
      throw new Error(`User not found: ${userId}`);
    }

    const row = lockRes.rows[0];
    let currentCallCount = parseInt(row.monthly_call_count || '0', 10);
    let billingPeriodStart = new Date(row.billing_period_start || now);
    let balance = parseFloat(row.balance_usd || '0');
    let resetOccurred = false;

    // 1. Monthly Reset Check
    if (shouldResetBillingPeriod(billingPeriodStart, now)) {
      currentCallCount = 0;
      billingPeriodStart = new Date(now);
      resetOccurred = true;
    }

    const previousCallCount = currentCallCount;
    const costResult = calculateCallCost(providerRawCost, previousCallCount);

    // 2. Paid Call Balance Check & Deduction
    if (!costResult.isFree) {
      if (balance < costResult.finalCharge) {
        await client.query('ROLLBACK');
        throw new InsufficientFundsError(
          `Payment Required: Balance $${balance.toFixed(4)} is less than required charge $${costResult.finalCharge.toFixed(4)}`,
          costResult.finalCharge,
          balance
        );
      }

      const updateRes = await client.query(
        `UPDATE users
         SET balance_usd = balance_usd - $1,
             credit_balance = balance_usd - $1,
             monthly_call_count = $2,
             billing_period_start = $3
         WHERE id = $4 AND balance_usd >= $1
         RETURNING balance_usd, monthly_call_count`,
        [costResult.finalCharge, previousCallCount + 1, billingPeriodStart, userId]
      );

      if (updateRes.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new InsufficientFundsError(
          `Payment Required / Insufficient Balance for $${costResult.finalCharge.toFixed(4)}`,
          costResult.finalCharge,
          balance
        );
      }

      const newBalance = parseFloat(updateRes.rows[0].balance_usd);
      const newCallCount = parseInt(updateRes.rows[0].monthly_call_count, 10);

      // 3. Log Immutable Ledger Entry
      const ledgerRes = await client.query(
        `INSERT INTO ledger_entries
           (user_id, type, direction, amount_usd, raw_provider_cost, markup_amount, total_deducted, provider_id, job_id, description, balance_after)
         VALUES ($1, 'debit', 'debit', $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          userId,
          costResult.finalCharge,
          costResult.rawCost,
          costResult.markup,
          costResult.finalCharge,
          providerId,
          jobId,
          description,
          newBalance,
        ]
      );

      await client.query('COMMIT');
      bustAuthCache(userId).catch(() => {});

      return {
        ...costResult,
        userId,
        previousCallCount,
        newCallCount,
        balanceBefore: balance,
        balanceAfter: newBalance,
        resetOccurred,
        ledgerEntryId: ledgerRes.rows[0]?.id,
      };
    }

    // 4. Free Call Update
    const updateRes = await client.query(
      `UPDATE users
       SET monthly_call_count = $1,
           billing_period_start = $2
       WHERE id = $3
       RETURNING balance_usd, monthly_call_count`,
      [previousCallCount + 1, billingPeriodStart, userId]
    );

    const newCallCount = parseInt(updateRes.rows[0].monthly_call_count, 10);

    // Audit log for free calls
    const ledgerRes = await client.query(
      `INSERT INTO ledger_entries
         (user_id, type, direction, amount_usd, raw_provider_cost, markup_amount, total_deducted, provider_id, job_id, description, balance_after)
       VALUES ($1, 'free_call', 'none', 0, $2, 0, 0, $3, $4, $5, $6)
       RETURNING id`,
      [userId, providerRawCost, providerId, jobId, `${description} (Free tier call #${newCallCount})`, balance]
    );

    await client.query('COMMIT');

    return {
      ...costResult,
      userId,
      previousCallCount,
      newCallCount,
      balanceBefore: balance,
      balanceAfter: balance,
      resetOccurred,
      ledgerEntryId: ledgerRes.rows[0]?.id,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
