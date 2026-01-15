/**
 * useTopRWAs Hook
 * Fetches and manages top RWA tokens by volume for ticker
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchExploreData } from '@/lib/api/endpoints/explore';
import { TickerItem } from '@/lib/types/ticker.types';
import { useMemo } from 'react';

// ============================================================================
// Hook
// ============================================================================

export function useTopRWAs(maxItems: number = 8) {
  // Fetch tokens data
  const { data, isLoading, error } = useQuery({
    queryKey: ['explore-tokens'],
    queryFn: fetchExploreData,
    staleTime: 60 * 1000, // 60 seconds
    refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
  });

  // Transform and sort tokens for ticker
  const tickerItems: TickerItem[] = useMemo(() => {
    if (!data?.tokens) return [];

    // Sort by volume24h (descending)
    const sorted = [...data.tokens].sort((a, b) => b.volume24h - a.volume24h);

    // Take top items and format for ticker
    return sorted.slice(0, maxItems).map((token) => ({
      symbol: token.symbol,
      name: token.name,
      price: token.price,
      priceChange24h: token.priceChange24h,
      priceChangePercentage24h: token.priceChangePercentage24h,
      image: token.image,
    }));
  }, [data?.tokens, maxItems]);

  return {
    items: tickerItems,
    isLoading,
    error,
  };
}
