// services/billing.ts
import crypto from 'crypto';
import { creditLedger } from './ledger';

// ── CHARGE CALCULATION ────────────────────────────────────────────────────────
// LiteDaemon is pre-revenue. The developer is charged exactly the provider's
// wholesale cost — no markup, no percentage, no platform fee.
export function calculateCharge(providerCostUsd: number): number {
  return Math.round(providerCostUsd * 1e8) / 1e8;
}

// ── LEMONSQUEEZY CHECKOUT URL ─────────────────────────────────────────────────
const VARIANTS: Record<string, string | undefined> = {
  '10':  process.env.LS_VARIANT_10,
  '25':  process.env.LS_VARIANT_25,
  '50':  process.env.LS_VARIANT_50,
  '100': process.env.LS_VARIANT_100,
};

export function getCheckoutUrl(userId: string, creditAmount: string): string {
  const vid = VARIANTS[creditAmount];
  if (!vid) throw new Error(`Invalid amount. Valid: 10, 25, 50, 100`);
  return `https://litedaemon.lemonsqueezy.com/checkout/buy/${vid}`
       + `?checkout[custom][user_id]=${userId}`
       + `&checkout[custom][credit_amount]=${creditAmount}`;
}

// ── WEBHOOK SIGNATURE VERIFICATION ──────────────────────────────────────────
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

  if (!userId || !creditAmount || status !== 'paid') return;

  const amountUsd = parseFloat(creditAmount);
  await creditLedger(userId, amountUsd, `LemonSqueezy deposit — $${amountUsd.toFixed(2)} credits`);
}
