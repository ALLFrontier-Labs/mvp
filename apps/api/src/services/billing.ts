// services/billing.ts
import crypto from 'crypto';
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { creditLedger } from './ledger';
import { pool } from '../db/client';

// ── SDK INIT ──────────────────────────────────────────────────────────────────
lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });

// ── CHARGE CALCULATION ────────────────────────────────────────────────────────
// LiteDaemon is pre-revenue. The developer is charged exactly the provider's
// wholesale cost — no markup, no percentage, no platform fee.
export function calculateCharge(providerCostUsd: number): number {
  return Math.round(providerCostUsd * 1e8) / 1e8;
}

// ── LEMONSQUEEZY VARIANT MAP ──────────────────────────────────────────────────
const VARIANT_IDS: Record<string, number> = {
  '10':  1954573,
  '25':  1954620,
  '50':  1954599,
  '100': 1954615,
};

const STORE_ID = 440354;

// ── CREATE CHECKOUT SESSION ───────────────────────────────────────────────────
// Uses the LS SDK to create a proper hosted checkout URL.
// Pre-fills the user's email so they don't have to type it twice.
export async function getCheckoutUrl(userId: string, creditAmount: string): Promise<string> {
  const variantId = VARIANT_IDS[creditAmount];
  if (!variantId) throw new Error(`Invalid amount. Valid: 10, 25, 50, 100`);

  // Fetch the user's email to pre-fill on the checkout page
  let email: string | undefined;
  try {
    const r = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    email = r.rows[0]?.email;
  } catch { /* non-fatal — checkout still works without pre-fill */ }

  const { data, error } = await createCheckout(STORE_ID, variantId, {
    checkoutOptions: {
      embed: false,
      media: true,
      logo: true,
    },
    checkoutData: {
      email,
      custom: {
        user_id: userId,
        credit_amount: creditAmount,
      },
    },
    productOptions: {
      redirectUrl: `${process.env.FRONTEND_URL || 'https://mvp-omega-livid.vercel.app'}/billing?success=1`,
      receiptButtonText: 'Go to Dashboard',
      receiptThankYouNote: `Your $${creditAmount} has been credited to your LiteDaemon wallet.`,
    },
  });

  if (error || !data?.data?.attributes?.url) {
    throw new Error(error?.message || 'Failed to create LemonSqueezy checkout');
  }

  return data.data.attributes.url;
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
  await creditLedger(userId, amountUsd, `LemonSqueezy deposit — $${amountUsd.toFixed(2)} credits`);
  console.log(`[Billing] Credited $${amountUsd} to user ${userId}`);
}
