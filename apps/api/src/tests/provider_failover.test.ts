import assert from 'assert';
import { getAdapter } from '../adapters/index';
import { ProviderError } from '../types';

console.log('\n🧪 Executing Provider Adapter Failover & Error Handling Unit Tests...\n');

async function runTests() {
  // Test 1: Daytona adapter throws ProviderError with isQuotaOrAuth = true on unconfigured key
  console.log('📌 Test 1: Daytona Adapter throws ProviderError(isQuotaOrAuth=true) on PLACEHOLDER key...');
  const daytonaAdapter = getAdapter('daytona');
  try {
    await daytonaAdapter.run({ code: 'print("hello")' }, 'PLACEHOLDER');
    assert.fail('Daytona adapter should have thrown ProviderError but returned data');
  } catch (err: any) {
    assert(err instanceof ProviderError, 'Error for daytona should be instance of ProviderError');
    assert.strictEqual(err.isQuotaOrAuth, true, 'ProviderError for daytona should set isQuotaOrAuth=true to trigger auto-failover');
    console.log(`  ✓ Daytona adapter correctly threw ProviderError(isQuotaOrAuth=true): "${err.message}"`);
  }

  // Test 2: Active adapters throw proper error on missing params
  console.log('\n📌 Test 2: Active Adapters validate parameters...');
  const firecrawlAdapter = getAdapter('firecrawl');
  try {
    await firecrawlAdapter.run({}, 'sk-test-key');
    assert.fail('Firecrawl should have thrown error on missing url');
  } catch (err: any) {
    assert(err instanceof ProviderError, 'Error should be ProviderError');
    assert.strictEqual(err.isQuotaOrAuth, false, 'Missing param error should have isQuotaOrAuth=false');
    console.log(`  ✓ Firecrawl parameter validation passed: "${err.message}"`);
  }

  console.log('\n====================================================');
  console.log('📊 PROVIDER FAILOVER & ADAPTER TESTS PASSED!');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('❌ FAILOVER TEST FAILED:', err);
  process.exit(1);
});
