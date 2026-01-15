'use client';

/**
 * useSwapState Hook (Refactored)
 *
 * Single Responsibility: Orchestrate the complete swap lifecycle
 *
 * This hook is responsible ONLY for:
 * - Coordinating between specialized hooks (form, quote, execution, modals, etc.)
 * - Managing state transitions and lifecycle
 * - Providing a unified interface for swap operations
 * - Syncing state between coordinated hooks
 *
 * It does NOT directly:
 * - Manage primitive state (delegated to specialized hooks)
 * - Implement business logic (delegated to specialized hooks)
 * - Handle localStorage (delegated to useSwapPersistence)
 * - Derive status (delegated to useSwapStatus)
 *
 * This follows the Orchestrator Pattern and Single Responsibility Principle.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Token } from '@/lib/types/token.types';
import {
  SwapExecutionStatus,
  SwapModalType,
  type PersistedExecutionState,
  type QuoteComparison,
  type QuoteFreshness,
  type RouteExtended,
  type SwapExecutionError,
  type SwapModalState,
} from '@/lib/types/lifi.types';

import {
  useSwapQuote,
  type SwapQuoteDerivedValues,
  type SwapQuoteError,
} from './useSwapQuote';
import { useSwapValidation } from './useSwapValidation';
import type { SwapValidationErrors } from '../utils/swapValidation';
import { useQuoteRefresh } from './useQuoteRefresh';
import {
  useRouteExecution,
  type UseRouteExecutionReturn,
} from './useRouteExecution';
import { useSwapForm, type SwapFormState } from './useSwapForm';
import { useSwapModals } from './useSwapModals';
import { useSwapPersistence } from './useSwapPersistence';
import { useSwapStatus } from './useSwapStatus';

// =============================================================================
// Types
// =============================================================================

/**
 * Approval state (passed through from container/token approval hook)
 */
export interface SwapApprovalState {
  isRequired: boolean;
  isApproving: boolean;
  isApproved: boolean;
  txHash?: string;
  error?: SwapExecutionError | null;
}

interface SwapQuoteState {
  route: RouteExtended | null;
  isLoading: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  isDebouncing: boolean;
  fromAmountWei: string | null;
  debouncedAmount: string;
  error: SwapQuoteError | null;
  derived: SwapQuoteDerivedValues;
  freshness: QuoteFreshness | null;
  comparison: QuoteComparison | null;
  updatedAt: number | null;
  refetch: () => Promise<void>;
}

interface SwapValidationState {
  isValid: boolean;
  errors: SwapValidationErrors;
  canExecute: boolean;
}

interface SwapRefreshState {
  secondsUntilRefresh: number;
  isStale: boolean;
  refresh: () => Promise<void>;
  resetTimer: () => void;
  pause: () => void;
  resume: () => void;
  isAutoRefreshActive: boolean;
}

interface SwapExecutionControls
  extends Pick<
    UseRouteExecutionReturn,
    | 'reset'
    | 'cancel'
    | 'isExecuting'
    | 'isReady'
    | 'setExecuteInBackground'
    | 'isBackgroundExecution'
  > {
  state: UseRouteExecutionReturn['state'];
  execute: (route?: RouteExtended | null) => Promise<RouteExtended | null>;
  resume: (route?: RouteExtended | null) => Promise<RouteExtended | null>;
}

interface SwapApprovalControls {
  state: SwapApprovalState;
  update: (patch: Partial<SwapApprovalState>) => void;
  reset: () => void;
}

interface SwapPersistenceState {
  persistedState: PersistedExecutionState | null;
  hasPersistedState: boolean;
  resumePersistedRoute: () => Promise<RouteExtended | null>;
  clearPersistedState: () => void;
}

interface SwapActions {
  beginReview: () => void;
  cancelReview: () => void;
  confirmSwap: () => Promise<RouteExtended | null>;
}

export interface UseSwapStateParams {
  tokens: Token[];
  slippage: number; // percentage (e.g. 0.5 for 0.5%)
  walletAddress?: string | null;
  toAddress?: string | null;
  feePercentage?: number;
  autoRefreshEnabled?: boolean;
  initialToToken?: Token | null; // Initial "to" token (e.g., from URL parameter)
}

