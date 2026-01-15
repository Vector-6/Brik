'use client';

/**
 * useTransactionFilters Hook
 * Manages transaction filter state and updates
 */

import { useState, useCallback } from 'react';
import {
  TransactionFilters,
  DateRange,
  DEFAULT_FILTERS,
  hasActiveFilters,
  clearFilters as clearAllFilters,
  countActiveFilters,
  TransactionViewMode,
} from '../types/filter.types';
import { TransactionStatusFilter } from '@/lib/api/types/transaction.types';

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UseTransactionFiltersReturn {
  /** Current filters state */
  filters: TransactionFilters;
  /** Current view mode (user or platform) */
  viewMode: TransactionViewMode;
  /** Update status filter */
  setStatus: (status: TransactionStatusFilter) => void;
  /** Update chain filter */
  setChainId: (chainId?: number) => void;
  /** Update token filter */
  setToken: (token?: string) => void;
  /** Update date range filter */
  setDateRange: (range?: DateRange) => void;
  /** Update search query */
  setSearch: (search?: string) => void;
  /** Set view mode */
  setViewMode: (mode: TransactionViewMode) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Check if any filters are active */
  isFiltersActive: boolean;
  /** Count of active filters */
  activeFilterCount: number;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing transaction filters
 *
 * @returns Filter state and control methods
 *
 * @example
 * const { filters, setStatus, clearFilters, activeFilterCount } = useTransactionFilters();
 */
export function useTransactionFilters(): UseTransactionFiltersReturn {
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<TransactionViewMode>('platform');

  // ============================================================================
  // Update Methods
  // ============================================================================

  const setStatus = useCallback((status: TransactionStatusFilter) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setChainId = useCallback((chainId?: number) => {
    setFilters((prev) => ({ ...prev, chainId }));
  }, []);

  const setToken = useCallback((token?: string) => {
    setFilters((prev) => ({ ...prev, token }));
  }, []);

  const setDateRange = useCallback((range?: DateRange) => {
    setFilters((prev) => ({ ...prev, dateRange: range }));
  }, []);

  const setSearch = useCallback((search?: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(clearAllFilters());
  }, []);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const isFiltersActive = hasActiveFilters(filters);
  const activeFilterCount = countActiveFilters(filters);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    filters,
    viewMode,
    setStatus,
    setChainId,
    setToken,
    setDateRange,
    setSearch,
    setViewMode,
    clearFilters,
    isFiltersActive,
    activeFilterCount,
  };
}
