// services/byokPricing.ts — 1,000 Free Monthly Requests & 5% BYOK Fee Engine
import { pool } from '../db/client';
import { calc5PercentFee } from '../config/provider-prices';

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
      byok_requests_this_month: number;
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
    'SELECT balance_usd, byok_requests_this_month, byok_last_reset_at FROM users WHERE id = $1',
    [userId]
  );

  if (userRes.rows.length === 0) {
    throw new Error('User not found');
  }

  const row = userRes.rows[0];
  const currentBalance = parseFloat(row.balance_usd || '0');
  let requestsThisMonth = parseInt(row.byok_requests_this_month || '0', 10);
  const lastResetAt = row.byok_last_reset_at ? new Date(row.byok_last_reset_at) : new Date();

  // 1. Month Reset Check (UTC Month/Year comparison)
  const now = new Date();
  const isNewMonth =
    now.getUTCFullYear() > lastResetAt.getUTCFullYear() ||
    (now.getUTCFullYear() === lastResetAt.getUTCFullYear() && now.getUTCMonth() > lastResetAt.getUTCMonth());

  if (isNewMonth) {
    requestsThisMonth = 0;
    await pool.query(
      'UPDATE users SET byok_requests_this_month = 0, byok_last_reset_at = NOW() WHERE id = $1',
      [userId]
    );
  }

  const nextCount = requestsThisMonth + 1;

  // 2. Request Allowance Check
  if (nextCount <= 1000) {
    // Free Allowance (Calls 1..1000)
    await pool.query(
      'UPDATE users SET byok_requests_this_month = byok_requests_this_month + 1 WHERE id = $1',
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

  // 3. Paid Request Check (Calls > 1000) -> 5% BYOK Gateway Fee
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
          error: 'Insufficient wallet balance',
          message: 'You have exceeded your 1,000 free monthly BYOK requests. Please top up your wallet (min $5) to continue routing requests.',
          byok_requests_this_month: nextCount,
          required_balance: calculatedFee,
          current_balance: currentBalance,
        },
      },
    };
  }

  // Balance is sufficient
  await pool.query(
    'UPDATE users SET byok_requests_this_month = byok_requests_this_month + 1 WHERE id = $1',
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
