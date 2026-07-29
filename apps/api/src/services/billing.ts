// services/billing.ts — Lemon Squeezy Integration & 5% Gateway Fee Engine
import crypto from 'crypto';
import { creditLedger } from './ledger';
import { pool } from '../db/client';
import { calc5PercentFee } from '../config/provider-prices';

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

// ── LEMONSQUEEZY CONFIG ───────────────────────────────────────────────────────
const STORE_ID   = 440354;
const VARIANT_ID = 1954573; // Base variant template

const MIN_TOPUP = 5;   // $5 minimum
const MAX_TOPUP = 999; // $999 maximum

// ── CREATE CHECKOUT SESSION (custom price) ────────────────────────────────────
export async function getCheckoutUrl(userId: string, creditAmount: number): Promise<string> {
  if (creditAmount < MIN_TOPUP) throw new Error(`Minimum top-up is $${MIN_TOPUP}`);
  if (creditAmount > MAX_TOPUP) throw new Error(`Maximum top-up is $${MAX_TOPUP}`);

  const checkoutPrice = calcCheckoutPrice(creditAmount);
  const checkoutPriceCents = Math.round(checkoutPrice * 100);

  // Fetch user email for pre-fill
  let email: string | undefined;
  try {
    const r = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    email = r.rows[0]?.email;
  } catch { /* non-fatal */ }

  const payload = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email,
          custom_price: checkoutPriceCents,
          custom: {
            user_id:       userId,
            credit_amount: String(creditAmount),
          },
        },
        product_options: {
          redirect_url:          `${process.env.FRONTEND_URL || 'https://mvp-omega-livid.vercel.app'}/billing?success=1`,
          receipt_button_text:   'Go to Dashboard',
          receipt_thank_you_note: `$${creditAmount.toFixed(2)} has been credited to your LiteDaemon wallet.`,
        },
        checkout_options: {
          embed: false,
          media: true,
          logo:  true,
        },
      },
      relationships: {
        store:   { data: { type: 'stores',   id: String(STORE_ID) } },
        variant: { data: { type: 'variants', id: String(VARIANT_ID) } },
      },
    },
  };

  const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Accept':        'application/vnd.api+json',
      'Content-Type':  'application/vnd.api+json',
      'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const json: any = await res.json();
  if (!res.ok || json.errors) {
    const msg = json.errors?.[0]?.detail || `LS API error ${res.status}`;
    throw new Error(msg);
  }

  const url = json.data?.attributes?.url;
  if (!url) throw new Error('LemonSqueezy did not return a checkout URL');
  return url;
}

// ── WEBHOOK SIGNATURE VERIFICATION (HMAC SHA-256) ─────────────────────────────
export function verifyLSSignature(rawBody: Buffer | string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';
  if (!secret || !signature) return false;

  const buf = typeof rawBody === 'string' ? Buffer.from(rawBody) : rawBody;
  const computed = crypto.createHmac('sha256', secret).update(buf).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(signature, 'hex'));
  } catch { return false; }
}

// ── HANDLE PAYMENT WEBHOOK ────────────────────────────────────────────────────
// CRITICAL: Lemon Squeezy total amounts in attributes (total_usd / total) are in CENTS (e.g. 500 = $5.00)
export async function handleOrderCreated(body: any): Promise<void> {
  const userId       = body?.meta?.custom_data?.user_id;
  const creditAmount = body?.meta?.custom_data?.credit_amount;
  const status       = body?.data?.attributes?.status;

  console.log('[Webhook] order_created', { userId, creditAmount, status });

  if (!userId || status !== 'paid') return;

  // Lemon Squeezy total cents conversion logic
  let creditedUsd = 0;
  const totalCents = body?.data?.attributes?.total_usd ?? body?.data?.attributes?.total;

  if (typeof totalCents === 'number' && totalCents > 0) {
    // If total_usd/total in cents is present, divide by 100
    creditedUsd = totalCents / 100;
  } else if (creditAmount) {
    creditedUsd = parseFloat(creditAmount);
  }

  if (isNaN(creditedUsd) || creditedUsd <= 0) return;

  await creditLedger(userId, creditedUsd, `LemonSqueezy wallet deposit — $${creditedUsd.toFixed(2)} deposited`);
  console.log(`[Billing] Credited $${creditedUsd.toFixed(2)} to user ${userId}`);
}
