/**
 * Swap Fee Calculation Utilities
 * Handles calculation of Brik fees and swap values
 */

/**
 * Brik fee percentage (50% for TEST ENVIRONMENT)
 */
export const BRIK_FEE_PERCENTAGE = 0.5; // TEST ONLY - was 0.005 (0.5%)

/**
 * Calculate swap value in USD from token amount and price
 */
export function calculateSwapValueUsd(
  amount: string,
  priceUsd: number
): number {
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return 0;
  }

  return amountNum * priceUsd;
}

/**
 * Calculate Brik fee (50% of swap value in USD for TEST ENVIRONMENT)
 */
export function calculateBrikFeeUsd(swapValueUsd: number): number {
  return swapValueUsd * BRIK_FEE_PERCENTAGE;
}

/**
 * Calculate both swap value and Brik fee from token amount and price
 */
export function calculateSwapMetrics(
  amount: string,
  priceUsd: number
): {
  swapValueUsd: number;
  brikFeeUsd: number;
} {
  const swapValueUsd = calculateSwapValueUsd(amount, priceUsd);
  const brikFeeUsd = calculateBrikFeeUsd(swapValueUsd);

  return {
    swapValueUsd,
    brikFeeUsd,
  };
}

/**
 * Estimate points earned from a swap
 * Points = Brik Fee USD × 100
 */
export function estimatePointsEarned(brikFeeUsd: number): number {
  return Math.floor(brikFeeUsd * 100);
}
