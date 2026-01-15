/**
 * Quote Details Extraction Utilities
 *
 * Extracts and formats quote information for display in UI components.
 * Follows single responsibility principle by separating data extraction from UI logic.
 */

import type { RouteExtended } from '@/lib/types/lifi.types';
import type { Token } from '@/lib/types/token.types';
import { fromSmallestUnit } from './amountConversion';

// ============================================================================
// Types
// ============================================================================

/**
 * Formatted quote details ready for display
 */
export interface QuoteDisplayDetails {
  /** Formatted destination amount (e.g., "1.5") */
  toAmount: string;

  /** Formatted minimum received amount (e.g., "1.485") */
  minReceived: string;

  /** Exchange rate (1 fromToken = X toToken) */
  rate: number;

  /** Price impact percentage (0-100) */
  priceImpact: number;

  /** Gas cost in USD (formatted) */
  gasCostUSD: string | null;

  /** Route provider name (e.g., "Uniswap", "Stargate") */
  routeProvider: string;

  /** Estimated execution time in seconds */
  estimatedTimeSeconds: number;

  /** From amount in USD (formatted) */
  fromAmountUSD: string | null;

  /** To amount in USD (formatted) */
  toAmountUSD: string | null;
}

// ============================================================================
// Main Extraction Function
// ============================================================================

/**
 * Extracts formatted quote details from RouteExtended for display
 *
 * @param quote - LI.FI route with quote information
 * @param toToken - Destination token metadata
 * @param fromAmount - Source amount as string
 * @returns Formatted quote details ready for display
 *
 * @example
 * ```ts
 * const details = extractQuoteDetails(route, toToken, "1.5");
 * console.log(details.toAmount); // "2500.00"
 * console.log(details.rate); // 1666.67
 * console.log(details.priceImpact); // 0.15
 * ```
 */
export function extractQuoteDetails(
  quote: RouteExtended,
  toToken: Token,
  fromAmount: string
): QuoteDisplayDetails {
  // Extract to amount (convert from smallest units)
  const toAmount = convertToAmount(quote.toAmount, toToken);

  // Extract minimum received (convert from smallest units)
  const minReceived = convertToAmount(quote.toAmountMin, toToken);

  // Calculate exchange rate
  const rate = calculateExchangeRate(toAmount, fromAmount);

  // Calculate price impact
  const priceImpact = calculatePriceImpact(
    quote.fromAmountUSD,
    quote.toAmountUSD
  );

  // Extract gas cost
  const gasCostUSD = quote.gasCostUSD ?? null;

  // Extract route provider (first step's tool)
  const routeProvider = extractRouteProvider(quote);

  // Calculate estimated execution time
  const estimatedTimeSeconds = calculateEstimatedTime(quote);

  return {
    toAmount,
    minReceived,
    rate,
    priceImpact,
    gasCostUSD,
    routeProvider,
    estimatedTimeSeconds,
    fromAmountUSD: quote.fromAmountUSD ?? null,
    toAmountUSD: quote.toAmountUSD ?? null,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts amount from smallest units to human-readable format
 */
function convertToAmount(amountWei: string, token: Token): string {
  try {
    return fromSmallestUnit(
      amountWei,
      token.decimals,
      Math.min(8, token.decimals) // Max 8 decimal places for display
    );
  } catch (error) {
    console.warn('Failed to convert amount:', error);
    return '0';
  }
}

/**
 * Calculates exchange rate: 1 fromToken = X toTokens
 */
function calculateExchangeRate(
  toAmount: string,
  fromAmount: string
): number {
  const to = Number.parseFloat(toAmount);
  const from = Number.parseFloat(fromAmount);

  if (!Number.isFinite(to) || !Number.isFinite(from) || from === 0) {
    return 0;
  }

  return to / from;
}

/**
 * Calculates price impact percentage
 *
 * Price impact is the difference between expected value and actual value.
 * Uses USD amounts to get accurate cross-chain impact.
 *
 * Formula: ((fromUSD - toUSD) / fromUSD) * 100
 *
 * Note: A small positive price impact is normal for most swaps due to fees.
 * Large price impacts (>5%) indicate low liquidity or poor routing.
 */
function calculatePriceImpact(
  fromAmountUSD: string,
  toAmountUSD: string
): number {
  const fromUSD = Number.parseFloat(fromAmountUSD);
  const toUSD = Number.parseFloat(toAmountUSD);

  // If either value is invalid, return 0
  if (!Number.isFinite(fromUSD) || !Number.isFinite(toUSD) || fromUSD === 0) {
    return 0;
  }

  // Calculate price impact as percentage
  const impact = ((fromUSD - toUSD) / fromUSD) * 100;

  // Return absolute value capped at 100%
  // Negative impact means better than expected (rare, but possible with positive slippage)
  return Math.max(0, Math.min(100, impact));
}

/**
 * Extracts route provider name from first step
 */
function extractRouteProvider(quote: RouteExtended): string {
  const firstStep = quote.steps[0];

  if (!firstStep) {
    return 'Unknown';
  }

  // Try to get tool details name first, fall back to tool key
  return firstStep.toolDetails?.name ?? firstStep.tool ?? 'Best Route';
}

/**
 * Calculates total estimated execution time from all steps
 */
function calculateEstimatedTime(quote: RouteExtended): number {
  return quote.steps.reduce((total, step) => {
    const stepTime = step.estimate?.executionDuration ?? 0;
    return total + stepTime;
  }, 0);
}

// ============================================================================
// Utility Functions for Specific Values
// ============================================================================

/**
 * Checks if price impact is high enough to warn the user
 */
export function isHighPriceImpact(priceImpact: number): boolean {
  return priceImpact > 5;
}

/**
 * Checks if price impact is moderate (show warning but allow)
 */
export function isModeratePriceImpact(priceImpact: number): boolean {
  return priceImpact > 3 && priceImpact <= 5;
}

/**
 * Gets price impact severity level
 */
export function getPriceImpactSeverity(
  priceImpact: number
): 'low' | 'moderate' | 'high' {
  if (priceImpact > 5) return 'high';
  if (priceImpact > 3) return 'moderate';
  return 'low';
}
