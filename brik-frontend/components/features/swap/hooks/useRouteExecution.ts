"use client";

import { useCallback, useRef, useState, type MutableRefObject } from "react";
import {
  executeRoute as executeRouteSdk,
  resumeRoute as resumeRouteSdk,
  stopRouteExecution,
  updateRouteExecution,
  type AcceptExchangeRateUpdateHook,
  type ExecutionOptions,
  type LiFiStepExtended,
  type Process,
  type ProcessStatus,
  type RouteExtended,
  type SwitchChainHook,
} from "@lifi/sdk";
import { type WalletClient } from "viem";
import { useWalletClient } from "wagmi";

import {
  SwapExecutionStatus,
  SwapErrorType,
  type ExecutionCallbacks,
  type ExecutionProgress,
  type ExchangeRateChange,
  type RouteExecutionState,
  type StepTransaction,
  type SwapExecutionError,
} from "@/lib/types/lifi.types";
import type { WalletErrorType } from "@/lib/types/wallet.types";
import {
  classifyWalletError,
  getWalletErrorMessage,
} from "@/lib/utils/walletErrors";

// =============================================================================
// Constants & Initial State
// =============================================================================

const TERMINAL_STATUSES = new Set<SwapExecutionStatus>([
  SwapExecutionStatus.COMPLETED,
  SwapExecutionStatus.FAILED,
  SwapExecutionStatus.CANCELLED,
]);

function createInitialState(): RouteExecutionState {
  return {
    status: SwapExecutionStatus.IDLE,
    route: null,
    progress: null,
    error: null,
    startTime: null,
    endTime: null,
  };
}

// =============================================================================
// Hook Types
// =============================================================================

export interface UseRouteExecutionParams {
  /** Optional callbacks for execution lifecycle */
  callbacks?: ExecutionCallbacks;
}

export interface UseRouteExecutionReturn {
  /** Current execution state */
  state: RouteExecutionState;
  /** Execute the provided route */
  execute: (route: RouteExtended) => Promise<RouteExtended>;
  /** Resume a previously interrupted route */
  resume: (route?: RouteExtended) => Promise<RouteExtended>;
  /** Cancel the active route execution */
  cancel: () => RouteExtended | null;
  /** Reset execution state back to idle */
  reset: () => void;
  /** Toggle background execution */
  setExecuteInBackground: (executeInBackground: boolean) => void;
  /** Whether the hook is currently executing a route */
  isExecuting: boolean;
  /** Whether a wallet client is available for execution */
  isReady: boolean;
  /** Whether execution is currently running in background mode */
  isBackgroundExecution: boolean;
}

// =============================================================================
// Public Hook
// =============================================================================

