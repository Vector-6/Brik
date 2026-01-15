/**
 * LI.FI Error Handling Utilities
 *
 * Comprehensive error handling system for LI.FI SDK integration.
 * Follows Single Responsibility Principle with modular error detection,
 * classification, transformation, messaging, and recovery suggestions.
 *
 * @module lifiErrorHandling
 */

import { SwapErrorType, type SwapExecutionError } from '@/lib/types/lifi.types';

// Re-export SwapErrorType for convenience
export { SwapErrorType };
export type { SwapExecutionError };

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Context information for error logging
 */
export interface ErrorContext {
  operation: string;
  fromToken?: string;
  toToken?: string;
  fromChain?: number;
  toChain?: number;
  amount?: string;
  [key: string]: unknown;
}

/**
 * Structured error log entry
 */
export interface ErrorLogEntry {
  timestamp: number;
  context: string;
  errorType: SwapErrorType;
  message: string;
  details?: ErrorContext;
  originalError?: Error;
}

// ============================================================================
// Error Type Detection Functions
// ============================================================================

/**
 * Detect if error is related to user rejection
 *
 * Checks for wallet rejection patterns and user cancellation.
 *
 * @param error - The error to check
 * @returns True if error is a user rejection
 */
export function isUserRejectionError(error: unknown): boolean {
  if (!error) return false;

  const errorString = String(error).toLowerCase();
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';

  return (
    errorString.includes('user rejected') ||
    errorString.includes('user denied') ||
    errorString.includes('user cancelled') ||
    errorString.includes('rejected by user') ||
    errorString.includes('denied by user') ||
    errorString.includes('cancelled by user') ||
    errorString.includes('user declined') ||
    errorString.includes('transaction rejected') ||
    errorString.includes('request rejected') ||
    errorMessage.includes('user rejected') ||
    errorMessage.includes('user denied') ||
    errorMessage.includes('user cancelled')
  );
}

/**
 * Detect if error is related to insufficient balance
 *
 * @param error - The error to check
 * @returns True if error is an insufficient balance error
 */
export function isInsufficientBalanceError(error: unknown): boolean {
  if (!error) return false;

  const errorString = String(error).toLowerCase();
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';

  return (
    errorString.includes('insufficient funds') ||
    errorString.includes('insufficient balance') ||
    errorString.includes('balance too low') ||
    errorString.includes('not enough') ||
    errorString.includes('exceeds balance') ||
    errorMessage.includes('insufficient funds') ||
    errorMessage.includes('insufficient balance') ||
    errorMessage.includes('balance too low')
  );
}

/**
 * Detect if error is related to insufficient gas
 *
 * @param error - The error to check
 * @returns True if error is an insufficient gas error
 */
export function isInsufficientGasError(error: unknown): boolean {
  if (!error) return false;

  const errorString = String(error).toLowerCase();
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';

  return (
    errorString.includes('insufficient gas') ||
    errorString.includes('out of gas') ||
    errorString.includes('gas required exceeds') ||
    errorString.includes('gas limit') ||
    errorString.includes('intrinsic gas too low') ||
    errorMessage.includes('insufficient gas') ||
    errorMessage.includes('out of gas')
  );
}

/**
 * Detect if error is related to slippage exceeded
 *
 * @param error - The error to check
 * @returns True if error is a slippage exceeded error
 */
export function isSlippageExceededError(error: unknown): boolean {
  if (!error) return false;

  const errorString = String(error).toLowerCase();
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';

  return (
    errorString.includes('slippage') ||
    errorString.includes('price impact') ||
    errorString.includes('price change') ||
    errorString.includes('tolerance exceeded') ||
    errorString.includes('too much slippage') ||
    errorMessage.includes('slippage') ||
    errorMessage.includes('price impact')
  );
}

/**
 * Detect if error is related to expired quote
 *
 * @param error - The error to check
 * @returns True if error is a quote expired error
 */
export function isQuoteExpiredError(error: unknown): boolean {
  if (!error) return false;

  const errorString = String(error).toLowerCase();
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';

  return (
    errorString.includes('quote expired') ||
    errorString.includes('quote too old') ||
    errorString.includes('quote stale') ||
    errorString.includes('outdated quote') ||
    errorString.includes('exchange rate has changed') ||
    errorMessage.includes('quote expired') ||
    errorMessage.includes('quote too old') ||
    errorMessage.includes('exchange rate has changed')
  );
}

