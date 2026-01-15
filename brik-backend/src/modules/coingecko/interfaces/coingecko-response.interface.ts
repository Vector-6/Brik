/**
 * CoinGecko API Response Interfaces
 *
 * These interfaces match the structure returned by CoinGecko API v3
 * Specifically for the /coins/markets endpoint
 */

/**
 * Market Data Response from CoinGecko API
 * Represents a single coin's market information
 */
export interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  market_cap_rank: number | null;
  fully_diluted_valuation: number | null;
  total_volume: number | null;
  high_24h: number | null;
  low_24h: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  market_cap_change_24h: number | null;
  market_cap_change_percentage_24h: number | null;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
  ath: number | null;
  ath_change_percentage: number | null;
  ath_date: string | null;
  atl: number | null;
  atl_change_percentage: number | null;
  atl_date: string | null;
  roi: {
    times: number;
    currency: string;
    percentage: number;
  } | null;
  last_updated: string;
  // Optional fields from price_change_percentage parameter
  price_change_percentage_1h_in_currency?: number | null;
  price_change_percentage_7d_in_currency?: number | null;
  price_change_percentage_14d_in_currency?: number | null;
  price_change_percentage_30d_in_currency?: number | null;
  price_change_percentage_200d_in_currency?: number | null;
  price_change_percentage_1y_in_currency?: number | null;
  // Optional sparkline data
  sparkline_in_7d?: {
    price: number[];
  };
}

/**
 * Query Parameters for CoinGecko /coins/markets endpoint
 */
export interface CoinGeckoMarketParams {
  vs_currency: string;
  ids?: string;
  category?: string;
  order?:
    | 'market_cap_asc'
    | 'market_cap_desc'
    | 'volume_asc'
    | 'volume_desc'
    | 'id_asc'
    | 'id_desc';
  per_page?: number;
  page?: number;
  sparkline?: boolean;
  price_change_percentage?: string;
  locale?: string;
  precision?: string | number;
}

/**
 * Token Details Response from CoinGecko API
 * Represents detailed information for a specific coin from /coins/{id} endpoint
 */
export interface CoinGeckoTokenDetails {
  id: string;
  symbol: string;
  name: string;
  description: {
    en: string;
    [key: string]: string;
  };
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    twitter_screen_name: string;
    telegram_channel_identifier: string;
    [key: string]: string | string[];
  };
  categories: string[];
  market_data?: {
    current_price: {
      usd: number;
      [key: string]: number;
    };
    [key: string]: unknown;
  };
}

/**
 * Market Chart Response from CoinGecko for /coins/{id}/market_chart
 */
export interface CoinGeckoMarketChart {
  prices?: [number, number][];
  market_caps?: [number, number][];
  total_volumes?: [number, number][];
}
