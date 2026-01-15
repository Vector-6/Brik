/**
 * Explore API Endpoints
 * Functions for interacting with the /api/explore endpoint
 */

import apiClient from '../client';
import { ExploreResponse } from '@/lib/types/explore.types';

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch comprehensive market data for all supported RWA tokens
 *
 * @returns Promise resolving to explore response with token data
 *
 * @throws {ApiError} 429 - Rate limit exceeded (no retry)
 * @throws {ApiError} 500 - Internal server error
 * @throws {ApiError} 502 - External service (CoinGecko) failure
 * @throws {ApiError} 503 - Blockchain service unavailable
 *
 * @example
 * const data = await fetchExploreData();
 * console.log(data.tokens.length); // Number of RWA tokens
 * console.log(data.lastUpdated); // ISO timestamp
 */
export async function fetchExploreData(): Promise<ExploreResponse> {
  const { data } = await apiClient.get<ExploreResponse>('/explore');
  return data;
}
