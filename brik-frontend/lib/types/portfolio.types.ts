/**
 * Portfolio Type Definitions
 * Types for portfolio API responses and UI state
 */

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Individual token balance in portfolio
 */
export interface PortfolioBalance {
  /** Token symbol (e.g., "XAUT", "PAXG") */
  symbol: string;

  /** Token full name */
  name: string;

  /** Raw balance in smallest unit (wei equivalent) */
  balance: string;

  /** Human-readable decimal balance */
  balanceFormatted: string;

  /** Token decimal places (usually 18) */
  decimals: number;

  /** Chain ID where token exists (1=Ethereum, 56=BSC, etc.) */
  chainId: number;

  /** Human-readable chain name */
  chainName: string;

  /** Token contract address on that chain */
  contractAddress: string;

  /** USD value of this token balance */
  usdValue: number;

  /** Current price per token in USD */
  price: number;

  /** Image of the asset */
  image: string;
}

/**
 * Portfolio performance metrics
 */
export interface PortfolioPerformance {
  /** USD value change in last 24 hours */
  change24h: number;

  /** Percentage change in last 24 hours */
  change24hPercent: number;

  /** USD value change in last 7 days */
  change7d: number;

  /** Percentage change in last 7 days */
  change7dPercent: number;

  /** USD value change in last 30 days */
  change30d: number;

  /** Percentage change in last 30 days */
  change30dPercent: number;
}

/**
 * Complete portfolio response from API
 */
export interface PortfolioResponse {
  /** Wallet address queried */
  walletAddress: string;

  /** Total portfolio value in USD */
  totalValueUSD: number;

  /** Array of token balances */
  balances: PortfolioBalance[];

  /** Performance metrics */
  performance: PortfolioPerformance;

  /** ISO 8601 timestamp of when data was fetched */
  lastUpdated: string;
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Portfolio filter options
 */
export interface PortfolioFilters {
  /** Selected chain IDs to filter by (empty = show all) */
  selectedChains: number[];

  /** Whether to hide tokens with zero balance */
  hideZeroBalances: boolean;

  /** Search query for filtering by symbol or name */
  searchQuery: string;
}

/**
 * Portfolio sort options
 */
export type PortfolioSortBy =
  | 'value-desc'    // USD value: high to low
  | 'value-asc'     // USD value: low to high
  | 'balance-desc'  // Token balance: high to low
  | 'balance-asc'   // Token balance: low to high
  | 'name-asc'      // Alphabetical by name
  | 'name-desc';    // Reverse alphabetical

/**
 * Aggregated portfolio stats by chain
 */
export interface ChainPortfolioStats {
  /** Chain ID */
  chainId: number;

  /** Chain name */
  chainName: string;

  /** Total USD value on this chain */
  totalValueUSD: number;

  /** Number of tokens on this chain */
  tokenCount: number;

  /** Percentage of total portfolio */
  percentage: number;
}

/**
 * Portfolio export data format
 */
export interface PortfolioExportData {
  /** Token symbol */
  symbol: string;

  /** Token name */
  name: string;

  /** Chain name */
  chain: string;

  /** Token balance (formatted) */
  balance: string;

  /** Price per token (USD) */
  price: string;

  /** Total value (USD) */
  value: string;

  /** Contract address */
  contractAddress: string;
}

// ============================================================================
// Validation & Utility Types
// ============================================================================

/**
 * Wallet address validation result
 */
export interface WalletValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Portfolio error types
 */
export type PortfolioErrorType =
  | 'invalid_address'
  | 'network_error'
  | 'rate_limit'
  | 'server_error'
  | 'not_found'
  | 'unknown_error';

/**
 * Portfolio error object
 */
export interface PortfolioError {
  type: PortfolioErrorType;
  message: string;
  statusCode?: number;
}
