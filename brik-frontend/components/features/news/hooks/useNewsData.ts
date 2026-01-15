/**
 * useNewsData Hook
 * Fetches and manages RWA news data from the news API
 */

'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchNewsData } from '@/lib/api/endpoints/news';
import { NewsQueryParams, NewsResponseWithCache } from '@/lib/types/news.types';

// ============================================================================
// Types
// ============================================================================

interface UseNewsDataOptions {
  /** Initial page size (default: 20) */
  pageSize?: number;
  /** Sort option (default: 'relevance') */
  sort?: 'relevance' | 'date';
  /** Enable automatic refetching */
  enabled?: boolean;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Fetch news data with infinite pagination and caching
 *
 * @param options - Configuration options for the hook
 * @returns Infinite query result with news data, loading states, and pagination functions
 *
 * @example
 * const {
 *   data,
 *   isLoading,
 *   error,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage
 * } = useNewsData({ pageSize: 20 });
 */
export function useNewsData(options: UseNewsDataOptions = {}) {
  const { pageSize = 20, sort = 'relevance', enabled = true } = options;

  return useInfiniteQuery<NewsResponseWithCache, Error>({
    queryKey: ['news', { pageSize, sort }],
    queryFn: ({ pageParam = { page: 1, limit: pageSize } }) =>
      fetchNewsData(pageParam as NewsQueryParams),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return {
        page: lastPage.page + 1,
        limit: pageSize,
      };
    },
    initialPageParam: { page: 1, limit: pageSize },
    staleTime: 2 * 60 * 60 * 1000, // 2 hours (matches API cache)
    gcTime: 4 * 60 * 60 * 1000, // 4 hours (formerly cacheTime)
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on rate limits or validation errors
      const errorResponse = error as { response?: { status?: number } };
      if (errorResponse?.response?.status === 429 || errorResponse?.response?.status === 400) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    enabled,
  });
}

/**
 * Simple news data hook for single page fetching
 *
 * @param page - Page number to fetch
 * @param limit - Number of articles per page
 * @returns Query result with single page of news data
 *
 * @example
 * const { data, isLoading, error } = useNewsPage(1, 20);
 */
export function useNewsPage(page: number = 1, limit: number = 20) {
  return useQuery<NewsResponseWithCache, Error>({
    queryKey: ['news-page', page, limit],
    queryFn: () => fetchNewsData({ page, limit }),
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
    gcTime: 4 * 60 * 60 * 1000, // 4 hours
    retry: (failureCount: number, error: unknown) => {
      const errorResponse = error as { response?: { status?: number } };
      if (errorResponse?.response?.status === 429 || errorResponse?.response?.status === 400) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}
