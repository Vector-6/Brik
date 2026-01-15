/**
 * Transactions API Endpoints
 * Functions for interacting with the /api/transactions endpoints
 */

import apiClient from '../client';
import {
  TransactionsResponse,
  AllTransactionsQueryParams,
  WalletTransactionsQueryParams,
  TransactionStatusFilter,
  isValidWalletAddress,
  validatePaginationParams,
  normalizeStatusFilter,
} from '../types/transaction.types';

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all platform transactions with optional filtering and pagination
 *
 * @param params - Query parameters for filtering transactions
 * @returns Promise resolving to transactions response
 *
 * @example
 * // Get first page of completed transactions
 * const result = await fetchAllTransactions();
 *
 * @example
 * // Get pending transactions on Ethereum
 * const result = await fetchAllTransactions({ status: 'PENDING', chain: 1 });
 *
 * @example
 * // Get page 2 with custom page size
 * const result = await fetchAllTransactions({ page: 2, limit: 50 });
 */
export async function fetchAllTransactions(
  params?: AllTransactionsQueryParams
): Promise<TransactionsResponse> {
  // Validate pagination parameters
  const validation = validatePaginationParams(params?.page, params?.limit);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Build query parameters
  const queryParams: Record<string, string | number> = {};

  if (params?.page !== undefined) {
    queryParams.page = params.page;
  }

  if (params?.limit !== undefined) {
    queryParams.limit = params.limit;
  }

  if (params?.chain !== undefined) {
    queryParams.chain = params.chain;
  }

  if (params?.token) {
    queryParams.token = params.token;
  }

  if (params?.status) {
    queryParams.status = normalizeStatusFilter(params.status);
  }

  if (params?.next) {
    queryParams.next = params.next;
  }

  if (params?.previous) {
    queryParams.previous = params.previous;
  }

  // Make API request
  const response = await apiClient.get<TransactionsResponse>('/transactions', {
    params: queryParams,
  });

  return response.data;
}

/**
 * Fetch transaction history for a specific wallet address
 *
 * @param walletAddress - Ethereum wallet address (0x...)
 * @param params - Query parameters for filtering
 * @returns Promise resolving to transactions response
 *
 * @throws Error if wallet address is invalid
 *
 * @example
 * // Get all completed transactions for a wallet
 * const result = await fetchWalletTransactions('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
 *
 * @example
 * // Get pending transactions with pagination
 * const result = await fetchWalletTransactions(
 *   '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
 *   { status: 'PENDING', page: 1, limit: 10 }
 * );
 */
export async function fetchWalletTransactions(
  walletAddress: string,
  params?: WalletTransactionsQueryParams
): Promise<TransactionsResponse> {
  // Validate wallet address
  if (!isValidWalletAddress(walletAddress)) {
    throw new Error('Invalid wallet address format');
  }

  // Validate pagination parameters
  const validation = validatePaginationParams(params?.page, params?.limit);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Build query parameters
  const queryParams: Record<string, string | number> = {};

  if (params?.page !== undefined) {
    queryParams.page = params.page;
  }

  if (params?.limit !== undefined) {
    queryParams.limit = params.limit;
  }

  if (params?.status) {
    queryParams.status = normalizeStatusFilter(params.status);
  }

  if (params?.next) {
    queryParams.next = params.next;
  }

  if (params?.previous) {
    queryParams.previous = params.previous;
  }

  // Make API request
  const response = await apiClient.get<TransactionsResponse>(
    `/transactions/${walletAddress}`,
    {
      params: queryParams,
    }
  );

  return response.data;
}

/**
 * Fetch transactions with unified interface
 * Automatically chooses between wallet-specific or platform-wide based on address
 *
 * @param options - Fetch options
 * @returns Promise resolving to transactions response
 *
 * @example
 * // Fetch wallet-specific transactions
 * const result = await fetchTransactions({
 *   walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
 *   status: 'DONE',
 *   page: 1,
 *   limit: 20
 * });
 *
 * @example
 * // Fetch platform-wide transactions
 * const result = await fetchTransactions({
 *   chain: 1,
 *   token: 'PAXG',
 *   status: 'ALL'
 * });
 *
 * @example
 * // Fetch next page using cursor
 * const result = await fetchTransactions({
 *   next: 'eyJsaW1pdCI6NSwib2Zmc2V0Ijo1fQ=='
 * });
 */
export async function fetchTransactions(
  options: {
    walletAddress?: string;
    page?: number;
    limit?: number;
    status?: string;
    chain?: number;
    token?: string;
    next?: string;
    previous?: string;
  } = {}
): Promise<TransactionsResponse> {
  const { walletAddress, page, limit, status, chain, token, next, previous } = options;

  // If wallet address provided, fetch wallet-specific transactions
  if (walletAddress && isValidWalletAddress(walletAddress)) {
    return fetchWalletTransactions(walletAddress, {
      page,
      limit,
      status: status as TransactionStatusFilter | undefined,
      next,
      previous,
    });
  }

  // Otherwise, fetch platform-wide transactions
  return fetchAllTransactions({
    page,
    limit,
    status: status as TransactionStatusFilter | undefined,
    chain,
    token,
    next,
    previous,
  });
}

/**
 * Fetch recent completed transactions (convenience function)
 *
 * @param walletAddress - Optional wallet address for user-specific transactions
 * @param limit - Number of transactions to fetch (default: 20)
 * @returns Promise resolving to transactions response
 *
 * @example
 * // Get 10 most recent completed transactions
 * const result = await fetchRecentTransactions(undefined, 10);
 */
export async function fetchRecentTransactions(
  walletAddress?: string,
  limit: number = 20
): Promise<TransactionsResponse> {
  return fetchTransactions({
    walletAddress,
    page: 1,
    limit,
    status: 'DONE',
  });
}

/**
 * Fetch pending transactions (for auto-refresh scenarios)
 *
 * @param walletAddress - Optional wallet address for user-specific transactions
 * @returns Promise resolving to transactions response
 *
 * @example
 * // Get all pending transactions for a wallet
 * const result = await fetchPendingTransactions('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
 */
export async function fetchPendingTransactions(
  walletAddress?: string
): Promise<TransactionsResponse> {
  return fetchTransactions({
    walletAddress,
    page: 1,
    limit: 100, // Get all pending (typically won't be many)
    status: 'PENDING',
  });
}

// ============================================================================
// Export all functions
// ============================================================================

const transactionsApi = {
  fetchAllTransactions,
  fetchWalletTransactions,
  fetchTransactions,
  fetchRecentTransactions,
  fetchPendingTransactions,
};

export default transactionsApi;
