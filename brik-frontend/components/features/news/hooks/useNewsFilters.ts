/**
 * useNewsFilters Hook
 * Manages filter and sort state for news articles
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { NewsSortOption, NewsViewMode, NewsFilters } from '@/lib/types/news.types';

// ============================================================================
// Types
// ============================================================================

interface UseNewsFiltersOptions {
  /** Initial sort option */
  initialSort?: NewsSortOption;
  /** Initial view mode */
  initialViewMode?: NewsViewMode;
}

interface UseNewsFiltersReturn {
  /** Current filters state */
  filters: NewsFilters;
  /** Current sort option */
  sort: NewsSortOption;
  /** Current view mode */
  viewMode: NewsViewMode;
  /** Set sort option */
  setSort: (sort: NewsSortOption) => void;
  /** Set view mode */
  setViewMode: (viewMode: NewsViewMode) => void;
  /** Reset all filters to defaults */
  resetFilters: () => void;
  /** Available sort options with labels */
  sortOptions: Array<{ value: NewsSortOption; label: string }>;
  /** Available view modes with labels */
  viewModeOptions: Array<{ value: NewsViewMode; label: string; icon: string }>;
}

// ============================================================================
// Constants
// ============================================================================

const SORT_OPTIONS: Array<{ value: NewsSortOption; label: string }> = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'date', label: 'Most Recent' },
];

const VIEW_MODE_OPTIONS: Array<{ value: NewsViewMode; label: string; icon: string }> = [
  { value: 'grid', label: 'Grid View', icon: 'grid' },
  { value: 'list', label: 'List View', icon: 'list' },
];

// ============================================================================
// Hook
// ============================================================================

/**
 * Manage filter and sort state for news articles
 *
 * @param options - Configuration options
 * @returns Filter state and functions
 *
 * @example
 * const {
 *   sort,
 *   viewMode,
 *   setSort,
 *   setViewMode,
 *   sortOptions
 * } = useNewsFilters();
 */
export function useNewsFilters(
  options: UseNewsFiltersOptions = {}
): UseNewsFiltersReturn {
  const {
    initialSort = 'relevance',
    initialViewMode = 'grid'
  } = options;

  // State
  const [sort, setSort] = useState<NewsSortOption>(initialSort);
  const [viewMode, setViewMode] = useState<NewsViewMode>(initialViewMode);

  // Combined filters object
  const filters = useMemo<NewsFilters>(() => ({
    sort,
    viewMode,
  }), [sort, viewMode]);

  // Reset function
  const resetFilters = useCallback(() => {
    setSort('relevance');
    setViewMode('grid');
  }, []);

  // Wrapped setters for additional logic if needed
  const handleSetSort = useCallback((newSort: NewsSortOption) => {
    setSort(newSort);
  }, []);

  const handleSetViewMode = useCallback((newViewMode: NewsViewMode) => {
    setViewMode(newViewMode);
  }, []);

  return {
    filters,
    sort,
    viewMode,
    setSort: handleSetSort,
    setViewMode: handleSetViewMode,
    resetFilters,
    sortOptions: SORT_OPTIONS,
    viewModeOptions: VIEW_MODE_OPTIONS,
  };
}

/**
 * Get display label for sort option
 *
 * @param sort - Sort option
 * @returns Display label
 */
export function getSortLabel(sort: NewsSortOption): string {
  const option = SORT_OPTIONS.find(opt => opt.value === sort);
  return option?.label ?? 'Unknown';
}

/**
 * Get display label for view mode
 *
 * @param viewMode - View mode
 * @returns Display label
 */
export function getViewModeLabel(viewMode: NewsViewMode): string {
  const option = VIEW_MODE_OPTIONS.find(opt => opt.value === viewMode);
  return option?.label ?? 'Unknown';
}

/**
 * Check if filters are at default values
 *
 * @param filters - Current filters
 * @returns Whether filters are at defaults
 */
export function areFiltersDefault(filters: NewsFilters): boolean {
  return filters.sort === 'relevance' && filters.viewMode === 'grid';
}
