/**
 * Frontend Token Types
 * Extended types from API for frontend usage
 */

import { SupportedToken, TokenMarketData } from '../api/types/api.types';

// ============================================================================
// Frontend Token Type
// ============================================================================

/**
 * Extended token type with additional computed/display fields for frontend
 * Each Token represents a token on a specific chain
 */
export interface Token extends SupportedToken {
  // Computed display fields
  displayName: string; // Formatted name for UI display
  logoUrl: string; // Token logo URL (CoinGecko, local, or fallback)

  // Optional metadata
  isPopular?: boolean; // Flag for popular tokens (for sorting/highlighting)

  // Chain context (required - each Token is bound to a specific chain)
  currentChainId: number; // Chain ID for this token instance
  currentChainAddress: string; // Contract address for this specific chain
  currentChainName: string; // Name of the chain (e.g., "Ethereum", "BNB Smart Chain")
}

// ============================================================================
// Swap Form Types
// ============================================================================

/**
 * Swap form state data
 */
export interface SwapFormData {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
  slippage: number; // Percentage (e.g., 0.5 for 0.5%)
}

/**
 * Swap quote/preview data
 */
export interface SwapQuote {
  inputAmount: string;
  outputAmount: string;
  rate: number; // Conversion rate
  priceImpact: number; // Percentage
  fee: string; // Fee amount
  minimumReceived: string; // Minimum output considering slippage
  estimatedGas?: string; // Gas estimate (optional)
}

/**
 * Swap execution status
 */
export type SwapStatus = 'idle' | 'loading' | 'success' | 'error';

// ============================================================================
// Token Selection Types
// ============================================================================

/**
 * Token selector dropdown state
 */
export interface TokenSelectorState {
  isOpen: boolean;
  searchQuery: string;
  selectedToken: Token | null;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Token with market data guaranteed to exist
 */
export type TokenWithMarketData = Token & {
  marketData: TokenMarketData;
};

/**
 * Token on a specific chain (now same as Token since all Tokens are chain-specific)
 * @deprecated Use Token directly - all tokens now include chain context
 */
export type TokenOnChain = Token;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if token has market data
 */
export function hasMarketData(token: Token): token is TokenWithMarketData {
  return token.marketData !== undefined;
}

/**
 * Check if token is on a specific chain
 */
export function isOnChain(token: Token, chainId: number): boolean {
  return token.chainsAvailable.some((chain) => chain.chainId === chainId);
}

/**
 * Get contract address for specific chain
 */
export function getContractAddress(
  token: Token,
  chainId: number
): string | undefined {
  const chain = token.chainsAvailable.find((c) => c.chainId === chainId);
  return chain?.contractAddress;
}

// ============================================================================
// Transformation Helpers
// ============================================================================

/**
 * Transform API token to frontend Token type(s)
 * Expands tokens that exist on multiple chains into separate Token objects
 *
 * @param apiToken - Token from API with chainsAvailable array
 * @returns Array of Token objects, one per chain
 *
 * @example
 * // Single chain token
 * transformApiToken(xautToken) // Returns [Token] with 1 entry
 *
 * @example
 * // Multi-chain token (XAUM on Ethereum + BSC)
 * transformApiToken(xaumToken) // Returns [Token, Token] with 2 entries
 */
export function transformApiToken(
  apiToken: SupportedToken
): Token[] {
  // Expand token into one entry per chain
  return apiToken.chainsAvailable.map((chain) => ({
    ...apiToken,
    displayName: formatTokenDisplayName(apiToken),
    logoUrl: apiToken.logoUri,
    currentChainId: chain.chainId,
    currentChainAddress: chain.contractAddress,
    currentChainName: chain.chainName,
  }));
}

/**
 * Format token display name
 */
function formatTokenDisplayName(token: SupportedToken): string {
  return `${token.symbol} - ${token.name}`;
}

/**
 * Get token logo URL
 * Priority: CoinGecko > Local asset > Fallback
 */
// function getTokenLogoUrl(token: SupportedToken): string {
//   // For now, return a placeholder
//   // In production, implement proper logo fetching logic
//   return `/tokens/${token.symbol.toLowerCase()}.png`;
// }

// ============================================================================
// Constants
// ============================================================================

/**
 * Popular token symbols (for prioritization)
 */
export const POPULAR_TOKENS = ['PAXG', 'XAUT', 'XAUM'];

/**
 * Default slippage percentage
 */
export const DEFAULT_SLIPPAGE = 0.5;

/**
 * Maximum slippage percentage
 */
export const MAX_SLIPPAGE = 5.0;

/**
 * Minimum slippage percentage
 */
export const MIN_SLIPPAGE = 0.1;
