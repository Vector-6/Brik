/**
 * Chart API Types
 * Types for the chart-related API endpoints
 */

// ============================================================================
// Chart API Response Types
// ============================================================================

export interface TokenHistoryResponse {
  symbol: string;
  name?: string;
  currency: string;
  days: string;
  interval: string;
  prices: DataPoint[];
  marketCaps: DataPoint[];
  totalVolumes: DataPoint[];
}

export interface DataPoint {
  timestamp: number; // Unix timestamp in milliseconds
  value: number; // Numerical value (price/market cap/volume)
}

// ============================================================================
// Chart API Request Parameters
// ============================================================================

export interface TokenHistoryParams {
  symbol: string;
  days?: '1' | '7' | '14' | '30' | '90' | '180' | '365' ;
  currency?: string;
  interval?: '5m' | '1h' | '1d';
  precision?: 'full' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18';
  from?: number; // Unix timestamp in seconds
  to?: number; // Unix timestamp in seconds
}

// ============================================================================
// Chart Component Types
// ============================================================================

export type ChartTimeframe = '1D' | '7D' | '30D' | '90D' | '180D' | '1Y' 

export interface ChartData {
  timestamp: number;
  price: number;
  marketCap?: number;
  volume?: number;
}

export type ChartType = 'price' | 'marketCap' | 'volume';

export interface ChartProps {
  symbol: string;
  className?: string;
  height?: number;
  showTimeframes?: boolean;
  showChartTypes?: boolean;
  defaultTimeframe?: ChartTimeframe;
  defaultType?: ChartType;
}

// ============================================================================
// Chart Error Types
// ============================================================================

export interface ChartErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp?: string;
  path?: string;
}
