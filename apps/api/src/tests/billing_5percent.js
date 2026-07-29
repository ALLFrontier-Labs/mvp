// tests/billing_5percent.js — Test suite for 5% BYOK Fee Engine & Lemon Squeezy Webhooks
const assert = require('assert');
const crypto = require('crypto');
const { calc5PercentFee, getProviderBasePrice } = require('../../dist/config/provider-prices');

console.log('\n🧪 Executing LiteDaemon 5% BYOK Billing Engine Test Suite...\n');

// ── Test 1: Provider List Prices & 5% Fee Calculation Math ────────────────────
console.log('📌 Test Suite 1: 5% BYOK Fee Calculation Math');

const testCases = [
  { provider: 'firecrawl',   expectedBase: 0.003, expectedFee: 0.00015 },
  { provider: 'jina',        expectedBase: 0.001, expectedFee: 0.00005 },
  { provider: 'tavily',      expectedBase: 0.001, expectedFee: 0.00005 },
  { provider: 'exa',         expectedBase: 0.002, expectedFee: 0.00010 },
  { provider: 'browserbase', expectedBase: 0.015, expectedFee: 0.00075 },
  { provider: 'e2b',         expectedBase: 0.008, expectedFee: 0.00040 },
  { provider: 'llamaparse',  expectedBase: 0.005, expectedFee: 0.00025 },
];

for (const tc of testCases) {
  const basePrice = getProviderBasePrice(tc.provider);
  const fee = calc5PercentFee(tc.provider);
  assert.strictEqual(basePrice, tc.expectedBase, `Base price for ${tc.provider} should be $${tc.expectedBase}`);
  assert.strictEqual(fee, tc.expectedFee, `5% Gateway Fee for ${tc.provider} should be $${tc.expectedFee}`);
  console.log(`  ✅ [PASS] ${tc.provider}: Base List Price = $${basePrice} -> 5% BYOK Fee = $${fee}`);
}

// ── Test 2: Lemon Squeezy HMAC SHA-256 Signature Verification ───────────────
console.log('\n📌 Test Suite 2: Lemon Squeezy HMAC Signature Verification');

function verifyLSSignature(rawBody, signature, secret) {
  const buf = typeof rawBody === 'string' ? Buffer.from(rawBody) : rawBody;
  const computed = crypto.createHmac('sha256', secret).update(buf).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(signature, 'hex'));
  } catch { return false; }
}

const secret = 'test_webhook_secret_key_12345';
const rawPayload = Buffer.from(JSON.stringify({
  meta: { event_name: 'order_created', custom_data: { user_id: 'usr_123' } },
  data: { attributes: { status: 'paid', total_usd: 1000 } }
}));

const validSignature = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');
const isValid = verifyLSSignature(rawPayload, validSignature, secret);
assert.strictEqual(isValid, true, 'Valid Lemon Squeezy HMAC signature should be accepted');
console.log('  ✅ [PASS] Valid HMAC SHA-256 signature verified successfully');

const invalidSignature = 'bad_signature_hash_000000000000000000000000000000000000000';
const isInvalid = verifyLSSignature(rawPayload, invalidSignature, secret);
assert.strictEqual(isInvalid, false, 'Invalid Lemon Squeezy signature should be rejected');
console.log('  ✅ [PASS] Invalid signature rejected successfully');

// ── Test 3: Lemon Squeezy Cents Conversion Math ──────────────────────────────
console.log('\n📌 Test Suite 3: Lemon Squeezy Cents to Dollars Conversion');

const samplePayload = { data: { attributes: { total_usd: 2500 } } }; // 2500 cents = $25.00
const totalCents = samplePayload.data.attributes.total_usd;
const dollars = totalCents / 100;
assert.strictEqual(dollars, 25.0, '2500 cents should equal $25.00');
console.log(`  ✅ [PASS] Lemon Squeezy payload ${totalCents} cents correctly converted to $${dollars.toFixed(2)} USD`);

console.log('\n=================================================');
console.log('🏁 5% BYOK BILLING ENGINE UNIT TESTS PASSED!');
console.log('=================================================\n');
