/**
 * Chart Data Hook
 * React Query hook for fetching and managing chart data
 */

import { useQuery } from '@tanstack/react-query';
import { fetchTokenHistory, timeframeToDays, formatChartData } from '@/lib/api/endpoints/chart';
import { ChartTimeframe, ChartData } from '@/lib/types/chart.types';

// ============================================================================
// Hook
// ============================================================================

export interface UseTokenChartOptions {
  enabled?: boolean;
  timeframe?: ChartTimeframe;
  currency?: string;
  refetchInterval?: number;
  staleTime?: number;
}

export function useTokenChart(
  symbol: string | undefined,
  options: UseTokenChartOptions = {}
) {
  const {
    enabled = true,
    timeframe = '30D',
    currency = 'usd',
    refetchInterval = 5 * 60 * 1000, // 5 minutes
    staleTime = 2 * 60 * 1000, // 2 minutes
  } = options;

  return useQuery({
    queryKey: ['tokenChart', symbol, timeframe, currency],
    queryFn: async (): Promise<ChartData[]> => {
      if (!symbol) throw new Error('Symbol is required');
      
      const response = await fetchTokenHistory(symbol, {
        days: timeframeToDays(timeframe),
        currency,
      });
      
      return formatChartData(response);
    },
    enabled: enabled && !!symbol,
    refetchInterval,
    staleTime,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (token not found)
      if (error?.response?.status === 404) return false;
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
