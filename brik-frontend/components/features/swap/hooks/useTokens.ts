'use client';

/**
 * useTokens Hook
 * React Query hook for fetching tokens from the API
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchTokens } from '@/lib/api/endpoints/tokens';
import { TokensQueryParams, ApiErrorResponse } from '@/lib/api/types/api.types';
import { Token, transformApiToken } from '@/lib/types/token.types';

// ============================================================================
// Hook Options
// ============================================================================

interface UseTokensOptions {
  chainId?: number;
  includeMarketData?: boolean;
  symbol?: string;
  enabled?: boolean; // Allow disabling the query
}

// ============================================================================
// Hook Return Type
// ============================================================================

interface UseTokensReturn {
  tokens: Token[];
  isLoading: boolean;
  isError: boolean;
  error: ApiErrorResponse | null;
  refetch: () => void;
  isRefetching: boolean;
  isFetching: boolean;
}

// ============================================================================
// Query Key Factory
// ============================================================================

/**
 * Generate query key for React Query caching
 * Ensures proper cache separation based on parameters
 */
function getTokensQueryKey(options: UseTokensOptions = {}): string[] {
  return [
    'tokens',
    options.chainId?.toString() || 'all',
    options.includeMarketData ? 'with-market-data' : 'no-market-data',
    options.symbol || 'all',
  ];
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Fetch and cache tokens with React Query
 *
 * @param options - Query options
 * @returns Token data and query state
 *
 * @example
 * // Get all tokens with market data
 * const { tokens, isLoading } = useTokens({ includeMarketData: true });
 *
 * @example
 * // Get tokens for specific chain
 * const { tokens } = useTokens({ chainId: 1 });
 *
 * @example
 * // Get specific token
 * const { tokens } = useTokens({ symbol: 'PAXG', includeMarketData: true });
 */
export function useTokens(options: UseTokensOptions = {}): UseTokensReturn {
  const { chainId, includeMarketData = false, symbol, enabled = true } = options;

  // Build query parameters
  const queryParams: TokensQueryParams = {
    includeMarketData,
  };

  if (chainId) {
    queryParams.chainId = chainId.toString();
  }

  if (symbol) {
    queryParams.symbol = symbol;
  }

  // React Query
  const query: UseQueryResult<Token[], ApiErrorResponse> = useQuery({
    queryKey: getTokensQueryKey(options),
    queryFn: async () => {
      const response = await fetchTokens(queryParams);

      // Transform API tokens to frontend Token type
      // flatMap is used because transformApiToken now returns Token[] (one per chain)
      // This expands multi-chain tokens into separate entries
      return response.tokens.flatMap((apiToken) =>
        transformApiToken(apiToken)
      );
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes (matches backend cache)
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    tokens: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error || null,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    isFetching: query.isFetching,
  };
}

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Fetch tokens with market data
 * Convenience hook for common use case
 */
export function useTokensWithMarketData(options: Omit<UseTokensOptions, 'includeMarketData'> = {}) {
  return useTokens({ ...options, includeMarketData: true });
}

/**
 * Fetch tokens for a specific chain
 * Convenience hook for chain-specific tokens
 */
export function useTokensByChain(chainId: number, includeMarketData = false) {
  return useTokens({ chainId, includeMarketData });
}

/**
 * Fetch a specific token by symbol
 * Convenience hook for single token lookup
 */
export function useTokenBySymbol(symbol: string, includeMarketData = false) {
  const result = useTokens({ symbol, includeMarketData });

  return {
    ...result,
    token: result.tokens[0] || null,
  };
}
