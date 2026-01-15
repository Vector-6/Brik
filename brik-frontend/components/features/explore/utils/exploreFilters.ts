/**
 * Explore Filter Utilities
 * Helper functions for filtering RWA tokens
 */

import { ExploreToken, ExploreFilters } from '@/lib/types/explore.types';

// ============================================================================
// Filter Functions
// ============================================================================

/**
 * Filter tokens by search query (name or symbol)
 */
export function filterBySearch(
  tokens: ExploreToken[],
  searchQuery: string
): ExploreToken[] {
  if (!searchQuery.trim()) return tokens;

  const query = searchQuery.toLowerCase();
  return tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(query) ||
      token.symbol.toLowerCase().includes(query) ||
      token.description.toLowerCase().includes(query)
  );
}

/**
 * Filter tokens by categories
 */
export function filterByCategories(
  tokens: ExploreToken[],
  categories: string[]
): ExploreToken[] {
  if (categories.length === 0) return tokens;

  return tokens.filter((token) =>
    token.category.some((cat) => categories.includes(cat))
  );
}

/**
 * Filter tokens by blockchain chains
 */
export function filterByChains(
  tokens: ExploreToken[],
  chains: string[]
): ExploreToken[] {
  if (chains.length === 0) return tokens;

  return tokens.filter((token) =>
    token.chainsAvailable.some((chain) => chains.includes(chain))
  );
}

/**
 * Filter tokens by APY range (calculated from price change)
 * Note: This is a simplified calculation. Adjust based on your APY calculation logic.
 */
export function filterByApyRange(
  tokens: ExploreToken[],
  apyRange: [number, number]
): ExploreToken[] {
  const [minApy, maxApy] = apyRange;

  // If range is at default (0-100), return all
  if (minApy === 0 && maxApy === 100) return tokens;

  return tokens.filter((token) => {
    // Simplified APY calculation based on 24h price change
    // You may want to adjust this based on actual APY data
    const estimatedApy = Math.abs(token.priceChangePercentage24h * 365);
    return estimatedApy >= minApy && estimatedApy <= maxApy;
  });
}

/**
 * Apply all filters to token list
 */
export function applyFilters(
  tokens: ExploreToken[],
  filters: ExploreFilters
): ExploreToken[] {
  let filtered = tokens;

  filtered = filterBySearch(filtered, filters.searchQuery);
  filtered = filterByCategories(filtered, filters.categories);
  filtered = filterByChains(filtered, filters.chains);
  filtered = filterByApyRange(filtered, filters.apyRange);

  return filtered;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get unique categories from token list
 */
export function getUniqueCategories(tokens: ExploreToken[]): string[] {
  const categories = new Set<string>();
  tokens.forEach((token) => {
    token.category.forEach((cat) => categories.add(cat));
  });
  return Array.from(categories).sort();
}

/**
 * Get unique chains from token list
 */
export function getUniqueChains(tokens: ExploreToken[]): string[] {
  const chains = new Set<string>();
  tokens.forEach((token) => {
    token.chainsAvailable.forEach((chain) => chains.add(chain));
  });
  return Array.from(chains).sort();
}

/**
 * Count active filters
 */
export function countActiveFilters(filters: ExploreFilters): number {
  let count = 0;

  if (filters.searchQuery.trim()) count++;
  if (filters.categories.length > 0) count++;
  if (filters.chains.length > 0) count++;
  if (filters.apyRange[0] !== 0 || filters.apyRange[1] !== 100) count++;

  return count;
}

/**
 * Get default filters
 */
export function getDefaultFilters(): ExploreFilters {
  return {
    categories: [],
    chains: [],
    apyRange: [0, 100],
    searchQuery: '',
  };
}
