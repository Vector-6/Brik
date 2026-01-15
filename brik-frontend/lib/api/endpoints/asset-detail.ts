/**
 * Asset Detail API Endpoints
 * Functions for fetching individual asset details and related data
 */

import apiClient from '../client';
import { AssetDetail } from '@/lib/types/asset-detail.types';

// ============================================================================
// Types for API Response
// ============================================================================

interface ChainAvailability {
  chainId: number;
  chainName: string;
  contractAddress: string;
}

interface SimilarTokenMarketData {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
}

interface SimilarTokenFromAPI {
  symbol: string;
  name: string;
  image: string;
  coingeckoId: string;
  sharedCategories: string[];
  similarityScore: number;
  chainsAvailable: ChainAvailability[];
  marketData?: SimilarTokenMarketData;
}

interface SimilarTokensAPIResponse {
  requestedToken: {
    symbol: string;
    name: string;
    categories: string[];
  };
  similarTokens: SimilarTokenFromAPI[];
  total: number;
  lastUpdated: string;
}

export interface SimilarToken {
  symbol: string;
  name: string;
  image: string;
  coingeckoId: string;
  sharedCategories: string[];
  similarityScore: number;
  chainsAvailable: ChainAvailability[];
  price?: number;
  marketCap?: number;
  volume24h?: number;
  priceChange24h?: number;
  priceChangePercentage24h?: number;
}

interface TokenAPIResponse {
  symbol: string;
  name: string;
  description: string;
  image: string;
  marketData: {
    currentPrice: number;
    marketCap: number;
    marketCapRank: number;
    totalVolume: number;
    priceChange24h: number;
    priceChangePercentage24h: number;
    priceChangePercentage7d: number;
    priceChangePercentage30d: number;
    circulatingSupply: number;
    totalSupply: number;
    maxSupply: number;
    ath: number;
    athDate: string;
    atl: number;
    atlDate: string;
    lastUpdated: string;
  };
  links: {
    homepage?: string[];
    blockchain_site?: string[];
    official_forum_url?: string[];
    twitter_screen_name?: string;
    telegram_channel_identifier?: string;
  };
  chainsAvailable: Array<{
    chainId: number;
    chainName: string;
    contractAddress: string;
  }>;
  categories: string[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Transform API response to AssetDetail format
 */
function transformTokenResponse(data: TokenAPIResponse): AssetDetail {
  return {
    symbol: data.symbol,
    name: data.name,
    description: data.description,
    image: data.image,
    price: data.marketData.currentPrice,
    marketCap: data.marketData.marketCap,
    volume24h: data.marketData.totalVolume,
    priceChange24h: data.marketData.priceChange24h,
    priceChangePercentage24h: data.marketData.priceChangePercentage24h,
    chainsAvailable: data.chainsAvailable.map((chain) => chain.chainName),
    category: data.categories,

    // Extended fields
    totalValueLocked: undefined, // Not provided by this API
    apy: undefined, // Not provided by this API
    supply: data.marketData.totalSupply,
    circulatingSupply: data.marketData.circulatingSupply,

    // Metadata
    custodian: undefined, // Not provided by this API
    source: 'CoinGecko',
    website: data.links.homepage?.[0],
    whitepaper: undefined, // Not provided by this API

    // Contracts
    contracts: data.chainsAvailable.map((chain) => ({
      chain: chain.chainName,
      address: chain.contractAddress,
      decimals: 18, // Default, would need to be fetched separately
    })),

    // Social links
    socialLinks: {
      twitter: data.links.twitter_screen_name
        ? `https://twitter.com/${data.links.twitter_screen_name}`
        : undefined,
      telegram: data.links.telegram_channel_identifier
        ? `https://t.me/${data.links.telegram_channel_identifier}`
        : undefined,
    },

    // Timestamps
    lastUpdated: data.marketData.lastUpdated,
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch detailed information for a single RWA asset
 *
 * @param id - Asset symbol or unique identifier
 * @returns Promise resolving to asset detail data
 *
 * @throws {ApiError} 404 - Asset not found
 * @throws {ApiError} 429 - Rate limit exceeded (no retry)
 * @throws {ApiError} 500 - Internal server error
 * @throws {ApiError} 502 - External service failure
 *
 * @example
 * const asset = await fetchAssetDetail('PAXG');
 * console.log(asset.name); // "Paxos Gold"
 */
export async function fetchAssetDetail(id: string): Promise<AssetDetail> {
  const { data } = await apiClient.get<TokenAPIResponse>(`/token/${id}`);
  return transformTokenResponse(data);
}

/**
 * Fetch similar or related assets based on the current asset
 *
 * @param symbol - Current asset symbol
 * @param limit - Maximum number of similar assets to return (default: 8, max: 50)
 * @param includeMarketData - Whether to include market data (default: true)
 * @returns Promise resolving to array of similar assets
 *
 * @throws {ApiError} 404 - Asset not found
 * @throws {ApiError} 429 - Rate limit exceeded (no retry)
 * @throws {ApiError} 500 - Internal server error
 *
 * @example
 * const similarAssets = await fetchSimilarAssets('PAXG', 4);
 * console.log(similarAssets.length); // Up to 4 similar assets
 */
export async function fetchSimilarAssets(
  symbol: string,
  limit: number = 8,
  includeMarketData: boolean = true
): Promise<SimilarToken[]> {
  const params = new URLSearchParams({
    limit: Math.min(limit, 50).toString(),
    includeMarketData: includeMarketData.toString(),
  });

  const { data } = await apiClient.get<SimilarTokensAPIResponse>(
    `/token/${symbol}/similar?${params.toString()}`
  );

  return data.similarTokens.map((token) => ({
    symbol: token.symbol,
    name: token.name,
    image: token.image,
    coingeckoId: token.coingeckoId,
    sharedCategories: token.sharedCategories,
    similarityScore: token.similarityScore,
    chainsAvailable: token.chainsAvailable,
    price: token.marketData?.price,
    marketCap: token.marketData?.marketCap,
    volume24h: token.marketData?.volume24h,
    priceChange24h: token.marketData?.priceChange24h,
    priceChangePercentage24h: token.marketData?.priceChangePercentage24h,
  }));
}
