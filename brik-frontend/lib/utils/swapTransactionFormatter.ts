/**
 * Swap Transaction Formatter
 *
 * Converts LI.FI RouteExtended data to Transaction type following SRP.
 * Responsible ONLY for data transformation - no business logic or storage operations.
 */

import type { RouteExtended } from '@lifi/sdk';
import type { Transaction, TransactionStatus } from '../api/types/transaction.types';
import { SwapExecutionStatus } from '../types/lifi.types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique transaction ID
 * Uses transaction hash if available, otherwise generates a unique ID
 */
function generateTransactionId(route: RouteExtended): string {
  // Try to get transaction hash from the first completed step
  const completedStep = route.steps.find(
    (step) => step.execution?.process?.some((p) => p.txHash)
  );

  if (completedStep) {
    const process = completedStep.execution?.process.find((p) => p.txHash);
    if (process?.txHash) {
      return `swap-${process.txHash}`;
    }
  }

  // Fallback: use route ID or generate unique ID
  return `swap-${route.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract primary transaction hash from route
 * Gets the most recent confirmed transaction hash
 */
function extractTransactionHash(route: RouteExtended): string {
  // Look for transaction hash in reverse order (most recent first)
  for (let i = route.steps.length - 1; i >= 0; i--) {
    const step = route.steps[i];
    const processes = step.execution?.process ?? [];

    // Find the most recent transaction hash
    for (let j = processes.length - 1; j >= 0; j--) {
      const process = processes[j];
      if (process.txHash) {
        return process.txHash;
      }
    }
  }

  // No transaction hash found - return placeholder
  return '';
}

/**
 * Map execution status to transaction status
 */
function mapExecutionStatusToTransactionStatus(
  executionStatus: SwapExecutionStatus
): TransactionStatus {
  switch (executionStatus) {
    case SwapExecutionStatus.COMPLETED:
      return 'completed';
    case SwapExecutionStatus.FAILED:
    case SwapExecutionStatus.CANCELLED:
      return 'failed';
    case SwapExecutionStatus.IDLE:
    case SwapExecutionStatus.APPROVING:
    case SwapExecutionStatus.SIGNING:
    case SwapExecutionStatus.EXECUTING:
    case SwapExecutionStatus.CONFIRMING:
    default:
      return 'pending';
  }
}

/**
 * Determine transaction status from route
 */
function determineTransactionStatus(route: RouteExtended): TransactionStatus {
  // Check if all steps are done
  const allStepsDone = route.steps.every(
    (step) => step.execution?.status === 'DONE'
  );

  if (allStepsDone) {
    return 'completed';
  }

  // Check for failures
  const hasFailure = route.steps.some(
    (step) =>
      step.execution?.process?.some(
        (p) => p.status === 'FAILED' || p.status === 'CANCELLED'
      )
  );

  if (hasFailure) {
    return 'failed';
  }

  // Otherwise, it's pending
  return 'pending';
}

/**
 * Calculate USD value from route
 * Uses toAmountUSD if available, otherwise estimates from token prices
 */
function calculateUsdValue(route: RouteExtended): number {
  try {
    // Try to get USD value from route
    if (route.toAmountUSD) {
      return parseFloat(route.toAmountUSD);
    }

    // Try to calculate from fromAmountUSD
    if (route.fromAmountUSD) {
      return parseFloat(route.fromAmountUSD);
    }

    // No USD value available
    return 0;
  } catch (error) {
    console.warn('[TransactionFormatter] Error calculating USD value:', error);
    return 0;
  }
}

/**
 * Get token symbol safely
 */
function getTokenSymbol(token: unknown): string {
  if (token && typeof token === 'object' && 'symbol' in token && typeof token.symbol === 'string') {
    return token.symbol;
  }
  return 'UNKNOWN';
}

/**
 * Get chain ID safely
 */
function getChainId(chainId: unknown): number {
  if (typeof chainId === 'number') {
    return chainId;
  }
  if (typeof chainId === 'string') {
    const parsed = parseInt(chainId, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Convert completed RouteExtended to Transaction type
 *
 * @param route - LI.FI RouteExtended object
 * @param walletAddress - User's wallet address
 * @param executionStatus - Optional execution status override
 * @returns Transaction object ready for storage
 *
 * @example
 * const transaction = routeToTransaction(route, '0x123...', SwapExecutionStatus.COMPLETED);
 * saveSwapTransaction(transaction);
 */
export function routeToTransaction(
  route: RouteExtended,
  walletAddress: string,
  executionStatus?: SwapExecutionStatus
): Transaction {
  // Extract data from first step (source)
  const firstStep = route.steps[0];
  const fromChainId = getChainId(firstStep?.action?.fromChainId);
  const fromToken = getTokenSymbol(firstStep?.action?.fromToken);
  const fromAmount = firstStep?.action?.fromAmount ?? '0';

  // Extract data from last step (destination)
  const lastStep = route.steps[route.steps.length - 1];
  const toChainId = getChainId(lastStep?.action?.toChainId);
  const toToken = getTokenSymbol(lastStep?.action?.toToken);
  // toAmount is available on the action object for most routes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toAmount = (lastStep?.action as any)?.toAmount ?? route.toAmountMin ?? '0';

  // Generate ID and extract transaction hash
  const id = generateTransactionId(route);
  const txHash = extractTransactionHash(route);

  // Determine status
  const status = executionStatus
    ? mapExecutionStatusToTransactionStatus(executionStatus)
    : determineTransactionStatus(route);

  // Calculate USD value
  const usdValue = calculateUsdValue(route);

  // Create timestamp
  const timestamp = new Date().toISOString();

  return {
    id,
    walletAddress,
    fromChain: fromChainId,
    toChain: toChainId,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    txHash,
    status,
    timestamp,
    usdValue,
  };
}

/**
 * Check if a route is ready to be tracked
 * A route is trackable if it has at least one transaction hash
 *
 * @param route - LI.FI RouteExtended object
 * @returns True if route can be tracked
 *
 * @example
 * if (isRouteTrackable(route)) {
 *   const transaction = routeToTransaction(route, walletAddress);
 *   saveSwapTransaction(transaction);
 * }
 */
export function isRouteTrackable(route: RouteExtended): boolean {
  // Route must have at least one step with a transaction hash
  return route.steps.some(
    (step) => step.execution?.process?.some((p) => p.txHash)
  );
}

/**
 * Extract all transaction hashes from a route
 * Useful for tracking multiple transactions within a single swap
 *
 * @param route - LI.FI RouteExtended object
 * @returns Array of transaction hashes
 *
 * @example
 * const hashes = extractAllTransactionHashes(route);
 * hashes.forEach(hash => console.log('Track:', hash));
 */
export function extractAllTransactionHashes(route: RouteExtended): string[] {
  const hashes: string[] = [];

  for (const step of route.steps) {
    const processes = step.execution?.process ?? [];
    for (const process of processes) {
      if (process.txHash && !hashes.includes(process.txHash)) {
        hashes.push(process.txHash);
      }
    }
  }

  return hashes;
}

/**
 * Update transaction with latest route data
 * Useful for updating pending transactions as they progress
 *
 * @param existingTransaction - Current transaction object
 * @param updatedRoute - Updated route with new data
 * @returns Updated transaction object
 *
 * @example
 * const updatedTx = updateTransactionFromRoute(existingTx, updatedRoute);
 * saveSwapTransaction(updatedTx);
 */
export function updateTransactionFromRoute(
  existingTransaction: Transaction,
  updatedRoute: RouteExtended
): Transaction {
  // Update transaction hash if it's now available
  const newTxHash = extractTransactionHash(updatedRoute);
  const txHash = newTxHash || existingTransaction.txHash;

  // Update status based on route
  const status = determineTransactionStatus(updatedRoute);

  // Update amounts if they've changed (e.g., slippage adjustment)
  const lastStep = updatedRoute.steps[updatedRoute.steps.length - 1];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toAmount = (lastStep?.action as any)?.toAmount ?? updatedRoute.toAmountMin ?? existingTransaction.toAmount;

  // Update USD value
  const usdValue = calculateUsdValue(updatedRoute) || existingTransaction.usdValue;

  return {
    ...existingTransaction,
    txHash,
    status,
    toAmount,
    usdValue,
  };
}

/**
 * Create a minimal transaction placeholder for tracking before execution completes
 * Useful for showing the transaction immediately in UI
 *
 * @param route - LI.FI RouteExtended object
 * @param walletAddress - User's wallet address
 * @returns Minimal transaction object with pending status
 *
 * @example
 * // Start tracking immediately when execution begins
 * const placeholder = createTransactionPlaceholder(route, walletAddress);
 * saveSwapTransaction(placeholder);
 */
export function createTransactionPlaceholder(
  route: RouteExtended,
  walletAddress: string
): Transaction {
  const firstStep = route.steps[0];
  const lastStep = route.steps[route.steps.length - 1];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toAmount = (lastStep?.action as any)?.toAmount ?? route.toAmountMin ?? '0';

  return {
    id: `swap-pending-${route.id || Date.now()}`,
    walletAddress,
    fromChain: getChainId(firstStep?.action?.fromChainId),
    toChain: getChainId(lastStep?.action?.toChainId),
    fromToken: getTokenSymbol(firstStep?.action?.fromToken),
    toToken: getTokenSymbol(lastStep?.action?.toToken),
    fromAmount: firstStep?.action?.fromAmount ?? '0',
    toAmount,
    txHash: '',
    status: 'pending',
    timestamp: new Date().toISOString(),
    usdValue: calculateUsdValue(route),
  };
}
