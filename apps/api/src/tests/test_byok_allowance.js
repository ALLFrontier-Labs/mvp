// apps/api/src/tests/test_byok_allowance.js
const assert = require('assert');
require('dotenv').config();
const { pool } = require('../../dist/db/client');
const { preCheckAndEvaluateByok } = require('../../dist/services/byokPricing');
const { debitLedger } = require('../../dist/services/ledger');

console.log('\n🧪 Executing BYOK Monthly Allowance & 5% Fee Gateway E2E Test Suite...\n');

async function runTest() {
  // Create temp test user
  const email = `byok_test_${Date.now()}@litedaemon.internal`;
  const userRes = await pool.query(
    `INSERT INTO users (email, balance_usd, byok_requests_this_month, byok_last_reset_at)
     VALUES ($1, 0.00000000, 999, NOW()) RETURNING id`,
    [email]
  );
  const userId = userRes.rows[0].id;
  console.log(`📌 Created test user ${email} (ID: ${userId}) with 999 existing requests & $0.00 balance`);

  try {
    // ── Step 1: Request #1 (1000th call - Free Allowance) ─────────────────────
    console.log('\n🔹 Step 1: Firing Request #1 (1000th call)...');
    const eval1 = await preCheckAndEvaluateByok(userId, 'tavily');
    assert.strictEqual(eval1.allowed, true, '1000th call should be ALLOWED');
    assert.strictEqual(eval1.isFreeCall, true, '1000th call should be marked as FREE');
    assert.strictEqual(eval1.charge, 0, '1000th call charge should be $0.00');
    assert.strictEqual(eval1.nextRequestCount, 1000, 'Next request count should be 1000');
    console.log('  ✅ [PASS] 1000th call ALLOWED with $0.00 charge (Free Monthly Allowance)');

    // ── Step 2: Request #2 (1001st call - Overage on $0 Balance) ──────────────
    console.log('\n🔹 Step 2: Firing Request #2 (1001st call) on $0.00 balance...');
    const eval2 = await preCheckAndEvaluateByok(userId, 'tavily');
    assert.strictEqual(eval2.allowed, false, '1001st call on $0 balance should be REJECTED');
    assert.strictEqual(eval2.isFreeCall, false, '1001st call is not free');
    assert.strictEqual(eval2.errorResponse.statusCode, 402, 'HTTP Status code should be 402');
    assert.strictEqual(eval2.errorResponse.payload.error, 'Insufficient wallet balance');
    assert.strictEqual(eval2.errorResponse.payload.byok_requests_this_month, 1001);
    assert.strictEqual(eval2.errorResponse.payload.required_balance, 0.00005);
    console.log('  ✅ [PASS] 1001st call REJECTED with 402 Payment Required:');
    console.log('    ', JSON.stringify(eval2.errorResponse.payload));

    // ── Step 3: Top up wallet to $5.00 ────────────────────────────────────────
    console.log('\n🔹 Step 3: Topping up test user wallet to $5.00 USD...');
    await pool.query('UPDATE users SET balance_usd = 5.00000000 WHERE id = $1', [userId]);
    console.log('  ✅ [PASS] Wallet topped up to $5.00000000 USD');

    // ── Step 4: Request #3 (1001st call Retry on $5.00 Balance) ───────────────
    console.log('\n🔹 Step 4: Retrying Request #3 (1001st call) with $5.00 balance...');
    const eval3 = await preCheckAndEvaluateByok(userId, 'tavily');
    assert.strictEqual(eval3.allowed, true, '1001st call with $5.00 balance should be ALLOWED');
    assert.strictEqual(eval3.isFreeCall, false, '1001st call is not free');
    assert.strictEqual(eval3.charge, 0.00005, '1001st call 5% BYOK fee should be $0.00005');

    // Execute atomic debit
    await debitLedger(userId, eval3.charge, 'tavily', null, 'Tavily 5% BYOK Fee');
    const updatedUser = await pool.query('SELECT balance_usd FROM users WHERE id = $1', [userId]);
    const finalBalance = parseFloat(updatedUser.rows[0].balance_usd);
    assert.strictEqual(finalBalance, 4.99995, 'Wallet balance should decrease from $5.00 to $4.99995');
    console.log(`  ✅ [PASS] 1001st call ALLOWED! Debited $0.00005 fee. Remaining wallet balance = $${finalBalance.toFixed(5)} USD`);

    console.log('\n=================================================');
    console.log('🏁 BYOK MONTHLY ALLOWANCE & 5% FEE TESTS PASSED!');
    console.log('=================================================\n');
  } finally {
    // Cleanup test user
    await pool.query('DELETE FROM ledger_entries WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    await pool.end();
  }
}

runTest().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
