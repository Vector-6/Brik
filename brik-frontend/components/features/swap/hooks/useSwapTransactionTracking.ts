'use client';

/**
 * useSwapTransactionTracking Hook
 *
 * Main hook for tracking swap transactions following SRP.
 * Orchestrates storage and formatting operations without implementing them directly.
 *
 * Responsibilities:
 * - Track swap executions automatically via callbacks
 * - Store transactions locally and optionally sync with backend
 * - Provide transaction history access
 * - Handle status updates for pending transactions
 * - Cleanup on unmount
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RouteExtended } from '@lifi/sdk';

import type { Transaction } from '@/lib/api/types/transaction.types';
import { SwapExecutionStatus } from '@/lib/types/lifi.types';
import {
  saveSwapTransaction,
  getAllSwapTransactions,
  getSwapTransaction,
  clearSwapTransactions,
  getSwapTransactionCount,
  isStorageAvailable,
} from '@/lib/utils/swapTransactionStorage';
import {
  routeToTransaction,
  updateTransactionFromRoute,
  createTransactionPlaceholder,
  isRouteTrackable,
} from '@/lib/utils/swapTransactionFormatter';

// ============================================================================
// Types
// ============================================================================

export interface UseSwapTransactionTrackingOptions {
  /** Wallet address for filtering user-specific transactions */
  walletAddress?: string;
  /** Enable automatic tracking of swap executions (default: true) */
  autoTrack?: boolean;
  /** Enable console logging for debugging (default: false) */
  debug?: boolean;
}

export interface UseSwapTransactionTrackingReturn {
  /** Track a new swap transaction */
  trackTransaction: (route: RouteExtended, walletAddress: string, status?: SwapExecutionStatus) => boolean;
  /** Update an existing transaction with new route data */
  updateTransaction: (route: RouteExtended) => boolean;
  /** Get all tracked transactions */
  getTransactions: (walletAddress?: string) => Transaction[];
  /** Get a specific transaction by ID or txHash */
  getTransaction: (identifier: string) => Transaction | null;
  /** Clear all transactions (optionally for specific wallet) */
  clearTransactions: (walletAddress?: string) => boolean;
  /** Get count of tracked transactions */
  getCount: (walletAddress?: string) => number;
  /** Check if tracking is available (localStorage working) */
  isAvailable: boolean;
  /** Recent transactions (for quick access) */
  recentTransactions: Transaction[];
  /** Refresh recent transactions */
  refreshRecentTransactions: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for tracking swap transactions
 *
 * @param options - Configuration options
 * @returns Transaction tracking API
 *
 * @example
 * // Basic usage with auto-tracking
 * const tracking = useSwapTransactionTracking({
 *   walletAddress: '0x123...',
 *   autoTrack: true
 * });
 *
 * // Manual tracking
 * tracking.trackTransaction(route, walletAddress, SwapExecutionStatus.COMPLETED);
 *
 * // Get transaction history
 * const transactions = tracking.getTransactions();
 */
export function useSwapTransactionTracking(
  options: UseSwapTransactionTrackingOptions = {}
): UseSwapTransactionTrackingReturn {
  const {
    walletAddress,
    autoTrack = true,
    debug = false,
  } = options;

  // ============================================================================
  // State
  // ============================================================================

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isAvailable] = useState(() => isStorageAvailable());

  // Track active swap routes to avoid duplicate tracking
  const trackedRoutesRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(true);

  // ============================================================================
  // Logging Helper
  // ============================================================================

  const log = useCallback(
    (message: string, ...args: unknown[]) => {
      if (debug) {
        console.log(`[SwapTracking] ${message}`, ...args);
      }
    },
    [debug]
  );

  // ============================================================================
  // Core Tracking Functions
  // ============================================================================

  /**
   * Track a new swap transaction
   */
  const trackTransaction = useCallback(
    (route: RouteExtended, walletAddr: string, status?: SwapExecutionStatus): boolean => {
      if (!isAvailable) {
        log('Storage not available, skipping tracking');
        return false;
      }

      // Check if route has already been tracked
      const routeId = route.id || '';
      if (routeId && trackedRoutesRef.current.has(routeId)) {
        log('Route already tracked:', routeId);
        return false;
      }

      try {
        // Check if route is trackable (has transaction hash)
        if (!isRouteTrackable(route)) {
          log('Route not yet trackable (no tx hash), creating placeholder');
          const placeholder = createTransactionPlaceholder(route, walletAddr);
          const saved = saveSwapTransaction(placeholder);
          if (saved) {
            log('Placeholder transaction saved:', placeholder.id);
            if (routeId) {
              trackedRoutesRef.current.add(routeId);
            }
          }
          return saved;
        }

        // Convert route to transaction
        const transaction = routeToTransaction(route, walletAddr, status);

        // Save to storage
        const saved = saveSwapTransaction(transaction);

        if (saved) {
          log('Transaction tracked:', transaction.id, transaction.txHash);
          if (routeId) {
            trackedRoutesRef.current.add(routeId);
          }
        } else {
          log('Failed to save transaction');
        }

        return saved;
      } catch (error) {
        console.error('[SwapTracking] Error tracking transaction:', error);
        return false;
      }
    },
    [isAvailable, log]
  );

