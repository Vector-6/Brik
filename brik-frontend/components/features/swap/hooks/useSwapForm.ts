'use client';

/**
 * useSwapForm Hook
 *
 * Single Responsibility: Manage swap form state
 *
 * This hook is responsible ONLY for:
 * - Managing fromToken, toToken, fromAmount, toAmount state
 * - Providing setters for form fields
 * - Token switching functionality
 * - Token filtering logic (available tokens)
 * - Form reset functionality
 *
 * It does NOT:
 * - Fetch quotes
 * - Validate swap logic
 * - Execute swaps
 * - Manage modals
 * - Handle persistence
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Token } from '@/lib/types/token.types';

// =============================================================================
// Types
// =============================================================================

export interface SwapFormState {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
}

export interface UseSwapFormParams {
  tokens: Token[];
  initialFromToken?: Token | null;
  initialToToken?: Token | null;
}

export interface UseSwapFormReturn {
  form: SwapFormState;
  setFromToken: (token: Token | null) => void;
  setToToken: (token: Token | null) => void;
  setFromAmount: (amount: string) => void;
  setToAmount: (amount: string) => void;
  switchTokens: () => void;
  resetForm: () => void;
  availableFromTokens: Token[];
  availableToTokens: Token[];
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook for managing swap form state
 *
 * Handles form field state and token filtering logic.
 * Does not contain business logic for quotes or execution.
 *
 * @param params - Configuration parameters
 * @returns Form state and controls
 */
export function useSwapForm(params: UseSwapFormParams): UseSwapFormReturn {
  const { tokens, initialFromToken = null, initialToToken = null } = params;

  // ===========================================================================
  // State
  // ===========================================================================

  const [fromToken, setFromToken] = useState<Token | null>(initialFromToken);
  const [toToken, setToToken] = useState<Token | null>(initialToToken);
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');

  // Track if initialToToken has been applied (only apply once)
  const initialToTokenAppliedRef = useRef(false);

  // ===========================================================================
  // Effects
  // ===========================================================================

  // Apply initialToToken when it becomes available (only once)
  useEffect(() => {
    if (
      initialToToken &&
      !initialToTokenAppliedRef.current &&
      !toToken // Only set if toToken is not already set
    ) {
      setToToken(initialToToken);
      initialToTokenAppliedRef.current = true;
    }
  }, [initialToToken, toToken]);

  // ===========================================================================
  // Token Filtering
  // ===========================================================================

  // Available tokens for "from" field (exclude currently selected toToken)
  const availableFromTokens = useMemo(() => {
    if (!toToken) {
      return tokens;
    }

    return tokens.filter((token) => !isSameToken(token, toToken));
  }, [tokens, toToken]);

  // Available tokens for "to" field (exclude currently selected fromToken)
  const availableToTokens = useMemo(() => {
    if (!fromToken) {
      return tokens;
    }

    return tokens.filter((token) => !isSameToken(token, fromToken));
  }, [tokens, fromToken]);

  // ===========================================================================
  // Actions
  // ===========================================================================

  const handleSetFromToken = useCallback(
    (token: Token | null) => {
      setFromToken(token);

      // If the new fromToken is the same as toToken, clear toToken
      if (token && toToken && isSameToken(token, toToken)) {
        setToToken(null);
      }
    },
    [toToken],
  );

  const handleSetToToken = useCallback(
    (token: Token | null) => {
      setToToken(token);

      // If the new toToken is the same as fromToken, clear fromToken
      if (token && fromToken && isSameToken(token, fromToken)) {
        setFromToken(null);
      }
    },
    [fromToken],
  );

  const handleSwitchTokens = useCallback(() => {
    // Swap tokens
    setFromToken(toToken);
    setToToken(fromToken);

    // Swap amounts
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  }, [fromToken, toToken, fromAmount, toAmount]);

  const handleResetForm = useCallback(() => {
    setFromToken(initialFromToken);
    setToToken(initialToToken);
    setFromAmount('');
    setToAmount('');
  }, [initialFromToken, initialToToken]);

  // ===========================================================================
  // Return Values
  // ===========================================================================

  const form: SwapFormState = useMemo(
    () => ({
      fromToken,
      toToken,
      fromAmount,
      toAmount,
    }),
    [fromToken, toToken, fromAmount, toAmount],
  );

  return {
    form,
    setFromToken: handleSetFromToken,
    setToToken: handleSetToToken,
    setFromAmount,
    setToAmount,
    switchTokens: handleSwitchTokens,
    resetForm: handleResetForm,
    availableFromTokens,
    availableToTokens,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if two tokens are the same
 * Compares by chain ID and contract address
 */
function isSameToken(a: Token, b: Token): boolean {
  return (
    a.currentChainId === b.currentChainId &&
    a.currentChainAddress.toLowerCase() === b.currentChainAddress.toLowerCase()
  );
}

export default useSwapForm;
