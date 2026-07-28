/**
 * byok_billing.test.ts
 * Automated Integration Test for BYOK & Zero-Debit Billing Logic
 * Run via: npx ts-node -r dotenv/config src/tests/byok_billing.test.ts
 */
import 'dotenv/config';
import crypto from 'crypto';
import { pool } from '../db/client';
import { createUser, generateApiKey } from '../services/auth';
import { upsertByokKey, deleteByokKey, resolveProviderKey } from '../services/byok';
import { debitLedger } from '../services/ledger';

const SALT = process.env.API_KEY_SALT || 'litedaemon_default_salt_2026';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('🧪 Starting BYOK & Billing Integration Tests...\n');

  const testEmail = `test_byok_${Date.now()}@litedaemon.io`;
  let userId: string = '';

  try {
    // ── Setup: Create Test User with $10 Balance ────────────────────────────
    console.log('1. Setting up test user & wallet balance...');
    const userRes = await createUser(testEmail, 'TestPassword123!', 'BYOK', 'Tester');
    userId = userRes.user.id;

    await pool.query(`UPDATE users SET balance_usd = 10.00000000 WHERE id = $1`, [userId]);
    const initUser = await pool.query(`SELECT balance_usd FROM users WHERE id = $1`, [userId]);
    assert(parseFloat(initUser.rows[0].balance_usd) === 10.0, 'User balance initialized to $10.00');

    // ── Test 1: Platform Key Call (Debit Must Occur) ───────────────────────
    console.log('\n2. Testing Platform Key Call (Wallet Debit)...');
    const providerId = 'jina';
    const platformEncryptedKey = (await pool.query(`SELECT api_key_encrypted FROM providers WHERE id = $1`, [providerId])).rows[0]?.api_key_encrypted;

    const keyRes1 = await resolveProviderKey(userId, platformEncryptedKey, providerId);
    assert(keyRes1.isByok === false, 'Platform call resolves isByok = false');

    const platformCost = 0.001;
    const testJobId1 = crypto.randomUUID();

    // Create job record & debit
    await pool.query(
      `INSERT INTO jobs (id, user_id, provider_id, endpoint, params, status, cost_usd, is_byok)
       VALUES ($1, $2, $3, 'scrape', '{}', 'completed', $4, false)`,
      [testJobId1, userId, providerId, platformCost]
    );

    await debitLedger(userId, platformCost, providerId, testJobId1, 'Platform call debit test');

    const balAfterPlatform = await pool.query(`SELECT balance_usd FROM users WHERE id = $1`, [userId]);
    const expectedBal = 10.0 - platformCost;
    assert(Math.abs(parseFloat(balAfterPlatform.rows[0].balance_usd) - expectedBal) < 0.00001, `Wallet debited by $${platformCost} (New balance = $${balAfterPlatform.rows[0].balance_usd})`);

    const ledgerEntries1 = await pool.query(`SELECT * FROM ledger_entries WHERE job_id = $1`, [testJobId1]);
    assert(ledgerEntries1.rowCount === 1, '1 debit entry created in ledger_entries for platform call');
    assert(parseFloat(ledgerEntries1.rows[0].amount_usd) === platformCost, `Ledger entry amount = $${platformCost}`);

    // ── Test 2: BYOK Vault Key Call (Zero Debit Guarantee) ────────────────
    console.log('\n3. Testing BYOK Vault Key Call (Zero Debit Guarantee)...');
    await upsertByokKey(userId, providerId, 'jina_custom_byok_vault_key_123', 'My Custom Key');

    const keyRes2 = await resolveProviderKey(userId, platformEncryptedKey, providerId);
    assert(keyRes2.isByok === true, 'Stored BYOK key resolves isByok = true');
    assert(keyRes2.apiKey === 'jina_custom_byok_vault_key_123', 'Resolved API key matches BYOK vault key');

    const byokCost = keyRes2.isByok ? 0 : platformCost;
    assert(byokCost === 0, 'BYOK cost calculated as strictly $0.00');

    const testJobId2 = crypto.randomUUID();
    await pool.query(
      `INSERT INTO jobs (id, user_id, provider_id, endpoint, params, status, cost_usd, is_byok)
       VALUES ($1, $2, $3, 'scrape', '{}', 'completed', $4, true)`,
      [testJobId2, userId, providerId, byokCost]
    );

    // Call debitLedger with cost = 0 (guard check must skip debit & ledger insertion)
    await debitLedger(userId, byokCost, providerId, testJobId2, 'BYOK call debit test');

    const balAfterBYOK = await pool.query(`SELECT balance_usd FROM users WHERE id = $1`, [userId]);
    assert(parseFloat(balAfterBYOK.rows[0].balance_usd) === parseFloat(balAfterPlatform.rows[0].balance_usd), `Wallet balance remained UNTOUCHED at $${balAfterBYOK.rows[0].balance_usd}`);

    const ledgerEntries2 = await pool.query(`SELECT * FROM ledger_entries WHERE job_id = $1`, [testJobId2]);
    assert(ledgerEntries2.rowCount === 0, 'Zero debit entries in ledger_entries for BYOK call ($0.00 debit)');

    // ── Test 3: Per-Request Header Key Override (X-Provider-Key) ───────────
    console.log('\n4. Testing Per-Request Header Key Override (X-Provider-Key)...');
    const headerOverrideKey = 'tvly-header-override-key-999';
    const keyRes3 = await resolveProviderKey(userId, platformEncryptedKey, 'tavily', headerOverrideKey);

    assert(keyRes3.isByok === true, 'Header override resolves isByok = true');
    assert(keyRes3.apiKey === headerOverrideKey, 'Resolved API key matches header X-Provider-Key');

    console.log('\n✅ ALL BYOK & BILLING INTEGRATION TESTS PASSED SUCCESSFULLY!\n');
  } catch (err: any) {
    console.error('\n❌ Test failure:', err.message);
    process.exit(1);
  } finally {
    // Clean up test data
    if (userId) {
      await pool.query(`DELETE FROM ledger_entries WHERE user_id = $1`, [userId]);
      await pool.query(`DELETE FROM jobs WHERE user_id = $1`, [userId]);
      await pool.query(`DELETE FROM user_provider_keys WHERE user_id = $1`, [userId]);
      await pool.query(`DELETE FROM api_keys WHERE user_id = $1`, [userId]);
      await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
      console.log('🧹 Cleaned up test user data');
    }
    await pool.end();
  }
}

runTests();
