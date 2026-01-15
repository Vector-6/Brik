/**
 * Global Search Types
 * Type definitions for navbar search functionality
 */

import { ExploreToken } from './explore.types';

// ============================================================================
// Search Result Types
// ============================================================================

export type SearchResultType = 'token' | 'page' | 'wallet';

export interface BaseSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
}

export interface TokenSearchResult extends BaseSearchResult {
  type: 'token';
  token: ExploreToken;
}

export interface PageSearchResult extends BaseSearchResult {
  type: 'page';
  href: string;
  icon?: string;
}

export interface WalletSearchResult extends BaseSearchResult {
  type: 'wallet';
  address: string;
}

export type SearchResult = TokenSearchResult | PageSearchResult | WalletSearchResult;

// ============================================================================
// Search State
// ============================================================================

export interface SearchState {
  query: string;
  results: SearchResult[];
  isOpen: boolean;
  isLoading: boolean;
  selectedIndex: number;
}

// ============================================================================
// Search Config
// ============================================================================

export interface SearchablePages {
  name: string;
  href: string;
  keywords: string[];
  description: string;
}
