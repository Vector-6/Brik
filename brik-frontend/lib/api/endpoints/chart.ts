/**
 * Chart API Service
 * Service functions for fetching chart data from the backend
 */

import apiClient from '../client';
import { TokenHistoryResponse, TokenHistoryParams } from '../../types/chart.types';

// ============================================================================
// Chart API Functions
// ============================================================================

/**
 * Fetch token price history data
 */
export async function fetchTokenHistory(
  symbol: string,
  params?: Omit<TokenHistoryParams, 'symbol'>
): Promise<TokenHistoryResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.days) queryParams.append('days', params.days);
  if (params?.currency) queryParams.append('currency', params.currency);
  if (params?.interval) queryParams.append('interval', params.interval);
  if (params?.precision) queryParams.append('precision', params.precision);
  if (params?.from) queryParams.append('from', params.from.toString());
  if (params?.to) queryParams.append('to', params.to.toString());

  const url = `/coin/${encodeURIComponent(symbol)}/history${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  const response = await apiClient.get<TokenHistoryResponse>(url);
  return response.data;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert ChartTimeframe to days parameter
 */
export function timeframeToDays(timeframe: '1D' | '7D' | '30D' | '90D' | '180D' | '1Y' ): 
  '1' | '7' | '30' | '90' | '180' | '365'{
  switch (timeframe) {
    case '1D': return '1';
    case '7D': return '7';
    case '30D': return '30';
    case '90D': return '90';
    case '180D': return '180';
    case '1Y': return '365';
    
    default: return '30';
  }
}

/**
 * Format chart data for recharts consumption
 */
export function formatChartData(response: TokenHistoryResponse): Array<{
  timestamp: number;
  price: number;
  marketCap?: number;
  volume?: number;
  date: string;
}> {
  const { prices, marketCaps, totalVolumes } = response;
  
  return prices.map((pricePoint, index) => ({
    timestamp: pricePoint.timestamp,
    price: pricePoint.value,
    marketCap: marketCaps[index]?.value,
    volume: totalVolumes[index]?.value,
    date: new Date(pricePoint.timestamp).toLocaleString(),
  }));
}
