/**
 * Portfolio Filters Hook
 * Custom hook for filtering and sorting portfolio data
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  PortfolioBalance,
  PortfolioFilters,
  PortfolioSortBy,
  ChainPortfolioStats,
} from '@/lib/types/portfolio.types';

// ============================================================================
// Hook
// ============================================================================

/**
 * Filter and sort portfolio balances
 *
 * @param balances - Array of portfolio balances
 * @returns Filtered balances and filter controls
 */
export function usePortfolioFilters(balances: PortfolioBalance[]) {
  // Filter state
  const [filters, setFilters] = useState<PortfolioFilters>({
    selectedChains: [],
    hideZeroBalances: false,
    searchQuery: '',
  });

  // Sort state
  const [sortBy, setSortBy] = useState<PortfolioSortBy>('value-desc');

  // ============================================================================
  // Filter Functions
  // ============================================================================

  const setSelectedChains = useCallback((chains: number[]) => {
    setFilters((prev) => ({ ...prev, selectedChains: chains }));
  }, []);

  const toggleChain = useCallback((chainId: number) => {
    setFilters((prev) => ({
      ...prev,
      selectedChains: prev.selectedChains.includes(chainId)
        ? prev.selectedChains.filter((id) => id !== chainId)
        : [...prev.selectedChains, chainId],
    }));
  }, []);

  const setHideZeroBalances = useCallback((hide: boolean) => {
    setFilters((prev) => ({ ...prev, hideZeroBalances: hide }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      selectedChains: [],
      hideZeroBalances: false,
      searchQuery: '',
    });
  }, []);

  // ============================================================================
  // Filtered Balances
  // ============================================================================

  const filteredBalances = useMemo(() => {
    let result = [...balances];

    // Filter by chain
    if (filters.selectedChains.length > 0) {
      result = result.filter((balance) =>
        filters.selectedChains.includes(balance.chainId)
      );
    }

    // Hide zero balances
    if (filters.hideZeroBalances) {
      result = result.filter((balance) => balance.usdValue > 0);
    }

    // Search by symbol or name
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (balance) =>
          balance.symbol.toLowerCase().includes(query) ||
          balance.name.toLowerCase().includes(query)
      );
    }

    return result;
  }, [balances, filters]);

  // ============================================================================
  // Sorted Balances
  // ============================================================================

  const sortedBalances = useMemo(() => {
    const result = [...filteredBalances];

    switch (sortBy) {
      case 'value-desc':
        return result.sort((a, b) => b.usdValue - a.usdValue);

      case 'value-asc':
        return result.sort((a, b) => a.usdValue - b.usdValue);

      case 'balance-desc':
        return result.sort(
          (a, b) =>
            parseFloat(b.balanceFormatted) - parseFloat(a.balanceFormatted)
        );

      case 'balance-asc':
        return result.sort(
          (a, b) =>
            parseFloat(a.balanceFormatted) - parseFloat(b.balanceFormatted)
        );

      case 'name-asc':
        return result.sort((a, b) => a.name.localeCompare(b.name));

      case 'name-desc':
        return result.sort((a, b) => b.name.localeCompare(a.name));

      default:
        return result;
    }
  }, [filteredBalances, sortBy]);

  // ============================================================================
  // Chain Statistics
  // ============================================================================

  const chainStats = useMemo((): ChainPortfolioStats[] => {
    const totalValue = balances.reduce((sum, b) => sum + b.usdValue, 0);

    // Group by chain
    const chainMap = new Map<number, ChainPortfolioStats>();

    balances.forEach((balance) => {
      const existing = chainMap.get(balance.chainId);

      if (existing) {
        existing.totalValueUSD += balance.usdValue;
        existing.tokenCount += 1;
      } else {
        chainMap.set(balance.chainId, {
          chainId: balance.chainId,
          chainName: balance.chainName,
          totalValueUSD: balance.usdValue,
          tokenCount: 1,
          percentage: 0, // Will calculate below
        });
      }
    });

    // Calculate percentages and convert to array
    const stats = Array.from(chainMap.values()).map((stat) => ({
      ...stat,
      percentage: totalValue > 0 ? (stat.totalValueUSD / totalValue) * 100 : 0,
    }));

    // Sort by value descending
    return stats.sort((a, b) => b.totalValueUSD - a.totalValueUSD);
  }, [balances]);

  // ============================================================================
  // Active Filter Count
  // ============================================================================

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.selectedChains.length > 0) count++;
    if (filters.hideZeroBalances) count++;
    if (filters.searchQuery.trim()) count++;
    return count;
  }, [filters]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // Filtered/sorted data
    filteredBalances: sortedBalances,
    chainStats,

    // Filter state
    filters,
    setSelectedChains,
    toggleChain,
    setHideZeroBalances,
    setSearchQuery,
    clearFilters,
    activeFilterCount,

    // Sort state
    sortBy,
    setSortBy,
  };
}

/**
 * Get unique chains from balances
 *
 * @param balances - Array of portfolio balances
 * @returns Array of unique chain IDs and names
 */
export function useUniqueChains(balances: PortfolioBalance[]): Array<{
  chainId: number;
  chainName: string;
}> {
  return useMemo(() => {
    const chainMap = new Map<number, string>();

    balances.forEach((balance) => {
      if (!chainMap.has(balance.chainId)) {
        chainMap.set(balance.chainId, balance.chainName);
      }
    });

    return Array.from(chainMap.entries())
      .map(([chainId, chainName]) => ({ chainId, chainName }))
      .sort((a, b) => a.chainId - b.chainId);
  }, [balances]);
}
