/**
 * Transaction API Type Definitions
 * Matches the /api/transactions endpoint response structure
 */

// ============================================================================
// Transaction Status Types
// ============================================================================

/**
 * Transaction status as returned by the API
 */
export type TransactionStatus = 'pending' | 'completed' | 'failed';

/**
 * Transaction status filter options
 */
export type TransactionStatusFilter = 'ALL' | 'DONE' | 'PENDING' | 'FAILED';

// ============================================================================
// Core Transaction Types
// ============================================================================

/**
 * Individual transaction object
 */
export interface Transaction {
  id: string;
  walletAddress: string;
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  txHash: string;
  status: TransactionStatus;
  timestamp: string; // ISO 8601 format
  usdValue: number;
}

/**
 * Transactions API response
 */
export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  next: string | null; // Cursor token for next page
  previous: string | null; // Cursor token for previous page
}

// ============================================================================
// Query Parameter Types
// ============================================================================

/**
 * Query parameters for GET /api/transactions
 */
export interface AllTransactionsQueryParams {
  page?: number;
  limit?: number;
  chain?: number;
  token?: string;
  status?: TransactionStatusFilter;
  next?: string; // Cursor for next page
  previous?: string; // Cursor for previous page
}

/**
 * Query parameters for GET /api/transactions/:walletAddress
 */
export interface WalletTransactionsQueryParams {
  page?: number;
  limit?: number;
  status?: TransactionStatusFilter;
  next?: string; // Cursor for next page
  previous?: string; // Cursor for previous page
}

// ============================================================================
// Error Response Types
// ============================================================================

/**
 * Transaction API error response
 */
export interface TransactionErrorResponse {
  error: string;
  message: string;
}

/**
 * Specific error types
 */
export interface TransactionValidationError extends TransactionErrorResponse {
  error: 'Invalid wallet address format' | 'Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 100.';
}

export interface TransactionRateLimitError extends TransactionErrorResponse {
  error: 'Too many requests';
}

export interface TransactionExternalServiceError extends TransactionErrorResponse {
  error: 'External service error';
}

export interface TransactionInternalServerError extends TransactionErrorResponse {
  error: 'Internal server error';
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if error is a transaction error response
 */
export function isTransactionErrorResponse(
  error: unknown
): error is TransactionErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    'message' in error
  );
}

/**
 * Check if error is a validation error (400)
 */
export function isTransactionValidationError(
  error: unknown
): error is TransactionValidationError {
  return (
    isTransactionErrorResponse(error) &&
    (error.error === 'Invalid wallet address format' ||
      error.error.includes('Invalid pagination parameters'))
  );
}

/**
 * Check if error is a rate limit error (429)
 */
export function isTransactionRateLimitError(
  error: unknown
): error is TransactionRateLimitError {
  return isTransactionErrorResponse(error) && error.error === 'Too many requests';
}

/**
 * Check if error is an external service error (502)
 */
export function isTransactionExternalServiceError(
  error: unknown
): error is TransactionExternalServiceError {
  return (
    isTransactionErrorResponse(error) && error.error === 'External service error'
  );
}

/**
 * Check if error is an internal server error (500)
 */
export function isTransactionInternalServerError(
  error: unknown
): error is TransactionInternalServerError {
  return (
    isTransactionErrorResponse(error) && error.error === 'Internal server error'
  );
}

// ============================================================================
// Utility Types for Frontend
// ============================================================================

/**
 * Parsed transaction for frontend consumption with computed properties
 */
export interface ParsedTransaction extends Transaction {
  // Computed display properties
  relativeTime: string; // e.g., "2 min ago"
  explorerUrl: string | null; // Block explorer link
  statusColor: string; // Tailwind color class
  formattedUsdValue: string; // e.g., "$1,234.56"
  fromChainName: string; // e.g., "Ethereum"
  toChainName: string; // e.g., "Polygon"
}

/**
 * Transaction list state for UI components
 */
export interface TransactionListState {
  transactions: ParsedTransaction[];
  isLoading: boolean;
  isError: boolean;
  error: TransactionErrorResponse | null;
  hasMore: boolean;
  page: number;
  total: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get user-friendly error message from transaction error
 */
export function getTransactionErrorMessage(error: unknown): string {
  if (isTransactionValidationError(error)) {
    return error.message;
  }

  if (isTransactionRateLimitError(error)) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  if (isTransactionExternalServiceError(error)) {
    return 'Failed to fetch transactions. Please try again later.';
  }

  if (isTransactionInternalServerError(error)) {
    return 'Something went wrong. Please try again later.';
  }

  if (isTransactionErrorResponse(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred while fetching transactions.';
}

/**
 * Validate wallet address format
 */
export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Normalize status filter to API format
 */
export function normalizeStatusFilter(
  status?: string
): TransactionStatusFilter {
  if (!status) return 'DONE';

  const upperStatus = status.toUpperCase();
  if (
    upperStatus === 'ALL' ||
    upperStatus === 'DONE' ||
    upperStatus === 'PENDING' ||
    upperStatus === 'FAILED'
  ) {
    return upperStatus as TransactionStatusFilter;
  }

  return 'DONE';
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(
  page?: number,
  limit?: number
): { isValid: boolean; error?: string } {
  if (page !== undefined && page < 1) {
    return { isValid: false, error: 'Page must be >= 1' };
  }

  if (limit !== undefined && (limit < 1 || limit > 100)) {
    return { isValid: false, error: 'Limit must be between 1 and 100' };
  }

  return { isValid: true };
}