/**
 * Detect if error is related to network issues
 *
 * @param error - The error to check
 * @returns True if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;

  const errorString = String(error).toLowerCase();
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';

  return (
    errorString.includes('network') ||
    errorString.includes('connection') ||
    errorString.includes('timeout') ||
    errorString.includes('fetch failed') ||
    errorString.includes('failed to fetch') ||
    errorString.includes('network request failed') ||
    errorString.includes('network error') ||
    errorString.includes('rpc') ||
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('fetch failed')
  );
}

/**
 * Detect if error is related to unsupported route
 *
 * @param error - The error to check
 * @returns True if error is an unsupported route error
 */
export function isUnsupportedRouteError(error: unknown): boolean {
  if (!error) return false;

  const errorString = String(error).toLowerCase();
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';

  return (
    errorString.includes('unsupported') ||
    errorString.includes('not supported') ||
    errorString.includes('no route found') ||
    errorString.includes('no routes available') ||
    errorString.includes('route not available') ||
    errorString.includes('invalid route') ||
    errorMessage.includes('unsupported') ||
    errorMessage.includes('not supported') ||
    errorMessage.includes('no route found')
  );
}

/**
 * Detect if error is related to approval failure
 *
 * @param error - The error to check
 * @returns True if error is an approval failure
 */
export function isApprovalFailedError(error: unknown): boolean {
  if (!error) return false;

  const errorString = String(error).toLowerCase();
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';

  return (
    errorString.includes('approval failed') ||
    errorString.includes('approve failed') ||
    errorString.includes('allowance failed') ||
    errorString.includes('token approval') ||
    errorString.includes('erc20: approve') ||
    errorMessage.includes('approval failed') ||
    errorMessage.includes('approve failed') ||
    errorMessage.includes('allowance failed')
  );
}

/**
 * Detect if error is related to execution failure
 *
 * @param error - The error to check
 * @returns True if error is an execution failure
 */
export function isExecutionFailedError(error: unknown): boolean {
  if (!error) return false;

  const errorString = String(error).toLowerCase();
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';

  return (
    errorString.includes('execution failed') ||
    errorString.includes('execution reverted') ||
    errorString.includes('transaction failed') ||
    errorString.includes('swap failed') ||
    errorString.includes('bridge failed') ||
    errorString.includes('reverted') ||
    errorString.includes('call exception') ||
    errorMessage.includes('execution failed') ||
    errorMessage.includes('execution reverted') ||
    errorMessage.includes('transaction failed')
  );
}

/**
 * Detect if error is related to rate limiting (HTTP 429)
 *
 * @param error - The error to check
 * @returns True if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (!error) return false;

  const errorString = String(error).toLowerCase();
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';

  return (
    errorString.includes('rate limit') ||
    errorString.includes('too many requests') ||
    errorString.includes('status code 429') ||
    errorString.includes('429') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests') ||
    errorMessage.includes('status code 429')
  );
}

/**
 * Detect if error is an HTTP error and extract status code
 *
 * @param error - The error to check
 * @returns Status code if HTTP error, null otherwise
 */
export function parseHTTPErrorCode(error: unknown): number | null {
  if (!error) return null;

  const errorString = String(error);
  const errorMessage = error instanceof Error ? error.message : '';

  // Try to match "status code XXX" pattern
  const statusCodeMatch = (errorString + errorMessage).match(/status code (\d{3})/i);
  if (statusCodeMatch) {
    return parseInt(statusCodeMatch[1], 10);
  }

  // Try to match "HTTPError" with status
  const httpErrorMatch = (errorString + errorMessage).match(/HTTP\s*(\d{3})/i);
  if (httpErrorMatch) {
    return parseInt(httpErrorMatch[1], 10);
  }

  // Check if error object has status/statusCode property
  if (typeof error === 'object' && error !== null) {
    if ('status' in error && typeof error.status === 'number') {
      return error.status;
    }
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return error.statusCode;
    }
  }

  return null;
}

/**
 * Parse retry-after duration from rate limit error
 *
 * Extracts time until retry from error messages like:
 * "retry in 47 minutes" or "retry after 2 hours"
 *
 * @param error - The error to parse
 * @returns Retry delay in seconds, or null if not found
 */
