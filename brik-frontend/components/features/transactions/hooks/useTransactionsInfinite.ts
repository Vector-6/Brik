'use client';

/**
 * useTransactionsInfinite Hook
 * React Query powered infinite scroll hook for transactions
 */

import { useInfiniteQuery, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import {
  ParsedTransaction,
  TransactionStatusFilter,
  TransactionsResponse,
} from '@/lib/api/types/transaction.types';
import { fetchTransactions } from '@/lib/api/endpoints/transactions';
import { parseTransactions, hasPendingTransactions } from '@/lib/utils/transaction';
import { TransactionFilters } from '../types/filter.types';

// ============================================================================
// Types
// ============================================================================

export interface UseTransactionsInfiniteOptions {
  /** Wallet address for user-specific transactions */
  walletAddress?: string;
  /** Transaction filters */
  filters?: TransactionFilters;
  /** Items per page */
  limit?: number;
  /** Auto-refresh interval for pending transactions (ms) */
  refreshInterval?: number;
  /** Enable infinite query */
  enabled?: boolean;
}

// ============================================================================
// Query Keys
// ============================================================================

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: {
    walletAddress?: string;
    status?: TransactionStatusFilter;
    chainId?: number;
    token?: string;
    search?: string;
  }) => [...transactionKeys.lists(), filters] as const,
};

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Infinite scroll hook for transactions with React Query
 * Uses cursor-based pagination for efficient data fetching
 *
 * @param options - Configuration options
 * @returns Infinite query result with parsed transactions
 *
 * @example
 * const {
 *   transactions,
 *   isLoading,
 *   fetchNextPage,
 *   hasNextPage,
 * } = useTransactionsInfinite({
 *   walletAddress: '0x...',
 *   filters: { status: 'DONE' }
 * });
 */
export function useTransactionsInfinite(options: UseTransactionsInfiniteOptions = {}) {
  const {
    walletAddress,
    filters = { status: 'DONE' },
    limit = 5, // Show only 5 by default
    refreshInterval = 30000,
    enabled = true,
  } = options;

  const queryClient = useQueryClient();

  // Build query key
  const queryKey = transactionKeys.list({
    walletAddress,
    status: filters.status,
    chainId: filters.chainId,
    token: filters.token,
    search: filters.search,
  });

  // Infinite query
  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const response = await fetchTransactions({
        walletAddress,
        limit,
        status: filters.status,
        chain: filters.chainId,
        token: filters.token,
        next: pageParam || undefined, // Use cursor instead of page number
      });

      return response;
    },
    getNextPageParam: (lastPage) => {
      // Return the next cursor token, or undefined if no more pages
      return lastPage.hasMore ? lastPage.next : undefined;
    },
    initialPageParam: null as string | null, // Start with no cursor (first page)
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  });

  // Flatten and parse transactions
  const transactions: ParsedTransaction[] = useMemo(
    () => query.data?.pages.flatMap((page: TransactionsResponse) => parseTransactions(page.transactions)) ?? [],
    [query.data]
  );

  // Auto-refresh for pending transactions
  useEffect(() => {
    if (!enabled || !hasPendingTransactions(transactions.map((t) => ({
      ...t,
      status: t.status,
      timestamp: t.timestamp,
      id: t.id,
      walletAddress: t.walletAddress,
      fromChain: t.fromChain,
      toChain: t.toChain,
      fromToken: t.fromToken,
      toToken: t.toToken,
      fromAmount: t.fromAmount,
      toAmount: t.toAmount,
      txHash: t.txHash,
      usdValue: t.usdValue,
    })))) {
      return;
    }

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [transactions, enabled, refreshInterval, queryClient, queryKey]);

  return {
    transactions,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    resetToFirstPage: () => {
      // Reset the infinite query to only the first page
      queryClient.setQueryData<InfiniteData<TransactionsResponse>>(queryKey, (data) => {
        if (!data) return data;
        return {
          pages: data.pages.slice(0, 1), // Keep only first page
          pageParams: data.pageParams.slice(0, 1), // Keep only first page param
        };
      });
    },
  };
}
