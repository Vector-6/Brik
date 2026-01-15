/**
 * News Feature Exports
 * Centralized exports for all news-related components, hooks, and utilities
 */

// ============================================================================
// Containers
// ============================================================================
export { NewsPageContainer, MobileNewsPageContainer } from './containers/NewsPageContainer';

// ============================================================================
// Hooks
// ============================================================================
export { useNewsData, useNewsPage } from './hooks/useNewsData';
export { useNewsPagination, usePaginationInfo } from './hooks/useNewsPagination';
export {
  useNewsFilters,
  getSortLabel,
  getViewModeLabel,
  areFiltersDefault
} from './hooks/useNewsFilters';

// ============================================================================
// Presenters
// ============================================================================
export { NewsCard } from './presenters/NewsCard';
export { NewsGrid, NewsGridWithLoadMore } from './presenters/NewsGrid';
export { NewsHero, CompactNewsHero,  } from './presenters/NewsHero';
export { NewsFilters, MobileNewsFilters } from './presenters/NewsFilters';
export {
  NewsErrorState,
  NewsEmptyState,
  InlineNewsError
} from './presenters/NewsErrorStates';
export { ImageWithFallback } from './presenters/ImageWithFallback';

// ============================================================================
// Skeletons
// ============================================================================
export {
  NewsCardSkeleton,
  NewsGridSkeleton,
  NewsHeroSkeleton,
  NewsFiltersSkeleton,
  LoadMoreButtonSkeleton,
  NewsPageSkeleton
} from './skeletons/NewsCardSkeleton';

// ============================================================================
// Utilities
// ============================================================================
export {
  formatRelativeTime,
  formatAbsoluteDate,
  formatShortDate,
  getFormattedTime,
  isWithinDays,
  isRecent,
  sortByDate,
  sortByRelevance,
} from './utils/dateFormatting';

export {
  getRelevanceLevel,
  getRelevanceInfo,
  shouldShowRelevanceBadge,
  getRelevanceBadgeText,
  getRelevanceBadgeVariant,
  filterByRelevance,
  getHighRelevanceArticles,
  getRelevanceDistribution,
  formatRelevanceScore,
  getRelevanceColor,
  HIGH_RELEVANCE_THRESHOLD,
  MEDIUM_RELEVANCE_THRESHOLD,
  MIN_RELEVANCE_THRESHOLD,
} from './utils/relevanceIndicator';

// ============================================================================
// Re-export Types (for convenience)
// ============================================================================
export type {
  NewsArticle,
  NewsResponse,
  NewsQueryParams,
  NewsSortOption,
  NewsViewMode,
  NewsFilters as NewsFiltersType,
  NewsPaginationState,
  NewsError,
  NewsCacheStatus,
  NewsResponseWithCache,
  FormattedTime,
} from '@/lib/types/news.types';
