/**
 * Explore Sorting Utilities
 * Helper functions for sorting RWA tokens
 */

import { ExploreToken, ExploreSortOption, ExploreSortConfig } from '@/lib/types/explore.types';

// ============================================================================
// Sort Configuration
// ============================================================================

/**
 * Parse sort option string into configuration
 */
export function parseSortOption(sortOption: ExploreSortOption): ExploreSortConfig {
  const [field, direction] = sortOption.split('-') as [string, 'asc' | 'desc'];

  const fieldMap: Record<string, ExploreSortConfig['field']> = {
    marketCap: 'marketCap',
    volume: 'volume24h',
    priceChange: 'priceChangePercentage24h',
    alphabetical: 'name',
  };

  return {
    field: fieldMap[field] || 'marketCap',
    direction,
  };
}

// ============================================================================
// Sort Functions
// ============================================================================

/**
 * Sort tokens by market cap
 */
export function sortByMarketCap(
  tokens: ExploreToken[],
  direction: 'asc' | 'desc' = 'desc'
): ExploreToken[] {
  return [...tokens].sort((a, b) => {
    const diff = a.marketCap - b.marketCap;
    return direction === 'desc' ? -diff : diff;
  });
}

/**
 * Sort tokens by 24h volume
 */
export function sortByVolume(
  tokens: ExploreToken[],
  direction: 'asc' | 'desc' = 'desc'
): ExploreToken[] {
  return [...tokens].sort((a, b) => {
    const diff = a.volume24h - b.volume24h;
    return direction === 'desc' ? -diff : diff;
  });
}

/**
 * Sort tokens by price change percentage
 */
export function sortByPriceChange(
  tokens: ExploreToken[],
  direction: 'asc' | 'desc' = 'desc'
): ExploreToken[] {
  return [...tokens].sort((a, b) => {
    const diff = a.priceChangePercentage24h - b.priceChangePercentage24h;
    return direction === 'desc' ? -diff : diff;
  });
}

/**
 * Sort tokens alphabetically by name
 */
export function sortAlphabetically(
  tokens: ExploreToken[],
  direction: 'asc' | 'desc' = 'asc'
): ExploreToken[] {
  return [...tokens].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return direction === 'desc' ? -comparison : comparison;
  });
}

/**
 * Apply sorting to token list based on configuration
 */
export function applySorting(
  tokens: ExploreToken[],
  sortOption: ExploreSortOption
): ExploreToken[] {
  const config = parseSortOption(sortOption);

  switch (config.field) {
    case 'marketCap':
      return sortByMarketCap(tokens, config.direction);
    case 'volume24h':
      return sortByVolume(tokens, config.direction);
    case 'priceChangePercentage24h':
      return sortByPriceChange(tokens, config.direction);
    case 'name':
      return sortAlphabetically(tokens, config.direction);
    default:
      return tokens;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get sort label for display
 */
export function getSortLabel(sortOption: ExploreSortOption): string {
  const labels: Record<ExploreSortOption, string> = {
    'marketCap-desc': 'Market Cap: High → Low',
    'marketCap-asc': 'Market Cap: Low → High',
    'volume-desc': 'Volume: High → Low',
    'priceChange-desc': 'Top Gainers',
    'priceChange-asc': 'Top Losers',
    'alphabetical-asc': 'Name: A → Z',
    'alphabetical-desc': 'Name: Z → A',
  };

  return labels[sortOption] || 'Sort By';
}

/**
 * Get available sort options
 */
export function getSortOptions(): { value: ExploreSortOption; label: string }[] {
  return [
    { value: 'marketCap-desc', label: 'Market Cap: High → Low' },
    { value: 'marketCap-asc', label: 'Market Cap: Low → High' },
    { value: 'volume-desc', label: 'Volume: High → Low' },
    { value: 'priceChange-desc', label: 'Top Gainers' },
    { value: 'priceChange-asc', label: 'Top Losers' },
    { value: 'alphabetical-asc', label: 'Name: A → Z' },
    { value: 'alphabetical-desc', label: 'Name: Z → A' },
  ];
}
