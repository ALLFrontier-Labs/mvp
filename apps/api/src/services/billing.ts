// services/billing.ts — Dodo Payments Integration & 5% Gateway Fee Engine
import { creditLedger } from './ledger';
import { pool } from '../db/client';
import { calc5PercentFee } from '../config/provider-prices';
import { dodo } from '../lib/dodo';

// ── CHARGE CALCULATION (5% BYOK Gateway Fee) ──────────────────────────────────
export function calculateCharge(providerId: string): number {
  return calc5PercentFee(providerId);
}

// ── OPENROUTER STANDARD DEPOSIT FEE CALCULATION ──────────────────────────────
// Formula: depositFee = Math.max(0.80, creditAmount * 0.055)
// totalToPay = creditAmount + depositFee
export function calcDepositFee(creditUsd: number): number {
  const fee = Math.max(0.80, creditUsd * 0.055);
  return Math.round(fee * 100) / 100;
}

export function calcCheckoutPrice(creditUsd: number): number {
  const fee = calcDepositFee(creditUsd);
  return Math.round((creditUsd + fee) * 100) / 100;
}

const MIN_TOPUP = 5;   // $5 minimum
const MAX_TOPUP = 999; // $999 maximum

// ── CREATE CHECKOUT SESSION (custom price via Dodo) ───────────────────────────
export async function getCheckoutUrl(userId: string, creditAmountUSD: number): Promise<string> {
  if (creditAmountUSD < MIN_TOPUP) throw new Error(`Minimum top-up is $${MIN_TOPUP}`);
  if (creditAmountUSD > MAX_TOPUP) throw new Error(`Maximum top-up is $${MAX_TOPUP}`);

  const checkoutPrice = calcCheckoutPrice(creditAmountUSD);

  // Fetch user email for pre-fill
  let email: string | undefined;
  try {
    const r = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    email = r.rows[0]?.email;
  } catch { /* non-fatal */ }

  const appUrl = process.env.FRONTEND_URL || 'https://litedaemon.xyz';
  
  const payment = await dodo.payments.create({
    billing: {
      country: 'US',
    },
    customer: {
      email: email,
      name: 'LiteDaemon User',
    },
    payment_link: true,
    product_cart: [{
      product_id: process.env.DODO_PRODUCT_ID || (() => { throw new Error('DODO_PRODUCT_ID environment variable is not configured. Cannot create checkout.'); })(),
      amount: Math.round(checkoutPrice * 100), // convert to cents
      quantity: 1,
    }],
    currency: 'USD',
    return_url: `${appUrl}/billing?success=1`,
    metadata: {
      userId,
      creditAmountUSD: String(creditAmountUSD),
    },
  } as any);

  if (!payment.payment_link) {
    throw new Error('DodoPayments did not return a checkout URL');
  }

  return payment.payment_link;
}

// ── HANDLE PAYMENT WEBHOOK ────────────────────────────────────────────────────
export async function handleDodoPaymentSucceeded(eventBody: any): Promise<void> {
  // Dodo payment.succeeded event structure
  // Contains data in eventBody.data
  const paymentData = eventBody?.data;
  if (!paymentData) return;

  const metadata = paymentData.metadata;
  if (!metadata) return;

  const userId = metadata.userId;
  const creditAmountUSDStr = metadata.creditAmountUSD;

  console.log('[Webhook] payment.succeeded', { userId, creditAmountUSDStr });

  if (!userId || !creditAmountUSDStr) return;

  const creditedUsd = parseFloat(creditAmountUSDStr);
  if (isNaN(creditedUsd) || creditedUsd <= 0) return;

  await creditLedger(userId, creditedUsd, `Wallet deposit via Dodo Payments — $${creditedUsd.toFixed(2)} deposited`);
  console.log(`[Billing] Credited $${creditedUsd.toFixed(2)} to user ${userId}`);
}
