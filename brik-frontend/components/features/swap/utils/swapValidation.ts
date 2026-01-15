/**
 * Swap Validation Utilities
 * Validation functions for swap operations
 */

import { Token, SwapFormData } from '@/lib/types/token.types';
import { isValidNumberInput, isPositiveAmount } from './swapCalculations';

// ============================================================================
// Amount Validation
// ============================================================================

/**
 * Validate swap amount
 *
 * @param amount - Amount to validate
 * @returns Validation result with error message if invalid
 */
export function validateSwapAmount(amount: string): {
  isValid: boolean;
  error?: string;
} {
  // Empty amount
  if (!amount || amount.trim() === '') {
    return {
      isValid: false,
      error: 'Please enter an amount',
    };
  }

  // Invalid number format
  if (!isValidNumberInput(amount)) {
    return {
      isValid: false,
      error: 'Invalid amount format',
    };
  }

  // Zero or negative amount
  if (!isPositiveAmount(amount)) {
    return {
      isValid: false,
      error: 'Amount must be greater than zero',
    };
  }

  return { isValid: true };
}

/**
 * Validate that amount doesn't exceed maximum
 *
 * @param amount - Amount to validate
 * @param maxAmount - Maximum allowed amount
 * @returns Validation result
 */
export function validateMaxAmount(
  amount: string,
  maxAmount: string
): {
  isValid: boolean;
  error?: string;
} {
  const amountNum = parseFloat(amount);
  const maxNum = parseFloat(maxAmount);

  if (isNaN(amountNum) || isNaN(maxNum)) {
    return { isValid: true };
  }

  if (amountNum > maxNum) {
    return {
      isValid: false,
      error: `Amount exceeds maximum of ${maxAmount}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate that amount meets minimum requirement
 *
 * @param amount - Amount to validate
 * @param minAmount - Minimum required amount
 * @returns Validation result
 */
export function validateMinAmount(
  amount: string,
  minAmount: string
): {
  isValid: boolean;
  error?: string;
} {
  const amountNum = parseFloat(amount);
  const minNum = parseFloat(minAmount);

  if (isNaN(amountNum) || isNaN(minNum)) {
    return { isValid: true };
  }

  if (amountNum < minNum) {
    return {
      isValid: false,
      error: `Amount must be at least ${minAmount}`,
    };
  }

  return { isValid: true };
}

// ============================================================================
// Token Validation
// ============================================================================

/**
 * Validate token selection
 *
 * @param token - Token to validate
 * @param label - Label for error message ('from' or 'to')
 * @returns Validation result
 */
export function validateTokenSelection(
  token: Token | null,
  label: string
): {
  isValid: boolean;
  error?: string;
} {
  if (!token) {
    return {
      isValid: false,
      error: `Please select a ${label} token`,
    };
  }

  return { isValid: true };
}

/**
 * Validate that from and to tokens are different
 * Tokens are considered the same only if they have the same symbol, chain ID, and address
 *
 * @param fromToken - From token
 * @param toToken - To token
 * @returns Validation result
 */
export function validateTokenPair(
  fromToken: Token | null,
  toToken: Token | null
): {
  isValid: boolean;
  error?: string;
} {
  if (!fromToken || !toToken) {
    return { isValid: true }; // Will be caught by individual token validation
  }

  // Tokens are only the same if they have the same chain ID AND address
  // This allows cross-chain swaps of the same token symbol (e.g., USDT Ethereum -> USDT Avalanche)
  if (
    fromToken.currentChainId === toToken.currentChainId &&
    fromToken.currentChainAddress.toLowerCase() === toToken.currentChainAddress.toLowerCase()
  ) {
    return {
      isValid: false,
      error: 'Cannot swap the same token',
    };
  }

  return { isValid: true };
}

// ============================================================================
// Complete Swap Validation
// ============================================================================

/**
 * Validation errors for swap form
 */
export interface SwapValidationErrors {
  fromToken?: string;
  toToken?: string;
  fromAmount?: string;
  general?: string;
}

/**
 * Validate complete swap form
 *
 * @param formData - Swap form data
 * @returns Validation result with all errors
 */
export function validateSwapForm(formData: SwapFormData): {
  isValid: boolean;
  errors: SwapValidationErrors;
} {
  const errors: SwapValidationErrors = {};

  // Validate from token
  const fromTokenValidation = validateTokenSelection(formData.fromToken, 'from');
  if (!fromTokenValidation.isValid) {
    errors.fromToken = fromTokenValidation.error;
  }

  // Validate to token
  const toTokenValidation = validateTokenSelection(formData.toToken, 'to');
  if (!toTokenValidation.isValid) {
    errors.toToken = toTokenValidation.error;
  }

  // Validate token pair
  const pairValidation = validateTokenPair(formData.fromToken, formData.toToken);
  if (!pairValidation.isValid) {
    errors.general = pairValidation.error;
  }

  // Validate from amount
  const amountValidation = validateSwapAmount(formData.fromAmount);
  if (!amountValidation.isValid) {
    errors.fromAmount = amountValidation.error;
  }

  // Check if any errors exist
  const isValid = Object.keys(errors).length === 0;

  return { isValid, errors };
}

/**
 * Check if swap can be executed (quick validation)
 * Tokens are considered the same only if they have the same chain ID and address
 *
 * @param fromToken - From token
 * @param toToken - To token
 * @param fromAmount - From amount
 * @returns True if swap can be executed
 */
export function canExecuteSwap(
  fromToken: Token | null,
  toToken: Token | null,
  fromAmount: string
): boolean {
  // Must have both tokens selected
  if (!fromToken || !toToken) {
    return false;
  }

  // Tokens must be different (same chain ID AND address)
  // This allows cross-chain swaps of the same token symbol (e.g., USDT Ethereum -> USDT Avalanche)
  if (
    fromToken.currentChainId === toToken.currentChainId &&
    fromToken.currentChainAddress.toLowerCase() === toToken.currentChainAddress.toLowerCase()
  ) {
    return false;
  }

  // Must have valid amount
  const amountValidation = validateSwapAmount(fromAmount);
  if (!amountValidation.isValid) {
    return false;
  }

  return true;
}

// ============================================================================
// Slippage Validation
// ============================================================================

/**
 * Validate slippage percentage
 *
 * @param slippage - Slippage percentage
 * @param minSlippage - Minimum allowed slippage
 * @param maxSlippage - Maximum allowed slippage
 * @returns Validation result
 */
export function validateSlippage(
  slippage: number,
  minSlippage = 0.1,
  maxSlippage = 5.0
): {
  isValid: boolean;
  error?: string;
  warning?: string;
} {
  if (isNaN(slippage)) {
    return {
      isValid: false,
      error: 'Invalid slippage value',
    };
  }

  if (slippage < minSlippage) {
    return {
      isValid: false,
      error: `Slippage must be at least ${minSlippage}%`,
    };
  }

  if (slippage > maxSlippage) {
    return {
      isValid: false,
      error: `Slippage cannot exceed ${maxSlippage}%`,
    };
  }

  // Warning for high slippage
  if (slippage > 1.0) {
    return {
      isValid: true,
      warning: 'High slippage may result in unfavorable rates',
    };
  }

  return { isValid: true };
}
