'use client';

/**
 * useInitialToTokenFromUrl Hook
 *
 * Single Responsibility: Handle initial "to token" selection from URL parameter
 *
 * This hook is responsible for:
 * - Reading the 'token' URL parameter
 * - Finding the matching token by symbol (case-insensitive)
 * - Returning the initial token ONLY on first load
 * - Preventing URL param from overriding user's manual selections
 *
 * Edge cases handled:
 * 1. Tokens still loading → waits for tokens to be available
 * 2. Token symbol not found → returns null gracefully
 * 3. User manually changes toToken → never overrides user choice
 * 4. Case-insensitive matching → 'USDC' matches 'usdc'
 * 5. Multiple tokens with same symbol → returns first match
 * 6. No URL param → returns null
 */

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Token } from '@/lib/types/token.types';

// =============================================================================
// Types
// =============================================================================

export interface UseInitialToTokenFromUrlReturn {
  /**
   * The initial token to set (null if not found or already applied)
   */
  initialToken: Token | null;

  /**
   * Whether the initial token has been applied
   */
  hasBeenApplied: boolean;

  /**
   * Mark that the user has manually changed the token
   * Call this when user manually selects a different toToken
   */
  markAsUserModified: () => void;
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook to get initial toToken from URL parameter
 *
 * Reads the 'token' URL parameter and returns the matching token.
 * Only applies the token once on initial load and respects user choices.
 *
 * @param tokens - Available tokens array
 * @param isLoadingTokens - Whether tokens are still being fetched
 * @returns Initial token and control functions
 *
 * @example
 * // URL: /swap?token=USDC
 * const { initialToken, markAsUserModified } = useInitialToTokenFromUrl(tokens, isLoading);
 * // initialToken will be the USDC token object (or null if not found)
 *
 * // When user manually changes token:
 * const handleUserTokenChange = (token) => {
 *   setToToken(token);
 *   markAsUserModified(); // Prevent URL from overriding
 * };
 */
export function useInitialToTokenFromUrl(
  tokens: Token[],
  isLoadingTokens: boolean,
): UseInitialToTokenFromUrlReturn {
  const searchParams = useSearchParams();

  // Track if the initial token has been applied
  const hasAppliedRef = useRef(false);

  // Track if user has manually modified the token
  const userModifiedRef = useRef(false);

  // State for the initial token
  const [initialToken, setInitialToken] = useState<Token | null>(null);

  // Get the token symbol from URL parameter
  const tokenSymbolParam = searchParams.get('token');

  useEffect(() => {
    // Skip if:
    // 1. No token parameter in URL
    // 2. Already applied the initial token
    // 3. User has manually modified the token
    // 4. Tokens are still loading
    if (
      !tokenSymbolParam ||
      hasAppliedRef.current ||
      userModifiedRef.current ||
      isLoadingTokens
    ) {
      return;
    }

    // Skip if tokens array is empty (still waiting for data)
    if (tokens.length === 0) {
      return;
    }

    // Find matching token by symbol (case-insensitive)
    const matchedToken = findTokenBySymbol(tokens, tokenSymbolParam);

    if (matchedToken) {
      setInitialToken(matchedToken);
      hasAppliedRef.current = true;
    } else {
      // Token not found - mark as applied to prevent repeated lookups
      hasAppliedRef.current = true;
      console.debug(
        `[useInitialToTokenFromUrl] Token symbol '${tokenSymbolParam}' not found in available tokens`,
      );
    }
  }, [tokenSymbolParam, tokens, isLoadingTokens]);

  // Function to mark that user has manually changed the token
  const markAsUserModified = () => {
    userModifiedRef.current = true;
  };

  return {
    initialToken,
    hasBeenApplied: hasAppliedRef.current,
    markAsUserModified,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Find a token by symbol (case-insensitive)
 * If multiple tokens have the same symbol on different chains, returns the first match
 *
 * @param tokens - Array of tokens to search
 * @param symbol - Token symbol to find
 * @returns Matched token or null
 */
function findTokenBySymbol(tokens: Token[], symbol: string): Token | null {
  const normalizedSymbol = symbol.trim().toLowerCase();

  if (!normalizedSymbol) {
    return null;
  }

  const match = tokens.find(
    (token) => token.symbol.toLowerCase() === normalizedSymbol,
  );

  return match ?? null;
}

export default useInitialToTokenFromUrl;
