/**
 * Portfolio API Endpoints
 * Functions for interacting with the /api/portfolio endpoint
 */

import apiClient from '../client';
import {
  PortfolioResponse,
  PortfolioError,
  WalletValidation,
} from '@/lib/types/portfolio.types';

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate Ethereum wallet address format
 *
 * @param address - Wallet address to validate
 * @returns Validation result
 */
export function validateWalletAddress(address: string): WalletValidation {
  // Check if address exists
  if (!address || address.trim() === '') {
    return {
      isValid: false,
      error: 'Wallet address is required',
    };
  }

  // Check format: must start with 0x and be exactly 42 characters
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;

  if (!ethereumAddressRegex.test(address)) {
    return {
      isValid: false,
      error: 'Invalid wallet address format. Must be a valid Ethereum address (0x...)',
    };
  }

  return { isValid: true };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch portfolio data for a wallet address
 *
 * @param walletAddress - Ethereum wallet address (0x...)
 * @param includePerformance - Whether to include historical performance metrics (default: true)
 * @returns Promise resolving to portfolio data
 *
 * @throws PortfolioError if request fails or address is invalid
 *
 * @example
 * // Fetch portfolio with performance metrics
 * const portfolio = await fetchPortfolio('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
 *
 * @example
 * // Fetch portfolio without performance (faster)
 * const portfolio = await fetchPortfolio('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', false);
 */
export async function fetchPortfolio(
  walletAddress: string,
  includePerformance: boolean = true
): Promise<PortfolioResponse> {
  // Validate wallet address
  const validation = validateWalletAddress(walletAddress);
  if (!validation.isValid) {
    const error: PortfolioError = {
      type: 'invalid_address',
      message: validation.error || 'Invalid wallet address',
    };
    throw error;
  }

  try {
    // Make API request
    const response = await apiClient.get<PortfolioResponse>(
      `/portfolio/${walletAddress}`,
      {
        params: {
          includePerformance: includePerformance.toString(),
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    // Handle different error types
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; data?: { message?: string; error?: string } } };
      const statusCode = axiosError.response.status;
      const portfolioError: PortfolioError = {
        type: 'unknown_error',
        message: 'An error occurred while fetching portfolio data',
        statusCode,
      };

      // Map status codes to error types
      switch (statusCode) {
        case 400:
          portfolioError.type = 'invalid_address';
          portfolioError.message = 'Invalid wallet address format';
          break;

        case 404:
          portfolioError.type = 'not_found';
          portfolioError.message = 'Portfolio not found for this wallet address';
          break;

        case 429:
          portfolioError.type = 'rate_limit';
          portfolioError.message = 'Too many requests. Please try again later.';
          break;

        case 500:
        case 502:
        case 503:
          portfolioError.type = 'server_error';
          portfolioError.message = 'Server error. Please try again later.';
          break;

        default:
          portfolioError.message =
            axiosError.response.data?.message ||
            axiosError.response.data?.error ||
            'Failed to fetch portfolio data';
      }

      throw portfolioError;
    }

    // Network error
    const networkError: PortfolioError = {
      type: 'network_error',
      message: 'Network error. Please check your connection and try again.',
    };
    throw networkError;
  }
}

/**
 * Check if portfolio has any RWA token holdings
 *
 * @param portfolio - Portfolio response
 * @returns True if portfolio has non-zero balances
 */
export function hasPortfolioHoldings(portfolio: PortfolioResponse): boolean {
  return portfolio.balances.length > 0;
}

/**
 * Get unique chain IDs from portfolio balances
 *
 * @param portfolio - Portfolio response
 * @returns Array of unique chain IDs
 */
export function getPortfolioChainIds(portfolio: PortfolioResponse): number[] {
  const chainIds = new Set<number>();
  portfolio.balances.forEach((balance) => chainIds.add(balance.chainId));
  return Array.from(chainIds).sort((a, b) => a - b);
}

// ============================================================================
// Export
// ============================================================================

const portfolioApi = {
  fetchPortfolio,
  validateWalletAddress,
  hasPortfolioHoldings,
  getPortfolioChainIds,
};

export default portfolioApi;