export interface UseSwapStateReturn {
  form: SwapFormState;
  setFromToken: (token: Token | null) => void;
  setToToken: (token: Token | null) => void;
  setFromAmount: (value: string) => void;
  switchTokens: () => void;
  resetForm: () => void;
  tokens: {
    availableFrom: Token[];
    availableTo: Token[];
  };
  validation: SwapValidationState;
  quote: SwapQuoteState;
  status: SwapExecutionStatus;
  modal: SwapModalState;
  openModal: (type: SwapModalType, data?: unknown) => void;
  closeModal: () => void;
  actions: SwapActions;
  approval: SwapApprovalControls;
  execution: SwapExecutionControls;
  refresh: SwapRefreshState;
  lastError: SwapExecutionError | null;
  clearError: () => void;
  persistence: SwapPersistenceState;
  conversionRate: number;
  activeRoute: RouteExtended | null;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_APPROVAL_STATE: SwapApprovalState = {
  isRequired: false,
  isApproving: false,
  isApproved: false,
  txHash: undefined,
  error: null,
};

// =============================================================================
// Helper Function
// =============================================================================

function cloneRoute(route: RouteExtended): RouteExtended {
  if (typeof structuredClone === 'function') {
    return structuredClone(route);
  }
  return JSON.parse(JSON.stringify(route)) as RouteExtended;
}

// =============================================================================
// Main Hook (Orchestrator)
// =============================================================================

/**
 * Orchestrator hook for the complete swap lifecycle
 *
 * This hook coordinates between specialized hooks to provide a unified
 * interface for swap operations. It delegates specific concerns to focused
 * hooks, maintaining the Single Responsibility Principle.
 *
 * @param params - Configuration parameters
 * @returns Unified swap state and controls
 */
export function useSwapState(params: UseSwapStateParams): UseSwapStateReturn {
  const {
    tokens,
    slippage,
    walletAddress,
    toAddress,
    feePercentage,
    autoRefreshEnabled = true,
    initialToToken = null,
  } = params;

  // ===========================================================================
  // Specialized Hooks (Delegation)
  // ===========================================================================

  // Form state management
  const swapForm = useSwapForm({ tokens, initialToToken });

  // Modal state management
  const swapModals = useSwapModals();

  // Persistence management
  const swapPersistence = useSwapPersistence();

  // Validation
  const validationResult = useSwapValidation(
    swapForm.form.fromToken,
    swapForm.form.toToken,
    swapForm.form.fromAmount,
  );

  // Quote fetching
  const swapQuote = useSwapQuote({
    fromToken: swapForm.form.fromToken,
    toToken: swapForm.form.toToken,
    fromAmount: swapForm.form.fromAmount,
    slippage,
    walletAddress,
    toAddress,
    enabled: validationResult.canExecute,
    feePercentage,
  });

  // ===========================================================================
  // Local State (for coordination)
  // ===========================================================================

  const lockedRouteRef = useRef<RouteExtended | null>(null);
  const [approvalState, setApprovalState] = useState<SwapApprovalState>(
    DEFAULT_APPROVAL_STATE,
  );

  // ===========================================================================
  // Callbacks for Route Execution
  // ===========================================================================

  const handleStatusChange = useCallback((nextStatus: SwapExecutionStatus) => {
    // Status changes are handled by useSwapStatus
    // This callback exists for potential side effects
    console.debug('[useSwapState] Status changed to:', nextStatus);
  }, []);

  const handleRouteUpdate = useCallback((updatedRoute: RouteExtended) => {
    // Update locked route when route updates during execution
    lockedRouteRef.current = cloneRoute(updatedRoute);
  }, []);

  const handleExecutionError = useCallback(
    (error: SwapExecutionError) => {
      // Open error modal
      swapModals.openModal(SwapModalType.ERROR, error);
    },
    [swapModals],
  );

  const handleExecutionSuccess = useCallback(
    (route: RouteExtended) => {
      // Update locked route and open success modal
      lockedRouteRef.current = cloneRoute(route);
      swapModals.openModal(SwapModalType.SUCCESS, route);
      // Reset approval state on success
      setApprovalState(DEFAULT_APPROVAL_STATE);
    },
    [swapModals],
  );

  // Route execution
  const routeExecution = useRouteExecution({
    callbacks: {
      onStatusChange: handleStatusChange,
      onRouteUpdate: handleRouteUpdate,
      onError: handleExecutionError,
      onSuccess: handleExecutionSuccess,
    },
  });

  // Status derivation
  const swapStatus = useSwapStatus({
    executionStatus: routeExecution.state.status,
    isQuoteLoading: swapQuote.isLoading,
    isQuoteFetching: swapQuote.isFetching,
    isQuoteDebouncing: swapQuote.isDebouncing,
    hasQuote: Boolean(swapQuote.quote),
  });

  // Quote refresh
  const quoteRefresh = useQuoteRefresh({
    enabled: autoRefreshEnabled && Boolean(swapQuote.quote),
    onRefresh: async () => {
      await swapQuote.refetch();
    },
  });

  // ===========================================================================
  // Extract stable methods/values to avoid infinite loops
  // ===========================================================================
  // IMPORTANT: All extractions must happen BEFORE any useEffect hooks
  // to ensure dependency arrays have consistent lengths across renders

  // From quoteRefresh (wrapped in useCallback)
  const { pause: pauseRefresh, resume: resumeRefresh, resetTimer: resetRefreshTimer } = quoteRefresh;

  // From swapForm (wrapped in useCallback)
  const currentToAmount = swapForm.form.toAmount;
  const setToAmountAction = swapForm.setToAmount;

  // From swapPersistence (wrapped in useCallback)
  const persistStateAction = swapPersistence.persistState;
  const clearStateAction = swapPersistence.clearState;
  const shouldPersistCheck = swapPersistence.shouldPersist;

  // ===========================================================================
  // Effects (State Synchronization)
  // ===========================================================================

  // Sync toAmount from quote to form
  useEffect(() => {
    const nextToAmount = swapQuote.derived.toAmount ?? '';
    if (currentToAmount !== nextToAmount) {
      setToAmountAction(nextToAmount);
    }
  }, [swapQuote.derived.toAmount, currentToAmount, setToAmountAction]);

  // Manage quote refresh based on status
  useEffect(() => {
    if (!autoRefreshEnabled) {
      pauseRefresh();
      return;
    }

    if (swapStatus.shouldPauseRefresh) {
      pauseRefresh();
    } else {
      resumeRefresh();
    }
  }, [autoRefreshEnabled, swapStatus.shouldPauseRefresh, pauseRefresh, resumeRefresh]);

  // Reset refresh timer when quote updates
  useEffect(() => {
    if (swapQuote.updatedAt) {
      resetRefreshTimer();
    }
  }, [swapQuote.updatedAt, resetRefreshTimer]);

  // Persist execution state
  useEffect(() => {
    const { route, status, startTime } = routeExecution.state;

    if (!route || !shouldPersistCheck(status)) {
      clearStateAction();
      return;
    }

    const payload: PersistedExecutionState = {
      route: cloneRoute(route),
      status,
      startTime: startTime ?? Date.now(),
      lastUpdate: Date.now(),
    };

    persistStateAction(payload);
  }, [routeExecution.state, persistStateAction, clearStateAction, shouldPersistCheck]);

  // ===========================================================================
  // Approval State Management (Temporary - should be removed once integrated)
  // ===========================================================================

  const updateApprovalState = useCallback((patch: Partial<SwapApprovalState>) => {
    setApprovalState((previous: SwapApprovalState) => ({
      ...previous,
      ...patch,
    }));
  }, []);

  const resetApprovalState = useCallback(() => {
    setApprovalState(DEFAULT_APPROVAL_STATE);
  }, []);

  // ===========================================================================
  // Coordinated Actions
  // ===========================================================================

  const clearReviewState = useCallback(() => {
    swapStatus.clearManualStatus();
    lockedRouteRef.current = null;
    resetApprovalState();
    if (swapModals.isModalType(SwapModalType.REVIEW)) {
      swapModals.closeModal();
    }
  }, [resetApprovalState, swapModals, swapStatus]);

  const beginReview = useCallback(() => {
    if (!swapQuote.quote || !swapForm.form.fromToken || !swapForm.form.toToken) {
      return;
    }

    lockedRouteRef.current = cloneRoute(swapQuote.quote);
    swapStatus.setManualStatus(SwapExecutionStatus.REVIEWING);
    swapModals.openModal(SwapModalType.REVIEW, swapQuote.quote);
  }, [swapForm.form.fromToken, swapForm.form.toToken, swapModals, swapQuote.quote, swapStatus]);

  const cancelReview = useCallback(() => {
    clearReviewState();
  }, [clearReviewState]);

  const confirmSwap = useCallback(async () => {
    const targetRoute = lockedRouteRef.current ?? swapQuote.quote;

    if (!targetRoute) {
      return null;
    }

    lockedRouteRef.current = cloneRoute(targetRoute);
    swapStatus.clearManualStatus();
    swapModals.openModal(SwapModalType.EXECUTION, targetRoute);

    const result = await routeExecution.execute(targetRoute);
    return result;
  }, [routeExecution, swapModals, swapQuote.quote, swapStatus]);

  const executeRoute = useCallback(
    async (route?: RouteExtended | null) => {
      const targetRoute = route ?? lockedRouteRef.current ?? swapQuote.quote;

      if (!targetRoute) {
        return null;
      }

      lockedRouteRef.current = cloneRoute(targetRoute);
      const result = await routeExecution.execute(targetRoute);
      return result;
    },
    [routeExecution, swapQuote.quote],
  );

  const resumeRoute = useCallback(
    async (route?: RouteExtended | null) => {
      const targetRoute = route ?? lockedRouteRef.current;

      if (!targetRoute) {
        return null;
      }

      lockedRouteRef.current = cloneRoute(targetRoute);
      const result = await routeExecution.resume(targetRoute);
      return result;
    },
    [routeExecution],
  );

  const resumePersistedRoute = useCallback(async () => {
    if (!swapPersistence.persistedState) {
      return null;
    }

    const { route } = swapPersistence.persistedState;
    lockedRouteRef.current = cloneRoute(route);
    swapModals.openModal(SwapModalType.EXECUTION, route);

    const result = await routeExecution.resume(route);
    return result;
  }, [routeExecution, swapModals, swapPersistence.persistedState]);

  const cancelExecution = useCallback(() => {
    const cancelled = routeExecution.cancel();
    if (cancelled) {
      lockedRouteRef.current = cloneRoute(cancelled);
      swapPersistence.clearState();
      swapModals.closeModal();
    }
    return cancelled;
  }, [routeExecution, swapModals, swapPersistence]);

  const resetExecution = useCallback(() => {
    routeExecution.reset();
    swapPersistence.clearState();
    lockedRouteRef.current = null;
    swapStatus.clearManualStatus();
  }, [routeExecution, swapPersistence, swapStatus]);

  const clearError = useCallback(() => {
    if (swapModals.isModalType(SwapModalType.ERROR)) {
      swapModals.closeModal();
    }
  }, [swapModals]);

  // ===========================================================================
  // Form Actions (with side effects)
  // ===========================================================================

  const setFromToken = useCallback(
    (token: Token | null) => {
      swapForm.setFromToken(token);
      clearReviewState();
    },
    [clearReviewState, swapForm],
  );

  const setToToken = useCallback(
    (token: Token | null) => {
      swapForm.setToToken(token);
      clearReviewState();
    },
    [clearReviewState, swapForm],
  );

  const setFromAmount = useCallback(
    (value: string) => {
      swapForm.setFromAmount(value);
      clearReviewState();
    },
    [clearReviewState, swapForm],
  );

  const switchTokens = useCallback(() => {
    swapForm.switchTokens();
    clearReviewState();
  }, [clearReviewState, swapForm]);

  const resetForm = useCallback(() => {
    swapForm.resetForm();
    clearReviewState();
  }, [clearReviewState, swapForm]);

  // ===========================================================================
  // Computed Values
  // ===========================================================================

  const activeRoute = lockedRouteRef.current ?? swapQuote.quote;

  const lastError = useMemo(() => {
    if (swapModals.isModalType(SwapModalType.ERROR)) {
      return (swapModals.modal.data as SwapExecutionError) ?? null;
    }
    return routeExecution.state.error;
  }, [routeExecution.state.error, swapModals]);

  // ===========================================================================
  // Return Values (Unified Interface)
  // ===========================================================================

  const refetchQuote = useCallback(async () => {
    await swapQuote.refetch();
  }, [swapQuote]);

  const validation: SwapValidationState = useMemo(
    () => ({
      isValid: validationResult.isValidSwap,
      errors: validationResult.errors,
      canExecute: validationResult.canExecute,
    }),
    [validationResult],
  );

  const quote: SwapQuoteState = useMemo(
    () => ({
      route: swapQuote.quote,
      isLoading: swapQuote.isLoading,
      isFetching: swapQuote.isFetching,
      isRefetching: swapQuote.isRefetching,
      isDebouncing: swapQuote.isDebouncing,
      fromAmountWei: swapQuote.fromAmountWei,
      debouncedAmount: swapQuote.debouncedAmount,
      error: swapQuote.error,
      derived: swapQuote.derived,
      freshness: swapQuote.freshness,
      comparison: swapQuote.comparison,
      updatedAt: swapQuote.updatedAt,
      refetch: refetchQuote,
    }),
    [refetchQuote, swapQuote],
  );

  const refresh: SwapRefreshState = useMemo(
    () => ({
      secondsUntilRefresh: quoteRefresh.secondsUntilRefresh,
      isStale: quoteRefresh.isStale,
      refresh: quoteRefresh.refresh,
      resetTimer: quoteRefresh.resetTimer,
      pause: quoteRefresh.pause,
      resume: quoteRefresh.resume,
      isAutoRefreshActive: quoteRefresh.isAutoRefreshActive,
    }),
    [quoteRefresh],
  );

  const approval: SwapApprovalControls = useMemo(
    () => ({
      state: approvalState,
      update: updateApprovalState,
      reset: resetApprovalState,
    }),
    [approvalState, resetApprovalState, updateApprovalState],
  );

  const execution: SwapExecutionControls = useMemo(
    () => ({
      state: routeExecution.state,
      execute: executeRoute,
      resume: resumeRoute,
      cancel: cancelExecution,
      reset: resetExecution,
      isExecuting: routeExecution.isExecuting,
      isReady: routeExecution.isReady,
      setExecuteInBackground: routeExecution.setExecuteInBackground,
      isBackgroundExecution: routeExecution.isBackgroundExecution,
    }),
    [
      cancelExecution,
      executeRoute,
      resetExecution,
      resumeRoute,
      routeExecution.isBackgroundExecution,
      routeExecution.isExecuting,
      routeExecution.isReady,
      routeExecution.setExecuteInBackground,
      routeExecution.state,
    ],
  );

  const persistence: SwapPersistenceState = useMemo(
    () => ({
      persistedState: swapPersistence.persistedState,
      hasPersistedState: swapPersistence.hasPersistedState,
      resumePersistedRoute,
      clearPersistedState: swapPersistence.clearState,
    }),
    [
      resumePersistedRoute,
      swapPersistence.hasPersistedState,
      swapPersistence.persistedState,
      swapPersistence.clearState,
    ],
  );

  const actions: SwapActions = useMemo(
    () => ({
      beginReview,
      cancelReview,
      confirmSwap,
    }),
    [beginReview, cancelReview, confirmSwap],
  );

  return {
    // Form
    form: swapForm.form,
    setFromToken,
    setToToken,
    setFromAmount,
    switchTokens,
    resetForm,
    tokens: {
      availableFrom: swapForm.availableFromTokens,
      availableTo: swapForm.availableToTokens,
    },

    // Validation
    validation,

    // Quote
    quote,

    // Status
    status: swapStatus.status,

    // Modals
    modal: swapModals.modal,
    openModal: swapModals.openModal,
    closeModal: swapModals.closeModal,

    // Actions
    actions,

    // Approval
    approval,

    // Execution
    execution,

    // Refresh
    refresh,

    // Error handling
    lastError,
    clearError,

    // Persistence
    persistence,

    // Computed
    conversionRate: swapQuote.derived.conversionRate,
    activeRoute,
  };
}

export default useSwapState;
