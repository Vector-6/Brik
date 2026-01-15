/**
 * useSimilarAssets Hook
 * Fetches related assets based on category and characteristics
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSimilarAssets, SimilarToken } from '@/lib/api/endpoints/asset-detail';

// ============================================================================
// Hook
// ============================================================================

/**
 * Fetch similar assets with caching and error handling
 *
 * @param symbol - Current asset symbol
 * @param limit - Maximum number of similar assets to fetch (default: 8)
 * @param includeMarketData - Whether to include market data (default: true)
 * @returns Query result with similar assets, loading state, and error handling
 *
 * @example
 * const { data: similarAssets, isLoading } = useSimilarAssets('PAXG', 4);
 */
export function useSimilarAssets(
  symbol: string,
  limit: number = 8,
  includeMarketData: boolean = true
) {
  return useQuery<SimilarToken[], Error>({
    queryKey: ['similar-assets', symbol, limit, includeMarketData],
    queryFn: () => fetchSimilarAssets(symbol, limit, includeMarketData),
    staleTime: 15 * 60 * 1000, // 15 minutes to match backend cache
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!symbol, // Only fetch if symbol is provided
  });
}