  /**
   * Update an existing transaction with new route data
   */
  const updateTransaction = useCallback(
    (route: RouteExtended): boolean => {
      if (!isAvailable) {
        return false;
      }

      try {
        // Find existing transaction by route ID or transaction hash
        const routeId = route.id || '';
        let existingTransaction: Transaction | null = null;

        if (routeId) {
          existingTransaction = getSwapTransaction(`swap-${routeId}`);
        }

        // If not found by route ID, try to find by transaction hash
        if (!existingTransaction && isRouteTrackable(route)) {
          const processes = route.steps.flatMap(step => step.execution?.process ?? []);
          for (const process of processes) {
            if (process.txHash) {
              existingTransaction = getSwapTransaction(process.txHash);
              if (existingTransaction) break;
            }
          }
        }

        if (!existingTransaction) {
          log('No existing transaction found to update');
          return false;
        }

        // Update transaction with new route data
        const updatedTransaction = updateTransactionFromRoute(existingTransaction, route);
        const saved = saveSwapTransaction(updatedTransaction);

        if (saved) {
          log('Transaction updated:', updatedTransaction.id);
        }

        return saved;
      } catch (error) {
        console.error('[SwapTracking] Error updating transaction:', error);
        return false;
      }
    },
    [isAvailable, log]
  );

  /**
   * Get all tracked transactions
   */
  const getTransactions = useCallback(
    (walletAddr?: string): Transaction[] => {
      if (!isAvailable) {
        return [];
      }

      try {
        const transactions = getAllSwapTransactions({
          walletAddress: walletAddr || walletAddress,
        });
        log('Retrieved transactions:', transactions.length);
        return transactions;
      } catch (error) {
        console.error('[SwapTracking] Error getting transactions:', error);
        return [];
      }
    },
    [isAvailable, walletAddress, log]
  );

  /**
   * Get a specific transaction
   */
  const getTransaction = useCallback(
    (identifier: string): Transaction | null => {
      if (!isAvailable) {
        return null;
      }

      try {
        return getSwapTransaction(identifier);
      } catch (error) {
        console.error('[SwapTracking] Error getting transaction:', error);
        return null;
      }
    },
    [isAvailable]
  );

  /**
   * Clear all transactions
   */
  const clearTransactions = useCallback(
    (walletAddr?: string): boolean => {
      if (!isAvailable) {
        return false;
      }

      try {
        const cleared = clearSwapTransactions(walletAddr || walletAddress);
        if (cleared) {
          log('Transactions cleared for wallet:', walletAddr || walletAddress || 'all');
          trackedRoutesRef.current.clear();
        }
        return cleared;
      } catch (error) {
        console.error('[SwapTracking] Error clearing transactions:', error);
        return false;
      }
    },
    [isAvailable, walletAddress, log]
  );

  /**
   * Get count of tracked transactions
   */
  const getCount = useCallback(
    (walletAddr?: string): number => {
      if (!isAvailable) {
        return 0;
      }

      try {
        return getSwapTransactionCount(walletAddr || walletAddress);
      } catch (error) {
        console.error('[SwapTracking] Error getting transaction count:', error);
        return 0;
      }
    },
    [isAvailable, walletAddress]
  );

  /**
   * Refresh recent transactions (for UI)
   */
  const refreshRecentTransactions = useCallback(() => {
    if (!isAvailable || !isMountedRef.current) {
      return;
    }

    try {
      const transactions = getAllSwapTransactions({
        walletAddress,
        limit: 10, // Get 10 most recent
      });
      setRecentTransactions(transactions);
      log('Recent transactions refreshed:', transactions.length);
    } catch (error) {
      console.error('[SwapTracking] Error refreshing recent transactions:', error);
    }
  }, [isAvailable, walletAddress, log]);

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Load recent transactions on mount and when wallet changes
   */
  useEffect(() => {
    if (autoTrack && isAvailable) {
      refreshRecentTransactions();
    }
  }, [autoTrack, isAvailable, refreshRecentTransactions]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    trackTransaction,
    updateTransaction,
    getTransactions,
    getTransaction,
    clearTransactions,
    getCount,
    isAvailable,
    recentTransactions,
    refreshRecentTransactions,
  };
}

/**
 * Create transaction tracking callbacks for useRouteExecution
 *
 * This helper creates the callback functions that can be passed to useRouteExecution
 * to automatically track swap transactions.
 *
 * @param tracking - Transaction tracking API from useSwapTransactionTracking
 * @param walletAddress - User's wallet address
 * @returns Callbacks object for useRouteExecution
 *
 * @example
 * const tracking = useSwapTransactionTracking({ walletAddress });
 * const execution = useRouteExecution({
 *   callbacks: createTrackingCallbacks(tracking, walletAddress)
 * });
 */
export function createTrackingCallbacks(
  tracking: UseSwapTransactionTrackingReturn,
  walletAddress: string | null
) {
  if (!walletAddress) {
    return {};
  }

  return {
    onRouteUpdate: (route: RouteExtended) => {
      // Track or update transaction on route update
      if (isRouteTrackable(route)) {
        // Try to update first, if no existing transaction, track new one
        const updated = tracking.updateTransaction(route);
        if (!updated) {
          tracking.trackTransaction(route, walletAddress);
        }
      }
    },
    onSuccess: (route: RouteExtended) => {
      // Ensure completed swap is tracked
      tracking.trackTransaction(route, walletAddress, SwapExecutionStatus.COMPLETED);
      tracking.refreshRecentTransactions();
    },
    onError: (error: unknown) => {
      // Could track failed swaps here if route is available
      console.log('[SwapTracking] Swap error:', error);
    },
  };
}
