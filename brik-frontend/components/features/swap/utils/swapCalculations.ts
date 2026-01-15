/**
 * Swap Calculation Utilities
 * Pure functions for swap-related calculations
 *
 * NOTE: Amount conversion functions (toSmallestUnit, fromSmallestUnit) have been
 * moved to lib/utils/amountConversion.ts
 *
 * NOTE: Quote-related calculations (output amount, fees, slippage) are now
 * handled by the Quote API and returned in the quote response
 */

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Format token amount with proper decimal places
 *
 * @param amount - Amount as string or number
 * @param decimals - Number of decimal places
 * @returns Formatted amount
 *
 * @example
 * formatTokenAmount('1234.5678', 2); // '1234.57'
 * formatTokenAmount('0.000123', 6); // '0.000123'
 */
export function formatTokenAmount(
  amount: string | number,
  decimals: number
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return '0';
  }

  return num.toFixed(decimals);
}

/**
 * Format amount for display with thousand separators
 *
 * @param amount - Amount as string or number
 * @param decimals - Number of decimal places
 * @returns Formatted amount with commas
 *
 * @example
 * formatDisplayAmount('1234567.89', 2); // '1,234,567.89'
 */
export function formatDisplayAmount(
  amount: string | number,
  decimals = 2
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return '0';
  }

  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format USD value with $ symbol
 *
 * @param value - Value as number
 * @returns Formatted USD string
 *
 * @example
 * formatUsdValue(1234.56); // '$1,234.56'
 */
export function formatUsdValue(value: number): string {
  return `$${formatDisplayAmount(value, 2)}`;
}

/**
 * Format percentage with % symbol
 *
 * @param value - Percentage value
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(0.58); // '0.58%'
 * formatPercentage(-1.23); // '-1.23%'
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate that amount doesn't exceed maximum decimal places
 *
 * @param amount - Amount as string
 * @param maxDecimals - Maximum allowed decimal places
 * @returns True if valid, false otherwise
 *
 * @example
 * validateAmountDecimals('1.123456', 6); // true
 * validateAmountDecimals('1.123456', 4); // false
 */
export function validateAmountDecimals(
  amount: string,
  maxDecimals: number
): boolean {
  if (!amount || amount === '') {
    return true;
  }

  const decimalIndex = amount.indexOf('.');
  if (decimalIndex === -1) {
    return true; // No decimals
  }

  const decimalPlaces = amount.length - decimalIndex - 1;
  return decimalPlaces <= maxDecimals;
}

/**
 * Validate that input is a valid number format
 *
 * @param input - Input string
 * @returns True if valid number format, false otherwise
 *
 * @example
 * isValidNumberInput('123.45'); // true
 * isValidNumberInput('123.45.67'); // false
 * isValidNumberInput('abc'); // false
 */
export function isValidNumberInput(input: string): boolean {
  if (input === '') {
    return true;
  }

  // Allow numbers with optional single decimal point
  const regex = /^\d*\.?\d*$/;
  return regex.test(input);
}

/**
 * Sanitize number input (remove invalid characters)
 *
 * @param input - Input string
 * @returns Sanitized input
 *
 * @example
 * sanitizeNumberInput('12a3.4b5'); // '123.45'
 */
export function sanitizeNumberInput(input: string): string {
  // Remove all non-numeric characters except decimal point
  let sanitized = input.replace(/[^\d.]/g, '');

  // Ensure only one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }

  return sanitized;
}

// ============================================================================
// Comparison Functions
// ============================================================================

/**
 * Compare two amounts
 *
 * @param amount1 - First amount
 * @param amount2 - Second amount
 * @returns -1 if amount1 < amount2, 0 if equal, 1 if amount1 > amount2
 */
export function compareAmounts(amount1: string, amount2: string): number {
  const num1 = parseFloat(amount1);
  const num2 = parseFloat(amount2);

  if (isNaN(num1) || isNaN(num2)) {
    return 0;
  }

  if (num1 < num2) return -1;
  if (num1 > num2) return 1;
  return 0;
}

/**
 * Check if amount is greater than zero
 *
 * @param amount - Amount to check
 * @returns True if amount > 0
 */
export function isPositiveAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

// ============================================================================
// NOTE: Removed Functions (now handled by Quote API)
// ============================================================================
// The following functions have been removed as they are now handled by the
// Quote API (/api/quote) which provides accurate real-time data from LI.FI:
//
// ❌ calculatePriceImpact() - Use quote response for accurate price impact
// ❌ calculateFee() - Use quote.estimate.feeCosts for actual fees
// ❌ calculateMinimumReceived() - Use quote.estimate.toAmountMin
//
// The Quote API provides:
// - Real conversion rates from liquidity pools
// - Actual gas costs in USD
// - Protocol fees breakdown
// - Slippage-adjusted minimum received amounts
// - Route optimization across DEXs and bridges
// ============================================================================
