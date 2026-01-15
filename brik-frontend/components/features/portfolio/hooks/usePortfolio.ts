/**
 * Portfolio Data Hook
 * Custom hook for fetching and managing portfolio data
 */

'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchPortfolio } from '@/lib/api/endpoints/portfolio';
import { PortfolioResponse, PortfolioError } from '@/lib/types/portfolio.types';

// ============================================================================
// Hook Options
// ============================================================================

interface UsePortfolioOptions {
  /** Whether to include performance metrics (default: true) */
  includePerformance?: boolean;

  /** Whether to enable the query (default: auto-enable when wallet connected) */
  enabled?: boolean;

  /** Custom wallet address (overrides connected wallet) */
  walletAddress?: string;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Fetch and manage portfolio data for connected wallet
 *
 * @param options - Hook configuration options
 * @returns Query result with portfolio data
 *
 * @example
 * // Basic usage (fetches for connected wallet)
 * const { data, isLoading, error } = usePortfolio();
 *
 * @example
 * // Without performance metrics (faster)
 * const { data } = usePortfolio({ includePerformance: false });
 *
 * @example
 * // Disabled until some condition
 * const { data } = usePortfolio({ enabled: someCondition });
 */
export function usePortfolio(
  options: UsePortfolioOptions = {}
): UseQueryResult<PortfolioResponse, PortfolioError> {
  const { includePerformance = true, enabled: customEnabled, walletAddress: customAddress } = options;

  // Get connected wallet address
  const { address: connectedAddress, isConnected } = useAccount();

  // Determine which address to use
  const walletAddress = customAddress || connectedAddress;

  // Auto-enable query if wallet is connected (unless explicitly disabled)
  const isEnabled = customEnabled !== undefined
    ? customEnabled
    : Boolean(walletAddress && isConnected);

  return useQuery<PortfolioResponse, PortfolioError>({
    queryKey: ['portfolio', walletAddress, includePerformance],
    queryFn: async () => {
      if (!walletAddress) {
        throw {
          type: 'invalid_address',
          message: 'No wallet address provided',
        } as PortfolioError;
      }

      return fetchPortfolio(walletAddress, includePerformance);
    },
    enabled: isEnabled,
    staleTime: 60 * 1000, // 60 seconds (matches API cache TTL)
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on client errors (400, 404)
      if (error.type === 'invalid_address' || error.type === 'not_found') {
        return false;
      }

      // Retry server errors up to 2 times
      if (error.type === 'server_error' || error.type === 'network_error') {
        return failureCount < 2;
      }

      // Don't retry rate limits
      if (error.type === 'rate_limit') {
        return false;
      }

      return false;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * 2 ** attemptIndex, 4000);
    },
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Get total portfolio value (convenience hook)
 *
 * @returns Total USD value or 0 if not loaded
 */
export function usePortfolioValue(): number {
  const { data } = usePortfolio();
  return data?.totalValueUSD || 0;
}

/**
 * Get portfolio holdings count
 *
 * @returns Number of unique tokens in portfolio
 */
export function usePortfolioHoldingsCount(): number {
  const { data } = usePortfolio();
  return data?.balances.length || 0;
}

/**
 * Check if portfolio is empty
 *
 * @returns True if portfolio has no holdings
 */
export function useIsPortfolioEmpty(): boolean {
  const { data, isLoading } = usePortfolio();
  return !isLoading && data ? data.balances.length === 0 : false;
}
