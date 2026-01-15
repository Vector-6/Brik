/**
 * useNewsPagination Hook
 * Manages pagination state and load more functionality for news articles
 */

'use client';

import { useMemo } from 'react';
import { useNewsData } from './useNewsData';
import { NewsArticle } from '@/lib/types/news.types';

// ============================================================================
// Types
// ============================================================================

interface UseNewsPaginationOptions {
  /** Page size for pagination */
  pageSize?: number;
  /** Sort option */
  sort?: 'relevance' | 'date';
}

interface UseNewsPaginationReturn {
  /** All articles across all pages */
  articles: NewsArticle[];
  /** Whether initial data is loading */
  isLoading: boolean;
  /** Whether next page is being fetched */
  isLoadingMore: boolean;
  /** Error state */
  error: Error | null;
  /** Whether more pages are available */
  hasNextPage: boolean;
  /** Function to load next page */
  loadMore: () => void;
  /** Total number of articles loaded */
  totalArticles: number;
  /** Current page number */
  currentPage: number;
  /** Whether data is stale and refreshing */
  isRefreshing: boolean;
  /** Refetch function */
  refetch: () => void;
  /** Cache status from last response */
  cacheStatus?: {
    isHit: boolean;
    isStale: boolean;
    cacheKey?: string;
  };
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Manage pagination state for news articles with infinite loading
 *
 * @param options - Configuration options
 * @returns Pagination state and functions
 *
 * @example
 * const {
 *   articles,
 *   isLoading,
 *   hasNextPage,
 *   loadMore,
 *   isLoadingMore
 * } = useNewsPagination({ pageSize: 20 });
 */
export function useNewsPagination(
  options: UseNewsPaginationOptions = {}
): UseNewsPaginationReturn {
  const { pageSize = 20, sort = 'relevance' } = options;

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useNewsData({ pageSize, sort });

  // Flatten all articles from all pages
  const articles = useMemo(() => {
    return data?.pages?.flatMap((page) => page.articles) ?? [];
  }, [data?.pages]);

  // Get current page number (total pages loaded)
  const currentPage = useMemo(() => {
    return data?.pages?.length ?? 0;
  }, [data?.pages]);

  // Get total articles count
  const totalArticles = useMemo(() => {
    return articles.length;
  }, [articles.length]);

  // Get cache status from the most recent page
  const cacheStatus = useMemo(() => {
    const lastPage = data?.pages?.[data.pages.length - 1];
    return lastPage?.cacheStatus;
  }, [data?.pages]);

  // Load more function
  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    articles,
    isLoading,
    isLoadingMore: isFetchingNextPage,
    error,
    hasNextPage: Boolean(hasNextPage),
    loadMore,
    totalArticles,
    currentPage,
    isRefreshing: isRefetching,
    refetch,
    cacheStatus,
  };
}

/**
 * Get pagination metadata for display purposes
 *
 * @param totalArticles - Total number of articles loaded
 * @param pageSize - Number of articles per page
 * @param hasNextPage - Whether more pages are available
 * @returns Formatted pagination info
 */
export function usePaginationInfo(
  totalArticles: number,
  pageSize: number,
  hasNextPage: boolean
) {
  return useMemo(() => {
    const currentPage = Math.ceil(totalArticles / pageSize) || 1;
    const showingFrom = totalArticles > 0 ? 1 : 0;
    const showingTo = totalArticles;
    const estimatedTotal = hasNextPage ? `${totalArticles}+` : totalArticles.toString();

    return {
      currentPage,
      showingFrom,
      showingTo,
      estimatedTotal,
      displayText: totalArticles > 0
        ? `Showing ${showingFrom}-${showingTo} of ${estimatedTotal} articles`
        : 'No articles found',
    };
  }, [totalArticles, pageSize, hasNextPage]);
}
