/**
 * useExploreSorting Hook
 * Manages sorting state for the explore page
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { ExploreToken, ExploreSortOption } from '@/lib/types/explore.types';
import { applySorting } from '../utils/exploreSorting';

// ============================================================================
// Hook
// ============================================================================

/**
 * Manage sort state and apply sorting to token list
 *
 * @param tokens - Array of RWA tokens to sort
 * @returns Sorted tokens and sort control functions
 *
 * @example
 * const { sortedTokens, sortBy, setSortBy } = useExploreSorting(tokens);
 */
export function useExploreSorting(tokens: ExploreToken[]) {
  // Sort state - default to market cap descending
  const [sortBy, setSortBy] = useState<ExploreSortOption>('marketCap-desc');

  // Apply sorting with memoization
  const sortedTokens = useMemo(() => {
    return applySorting(tokens, sortBy);
  }, [tokens, sortBy]);

  // Update sort option
  const updateSort = useCallback((newSortBy: ExploreSortOption) => {
    setSortBy(newSortBy);
  }, []);

  return {
    sortedTokens,
    sortBy,
    setSortBy: updateSort,
  };
}
