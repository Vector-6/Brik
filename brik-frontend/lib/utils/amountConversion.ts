/**
 * Amount Conversion Utilities
 * Convert between human-readable amounts and blockchain smallest units (wei)
 */

// ============================================================================
// Core Conversion Functions
// ============================================================================

/**
 * Convert human-readable amount to smallest unit (wei)
 *
 * @param amount - Human-readable amount as string (e.g., "1.5")
 * @param decimals - Token decimals (e.g., 6 for USDC, 18 for ETH)
 * @returns Amount in smallest unit as string (e.g., "1500000")
 *
 * @example
 * toSmallestUnit("1.5", 6)  // "1500000" (USDC)
 * toSmallestUnit("1", 18)   // "1000000000000000000" (ETH)
 * toSmallestUnit("0.000001", 6)  // "1"
 */
export function toSmallestUnit(amount: string, decimals: number): string {
  if (!amount || amount === '' || amount === '0') {
    return '0';
  }

  // Remove leading/trailing whitespace
  const trimmed = amount.trim();

  // Validate input
  if (!/^\d*\.?\d*$/.test(trimmed)) {
    throw new Error(`Invalid amount format: ${amount}`);
  }

  if (decimals < 0 || decimals > 78) {
    throw new Error(`Invalid decimals: ${decimals}. Must be between 0 and 78`);
  }

  // Split into integer and decimal parts
  const [integerPart = '0', decimalPart = ''] = trimmed.split('.');

  // Check if decimal part exceeds token decimals
  if (decimalPart.length > decimals) {
    throw new Error(
      `Amount has too many decimal places. Max ${decimals} decimals allowed.`
    );
  }

  // Pad decimal part to match token decimals
  const paddedDecimal = decimalPart.padEnd(decimals, '0');

  // Combine and remove leading zeros
  const result = (integerPart + paddedDecimal).replace(/^0+/, '') || '0';

  return result;
}

/**
 * Convert smallest unit (wei) to human-readable amount
 *
 * @param amount - Amount in smallest unit as string (e.g., "1500000")
 * @param decimals - Token decimals (e.g., 6 for USDC, 18 for ETH)
 * @param maxDecimalPlaces - Maximum decimal places to show (default: same as decimals)
 * @returns Human-readable amount as string (e.g., "1.5")
 *
 * @example
 * fromSmallestUnit("1500000", 6)  // "1.5" (USDC)
 * fromSmallestUnit("1000000000000000000", 18)  // "1" (ETH)
 * fromSmallestUnit("1", 6)  // "0.000001"
 */
export function fromSmallestUnit(
  amount: string,
  decimals: number,
  maxDecimalPlaces?: number
): string {
  if (!amount || amount === '' || amount === '0') {
    return '0';
  }

  // Remove leading/trailing whitespace
  const trimmed = amount.trim();

  // Validate input
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid amount format: ${amount}`);
  }

  if (decimals < 0 || decimals > 78) {
    throw new Error(`Invalid decimals: ${decimals}. Must be between 0 and 78`);
  }

  // Pad with leading zeros if needed
  const paddedAmount = trimmed.padStart(decimals + 1, '0');

  // Split at decimal point position
  const decimalPosition = paddedAmount.length - decimals;
  const integerPart = paddedAmount.slice(0, decimalPosition) || '0';
  const decimalPart = paddedAmount.slice(decimalPosition);

  // Remove trailing zeros from decimal part
  const trimmedDecimal = decimalPart.replace(/0+$/, '');

  // Apply max decimal places if specified
  const finalDecimal =
    maxDecimalPlaces !== undefined && trimmedDecimal.length > maxDecimalPlaces
      ? trimmedDecimal.slice(0, maxDecimalPlaces)
      : trimmedDecimal;

  // Combine parts
  if (finalDecimal === '') {
    return integerPart;
  }

  return `${integerPart}.${finalDecimal}`;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate that amount can be converted to smallest unit
 *
 * @param amount - Amount to validate
 * @param decimals - Token decimals
 * @returns Validation result
 */
export function validateAmountForConversion(
  amount: string,
  decimals: number
): {
  isValid: boolean;
  error?: string;
} {
  if (!amount || amount === '') {
    return { isValid: false, error: 'Amount is required' };
  }

  if (!/^\d*\.?\d*$/.test(amount)) {
    return { isValid: false, error: 'Invalid amount format' };
  }

  const [, decimalPart = ''] = amount.split('.');
  if (decimalPart.length > decimals) {
    return {
      isValid: false,
      error: `Too many decimal places. Maximum ${decimals} allowed.`,
    };
  }

  return { isValid: true };
}

/**
 * Check if amount is zero or empty
 */
export function isZeroAmount(amount: string): boolean {
  if (!amount || amount === '') {
    return true;
  }

  const num = parseFloat(amount);
  return num === 0;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the maximum number of decimals for a token
 * Ensures the amount doesn't exceed token's decimal precision
 */
export function getMaxDecimalPlaces(decimals: number): number {
  return Math.min(decimals, 18); // Cap at 18 for display purposes
}

/**
 * Format amount with proper decimal places
 * Removes trailing zeros and unnecessary decimal point
 */
export function formatConvertedAmount(amount: string, decimals: number): string {
  if (!amount || amount === '0') {
    return '0';
  }

  const [integerPart, decimalPart = ''] = amount.split('.');
  const trimmedDecimal = decimalPart.replace(/0+$/, '');

  if (trimmedDecimal === '') {
    return integerPart;
  }

  // Limit decimal places for display
  const maxDecimals = getMaxDecimalPlaces(decimals);
  const finalDecimal =
    trimmedDecimal.length > maxDecimals
      ? trimmedDecimal.slice(0, maxDecimals)
      : trimmedDecimal;

  return `${integerPart}.${finalDecimal}`;
}

// ============================================================================
// Export all functions
// ============================================================================

const amountConversion = {
  toSmallestUnit,
  fromSmallestUnit,
  validateAmountForConversion,
  isZeroAmount,
  getMaxDecimalPlaces,
  formatConvertedAmount,
};

export default amountConversion;