export function parseRetryAfter(error: unknown): number | null {
  if (!error) return null;

  const errorString = String(error);
  const errorMessage = error instanceof Error ? error.message : '';
  const combined = (errorString + ' ' + errorMessage).toLowerCase();

  // Match "retry in X minutes/hours/seconds"
  const retryInMatch = combined.match(/retry in (\d+)\s*(minute|hour|second)s?/i);
  if (retryInMatch) {
    const value = parseInt(retryInMatch[1], 10);
    const unit = retryInMatch[2].toLowerCase();

    switch (unit) {
      case 'second':
        return value;
      case 'minute':
        return value * 60;
      case 'hour':
        return value * 3600;
      default:
        return null;
    }
  }

  // Match "retry after X minutes/hours/seconds"
  const retryAfterMatch = combined.match(/retry after (\d+)\s*(minute|hour|second)s?/i);
  if (retryAfterMatch) {
    const value = parseInt(retryAfterMatch[1], 10);
    const unit = retryAfterMatch[2].toLowerCase();

    switch (unit) {
      case 'second':
        return value;
      case 'minute':
        return value * 60;
      case 'hour':
        return value * 3600;
      default:
        return null;
    }
  }

  // Check for Retry-After header in error object
  if (typeof error === 'object' && error !== null) {
    if ('retryAfter' in error && typeof error.retryAfter === 'number') {
      return error.retryAfter;
    }
    if ('retry_after' in error && typeof error.retry_after === 'number') {
      return error.retry_after;
    }
  }

  return null;
}

// ============================================================================
// Error Classification
// ============================================================================

/**
 * Classify error into a specific SwapErrorType
 *
 * This function examines the error and determines which category it belongs to.
 * Detection functions are checked in order of specificity.
 *
 * @param error - The error to classify
 * @returns The classified error type
 */
export function classifySwapError(error: unknown): SwapErrorType {
  // Check in order of specificity
  if (isUserRejectionError(error)) {
    return SwapErrorType.USER_REJECTED;
  }

  // Check for rate limit errors early (before general network errors)
  if (isRateLimitError(error)) {
    return SwapErrorType.RATE_LIMIT_EXCEEDED;
  }

  if (isQuoteExpiredError(error)) {
    return SwapErrorType.QUOTE_EXPIRED;
  }

  if (isSlippageExceededError(error)) {
    return SwapErrorType.SLIPPAGE_EXCEEDED;
  }

  if (isInsufficientGasError(error)) {
    return SwapErrorType.INSUFFICIENT_GAS;
  }

  if (isInsufficientBalanceError(error)) {
    return SwapErrorType.INSUFFICIENT_BALANCE;
  }

  if (isApprovalFailedError(error)) {
    return SwapErrorType.APPROVAL_FAILED;
  }

  if (isUnsupportedRouteError(error)) {
    return SwapErrorType.UNSUPPORTED_ROUTE;
  }

  if (isNetworkError(error)) {
    return SwapErrorType.NETWORK_ERROR;
  }

  if (isExecutionFailedError(error)) {
    return SwapErrorType.EXECUTION_FAILED;
  }

  return SwapErrorType.UNKNOWN;
}

// ============================================================================
// Error Message Generation
// ============================================================================

/**
 * Generate user-friendly error message based on error type
 *
 * Creates clear, actionable messages that help users understand what went wrong.
 *
 * @param errorType - The classified error type
 * @param originalError - Optional original error for extracting details
 * @returns User-friendly error message
 */
export function getSwapErrorMessage(
  errorType: SwapErrorType,
  originalError?: unknown
): string {
  switch (errorType) {
    case SwapErrorType.USER_REJECTED:
      return 'Transaction was rejected. Please try again when ready.';

    case SwapErrorType.INSUFFICIENT_BALANCE:
      return 'Insufficient balance to complete this swap. Please check your wallet balance and try a smaller amount.';

    case SwapErrorType.INSUFFICIENT_GAS:
      return 'Insufficient gas to complete this transaction. Please add more native tokens to cover gas fees.';

    case SwapErrorType.SLIPPAGE_EXCEEDED:
      return 'Price moved beyond your slippage tolerance. Try increasing your slippage setting or wait for better market conditions.';

    case SwapErrorType.QUOTE_EXPIRED:
      return 'Quote has expired. Please refresh the quote to get the latest exchange rate.';

    case SwapErrorType.RATE_LIMIT_EXCEEDED: {
      const retryAfter = parseRetryAfter(originalError);
      if (retryAfter !== null) {
        const minutes = Math.ceil(retryAfter / 60);
        return `Rate limit reached. Please wait ${minutes} minute${minutes !== 1 ? 's' : ''} before trying again.`;
      }
      return 'Rate limit reached. Please wait a few minutes before trying again.';
    }

    case SwapErrorType.NETWORK_ERROR:
      return 'Network error occurred. Please check your internet connection and try again.';

    case SwapErrorType.UNSUPPORTED_ROUTE:
      return 'This swap route is not supported. Try selecting different tokens or chains.';

    case SwapErrorType.APPROVAL_FAILED:
      return 'Token approval failed. Please try again or check if you have sufficient gas.';

    case SwapErrorType.EXECUTION_FAILED:
      return 'Transaction execution failed. This may be due to market conditions or contract issues.';

    case SwapErrorType.UNKNOWN:
    default: {
      // Try to extract meaningful message from original error
      if (originalError instanceof Error) {
        return originalError.message || 'An unexpected error occurred during the swap.';
      }

      if (typeof originalError === 'string') {
        return originalError || 'An unexpected error occurred during the swap.';
      }

      return 'An unexpected error occurred during the swap. Please try again.';
    }
  }
}

