/**
 * Watchlist/Ticker Types
 * Type definitions for ticker bar functionality
 */

import { ExploreToken } from './explore.types';

// ============================================================================
// Ticker Item Types
// ============================================================================

export interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  image: string;
}

// ============================================================================
// Ticker State
// ============================================================================

export interface TickerState {
  items: TickerItem[];
  isLoading: boolean;
  error: Error | null;
}

// ============================================================================
// Ticker Config
// ============================================================================

export interface TickerConfig {
  maxItems: number;
  refreshInterval: number; // milliseconds
  sortBy: 'volume' | 'marketCap' | 'priceChange';
}

export const DEFAULT_TICKER_CONFIG: TickerConfig = {
  maxItems: 8,
  refreshInterval: 60000, // 60 seconds
  sortBy: 'volume',
};
