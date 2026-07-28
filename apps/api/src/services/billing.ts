// services/billing.ts
import crypto from 'crypto';
import { creditLedger } from './ledger';
import { pool } from '../db/client';

// ── CHARGE CALCULATION ────────────────────────────────────────────────────────
export function calculateCharge(providerCostUsd: number): number {
  return Math.round(providerCostUsd * 1e8) / 1e8;
}

// ── FEE-INCLUSIVE CHECKOUT PRICE ─────────────────────────────────────────────
// LemonSqueezy charges 5% + $0.50. We gross up so the user gets exactly their
// requested credit amount after fees — LiteDaemon keeps $0.00.
//   checkout_price = (credit_amount + 0.50) / 0.95
export function calcCheckoutPrice(creditUsd: number): number {
  return Math.ceil(((creditUsd + 0.5) / 0.95) * 100) / 100; // round up to nearest cent
}

// ── LEMONSQUEEZY CONFIG ───────────────────────────────────────────────────────
const STORE_ID  = 440354;
// Any live variant — we override the price dynamically via custom_price
const VARIANT_ID = 1954573; // $10 variant as the base template

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

  // Use raw LS REST API — the JS SDK doesn't expose custom_price
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

// ── WEBHOOK SIGNATURE VERIFICATION ───────────────────────────────────────────
export function verifyLSSignature(rawBody: Buffer, signature: string): boolean {
  const secret   = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(signature, 'hex'));
  } catch { return false; }
}

// ── HANDLE PAYMENT WEBHOOK ────────────────────────────────────────────────────
export async function handleOrderCreated(body: any): Promise<void> {
  const userId       = body?.meta?.custom_data?.user_id;
  const creditAmount = body?.meta?.custom_data?.credit_amount;
  const status       = body?.data?.attributes?.status;

  console.log('[Webhook] order_created', { userId, creditAmount, status });

  if (!userId || !creditAmount || status !== 'paid') return;

  const amountUsd = parseFloat(creditAmount);
  if (isNaN(amountUsd) || amountUsd <= 0) return;

  await creditLedger(userId, amountUsd, `Wallet top-up — $${amountUsd.toFixed(2)} deposited`);
  console.log(`[Billing] Credited $${amountUsd} to user ${userId}`);
}
