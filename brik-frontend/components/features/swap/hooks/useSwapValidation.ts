'use client';

/**
 * useSwapValidation Hook
 * Validation logic for swap forms
 */

import { useMemo } from 'react';
import { Token } from '@/lib/types/token.types';
import {
  validateSwapAmount,
  validateTokenSelection,
  validateTokenPair,
  canExecuteSwap,
  SwapValidationErrors,
} from '../utils/swapValidation';

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UseSwapValidationReturn {
  isValidSwap: boolean;
  errors: SwapValidationErrors;
  canExecute: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Validate swap form data
 *
 * @param fromToken - Selected from token
 * @param toToken - Selected to token
 * @param fromAmount - Input amount
 * @returns Validation state and errors
 *
 * @example
 * const { isValidSwap, errors, canExecute } = useSwapValidation(
 *   fromToken,
 *   toToken,
 *   fromAmount
 * );
 *
 * if (!canExecute) {
 *   console.log('Validation errors:', errors);
 * }
 */
export function useSwapValidation(
  fromToken: Token | null,
  toToken: Token | null,
  fromAmount: string
): UseSwapValidationReturn {
  // ============================================================================
  // Validation Logic
  // ============================================================================

  const errors = useMemo((): SwapValidationErrors => {
    const validationErrors: SwapValidationErrors = {};

    // Validate from token
    const fromTokenValidation = validateTokenSelection(fromToken, 'from');
    if (!fromTokenValidation.isValid) {
      validationErrors.fromToken = fromTokenValidation.error;
    }

    // Validate to token
    const toTokenValidation = validateTokenSelection(toToken, 'to');
    if (!toTokenValidation.isValid) {
      validationErrors.toToken = toTokenValidation.error;
    }

    // Validate token pair
    const pairValidation = validateTokenPair(fromToken, toToken);
    if (!pairValidation.isValid) {
      validationErrors.general = pairValidation.error;
    }

    // Validate from amount
    if (fromToken && toToken) {
      // Only validate amount if tokens are selected
      const amountValidation = validateSwapAmount(fromAmount);
      if (!amountValidation.isValid) {
        validationErrors.fromAmount = amountValidation.error;
      }
    }

    return validationErrors;
  }, [fromToken, toToken, fromAmount]);

  // Check if form is valid (no errors)
  const isValidSwap = useMemo((): boolean => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Check if swap can be executed (quick check)
  const canExecute = useMemo((): boolean => {
    return canExecuteSwap(fromToken, toToken, fromAmount);
  }, [fromToken, toToken, fromAmount]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    isValidSwap,
    errors,
    canExecute,
  };
}