// ============================================================================
// Recovery Suggestions
// ============================================================================

/**
 * Get recovery suggestions based on error type
 *
 * Provides actionable steps users can take to resolve the error.
 *
 * @param errorType - The classified error type
 * @returns Array of recovery suggestion strings
 */
export function getRecoverySuggestions(errorType: SwapErrorType): string[] {
  switch (errorType) {
    case SwapErrorType.USER_REJECTED:
      return [
        'Review the transaction details carefully',
        'Confirm the transaction in your wallet when ready',
      ];

    case SwapErrorType.INSUFFICIENT_BALANCE:
      return [
        'Check your wallet balance',
        'Reduce the swap amount',
        'Add more tokens to your wallet',
        'Consider swapping a smaller amount',
      ];

    case SwapErrorType.INSUFFICIENT_GAS:
      return [
        'Add more native tokens (ETH, MATIC, etc.) to cover gas fees',
        'Wait for gas prices to decrease',
        'Try again with a lower amount',
      ];

    case SwapErrorType.SLIPPAGE_EXCEEDED:
      return [
        'Increase your slippage tolerance in settings',
        'Wait a few moments for market conditions to stabilize',
        'Try swapping a smaller amount',
        'Consider using a different route or token pair',
      ];

    case SwapErrorType.QUOTE_EXPIRED:
      return [
        'Click "Refresh Quote" to get the latest rates',
        'Review the new quote before confirming',
        'Complete transactions more quickly to avoid expiration',
      ];

    case SwapErrorType.RATE_LIMIT_EXCEEDED:
      return [
        'Wait for the specified time before retrying',
        'The page will automatically refresh when ready',
        'Consider using the swap at off-peak hours',
        'Try again later when the limit has reset',
      ];

    case SwapErrorType.NETWORK_ERROR:
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Switch to a different RPC endpoint if available',
        'Wait a moment and try again',
      ];

    case SwapErrorType.UNSUPPORTED_ROUTE:
      return [
        'Select different tokens for the swap',
        'Try swapping on a different chain',
        'Check if the tokens are supported on the selected chains',
        'Consider breaking the swap into multiple steps',
      ];

    case SwapErrorType.APPROVAL_FAILED:
      return [
        'Ensure you have enough gas for the approval transaction',
        'Try the approval again',
        'Check if the token contract is functioning normally',
        'Contact support if the issue persists',
      ];

    case SwapErrorType.EXECUTION_FAILED:
      return [
        'Review transaction details and try again',
        'Check if the token contracts are functioning',
        'Try a different route or bridge',
        'Reduce the swap amount',
        'Contact support with transaction details',
      ];

    case SwapErrorType.UNKNOWN:
    default:
      return [
        'Try refreshing the page and attempting the swap again',
        'Check your wallet connection',
        'Ensure you have sufficient balance and gas',
        'Contact support if the problem persists',
      ];
  }
}

// ============================================================================
// Error Transformation
// ============================================================================

/**
 * Create a structured SwapExecutionError from a raw error
 *
 * This is the main transformation function that converts any error into
 * a standardized SwapExecutionError object with classification, message,
 * recovery information, and original error reference.
 *
 * @param error - The raw error to transform
 * @returns Structured SwapExecutionError object
 */
export function createSwapExecutionError(
  error: unknown
): SwapExecutionError {
  const errorType = classifySwapError(error);
  const message = getSwapErrorMessage(errorType, error);
  const recoverable = isErrorRecoverable(errorType);
  const suggestedAction = getRecoverySuggestions(errorType)[0]; // First suggestion as primary action

  const structuredError: SwapExecutionError = {
    type: errorType,
    message,
    recoverable,
    suggestedAction,
    originalError: error instanceof Error ? error : undefined,
  };

  // Add retryAfter for rate limit errors
  if (errorType === SwapErrorType.RATE_LIMIT_EXCEEDED) {
    const retryAfter = parseRetryAfter(error);
    if (retryAfter !== null) {
      structuredError.retryAfter = retryAfter;
    }
  }

  return structuredError;
}

