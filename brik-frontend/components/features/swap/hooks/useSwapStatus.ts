'use client';

/**
 * useSwapStatus Hook
 *
 * Single Responsibility: Derive overall swap status
 *
 * This hook is responsible ONLY for:
 * - Deriving the overall swap status from multiple status indicators
 * - Providing status-based flags (isLoading, isExecuting, etc.)
 * - Managing manual status overrides (e.g., REVIEWING state)
 * - Determining when to pause quote refresh
 *
 * It does NOT:
 * - Execute swaps
 * - Fetch quotes
 * - Manage execution state
 * - Handle modals
 */

import { useCallback, useMemo, useState } from 'react';
import { SwapExecutionStatus } from '@/lib/types/lifi.types';

// =============================================================================
// Types
// =============================================================================

export interface UseSwapStatusParams {
  executionStatus: SwapExecutionStatus;
  isQuoteLoading: boolean;
  isQuoteFetching: boolean;
  isQuoteDebouncing: boolean;
  hasQuote: boolean;
}

export interface UseSwapStatusReturn {
  status: SwapExecutionStatus;
  isLoading: boolean;
  isExecuting: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isCancelled: boolean;
  isIdle: boolean;
  shouldPauseRefresh: boolean;
  setManualStatus: (status: SwapExecutionStatus) => void;
  clearManualStatus: () => void;
}

// =============================================================================
// Constants
// =============================================================================

// Statuses that indicate active execution
const EXECUTING_STATUSES = new Set<SwapExecutionStatus>([
  SwapExecutionStatus.APPROVING,
  SwapExecutionStatus.SIGNING,
  SwapExecutionStatus.EXECUTING,
  SwapExecutionStatus.CONFIRMING,
]);

// Statuses that should pause quote refresh
const PAUSE_REFRESH_STATUSES = new Set<SwapExecutionStatus>([
  SwapExecutionStatus.REVIEWING,
  SwapExecutionStatus.APPROVING,
  SwapExecutionStatus.SIGNING,
  SwapExecutionStatus.EXECUTING,
  SwapExecutionStatus.CONFIRMING,
]);

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook for deriving overall swap status
 *
 * Combines execution status, quote loading state, and manual overrides
 * to provide a unified status representation.
 *
 * @param params - Status indicators
 * @returns Derived status and flags
 */
export function useSwapStatus(
  params: UseSwapStatusParams,
): UseSwapStatusReturn {
  const {
    executionStatus,
    isQuoteLoading,
    isQuoteFetching,
    isQuoteDebouncing,
    hasQuote,
  } = params;

  // ===========================================================================
  // State
  // ===========================================================================

  // Manual status override (e.g., for REVIEWING state)
  const [manualStatus, setManualStatus] = useState<SwapExecutionStatus | null>(
    null,
  );

  // ===========================================================================
  // Status Derivation
  // ===========================================================================

  const status = useMemo(() => {
    // Manual status takes precedence
    if (manualStatus !== null) {
      return manualStatus;
    }

    // If execution status is not IDLE, use it
    if (executionStatus !== SwapExecutionStatus.IDLE) {
      return executionStatus;
    }

    // Derive status from quote state
    if (isQuoteDebouncing) {
      return SwapExecutionStatus.FETCHING_QUOTE;
    }

    if (isQuoteLoading || isQuoteFetching) {
      return SwapExecutionStatus.FETCHING_QUOTE;
    }

    if (hasQuote) {
      return SwapExecutionStatus.QUOTE_READY;
    }

    return SwapExecutionStatus.IDLE;
  }, [
    manualStatus,
    executionStatus,
    isQuoteLoading,
    isQuoteFetching,
    isQuoteDebouncing,
    hasQuote,
  ]);

  // ===========================================================================
  // Status Flags
  // ===========================================================================

  const isLoading = useMemo(() => {
    return (
      status === SwapExecutionStatus.FETCHING_QUOTE ||
      isQuoteLoading ||
      isQuoteFetching
    );
  }, [status, isQuoteLoading, isQuoteFetching]);

  const isExecuting = useMemo(() => {
    return EXECUTING_STATUSES.has(status);
  }, [status]);

  const isCompleted = useMemo(() => {
    return status === SwapExecutionStatus.COMPLETED;
  }, [status]);

  const isFailed = useMemo(() => {
    return status === SwapExecutionStatus.FAILED;
  }, [status]);

  const isCancelled = useMemo(() => {
    return status === SwapExecutionStatus.CANCELLED;
  }, [status]);

  const isIdle = useMemo(() => {
    return status === SwapExecutionStatus.IDLE;
  }, [status]);

  const shouldPauseRefresh = useMemo(() => {
    return PAUSE_REFRESH_STATUSES.has(status);
  }, [status]);

  // ===========================================================================
  // Actions
  // ===========================================================================

  const handleSetManualStatus = useCallback((newStatus: SwapExecutionStatus) => {
    setManualStatus(newStatus);
  }, []);

  const handleClearManualStatus = useCallback(() => {
    setManualStatus(null);
  }, []);

  // ===========================================================================
  // Return Values
  // ===========================================================================

  return {
    status,
    isLoading,
    isExecuting,
    isCompleted,
    isFailed,
    isCancelled,
    isIdle,
    shouldPauseRefresh,
    setManualStatus: handleSetManualStatus,
    clearManualStatus: handleClearManualStatus,
  };
}

export default useSwapStatus;
