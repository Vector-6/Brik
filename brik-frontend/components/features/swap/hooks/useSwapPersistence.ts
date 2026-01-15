'use client';

/**
 * useSwapPersistence Hook
 *
 * Single Responsibility: Persist and load swap execution state
 *
 * This hook is responsible ONLY for:
 * - Saving execution state to localStorage
 * - Loading execution state from localStorage
 * - Clearing persisted state
 * - Determining if state should be persisted based on status
 * - Providing flags for persisted state existence
 *
 * It does NOT:
 * - Execute swaps
 * - Validate state
 * - Manage execution logic
 * - Handle UI state
 */

import { useCallback, useEffect, useState } from 'react';
import {
  SwapExecutionStatus,
  type PersistedExecutionState,
} from '@/lib/types/lifi.types';

// =============================================================================
// Types
// =============================================================================

export interface UseSwapPersistenceReturn {
  persistedState: PersistedExecutionState | null;
  hasPersistedState: boolean;
  persistState: (state: PersistedExecutionState) => void;
  clearState: () => void;
  shouldPersist: (status: SwapExecutionStatus) => boolean;
}

// =============================================================================
// Constants
// =============================================================================

const STORAGE_KEY = 'brik_swap_execution_state';
const MAX_STATE_AGE_MS = 1000 * 60 * 60 * 24; // 24 hours

// Statuses that should be persisted (in-progress or recoverable states)
const PERSISTABLE_STATUSES = new Set<SwapExecutionStatus>([
  SwapExecutionStatus.APPROVING,
  SwapExecutionStatus.SIGNING,
  SwapExecutionStatus.EXECUTING,
  SwapExecutionStatus.CONFIRMING,
]);

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook for persisting swap execution state
 *
 * Uses localStorage to persist swap state for recovery after page reload.
 * Automatically loads state on mount and clears stale state.
 *
 * @returns Persistence state and controls
 */
export function useSwapPersistence(): UseSwapPersistenceReturn {
  // ===========================================================================
  // State
  // ===========================================================================

  const [persistedState, setPersistedState] =
    useState<PersistedExecutionState | null>(null);

  // ===========================================================================
  // Load State on Mount
  // ===========================================================================

  useEffect(() => {
    const loadedState = loadPersistedState();
    setPersistedState(loadedState);
  }, []);

  // ===========================================================================
  // Actions
  // ===========================================================================

  const persistState = useCallback((state: PersistedExecutionState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setPersistedState(state);
    } catch (error) {
      console.error('[useSwapPersistence] Failed to persist state:', error);
    }
  }, []);

  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setPersistedState(null);
    } catch (error) {
      console.error('[useSwapPersistence] Failed to clear state:', error);
    }
  }, []);

  const shouldPersist = useCallback((status: SwapExecutionStatus): boolean => {
    return PERSISTABLE_STATUSES.has(status);
  }, []);

  // ===========================================================================
  // Derived State
  // ===========================================================================

  const hasPersistedState = persistedState !== null;

  // ===========================================================================
  // Return Values
  // ===========================================================================

  return {
    persistedState,
    hasPersistedState,
    persistState,
    clearState,
    shouldPersist,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Load persisted state from localStorage
 * Returns null if:
 * - No state exists
 * - State is invalid
 * - State is too old
 */
function loadPersistedState(): PersistedExecutionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedExecutionState;

    // Validate structure
    if (!isValidPersistedState(parsed)) {
      console.warn('[useSwapPersistence] Invalid persisted state structure');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Check if state is too old
    const age = Date.now() - parsed.lastUpdate;
    if (age > MAX_STATE_AGE_MS) {
      console.info('[useSwapPersistence] Persisted state is too old, clearing');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('[useSwapPersistence] Failed to load persisted state:', error);
    return null;
  }
}

/**
 * Validate persisted state structure
 */
function isValidPersistedState(state: unknown): state is PersistedExecutionState {
  if (!state || typeof state !== 'object') {
    return false;
  }

  const s = state as Partial<PersistedExecutionState>;

  return (
    typeof s.status === 'string' &&
    typeof s.startTime === 'number' &&
    typeof s.lastUpdate === 'number' &&
    s.route !== null &&
    typeof s.route === 'object'
  );
}

export default useSwapPersistence;
