/**
 * NewsPageContainer Component
 * Main container that orchestrates the news page functionality
 */

'use client';

import { useCallback, useMemo } from 'react';
import { useNewsPagination } from '../hooks/useNewsPagination';
import { useNewsFilters } from '../hooks/useNewsFilters';
import { NewsHero } from '../presenters/NewsHero';
import { NewsFilters } from '../presenters/NewsFilters';
import { NewsGridWithLoadMore } from '../presenters/NewsGrid';
import { NewsErrorState } from '../presenters/NewsErrorStates';
import { NewsPageSkeleton } from '../skeletons/NewsCardSkeleton';
import { NewsArticle } from '@/lib/types/news.types';
import { sortByRelevance, sortByDate } from '../utils/dateFormatting';

// ============================================================================
// Types
// ============================================================================

interface NewsPageContainerProps {
  /** Initial page size */
  pageSize?: number;
  /** Additional CSS classes */
  className?: string;
  /** Custom hero content */
  heroProps?: {
    title?: string;
    subtitle?: string;
    showBackground?: boolean;
  };
  /** Analytics callback for article clicks */
  onArticleClick?: (article: NewsArticle) => void;
}

// ============================================================================
// Error Type Mapping
// ============================================================================

function getErrorType(error: unknown): 'rate_limit' | 'service_unavailable' | 'network_error' | 'unknown' {
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as { response?: { status?: number } };
    const status = errorObj.response?.status;

    switch (status) {
      case 429:
        return 'rate_limit';
      case 502:
      case 503:
        return 'service_unavailable';
      default:
        return 'network_error';
    }
  }

  return 'unknown';
}

// ============================================================================
// Main Component
// ============================================================================

