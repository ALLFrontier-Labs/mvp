/**
 * byok_billing.test.ts
 * Automated Integration Test for BYOK Multi-Key Prioritization & Gateways
 */
import 'dotenv/config';
import crypto from 'crypto';
import { pool } from '../db/client';
import { createUser } from '../services/auth';
import { addByokKey, deleteByokKey, getProviderKeysForUser } from '../services/byok';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('🧪 Starting BYOK Multi-Key Integration Tests...\n');

  const testEmail = `test_byok_${Date.now()}@litedaemon.io`;
  let userId: string = '';

  try {
    console.log('1. Creating test user...');
    const userRes = await createUser(testEmail, 'TestPassword123!', 'BYOK', 'Tester');
    userId = userRes.user.id;

    console.log('\n2. Testing Multi-Key BYOK Prioritization...');
    const providerId = 'jina';

    // Add Key #1 (Prioritized)
    const k1 = await addByokKey(userId, providerId, 'jina_key_priority_1', 'prioritized', 'Primary Key');
    assert(k1.key_type === 'prioritized', 'Key #1 added as prioritized');

    // Add Key #2 (Fallback)
    const k2 = await addByokKey(userId, providerId, 'jina_key_fallback_2', 'fallback', 'Backup Key');
    assert(k2.key_type === 'fallback', 'Key #2 added as fallback');

    // Retrieve keys
    const keys = await getProviderKeysForUser(userId, providerId);
    assert(keys.length === 2, 'User has 2 configured BYOK keys for provider');
    assert(keys[0].rawKey === 'jina_key_priority_1', 'Keys[0] is Primary Key');
    assert(keys[1].rawKey === 'jina_key_fallback_2', 'Keys[1] is Fallback Key');

    // Clean up
    await deleteByokKey(userId, k1.id);
    await deleteByokKey(userId, k2.id);
    const afterDelete = await getProviderKeysForUser(userId, providerId);
    assert(afterDelete.length === 0, 'Keys successfully deleted');

    console.log('\n✅ ALL BYOK MULTI-KEY TESTS PASSED SUCCESSFULLY!\n');
  } catch (err: any) {
    console.error('\n❌ Test failure:', err.message);
    process.exit(1);
  } finally {
    if (userId) {
      await pool.query(`DELETE FROM user_provider_keys WHERE user_id = $1`, [userId]);
      await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
      console.log('🧹 Cleaned up test user');
    }
    await pool.end();
  }
}

runTests();
