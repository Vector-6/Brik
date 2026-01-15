/**
 * Token API Endpoints
 * Functions for interacting with the /api/tokens endpoint
 */

import apiClient from '../client';
import { TokensQueryParams, TokensResponse } from '../types/api.types';

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all tokens with optional filtering and market data
 *
 * @param params - Query parameters for filtering tokens
 * @returns Promise resolving to tokens response
 *
 * @example
 * // Get all tokens without market data
 * const tokens = await fetchTokens();
 *
 * @example
 * // Get tokens with market data
 * const tokens = await fetchTokens({ includeMarketData: true });
 *
 * @example
 * // Get tokens for specific chain
 * const tokens = await fetchTokens({ chainId: '1' });
 *
 * @example
 * // Get specific token with market data
 * const token = await fetchTokens({ symbol: 'PAXG', includeMarketData: true });
 */
export async function fetchTokens(
  params?: TokensQueryParams
): Promise<TokensResponse> {
  // Build query parameters
  const queryParams: Record<string, string> = {};

  if (params?.chainId) {
    queryParams.chainId = params.chainId;
  }

  if (params?.includeMarketData !== undefined) {
    // Convert boolean to string "true" or "false" as API expects
    queryParams.includeMarketData = params.includeMarketData ? 'true' : 'false';
  }

  if (params?.symbol) {
    queryParams.symbol = params.symbol;
  }

  // Make API request
  const response = await apiClient.get<TokensResponse>('/tokens', {
    params: queryParams,
  });

  return response.data;
}

/**
 * Fetch a specific token by symbol
 *
 * @param symbol - Token symbol (e.g., 'PAXG', 'XAUT')
 * @param includeMarketData - Whether to include real-time market data
 * @returns Promise resolving to tokens response (will contain single token if found)
 *
 * @example
 * const response = await fetchTokenBySymbol('PAXG', true);
 * const token = response.tokens[0];
 */
export async function fetchTokenBySymbol(
  symbol: string,
  includeMarketData = false
): Promise<TokensResponse> {
  return fetchTokens({
    symbol,
    includeMarketData,
  });
}

/**
 * Fetch tokens available on a specific blockchain
 *
 * @param chainId - Blockchain chain ID (1, 56, 137, 42161, 10, 43114)
 * @param includeMarketData - Whether to include real-time market data
 * @returns Promise resolving to tokens response
 *
 * @example
 * // Get all Ethereum tokens with market data
 * const ethTokens = await fetchTokensByChain(1, true);
 */
export async function fetchTokensByChain(
  chainId: number,
  includeMarketData = false
): Promise<TokensResponse> {
  return fetchTokens({
    chainId: chainId.toString(),
    includeMarketData,
  });
}

// ============================================================================
// Export all functions
// ============================================================================

const tokensApi = {
  fetchTokens,
  fetchTokenBySymbol,
  fetchTokensByChain,
};

export default tokensApi;
