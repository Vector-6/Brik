/**
 * useAssetDetail Hook
 * Fetches and manages detailed asset data from the API
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAssetDetail } from '@/lib/api/endpoints/asset-detail';
import { AssetDetail } from '@/lib/types/asset-detail.types';

// ============================================================================
// Hook
// ============================================================================

/**
 * Fetch detailed asset data with caching and error handling
 *
 * @param id - Asset symbol or unique identifier
 * @returns Query result with asset data, loading state, and error handling
 *
 * @example
 * const { data: asset, isLoading, error, refetch } = useAssetDetail('PAXG');
 */
export function useAssetDetail(id: string) {
  return useQuery<AssetDetail, Error>({
    queryKey: ['asset-detail', id],
    queryFn: () => fetchAssetDetail(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 404 (asset not found)
      if (error.message.includes('404')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    enabled: !!id, // Only fetch if id is provided
  });
}