/**
 * Determine if an error type is recoverable
 *
 * Recoverable errors are those where the user can take action to resolve them.
 *
 * @param errorType - The error type to check
 * @returns True if the error is recoverable
 */
export function isErrorRecoverable(errorType: SwapErrorType): boolean {
  switch (errorType) {
    case SwapErrorType.USER_REJECTED:
    case SwapErrorType.INSUFFICIENT_BALANCE:
    case SwapErrorType.INSUFFICIENT_GAS:
    case SwapErrorType.SLIPPAGE_EXCEEDED:
    case SwapErrorType.QUOTE_EXPIRED:
    case SwapErrorType.RATE_LIMIT_EXCEEDED:
    case SwapErrorType.NETWORK_ERROR:
    case SwapErrorType.APPROVAL_FAILED:
      return true;

    case SwapErrorType.EXECUTION_FAILED:
    case SwapErrorType.UNSUPPORTED_ROUTE:
    case SwapErrorType.UNKNOWN:
    default:
      return false;
  }
}

// ============================================================================
// Error Logging
// ============================================================================

/**
 * Log a swap error with structured context
 *
 * Creates a detailed log entry for debugging and monitoring purposes.
 *
 * @param context - Description of where/when the error occurred
 * @param error - The error to log
 * @param details - Additional context information
 */
export function logSwapError(
  context: string,
  error: unknown,
  details?: ErrorContext
): void {
  const errorType = classifySwapError(error);
  const message = getSwapErrorMessage(errorType, error);

  const logEntry: ErrorLogEntry = {
    timestamp: Date.now(),
    context,
    errorType,
    message,
    details,
    originalError: error instanceof Error ? error : undefined,
  };

  // Use console.error for errors that need immediate attention
  // Use console.warn for recoverable errors
  const logMethod =
    errorType === SwapErrorType.EXECUTION_FAILED ||
    errorType === SwapErrorType.UNKNOWN
      ? console.error
      : console.warn;

  logMethod('[LI.FI Swap Error]', {
    context: logEntry.context,
    type: logEntry.errorType,
    message: logEntry.message,
    timestamp: new Date(logEntry.timestamp).toISOString(),
    details: logEntry.details,
    originalError: logEntry.originalError,
  });
}

/**
 * Log error with comprehensive context for debugging
 *
 * Enhanced logging with additional debugging information.
 *
 * @param operation - The operation that failed
 * @param error - The error that occurred
 * @param additionalContext - Additional context information
 */
export function logSwapErrorWithContext(
  operation: string,
  error: unknown,
  additionalContext?: Partial<ErrorContext>
): void {
  const enrichedContext: ErrorContext = {
    operation,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    timestamp: Date.now(),
    ...additionalContext,
  };

  logSwapError(operation, error, enrichedContext);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract error message from any error type
 *
 * Safely extracts a string message from various error formats.
 *
 * @param error - The error to extract message from
 * @returns Extracted error message
 */
export function extractErrorMessage(error: unknown): string {
  if (!error) {
    return 'Unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message || 'Unknown error';
  }

  if (typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return 'Unknown error';
}

/**
 * Check if an error should trigger a retry
 *
 * Determines if automatic retry is appropriate for the error type.
 *
 * @param errorType - The error type to check
 * @returns True if retry is recommended
 */
export function shouldRetryOnError(errorType: SwapErrorType): boolean {
  switch (errorType) {
    case SwapErrorType.NETWORK_ERROR:
    case SwapErrorType.QUOTE_EXPIRED:
      return true;

    case SwapErrorType.USER_REJECTED:
    case SwapErrorType.INSUFFICIENT_BALANCE:
    case SwapErrorType.INSUFFICIENT_GAS:
    case SwapErrorType.SLIPPAGE_EXCEEDED:
    case SwapErrorType.UNSUPPORTED_ROUTE:
    case SwapErrorType.APPROVAL_FAILED:
    case SwapErrorType.EXECUTION_FAILED:
    case SwapErrorType.UNKNOWN:
    default:
      return false;
  }
}

/**
 * Get retry delay in milliseconds based on error type
 *
 * Provides appropriate retry delay for retryable errors.
 *
 * @param errorType - The error type
 * @param attemptNumber - Current retry attempt number
 * @returns Delay in milliseconds, or null if retry not recommended
 */
export function getRetryDelay(
  errorType: SwapErrorType,
  attemptNumber: number = 1
): number | null {
  if (!shouldRetryOnError(errorType)) {
    return null;
  }

  // Exponential backoff with jitter
  const baseDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), maxDelay);
  const jitter = Math.random() * 1000; // Up to 1 second of jitter

  return exponentialDelay + jitter;
}