export function useRouteExecution({
  callbacks,
}: UseRouteExecutionParams = {}): UseRouteExecutionReturn {
  const { data: walletClient } = useWalletClient();

  const [state, setState] = useState<RouteExecutionState>(() =>
    createInitialState()
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [isBackgroundExecution, setIsBackgroundExecution] = useState(false);

  const callbacksRef = useRef<ExecutionCallbacks | undefined>(callbacks);
  const statusRef = useRef<SwapExecutionStatus>(SwapExecutionStatus.IDLE);
  const seenTransactionHashesRef = useRef<Set<string>>(new Set());
  const executeInBackgroundRef = useRef(false);

  callbacksRef.current = callbacks;

  const commitStatusChange = useCallback((status: SwapExecutionStatus) => {
    if (statusRef.current !== status) {
      statusRef.current = status;
      callbacksRef.current?.onStatusChange?.(status);
    }
  }, []);

  const handleRouteUpdate = useCallback(
    (updatedRoute: RouteExtended) => {
      const nextStatus = deriveRouteStatus(updatedRoute);
      const progress = deriveExecutionProgress(updatedRoute, nextStatus);
      const timestamp = Date.now();

      setState((previous) => ({
        status: nextStatus,
        route: updatedRoute,
        progress,
        error: previous.error,
        startTime: previous.startTime ?? timestamp,
        endTime: isTerminalStatus(nextStatus) ? timestamp : previous.endTime,
      }));

      callbacksRef.current?.onRouteUpdate?.(updatedRoute);
      commitStatusChange(nextStatus);
      notifyTransactionHashes(
        updatedRoute,
        callbacksRef.current?.onTransactionHash,
        seenTransactionHashesRef.current
      );
    },
    [commitStatusChange]
  );

  const ensureWalletClient = useCallback((): WalletClient => {
    if (!walletClient) {
      throw new Error(
        "Wallet client is not available. Please connect your wallet."
      );
    }
    return walletClient;
  }, [walletClient]);

  const buildExecutionOptions = useCallback((): ExecutionOptions => {
    const switchChainHook = walletClient
      ? createSwitchChainHook(walletClient)
      : undefined;
    const acceptExchangeRateUpdateHook = createExchangeRateHook(callbacksRef);

    const options: ExecutionOptions = {
      updateRouteHook: handleRouteUpdate,
      executeInBackground: executeInBackgroundRef.current,
    };

    if (switchChainHook) {
      options.switchChainHook = switchChainHook;
    }

    if (acceptExchangeRateUpdateHook) {
      options.acceptExchangeRateUpdateHook = acceptExchangeRateUpdateHook;
    }

    return options;
  }, [handleRouteUpdate, walletClient]);

  const execute = useCallback(
    async (route: RouteExtended) => {
      ensureWalletClient();

      // Log execution start for debugging
      console.log('[useRouteExecution] Starting route execution:', {
        routeId: route.id,
        steps: route.steps.length,
        timestamp: new Date().toISOString(),
      });

      seenTransactionHashesRef.current = new Set();
      executeInBackgroundRef.current = isBackgroundExecution;

      setIsExecuting(true);
      setState({
        status: SwapExecutionStatus.EXECUTING,
        route,
        progress: deriveExecutionProgress(route, SwapExecutionStatus.EXECUTING),
        error: null,
        startTime: Date.now(),
        endTime: null,
      });
      commitStatusChange(SwapExecutionStatus.EXECUTING);

      try {
        const options = buildExecutionOptions();

        // Log before calling LiFi SDK
        console.log('[useRouteExecution] Calling LiFi SDK executeRoute - wallet prompts should appear now');

        const result = await executeRouteSdk(route, options);

        console.log('[useRouteExecution] Route execution completed successfully');
        handleRouteUpdate(result);
        callbacksRef.current?.onSuccess?.(result);
        return result;
      } catch (cause) {
        console.error('[useRouteExecution] Route execution failed:', cause);
        const error = normaliseExecutionError(cause);
        setState((previous) => ({
          ...previous,
          status: SwapExecutionStatus.FAILED,
          error,
          endTime: Date.now(),
        }));
        commitStatusChange(SwapExecutionStatus.FAILED);
        callbacksRef.current?.onError?.(error);
        throw cause;
      } finally {
        setIsExecuting(false);
      }
    },
    [
      buildExecutionOptions,
      commitStatusChange,
      ensureWalletClient,
      handleRouteUpdate,
      isBackgroundExecution,
    ]
  );

  const resume = useCallback(
    async (routeOverride?: RouteExtended) => {
      ensureWalletClient();
      const routeToResume = routeOverride ?? state.route;

      if (!routeToResume) {
        throw new Error(
          "No route available to resume. Provide a route argument or execute a new route."
        );
      }

      executeInBackgroundRef.current = isBackgroundExecution;
      setIsExecuting(true);
      setState((previous) => ({
        status: SwapExecutionStatus.EXECUTING,
        route: routeToResume,
        progress: deriveExecutionProgress(
          routeToResume,
          SwapExecutionStatus.EXECUTING
        ),
        error: null,
        startTime: previous.startTime ?? Date.now(),
        endTime: null,
      }));
      commitStatusChange(SwapExecutionStatus.EXECUTING);

      try {
        const options = buildExecutionOptions();
        const result = await resumeRouteSdk(routeToResume, options);

        handleRouteUpdate(result);
        callbacksRef.current?.onSuccess?.(result);
        return result;
      } catch (cause) {
        const error = normaliseExecutionError(cause);
        setState((previous) => ({
          ...previous,
          status: SwapExecutionStatus.FAILED,
          error,
          endTime: Date.now(),
        }));
        commitStatusChange(SwapExecutionStatus.FAILED);
        callbacksRef.current?.onError?.(error);
        throw cause;
      } finally {
        setIsExecuting(false);
      }
    },
    [
      buildExecutionOptions,
      commitStatusChange,
      ensureWalletClient,
      handleRouteUpdate,
      isBackgroundExecution,
      state.route,
    ]
  );

  const cancel = useCallback((): RouteExtended | null => {
    if (!state.route) {
      return null;
    }

    const stoppedRoute = stopRouteExecution(state.route) as RouteExtended;
    executeInBackgroundRef.current = false;
    setIsExecuting(false);
    handleRouteUpdate(stoppedRoute);
    return stoppedRoute;
  }, [handleRouteUpdate, state.route]);

  const reset = useCallback(() => {
    statusRef.current = SwapExecutionStatus.IDLE;
    seenTransactionHashesRef.current = new Set();
    executeInBackgroundRef.current = false;
    setIsExecuting(false);
    setIsBackgroundExecution(false);
    setState(createInitialState());
  }, []);

  const setExecuteInBackground = useCallback(
    (executeInBackground: boolean) => {
      executeInBackgroundRef.current = executeInBackground;
      setIsBackgroundExecution(executeInBackground);

      if (state.route) {
        try {
          updateRouteExecution(state.route, { executeInBackground });
        } catch (error) {
          console.warn("Failed to update background execution setting:", error);
        }
      }
    },
    [state.route]
  );

  return {
    state,
    execute,
    resume,
    cancel,
    reset,
    setExecuteInBackground,
    isExecuting,
    isReady: Boolean(walletClient),
    isBackgroundExecution,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

function isTerminalStatus(status: SwapExecutionStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

function deriveRouteStatus(route: RouteExtended): SwapExecutionStatus {
  const processes = flattenProcesses(route.steps);

  if (processes.some((process) => process.status === "FAILED")) {
    return SwapExecutionStatus.FAILED;
  }

  if (processes.some((process) => process.status === "CANCELLED")) {
    return SwapExecutionStatus.CANCELLED;
  }

  if (
    route.steps.length > 0 &&
    route.steps.every((step) => step.execution?.status === "DONE")
  ) {
    return SwapExecutionStatus.COMPLETED;
  }

  // Check for token approval process - this is where MetaMask should prompt for approval
  const approvalProcess = processes.find(
    (process) =>
      process.type === "TOKEN_ALLOWANCE" && process.status !== "DONE"
  );

  if (approvalProcess) {
    console.log('[deriveRouteStatus] Token approval required - MetaMask should prompt for approval transaction', {
      processType: approvalProcess.type,
      processStatus: approvalProcess.status,
    });
    return SwapExecutionStatus.APPROVING;
  }

  // Check for user action required (signing transactions)
  const actionRequired = processes.find(
    (process) =>
      process.status === "ACTION_REQUIRED" ||
      process.status === "MESSAGE_REQUIRED"
  );

  if (actionRequired) {
    console.log('[deriveRouteStatus] User action required - MetaMask should prompt for signature', {
      processType: actionRequired.type,
      processStatus: actionRequired.status,
    });
    return SwapExecutionStatus.SIGNING;
  }

  if (
    processes.some(
      (process) =>
        process.type === "RECEIVING_CHAIN" &&
        (process.status === "STARTED" || process.status === "PENDING")
    )
  ) {
    return SwapExecutionStatus.CONFIRMING;
  }

  if (
    processes.some(
      (process) => process.status === "STARTED" || process.status === "PENDING"
    )
  ) {
    return SwapExecutionStatus.EXECUTING;
  }

  return SwapExecutionStatus.EXECUTING;
}

function deriveExecutionProgress(
  route: RouteExtended | null,
  status: SwapExecutionStatus
): ExecutionProgress | null {
  if (!route || route.steps.length === 0) {
    return null;
  }

  const totalSteps = route.steps.length;
  const firstIncompleteIndex = route.steps.findIndex(
    (step) => step.execution?.status !== "DONE"
  );
  const currentIndex =
    firstIncompleteIndex === -1 ? totalSteps - 1 : firstIncompleteIndex;
  const currentStep = route.steps[currentIndex];
  const transactions = extractTransactions(route.steps);
  const estimatedTimeRemaining = route.steps
    .slice(currentIndex)
    .reduce(
      (total, step) => total + (step.estimate?.executionDuration ?? 0),
      0
    );

  return {
    currentStep: currentIndex + 1,
    totalSteps,
    currentStepName: formatStepLabel(currentStep, currentIndex),
    currentStepStatus: status,
    transactions,
    estimatedTimeRemaining: estimatedTimeRemaining || undefined,
  };
}

function flattenProcesses(steps: LiFiStepExtended[]): Process[] {
  return steps.flatMap((step) => step.execution?.process ?? []);
}

function extractTransactions(steps: LiFiStepExtended[]): StepTransaction[] {
  const seen = new Map<string, StepTransaction>();

  for (const step of steps) {
    const processes = step.execution?.process ?? [];

    for (const process of processes) {
      const { txHash } = process;
      if (!txHash) {
        continue;
      }

      const status = mapProcessStatusToTransactionStatus(process.status);
      const existing = seen.get(txHash);

      if (existing) {
        if (existing.status === "pending" || status === "failed") {
          existing.status = status;
        }
        continue;
      }

      seen.set(txHash, {
        hash: txHash,
        explorerUrl: process.txLink,
        chainId:
          process.chainId ??
          step.action?.toChainId ??
          step.action?.fromChainId ??
          0,
        status,
        confirmations: undefined,
      });
    }
  }

  return Array.from(seen.values());
}

function mapProcessStatusToTransactionStatus(
  status: ProcessStatus
): StepTransaction["status"] {
  switch (status) {
    case "DONE":
      return "confirmed";
    case "FAILED":
    case "CANCELLED":
      return "failed";
    default:
      return "pending";
  }
}

function formatStepLabel(step: LiFiStepExtended, index: number): string {
  const toolName = step.toolDetails?.name ?? step.tool ?? `Step ${index + 1}`;
  const fromSymbol = step.action?.fromToken?.symbol;
  const toSymbol = step.action?.toToken?.symbol;

  if (fromSymbol && toSymbol) {
    const isCrossChain = step.action.fromChainId !== step.action.toChainId;
    return isCrossChain
      ? `${toolName}: ${fromSymbol} → ${toSymbol} (${step.action.fromChainId} → ${step.action.toChainId})`
      : `${toolName}: ${fromSymbol} → ${toSymbol}`;
  }

  return toolName;
}

function notifyTransactionHashes(
  route: RouteExtended,
  handler: ExecutionCallbacks["onTransactionHash"] | undefined,
  seenHashes: Set<string>
) {
  if (!handler) {
    return;
  }

  const processes = flattenProcesses(route.steps);

  for (const process of processes) {
    if (!process.txHash || seenHashes.has(process.txHash)) {
      continue;
    }

    seenHashes.add(process.txHash);
    handler(
      process.txHash,
      process.chainId ?? route.steps[0]?.action?.fromChainId ?? 0
    );
  }
}

function createSwitchChainHook(walletClient: WalletClient): SwitchChainHook {
  return async (requiredChainId: number) => {
    if (walletClient.chain?.id !== requiredChainId) {
      if (!walletClient.switchChain) {
        throw new Error(
          "Connected wallet does not support programmatic chain switching."
        );
      }
      await walletClient.switchChain({ id: requiredChainId });
    }

    return walletClient;
  };
}

function createExchangeRateHook(
  callbacksRef: MutableRefObject<ExecutionCallbacks | undefined>
): AcceptExchangeRateUpdateHook | undefined {
  if (!callbacksRef.current?.onExchangeRateChange) {
    return undefined;
  }

  return async ({ toToken, oldToAmount, newToAmount }) => {
    const change: ExchangeRateChange = {
      token: toToken,
      oldAmount: oldToAmount,
      newAmount: newToAmount,
      percentageChange: computePercentageChange(oldToAmount, newToAmount),
      timestamp: Date.now(),
    };

    return callbacksRef.current?.onExchangeRateChange?.(change);
  };
}

function computePercentageChange(oldAmount: string, newAmount: string): number {
  const previous = Number.parseFloat(oldAmount);
  const next = Number.parseFloat(newAmount);

  if (!Number.isFinite(previous) || previous === 0 || !Number.isFinite(next)) {
    return 0;
  }

  return ((next - previous) / previous) * 100;
}

function normaliseExecutionError(cause: unknown): SwapExecutionError {
  const walletErrorType = classifyWalletError(cause);
  const baseMessage = getWalletErrorMessage(cause);
  const inferredType = detectSwapErrorType(cause, walletErrorType);

  return {
    type: inferredType,
    message: baseMessage,
    recoverable: inferredType !== SwapErrorType.EXECUTION_FAILED,
    originalError: cause instanceof Error ? cause : undefined,
    suggestedAction: getSuggestedAction(inferredType),
  };
}

function detectSwapErrorType(
  cause: unknown,
  walletErrorType: WalletErrorType
): SwapErrorType {
  const message = extractErrorMessage(cause).toLowerCase();

  const specific = detectSpecificSwapError(message);
  if (specific) {
    return specific;
  }

  switch (walletErrorType) {
    case "user_rejected":
      return SwapErrorType.USER_REJECTED;
    case "insufficient_funds":
      return SwapErrorType.INSUFFICIENT_BALANCE;
    case "unsupported_chain":
      return SwapErrorType.UNSUPPORTED_ROUTE;
    case "network_error":
      return SwapErrorType.NETWORK_ERROR;
    case "contract_error":
      return SwapErrorType.EXECUTION_FAILED;
    default:
      return SwapErrorType.UNKNOWN;
  }
}

function detectSpecificSwapError(message: string): SwapErrorType | null {
  if (!message) {
    return null;
  }

  if (message.includes("quote") && message.includes("expired")) {
    return SwapErrorType.QUOTE_EXPIRED;
  }

  if (message.includes("slippage")) {
    return SwapErrorType.SLIPPAGE_EXCEEDED;
  }

  if (message.includes("insufficient") && message.includes("gas")) {
    return SwapErrorType.INSUFFICIENT_GAS;
  }

  if (message.includes("unsupported") || message.includes("not supported")) {
    return SwapErrorType.UNSUPPORTED_ROUTE;
  }

  return null;
}

function extractErrorMessage(cause: unknown): string {
  if (!cause) {
    return "";
  }

  if (typeof cause === "string") {
    return cause;
  }

  if (cause instanceof Error) {
    return cause.message ?? "";
  }

  if (
    typeof cause === "object" &&
    "message" in cause &&
    typeof cause.message === "string"
  ) {
    return cause.message;
  }

  return "";
}

function getSuggestedAction(type: SwapErrorType): string | undefined {
  switch (type) {
    case SwapErrorType.USER_REJECTED:
      return "Confirm the transaction in your wallet to continue.";
    case SwapErrorType.INSUFFICIENT_BALANCE:
      return "Reduce the swap amount or add more funds to your wallet.";
    case SwapErrorType.INSUFFICIENT_GAS:
      return "Add more native tokens to cover gas fees and retry.";
    case SwapErrorType.QUOTE_EXPIRED:
      return "Refresh the quote to get the latest rates before executing again.";
    case SwapErrorType.SLIPPAGE_EXCEEDED:
      return "Adjust your slippage tolerance or retry when market conditions improve.";
    case SwapErrorType.NETWORK_ERROR:
      return "Check your internet connection or try again in a few moments.";
    case SwapErrorType.UNSUPPORTED_ROUTE:
      return "Select a different token or chain combination.";
    default:
      return undefined;
  }
}
