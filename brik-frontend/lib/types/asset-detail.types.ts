/**
 * Asset Detail Types
 * Type definitions for individual RWA asset detail pages
 */

import { ExploreToken } from './explore.types';

// ============================================================================
// Asset Detail Types
// ============================================================================

/**
 * Detailed information about a single RWA asset
 * Extends ExploreToken with additional metadata
 */
export interface AssetDetail extends ExploreToken {
  // Extended financial metrics
  totalValueLocked?: number;
  apy?: number;
  supply?: number;
  circulatingSupply?: number;

  // Asset metadata
  custodian?: string;
  source?: string;
  website?: string;
  whitepaper?: string;

  // Blockchain data
  contracts?: AssetContract[];

  // Social links
  socialLinks?: SocialLinks;

  // Historical data
  priceHistory?: PriceHistoryPoint[];

  // Related assets
  relatedAssetIds?: string[];

  // Timestamps
  createdAt?: string;
  lastUpdated?: string;
}

/**
 * Contract information for an asset on a specific chain
 */
export interface AssetContract {
  chain: string;
  address: string;
  decimals?: number;
}

/**
 * Social media links
 */
export interface SocialLinks {
  twitter?: string;
  telegram?: string;
  discord?: string;
  medium?: string;
  github?: string;
}

/**
 * Price history data point
 */
export interface PriceHistoryPoint {
  timestamp: number;
  price: number;
  volume?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Response from /api/assets/[id]
 */
export interface AssetDetailResponse {
  asset: AssetDetail;
}

/**
 * Response from /api/assets/[id]/similar
 */
export interface SimilarAssetsResponse {
  assets: ExploreToken[];
  count: number;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for asset detail header component
 */
export interface AssetDetailHeaderProps {
  asset: AssetDetail;
}

/**
 * Props for asset metrics grid component
 */
export interface AssetMetricsGridProps {
  asset: AssetDetail;
}

/**
 * Props for asset about section component
 */
export interface AssetAboutSectionProps {
  asset: AssetDetail;
}

/**
 * Props for asset chains list component
 */
export interface AssetChainsListProps {
  chains: string[];
  contracts?: AssetContract[];
}

/**
 * Props for sticky CTA button component
 */
export interface StickyCTAButtonProps {
  asset: AssetDetail;
}

/**
 * Props for asset detail error component
 */
export interface AssetDetailErrorProps {
  error: unknown;
  assetId: string;
  onRetry?: () => void;
}
