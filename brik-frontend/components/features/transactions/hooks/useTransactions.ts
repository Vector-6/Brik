'use client';

/**
 * useTransactions Hook
 * Manages transaction fetching, state, and auto-refresh
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ParsedTransaction,
  TransactionStatusFilter,
  TransactionErrorResponse,
  getTransactionErrorMessage,
} from '@/lib/api/types/transaction.types';
import { fetchTransactions } from '@/lib/api/endpoints/transactions';
import { parseTransactions, hasPendingTransactions } from '@/lib/utils/transaction';

// ============================================================================
// Types
// ============================================================================

export interface UseTransactionsOptions {
  /** Wallet address for user-specific transactions (optional) */
  walletAddress?: string;
  /** Initial page number (default: 1) */
  initialPage?: number;
  /** Items per page (default: 20) */
  limit?: number;
  /** Transaction status filter (default: 'DONE') */
  status?: TransactionStatusFilter;
  /** Auto-refresh interval in ms for pending transactions (default: 30000) */
  refreshInterval?: number;
  /** Whether to auto-fetch on mount (default: true) */
  autoFetch?: boolean;
}

export interface UseTransactionsReturn {
  /** Parsed transactions with display properties */
  transactions: ParsedTransaction[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  isError: boolean;
  /** Error object */
  error: TransactionErrorResponse | null;
  /** Whether more pages are available */
  hasMore: boolean;
  /** Current page number */
  page: number;
  /** Total transactions in current response */
  total: number;
  /** Whether currently refreshing */
  isRefreshing: boolean;
  /** Load next page */
  loadMore: () => Promise<void>;
  /** Refresh current data */
  refresh: () => Promise<void>;
  /** Reset to first page */
  reset: () => void;
  /** Manually refetch data */
  refetch: () => Promise<void>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing transaction data fetching and state
 *
 * @param options - Configuration options
 * @returns Transaction state and control methods
 *
 * @example
 * // Fetch user-specific transactions
 * const { transactions, isLoading, loadMore } = useTransactions({
 *   walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
 *   status: 'DONE'
 * });
 *
 * @example
 * // Fetch platform-wide transactions
 * const { transactions, isLoading } = useTransactions({
 *   status: 'ALL',
 *   limit: 50
 * });
 */
export function useTransactions(
  options: UseTransactionsOptions = {}
): UseTransactionsReturn {
  const {
    walletAddress,
    initialPage = 1,
    limit = 20,
    status = 'DONE',
    refreshInterval = 30000, // 30 seconds
    autoFetch = true,
  } = options;

  // ============================================================================
  // State
  // ============================================================================

  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<TransactionErrorResponse | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);

  // Ref to track if component is mounted
  const isMountedRef = useRef<boolean>(true);
  // Ref for refresh interval
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // Fetch Transactions
  // ============================================================================

  /**
   * Fetch transactions from API
   */
  const fetchData = useCallback(
    async (pageToFetch: number, isRefresh: boolean = false) => {
      try {
        // Set loading state
        if (isRefresh) {
          setIsRefreshing(true);
        } else if (pageToFetch === 1) {
          setIsLoading(true);
        }

        setIsError(false);
        setError(null);

        // Fetch transactions
        const response = await fetchTransactions({
          walletAddress,
          page: pageToFetch,
          limit,
          status,
        });

        // Only update state if component is still mounted
        if (!isMountedRef.current) return;

        // Parse transactions
        const parsed = parseTransactions(response.transactions);

        // Update state
        if (pageToFetch === 1) {
          // First page - replace all transactions
          setTransactions(parsed);
        } else {
          // Subsequent pages - append transactions
          setTransactions((prev) => [...prev, ...parsed]);
        }

        setHasMore(response.hasMore);
        setTotal(response.total);
        setPage(pageToFetch);
      } catch (err) {
        console.error('Error fetching transactions:', err);

        if (!isMountedRef.current) return;

        setIsError(true);
        setError({
          error: 'Fetch Error',
          message: getTransactionErrorMessage(err),
        });
      } finally {
        if (!isMountedRef.current) return;

        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [walletAddress, limit, status]
  );

  // ============================================================================
  // Control Methods
  // ============================================================================

  /**
   * Load next page of transactions
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchData(page + 1);
  }, [hasMore, isLoading, page, fetchData]);

  /**
   * Refresh current transactions (refetch from page 1)
   */
  const refresh = useCallback(async () => {
    await fetchData(1, true);
  }, [fetchData]);

  /**
   * Reset to first page
   */
  const reset = useCallback(() => {
    setPage(initialPage);
    setTransactions([]);
    setHasMore(false);
    setTotal(0);
    setIsError(false);
    setError(null);
  }, [initialPage]);

  /**
   * Manually refetch current data
   */
  const refetch = useCallback(async () => {
    await fetchData(page);
  }, [page, fetchData]);

  // ============================================================================
  // Auto-refresh for Pending Transactions
  // ============================================================================

  /**
   * Check for pending transactions and refresh if any exist
   */
  const checkAndRefreshPending = useCallback(async () => {
    // Only check if we have transactions and status includes pending
    if (transactions.length === 0 || (status !== 'ALL' && status !== 'PENDING')) {
      return;
    }

    // Check if any transactions are pending
    if (hasPendingTransactions(transactions)) {
      console.log('[useTransactions] Auto-refreshing due to pending transactions');
      await refresh();
    }
  }, [transactions, status, refresh]);

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Initial fetch on mount or when dependencies change
   */
  useEffect(() => {
    if (autoFetch) {
      fetchData(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, status, limit, autoFetch]); // Intentionally omit fetchData to prevent infinite loops

  /**
   * Setup auto-refresh interval for pending transactions
   */
  useEffect(() => {
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    // Only setup interval if we should check for pending transactions
    if (transactions.length > 0 && hasPendingTransactions(transactions)) {
      console.log('[useTransactions] Setting up auto-refresh interval');
      refreshIntervalRef.current = setInterval(
        checkAndRefreshPending,
        refreshInterval
      );
    }

    // Cleanup interval on unmount or when dependencies change
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [transactions, refreshInterval, checkAndRefreshPending]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    transactions,
    isLoading,
    isError,
    error,
    hasMore,
    page,
    total,
    isRefreshing,
    loadMore,
    refresh,
    reset,
    refetch,
  };
}
