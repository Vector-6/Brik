/**
 * useExploreFilters Hook
 * Manages filter state for the explore page
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { ExploreToken, ExploreFilters } from '@/lib/types/explore.types';
import {
  applyFilters,
  getDefaultFilters,
  countActiveFilters,
  getUniqueCategories,
  getUniqueChains,
} from '../utils/exploreFilters';
import { useDebouncedValue } from '@/components/features/swap/hooks/useDebouncedValue';

// ============================================================================
// Hook
// ============================================================================

/**
 * Manage filter state and apply filters to token list
 *
 * @param tokens - Array of RWA tokens to filter
 * @returns Filter state, filtered tokens, and control functions
 *
 * @example
 * const {
 *   filters,
 *   filteredTokens,
 *   setCategories,
 *   setChains,
 *   setApyRange,
 *   setSearchQuery,
 *   clearFilters,
 *   activeFilterCount,
 * } = useExploreFilters(tokens);
 */
export function useExploreFilters(tokens: ExploreToken[]) {
  // Filter state
  const [filters, setFilters] = useState<ExploreFilters>(getDefaultFilters());

  // Debounce search query to prevent excessive re-renders
  const debouncedSearchQuery = useDebouncedValue(filters.searchQuery, 300);

  // Create debounced filters object
  const debouncedFilters = useMemo(
    () => ({
      ...filters,
      searchQuery: debouncedSearchQuery,
    }),
    [filters, debouncedSearchQuery]
  );

  // Apply filters with memoization
  const filteredTokens = useMemo(() => {
    return applyFilters(tokens, debouncedFilters);
  }, [tokens, debouncedFilters]);

  // Get available filter options
  const availableCategories = useMemo(() => getUniqueCategories(tokens), [tokens]);
  const availableChains = useMemo(() => getUniqueChains(tokens), [tokens]);

  // Count active filters
  const activeFilterCount = useMemo(
    () => countActiveFilters(debouncedFilters),
    [debouncedFilters]
  );

  // Filter update functions
  const setCategories = useCallback((categories: string[]) => {
    setFilters((prev) => ({ ...prev, categories }));
  }, []);

  const setChains = useCallback((chains: string[]) => {
    setFilters((prev) => ({ ...prev, chains }));
  }, []);

  const setApyRange = useCallback((apyRange: [number, number]) => {
    setFilters((prev) => ({ ...prev, apyRange }));
  }, []);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(getDefaultFilters());
  }, []);

  const updateFilters = useCallback((newFilters: Partial<ExploreFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    filters,
    filteredTokens,
    availableCategories,
    availableChains,
    activeFilterCount,
    setCategories,
    setChains,
    setApyRange,
    setSearchQuery,
    clearFilters,
    updateFilters,
  };
}
