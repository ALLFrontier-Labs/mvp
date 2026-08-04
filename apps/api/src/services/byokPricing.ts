// services/byokPricing.ts — 100 Free Monthly Calls & 5% Provider Markup Engine
import { pool } from '../db/client';
import { calc5PercentFee } from '../config/provider-prices';
import { shouldResetBillingPeriod } from '../lib/billing/usage';

export interface ByokAllowanceCheck {
  allowed: boolean;
  isFreeCall: boolean;
  charge: number;
  nextRequestCount: number;
  currentBalance: number;
  errorResponse?: {
    statusCode: number;
    payload: {
      error: string;
      message: string;
      monthly_call_count: number;
      required_balance: number;
      current_balance: number;
    };
  };
}

export async function preCheckAndEvaluateByok(
  userId: string,
  providerId: string = 'tavily'
): Promise<ByokAllowanceCheck> {
  const userRes = await pool.query(
    'SELECT balance_usd, monthly_call_count, billing_period_start FROM users WHERE id = $1',
    [userId]
  );

  if (userRes.rows.length === 0) {
    throw new Error('User not found');
  }

  const row = userRes.rows[0];
  const currentBalance = parseFloat(row.balance_usd || '0');
  let requestsThisMonth = parseInt(row.monthly_call_count || '0', 10);
  const lastResetAt = row.billing_period_start ? new Date(row.billing_period_start) : new Date();

  // 1. Month Reset Check (30-day or UTC Month/Year comparison)
  const now = new Date();
  const isResetNeeded = shouldResetBillingPeriod(lastResetAt, now);

  if (isResetNeeded) {
    requestsThisMonth = 0;
    await pool.query(
      'UPDATE users SET monthly_call_count = 0, billing_period_start = NOW() WHERE id = $1',
      [userId]
    );
  }

  const nextCount = requestsThisMonth + 1;

  // 2. Request Allowance Check (Calls 1..100)
  if (nextCount <= 100) {
    // Free Allowance (Calls 1..100)
    await pool.query(
      'UPDATE users SET monthly_call_count = monthly_call_count + 1 WHERE id = $1',
      [userId]
    );
    return {
      allowed: true,
      isFreeCall: true,
      charge: 0,
      nextRequestCount: nextCount,
      currentBalance,
    };
  }

  // 3. Paid Request Check (Calls > 100) -> Provider Pass-Through + 5% Markup
  const calculatedFee = calc5PercentFee(providerId);

  if (currentBalance < calculatedFee) {
    return {
      allowed: false,
      isFreeCall: false,
      charge: calculatedFee,
      nextRequestCount: nextCount,
      currentBalance,
      errorResponse: {
        statusCode: 402,
        payload: {
          error: 'Insufficient Balance',
          message: 'Every LiteDaemon account receives 100 free API calls per billing month across all integrated tools. Requests beyond 100 calls require an active balance. Requests with insufficient funds return HTTP 402 prior to provider invocation.',
          monthly_call_count: nextCount,
          required_balance: calculatedFee,
          current_balance: currentBalance,
        },
      },
    };
  }

  // Balance is sufficient
  await pool.query(
    'UPDATE users SET monthly_call_count = monthly_call_count + 1 WHERE id = $1',
    [userId]
  );

  return {
    allowed: true,
    isFreeCall: false,
    charge: calculatedFee,
    nextRequestCount: nextCount,
    currentBalance,
  };
}
