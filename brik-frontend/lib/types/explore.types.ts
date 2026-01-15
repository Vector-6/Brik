/**
 * Explore Feature Types
 * Type definitions for RWA token exploration
 */

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Individual RWA token data from API
 */
export interface ExploreToken {
  symbol: string;
  name: string;
  image: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  chainsAvailable: string[];
  description: string;
  category: string[];
}

/**
 * Complete API response from /api/explore
 */
export interface ExploreResponse {
  tokens: ExploreToken[];
  lastUpdated: string;
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Filter state for explore page
 */
export interface ExploreFilters {
  categories: string[];
  chains: string[];
  apyRange: [number, number];
  searchQuery: string;
}

/**
 * Sort options for token list
 */
export type ExploreSortOption =
  | 'marketCap-desc'
  | 'marketCap-asc'
  | 'volume-desc'
  | 'priceChange-desc'
  | 'priceChange-asc'
  | 'alphabetical-asc'
  | 'alphabetical-desc';

/**
 * Sort configuration
 */
export interface ExploreSortConfig {
  field: 'marketCap' | 'volume24h' | 'priceChangePercentage24h' | 'name';
  direction: 'asc' | 'desc';
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Loading state types
 */
export type ExploreLoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * View mode options
 */
export type ExploreViewMode = 'grid' | 'list';

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for RWA Card component
 */
export interface RWACardProps {
  token: ExploreToken;
  index: number;
}

/**
 * Props for Filter Bar component
 */
export interface FilterBarProps {
  filters: ExploreFilters;
  sortBy: ExploreSortOption;
  onFilterChange: (filters: ExploreFilters) => void;
  onSortChange: (sortBy: ExploreSortOption) => void;
  onClearFilters: () => void;
  availableCategories: string[];
  availableChains: string[];
  totalResults: number;
  activeFilterCount: number;
}

/**
 * Props for Error state component
 */
export interface ExploreErrorProps {
  error: unknown;
  onRetry: () => void;
}

/**
 * Props for Explore Grid component
 */
export interface ExploreGridProps {
  tokens: ExploreToken[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}
