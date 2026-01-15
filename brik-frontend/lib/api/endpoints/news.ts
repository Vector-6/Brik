/**
 * News API Endpoints
 * Functions for interacting with the /api/news endpoint
 */

import apiClient from '../client';
import { NewsResponse, NewsQueryParams, NewsCacheStatus, NewsResponseWithCache } from '@/lib/types/news.types';

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch RWA-related news articles with pagination and caching
 *
 * @param params - Query parameters for pagination and filtering
 * @returns Promise resolving to news response with articles
 *
 * @throws {ApiError} 400 - Validation failed (invalid parameters)
 * @throws {ApiError} 429 - Rate limit exceeded (no retry)
 * @throws {ApiError} 502 - External service (NewsAPI) failure
 * @throws {ApiError} 503 - News service unavailable (circuit breaker open)
 * @throws {ApiError} 500 - Internal server error
 *
 * @example
 * // Get first page with default limit (20)
 * const data = await fetchNewsData();
 *
 * // Get specific page with custom limit
 * const data = await fetchNewsData({ page: 2, limit: 10 });
 *
 * console.log(data.articles.length); // Number of articles
 * console.log(data.hasMore); // Whether more pages available
 */
export async function fetchNewsData(params: NewsQueryParams = {}): Promise<NewsResponseWithCache> {
  const { page = 1, limit = 20 } = params;

  const response = await apiClient.get<NewsResponse>('/news', {
    params: {
      page: page.toString(),
      limit: limit.toString(),
    },
  });

  // Extract cache status from headers if available
  const cacheStatus: NewsCacheStatus = {
    isHit: response.headers['x-cache'] === 'HIT',
    isStale: response.headers['x-cache-status'] === 'STALE',
    cacheKey: response.headers['x-cache-key'],
  };

  // Return response with cache information
  return {
    ...response.data,
    cacheStatus,
  };
}

/**
 * Fetch a single page of news articles (helper for infinite queries)
 *
 * @param pageParam - Page number and limit for infinite query
 * @returns Promise resolving to news response
 */
export async function fetchNewsPage({
  pageParam = { page: 1, limit: 20 }
}: {
  pageParam?: NewsQueryParams
}) {
  return fetchNewsData(pageParam);
}
