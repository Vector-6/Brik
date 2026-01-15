/**
 * Number Formatting Utilities
 * Smart formatting for token amounts, USD values, and percentages
 * with appropriate precision based on value magnitude
 */

// ============================================================================
// Core Formatting Functions
// ============================================================================

/**
 * Format token amount with intelligent precision
 * Handles very large and very small numbers appropriately
 *
 * @param amount - Amount as string or number
 * @param options - Formatting options
 * @returns Formatted string with appropriate precision
 *
 * @example
 * formatTokenAmount("1234567.89")      // "1,234,567.89"
 * formatTokenAmount("0.00012345")      // "0.0001235"
 * formatTokenAmount("223.226080207")   // "223.2261"
 */
export function formatTokenAmount(
  amount: string | number,
  options: {
    maxDecimals?: number;
    minDecimals?: number;
    useGrouping?: boolean;
  } = {}
): string {
  const {
    maxDecimals = 8,
    minDecimals = 0,
    useGrouping = true,
  } = options;

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num) || !isFinite(num)) {
    return '0';
  }

  if (num === 0) {
    return '0';
  }

  // Determine appropriate decimal places based on magnitude
  let decimals: number;
  const absNum = Math.abs(num);

  if (absNum >= 1_000_000) {
    // Large numbers: 1,234,567.89
    decimals = Math.min(2, maxDecimals);
  } else if (absNum >= 1_000) {
    // Thousands: 1,234.56
    decimals = Math.min(2, maxDecimals);
  } else if (absNum >= 1) {
    // Ones: 12.3456
    decimals = Math.min(4, maxDecimals);
  } else if (absNum >= 0.01) {
    // Cents: 0.1234
    decimals = Math.min(4, maxDecimals);
  } else if (absNum >= 0.0001) {
    // Small: 0.001234
    decimals = Math.min(6, maxDecimals);
  } else {
    // Very small: 0.00001234
    decimals = Math.min(8, maxDecimals);
  }

  // Format with Intl.NumberFormat for locale-aware formatting
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: decimals,
    useGrouping: useGrouping,
  });

  return formatter.format(num);
}

/**
 * Format USD value with $ prefix and appropriate decimals
 *
 * @param amount - Amount as string or number
 * @returns Formatted USD string
 *
 * @example
 * formatUSDValue(1234.56)    // "$1,234.56"
 * formatUSDValue(0.123)      // "$0.12"
 * formatUSDValue(1234567)    // "$1,234,567"
 */
export function formatUSDValue(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num) || !isFinite(num)) {
    return '$0.00';
  }

  const absNum = Math.abs(num);

  let decimals: number;
  if (absNum >= 1) {
    decimals = 2;
  } else if (absNum >= 0.01) {
    decimals = 4;
  } else {
    decimals = 6;
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });

  return formatter.format(num);
}

/**
 * Format percentage with appropriate precision
 *
 * @param value - Percentage value (e.g., 0.5 for 0.5%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(0.5)      // "0.50%"
 * formatPercentage(12.345)   // "12.35%"
 */
export function formatPercentage(
  value: number,
  decimals: number = 2
): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0.00%';
  }

  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with specific precision, removing trailing zeros
 *
 * @param amount - Amount to format
 * @param maxDecimals - Maximum decimal places
 * @returns Formatted string
 *
 * @example
 * formatWithPrecision("1.50000", 4)  // "1.5"
 * formatWithPrecision("0.12340", 4)  // "0.1234"
 */
export function formatWithPrecision(
  amount: string | number,
  maxDecimals: number = 8
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num) || !isFinite(num)) {
    return '0';
  }

  // Convert to string with max decimals, then remove trailing zeros
  const fixed = num.toFixed(maxDecimals);
  return fixed.replace(/\.?0+$/, '');
}

/**
 * Add thousand separators to a number string
 *
 * @param value - Number string
 * @returns String with thousand separators
 *
 * @example
 * addThousandSeparators("1234567")  // "1,234,567"
 */
export function addThousandSeparators(value: string): string {
  const parts = value.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**
 * Format large numbers with K/M/B suffix
 *
 * @param num - Number to format
 * @returns Formatted string with suffix
 *
 * @example
 * formatCompact(1500)          // "1.5K"
 * formatCompact(1500000)       // "1.5M"
 * formatCompact(1500000000)    // "1.5B"
 */
export function formatCompact(num: number): string {
  if (isNaN(num) || !isFinite(num)) {
    return '0';
  }

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1_000_000_000) {
    return `${sign}${(absNum / 1_000_000_000).toFixed(2)}B`;
  }
  if (absNum >= 1_000_000) {
    return `${sign}${(absNum / 1_000_000).toFixed(2)}M`;
  }
  if (absNum >= 1_000) {
    return `${sign}${(absNum / 1_000).toFixed(2)}K`;
  }

  return formatTokenAmount(num, { maxDecimals: 2 });
}

/**
 * Get full precision value for tooltips/copy
 * Returns the original value without formatting
 *
 * @param amount - Amount to preserve
 * @returns Full precision string
 */
export function getFullPrecision(amount: string | number): string {
  return String(amount);
}

/**
 * Truncate middle of long strings (for addresses, hashes)
 *
 * @param str - String to truncate
 * @param startChars - Characters to show at start
 * @param endChars - Characters to show at end
 * @returns Truncated string
 *
 * @example
 * truncateMiddle("0x1234567890abcdef", 6, 4)  // "0x1234...cdef"
 */
export function truncateMiddle(
  str: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (str.length <= startChars + endChars) {
    return str;
  }
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check if a value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && isFinite(value) && !isNaN(value);
}

/**
 * Check if amount is effectively zero
 */
export function isEffectivelyZero(amount: string | number, threshold: number = 0.0000001): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.abs(num) < threshold;
}

// ============================================================================
// Export all functions
// ============================================================================

const numberFormatting = {
  formatTokenAmount,
  formatUSDValue,
  formatPercentage,
  formatWithPrecision,
  addThousandSeparators,
  formatCompact,
  getFullPrecision,
  truncateMiddle,
  isValidNumber,
  isEffectivelyZero,
};

export default numberFormatting;
