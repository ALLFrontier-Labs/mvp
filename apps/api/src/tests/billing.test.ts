/**
 * LiteDaemon Billing Engine Test Suite
 * Path: apps/api/src/tests/billing.test.ts
 *
 * Automated Unit Test Suite covering:
 * a) Calls 1 through 100 return finalCharge = 0 (Free tier).
 * b) Call 101 correctly applies exact 5% markup on provider raw cost.
 * c) Simulating a date > 30 days out correctly resets monthly_call_count back to 0.
 * d) Attempting call 101 with insufficient balance triggers HTTP 402 refusal.
 */

import 'dotenv/config';
import { calculateCallCost } from '../lib/billing/calculator';
import {
  processCallUsage,
  shouldResetBillingPeriod,
  UserBillingState,
  InsufficientFundsError,
} from '../lib/billing/usage';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runBillingEngineTests() {
  console.log('====================================================');
  console.log('🧪 LiteDaemon End-to-End Billing Engine Unit Tests');
  console.log('====================================================\n');

  let passedCount = 0;
  const totalTests = 4;

  // ---------------------------------------------------------------------------
  // TEST A: Calls 1 through 100 return finalCharge = 0 (Free Tier Threshold)
  // ---------------------------------------------------------------------------
  console.log('Test A: Free Tier Threshold (Calls 1 through 100)');
  try {
    const rawCost = 0.010; // $0.010 Tavily search wholesale cost

    // Check boundary call 1 (currentCallCount = 0)
    const call1 = calculateCallCost(rawCost, 0);
    assert(call1.isFree === true, 'Call #1 isFree is true');
    assert(call1.finalCharge === 0, 'Call #1 finalCharge is 0');
    assert(call1.markup === 0, 'Call #1 markup is 0');

    // Check boundary call 50 (currentCallCount = 49)
    const call50 = calculateCallCost(rawCost, 49);
    assert(call50.isFree === true, 'Call #50 isFree is true');
    assert(call50.finalCharge === 0, 'Call #50 finalCharge is 0');

    // Check boundary call 100 (currentCallCount = 99)
    const call100 = calculateCallCost(rawCost, 99);
    assert(call100.isFree === true, 'Call #100 isFree is true');
    assert(call100.finalCharge === 0, 'Call #100 finalCharge is 0');

    // Verify via processCallUsage in-memory loop for calls 1..100
    const mockUser: UserBillingState = {
      id: 'usr_test_free_tier',
      monthly_call_count: 0,
      billing_period_start: new Date(),
      balance_usd: 0, // 0 balance should still work for free calls
      credit_balance: 0,
    };

    for (let i = 0; i < 100; i++) {
      const res = await processCallUsage('usr_test_free_tier', rawCost, {
        inMemoryUser: mockUser,
        providerId: 'tavily',
      });
      if (res.finalCharge !== 0 || !res.isFree) {
        throw new Error(`Call #${i + 1} was charged $${res.finalCharge} instead of being free`);
      }
    }

    assert(mockUser.monthly_call_count === 100, 'mockUser completed exactly 100 free calls');
    console.log('✅ TEST A PASSED: All 100 free calls returned finalCharge = 0.\n');
    passedCount++;
  } catch (err: any) {
    console.error(`❌ TEST A FAILED: ${err.message}\n`);
  }

  // ---------------------------------------------------------------------------
  // TEST B: Call 101 correctly applies exact 5% markup on provider raw cost
  // ---------------------------------------------------------------------------
  console.log('Test B: 5% Provider Markup Calculation on Call 101');
  try {
    const rawCost = 0.010; // $0.010 Tavily search raw cost

    // Call 101 -> currentCallCount = 100
    const call101 = calculateCallCost(rawCost, 100);
    assert(call101.isFree === false, 'Call #101 isFree is false');
    assert(call101.rawCost === 0.010, 'Call #101 rawCost is $0.010000');
    assert(call101.markup === 0.0005, 'Call #101 markup is $0.000500 (exact 5% of $0.010)');
    assert(call101.finalCharge === 0.0105, 'Call #101 finalCharge is $0.010500 ($0.010 + 5%)');
    assert(call101.formattedDisplayCharge === '0.0105', 'Display charge formatted to 4 decimals is 0.0105');

    // Test with another provider cost (e.g. Exa $0.002)
    const exaCost = 0.002;
    const call101Exa = calculateCallCost(exaCost, 100);
    assert(call101Exa.markup === 0.0001, 'Exa markup is $0.000100 (5% of $0.002)');
    assert(call101Exa.finalCharge === 0.0021, 'Exa finalCharge is $0.002100 ($0.002 + 5%)');

    console.log('✅ TEST B PASSED: Call 101 applied exact 5% markup (0.010 -> 0.0105).\n');
    passedCount++;
  } catch (err: any) {
    console.error(`❌ TEST B FAILED: ${err.message}\n`);
  }

  // ---------------------------------------------------------------------------
  // TEST C: Simulating a date > 30 days out correctly resets monthly_call_count
  // ---------------------------------------------------------------------------
  console.log('Test C: Monthly Billing Period Reset (> 30 Days Out)');
  try {
    const startDate = new Date('2026-01-01T00:00:00Z');
    const within30Days = new Date('2026-01-20T00:00:00Z');
    const past30Days = new Date('2026-02-05T00:00:00Z');

    assert(shouldResetBillingPeriod(startDate, within30Days) === false, 'Within 30 days returns reset = false');
    assert(shouldResetBillingPeriod(startDate, past30Days) === true, 'Past 30 days returns reset = true');

    // Test processCallUsage reset execution with mock user at call count 100
    const mockUser: UserBillingState = {
      id: 'usr_test_reset',
      monthly_call_count: 100,
      billing_period_start: startDate,
      balance_usd: 10.0,
      credit_balance: 10.0,
    };

    const res = await processCallUsage('usr_test_reset', 0.010, {
      inMemoryUser: mockUser,
      providerId: 'tavily',
      customNow: past30Days,
    });

    assert(res.resetOccurred === true, 'Reset flag set to true on processCallUsage');
    assert(res.previousCallCount === 0, 'previousCallCount reset to 0');
    assert(res.newCallCount === 1, 'newCallCount incremented to 1 after reset');
    assert(res.isFree === true, 'Call #1 of new period is FREE');
    assert(res.finalCharge === 0, 'finalCharge is $0 after reset');

    console.log('✅ TEST C PASSED: Simulated date > 30 days out successfully reset call count to 0.\n');
    passedCount++;
  } catch (err: any) {
    console.error(`❌ TEST C FAILED: ${err.message}\n`);
  }

  // ---------------------------------------------------------------------------
  // TEST D: Attempting call 101 with insufficient balance triggers HTTP 402
  // ---------------------------------------------------------------------------
  console.log('Test D: Pre-Call Insufficient Balance Rejection (HTTP 402)');
  try {
    const mockUser: UserBillingState = {
      id: 'usr_test_insufficient_bal',
      monthly_call_count: 100, // Call #101 is next
      billing_period_start: new Date(),
      balance_usd: 0.005, // Balance ($0.005) is less than required charge ($0.0105)
      credit_balance: 0.005,
    };

    let caughtError: InsufficientFundsError | null = null;
    try {
      await processCallUsage('usr_test_insufficient_bal', 0.010, {
        inMemoryUser: mockUser,
        providerId: 'tavily',
      });
    } catch (err: any) {
      if (err instanceof InsufficientFundsError) {
        caughtError = err;
      } else {
        throw err;
      }
    }

    assert(caughtError !== null, 'InsufficientFundsError was thrown');
    assert(caughtError?.statusCode === 402, 'Error status code is 402 (Payment Required)');
    assert(caughtError?.requiredUsd === 0.0105, 'Required USD on error is $0.0105');
    assert(caughtError?.currentBalance === 0.005, 'Current balance on error is $0.005');
    assert(mockUser.monthly_call_count === 100, 'Call count was NOT incremented on failed call');

    // Test successful call 101 when balance IS sufficient
    mockUser.balance_usd = 1.00;
    mockUser.credit_balance = 1.00;
    const successRes = await processCallUsage('usr_test_insufficient_bal', 0.010, {
      inMemoryUser: mockUser,
      providerId: 'tavily',
    });

    assert(successRes.isFree === false, 'Call 101 with balance is paid');
    assert(successRes.finalCharge === 0.0105, 'Call 101 deducted $0.0105');
    assert(successRes.balanceAfter === 0.9895, 'Balance updated to $0.9895 ($1.00 - $0.0105)');
    assert(mockUser.monthly_call_count === 101, 'Call count incremented to 101');

    console.log('✅ TEST D PASSED: Insufficient balance on call 101 triggered HTTP 402 refusal.\n');
    passedCount++;
  } catch (err: any) {
    console.error(`❌ TEST D FAILED: ${err.message}\n`);
  }

  // SUMMARY
  console.log('====================================================');
  console.log(`📊 TEST RESULTS: ${passedCount} / ${totalTests} TESTS PASSED`);
  console.log('====================================================');

  if (passedCount === totalTests) {
    console.log('\n🎉 ALL BILLING ENGINE UNIT TESTS PASSED SUCCESSFULLY!');
  } else {
    process.exit(1);
  }
}

runBillingEngineTests();
