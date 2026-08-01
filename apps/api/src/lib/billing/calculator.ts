/**
 * Billing Calculator Engine
 * Location: lib/billing/calculator.ts
 *
 * Implements LiteDaemon BYOK & Gateway Fee Mathematics:
 * - Calls 1 through 100 per billing month: FREE ($0.000000 charge)
 * - Call 101+: 5% Provider Markup applied (finalCharge = rawCost * 1.05)
 * - Precision: 6 decimal places internally (0.000000), formatted to 4 decimal places for display.
 */

export interface CallCostResult {
  isFree: boolean;
  rawCost: number;
  markup: number;
  finalCharge: number;
  formattedDisplayCharge: string; // 4 decimal places for ledger display
}

/**
 * Rounds a number to a specified number of decimal places.
 */

export function roundToDecimals(value: number, decimals: number = 6): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Calculates the exact user charge for an API tool call based on current billing month call count.
 *
 * @param providerRawCost The wholesale cost charged by the upstream provider (e.g. 0.010 for Tavily)
 * @param currentCallCount The total number of calls already completed by the user in the active billing period.
 */
export function calculateCallCost(providerRawCost: number, currentCallCount: number): CallCostResult {
  const rawCost = roundToDecimals(providerRawCost, 6);
  
  // Calls 1 through 100 are FREE (currentCallCount 0..99)
  if (currentCallCount < 100) {
    return {
      isFree: true,
      rawCost,
      markup: 0,
      finalCharge: 0,
      formattedDisplayCharge: '0.0000',
    };
  }

  // Call 101 onwards (currentCallCount >= 100) -> 5% markup
  const markup = roundToDecimals(rawCost * 0.05, 6);
  const finalCharge = roundToDecimals(rawCost + markup, 6); // equivalent to rawCost * 1.05

  return {
    isFree: false,
    rawCost,
    markup,
    finalCharge,
    formattedDisplayCharge: finalCharge.toFixed(4),
  };
}
