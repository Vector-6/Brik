/**
 * Transaction Filter Types
 * Type definitions for transaction filtering functionality
 */

import { TransactionStatusFilter } from '@/lib/api/types/transaction.types';

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Date range filter
 */
export interface DateRange {
  from?: Date;
  to?: Date;
}

/**
 * Transaction filters state
 */
export interface TransactionFilters {
  /** Status filter */
  status: TransactionStatusFilter;
  /** Chain ID filter */
  chainId?: number;
  /** Token symbol filter */
  token?: string;
  /** Date range filter */
  dateRange?: DateRange;
  /** Search query (transaction hash or wallet address) */
  search?: string;
}

/**
 * View mode for transactions
 */
export type TransactionViewMode = 'user' | 'platform';

// ============================================================================
// Filter Preset Types
// ============================================================================

export interface FilterPreset {
  label: string;
  filters: Partial<TransactionFilters>;
}

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_FILTERS: TransactionFilters = {
  status: 'DONE',
  chainId: undefined,
  token: undefined,
  dateRange: undefined,
  search: undefined,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: TransactionFilters): boolean {
  return (
    filters.status !== 'DONE' ||
    filters.chainId !== undefined ||
    filters.token !== undefined ||
    filters.dateRange !== undefined ||
    (filters.search !== undefined && filters.search.length > 0)
  );
}

/**
 * Clear all filters
 */
export function clearFilters(): TransactionFilters {
  return { ...DEFAULT_FILTERS };
}

/**
 * Count active filters
 */
export function countActiveFilters(filters: TransactionFilters): number {
  let count = 0;
  if (filters.status !== 'DONE') count++;
  if (filters.chainId !== undefined) count++;
  if (filters.token !== undefined) count++;
  if (filters.dateRange !== undefined) count++;
  if (filters.search && filters.search.length > 0) count++;
  return count;
}