export function NewsPageContainer({
  pageSize = 20,
  className = '',
  heroProps = {},
  onArticleClick,
}: NewsPageContainerProps) {
  // Filters state
  const {
    sort,
    viewMode,
    setSort,
    setViewMode,
  } = useNewsFilters({
    initialSort: 'relevance',
    initialViewMode: 'grid',
  });

  // Data fetching with pagination
  const {
    articles: rawArticles,
    isLoading,
    isLoadingMore,
    error,
    hasNextPage,
    loadMore,
    totalArticles,
    refetch,
    isRefreshing,
  } = useNewsPagination({
    pageSize,
    sort,
  });

  // Sort articles on client side for immediate feedback
  const sortedArticles = useMemo(() => {
    if (!rawArticles.length) return rawArticles;

    switch (sort) {
      case 'date':
        return sortByDate(rawArticles);
      case 'relevance':
      default:
        return sortByRelevance(rawArticles);
    }
  }, [rawArticles, sort]);

  // Handle article click with analytics
  const handleArticleClick = useCallback((article: NewsArticle) => {
    // Analytics callback
    onArticleClick?.(article);

    // Track click event (you can expand this)
    if (typeof window !== 'undefined') {
      const windowWithGtag = window as typeof window & {
        gtag?: (command: string, eventName: string, parameters: Record<string, unknown>) => void
      };
      if (windowWithGtag.gtag) {
        windowWithGtag.gtag('event', 'news_article_click', {
          article_id: article.id,
          article_title: article.title,
          article_source: article.source,
          relevance_score: article.relevanceScore,
        });
      }
    }
  }, [onArticleClick]);

  // Handle retry with error-specific logic
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle sort change
  const handleSortChange = useCallback((newSort: typeof sort) => {
    setSort(newSort);
  }, [setSort]);

  // Handle view mode change
  const handleViewModeChange = useCallback((newViewMode: typeof viewMode) => {
    setViewMode(newViewMode);
  }, [setViewMode]);

  // Show full page loading skeleton on initial load
  if (isLoading && totalArticles === 0) {
    return (
      <div className={className + `max-w-7xl mx-auto px-4 space-y-4`}>
        <NewsPageSkeleton />
      </div>
    );
  }

  // Show error state if there's an error and no cached data
  if (error && totalArticles === 0) {
    const errorType = getErrorType(error);

    return (
      <div className={className}>
        <NewsHero {...heroProps} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <NewsErrorState
            type={errorType}
            onRetry={handleRetry}
            isRetrying={isRefreshing}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Hero Section */}
      <NewsHero {...heroProps} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 space-y-4">
        {/* Section heading for accessibility */}
        <h2 className="sr-only">News Articles</h2>

        {/* Filters */}
        <NewsFilters
          sort={sort}
          viewMode={viewMode}
          totalArticles={totalArticles}
          hasMore={hasNextPage}
          onSortChange={handleSortChange}
          onViewModeChange={handleViewModeChange}
          isLoading={isLoading || isRefreshing}
        />

        {/* Articles Grid with Load More */}
        <div className="py-8">
          <NewsGridWithLoadMore
            articles={sortedArticles}
            viewMode={viewMode}
            isLoading={false} // We handle loading in pagination
            hasMore={hasNextPage}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
            onArticleClick={handleArticleClick}
            loadMoreText="Load More Articles"
          />
        </div>

        {/* Inline Error for load more failures */}
        {error && totalArticles > 0 && (
          <div className="text-center pb-8">
            <div className="inline-block">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Failed to load more articles
                <button
                  onClick={handleRetry}
                  className="ml-2 px-2 py-1 text-xs border border-red-500/30 rounded hover:bg-red-500/10 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Mobile-optimized Container
// ============================================================================

interface MobileNewsPageContainerProps extends NewsPageContainerProps {
  /** Whether to use compact hero */
  useCompactHero?: boolean;
}

export function MobileNewsPageContainer({
  pageSize = 15, // Smaller page size for mobile
  className = '',
  heroProps = {},
  onArticleClick,
  useCompactHero = false,
}: MobileNewsPageContainerProps) {
  // Force list view on mobile for better UX
  const {
    sort,
    viewMode,
    setSort,
    setViewMode,
  } = useNewsFilters({
    initialSort: 'relevance',
    initialViewMode: 'list', // Default to list on mobile
  });

  const {
    articles: rawArticles,
    isLoading,
    isLoadingMore,
    error,
    hasNextPage,
    loadMore,
    totalArticles,
    refetch,
    isRefreshing,
  } = useNewsPagination({
    pageSize,
    sort,
  });

  const sortedArticles = useMemo(() => {
    if (!rawArticles.length) return rawArticles;

    switch (sort) {
      case 'date':
        return sortByDate(rawArticles);
      case 'relevance':
      default:
        return sortByRelevance(rawArticles);
    }
  }, [rawArticles, sort]);

  const handleArticleClick = useCallback((article: NewsArticle) => {
    onArticleClick?.(article);
  }, [onArticleClick]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading && totalArticles === 0) {
    return (
      <div className={className}>
        <NewsPageSkeleton />
      </div>
    );
  }

  if (error && totalArticles === 0) {
    const errorType = getErrorType(error);

    return (
      <div className={className}>
        {useCompactHero ? (
          <NewsHero {...heroProps} />
        ) : (
          <NewsHero {...heroProps} />
        )}
        <div className="px-4 py-8">
          <NewsErrorState
            type={errorType}
            onRetry={handleRetry}
            isRetrying={isRefreshing}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Hero */}
      <NewsHero {...heroProps} />

      {/* Content */}
      <div className="px-4 py-8 space-y-6">
        {/* Mobile Filters */}
        <NewsFilters
          sort={sort}
          viewMode={viewMode}
          totalArticles={totalArticles}
          hasMore={hasNextPage}
          onSortChange={setSort}
          onViewModeChange={setViewMode}
          isLoading={isLoading || isRefreshing}
        />

        {/* Articles */}
        <NewsGridWithLoadMore
          articles={sortedArticles}
          viewMode={viewMode}
          isLoading={false}
          hasMore={hasNextPage}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMore}
          onArticleClick={handleArticleClick}
          loadMoreText="Load More"
        />
      </div>
    </div>
  );
}

// ============================================================================
// Export
// ============================================================================

export default NewsPageContainer;
