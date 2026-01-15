/**
 * useExploreData Hook
 * Fetches and manages RWA token data from the explore API
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchExploreData } from '@/lib/api/endpoints/explore';
import { ExploreResponse } from '@/lib/types/explore.types';

// ============================================================================
// Hook
// ============================================================================

/**
 * Fetch explore data with caching and automatic refetching
 *
 * @returns Query result with token data, loading state, and error handling
 *
 * @example
 * const { data, isLoading, error, refetch } = useExploreData();
 */
export function useExploreData() {
  return useQuery<ExploreResponse, Error>({
    queryKey: ['explore-tokens'],
    queryFn: fetchExploreData,
    staleTime: 15 * 60 * 1000, // 15 minutes (matches API cache)
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}
