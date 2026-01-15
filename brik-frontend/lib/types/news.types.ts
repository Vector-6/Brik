/**
 * News Types
 * TypeScript interfaces for news data and API responses
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Individual news article
 */
export interface NewsArticle {
  /** Unique identifier (e.g., "newsapi-https://example.com-0") */
  id: string;
  /** Article headline */
  title: string;
  /** Article summary/excerpt */
  description: string;
  /** Full article URL */
  url: string;
  /** Featured image URL */
  imageUrl: string;
  /** News source name (e.g., "Bloomberg", "CoinDesk") */
  source: string;
  /** ISO 8601 timestamp (e.g., "2025-10-26T12:00:00Z") */
  publishedAt: string;
  /** Article categories (e.g., ["rwa", "crypto"]) */
  category: string[];
  /** Optional: 0-1 relevance score (higher = more relevant) */
  relevanceScore?: number;
}

/**
 * News API response structure
 */
export interface NewsResponse {
  /** Array of news articles */
  articles: NewsArticle[];
  /** Total number of articles in this response */
  total: number;
  /** Current page number */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Whether more pages are available */
  hasMore: boolean;
}

// ============================================================================
// Query Parameters
// ============================================================================

/**
 * Query parameters for news API
 */
export interface NewsQueryParams {
  /** Page number for pagination */
  page?: number;
  /** Number of articles per page */
  limit?: number;
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Sort options for news articles
 */
export type NewsSortOption = 'relevance' | 'date';

/**
 * View mode for news display
 */
export type NewsViewMode = 'grid' | 'list';

/**
 * Filter state for news
 */
export interface NewsFilters {
  /** Current sort option */
  sort: NewsSortOption;
  /** Current view mode */
  viewMode: NewsViewMode;
}

/**
 * Pagination state for news
 */
export interface NewsPaginationState {
  /** Current page number */
  currentPage: number;
  /** Total pages available */
  totalPages: number;
  /** Whether more data is available */
  hasMore: boolean;
  /** Loading state for pagination */
  isLoadingMore: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * News-specific error types
 */
export interface NewsError {
  /** Error type identifier */
  type: 'rate_limit' | 'service_unavailable' | 'network_error' | 'unknown';
  /** Error message */
  message: string;
  /** Optional retry information */
  retryAfter?: number;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Cache status from backend
 */
export interface NewsCacheStatus {
  /** Whether request was served from cache */
  isHit: boolean;
  /** Whether cached data is stale */
  isStale: boolean;
  /** Cache key used */
  cacheKey?: string;
}

/**
 * Extended news response with cache information
 */
export interface NewsResponseWithCache extends NewsResponse {
  /** Cache status information */
  cacheStatus?: NewsCacheStatus;
}

/**
 * Formatted time display
 */
export type FormattedTime = {
  /** Human-readable time (e.g., "2 hours ago") */
  relative: string;
  /** Full date string */
  absolute: string;
  /** ISO timestamp */
  iso: string;
};
