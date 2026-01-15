/**
 * Wallet Error Utilities
 * Helper functions for handling wallet-related errors
 */

import type { WalletError, WalletErrorType } from '@/lib/types/wallet.types';

// ============================================================================
// Error Detection
// ============================================================================

/**
 * Check if error is a user rejection
 */
export function isUserRejection(error: unknown): boolean {
  if (!error) return false;

  const errorString = error.toString().toLowerCase();
  const errorMessage =
    error instanceof Error ? error.message.toLowerCase() : '';

  return (
    errorString.includes('user rejected') ||
    errorString.includes('user denied') ||
    errorString.includes('user cancelled') ||
    errorString.includes('rejected') ||
    errorMessage.includes('user rejected') ||
    errorMessage.includes('user denied')
  );
}

/**
 * Check if error is insufficient funds
 */
export function isInsufficientFunds(error: unknown): boolean {
  if (!error) return false;

  const errorString = error.toString().toLowerCase();
  const errorMessage =
    error instanceof Error ? error.message.toLowerCase() : '';

  return (
    errorString.includes('insufficient funds') ||
    errorString.includes('insufficient balance') ||
    errorMessage.includes('insufficient funds') ||
    errorMessage.includes('insufficient balance')
  );
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;

  const errorString = error.toString().toLowerCase();
  const errorMessage =
    error instanceof Error ? error.message.toLowerCase() : '';

  return (
    errorString.includes('network') ||
    errorString.includes('connection') ||
    errorString.includes('timeout') ||
    errorMessage.includes('network') ||
    errorMessage.includes('connection')
  );
}

/**
 * Check if error is a contract error
 */
export function isContractError(error: unknown): boolean {
  if (!error) return false;

  const errorString = error.toString().toLowerCase();
  const errorMessage =
    error instanceof Error ? error.message.toLowerCase() : '';

  return (
    errorString.includes('execution reverted') ||
    errorString.includes('contract') ||
    errorMessage.includes('execution reverted') ||
    errorMessage.includes('contract')
  );
}

// ============================================================================
// Error Classification
// ============================================================================

/**
 * Classify wallet error type
 */
export function classifyWalletError(error: unknown): WalletErrorType {
  if (isUserRejection(error)) {
    return 'user_rejected';
  }

  if (isInsufficientFunds(error)) {
    return 'insufficient_funds';
  }

  if (isNetworkError(error)) {
    return 'network_error';
  }

  if (isContractError(error)) {
    return 'contract_error';
  }

  return 'unknown_error';
}

// ============================================================================
// Error Messages
// ============================================================================

/**
 * Get user-friendly error message
 */
export function getWalletErrorMessage(error: unknown): string {
  const errorType = classifyWalletError(error);

  switch (errorType) {
    case 'user_rejected':
      return 'Transaction was rejected. Please try again.';

    case 'insufficient_funds':
      return 'Insufficient funds to complete this transaction. Please check your balance.';

    case 'unsupported_chain':
      return 'This chain is not supported. Please switch to a supported network.';

    case 'network_error':
      return 'Network error occurred. Please check your connection and try again.';

    case 'contract_error':
      return 'Smart contract error. The transaction could not be executed.';

    case 'unknown_error':
    default:
      // Try to extract message from error object
      if (error instanceof Error) {
        return error.message || 'An unexpected error occurred. Please try again.';
      }
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Create a structured wallet error object
 */
export function createWalletError(error: unknown): WalletError {
  const errorType = classifyWalletError(error);
  const message = getWalletErrorMessage(error);

  return {
    type: errorType,
    message,
    originalError: error instanceof Error ? error : undefined,
  };
}

// ============================================================================
// Error Logging
// ============================================================================

/**
 * Log wallet error with context
 */
export function logWalletError(
  context: string,
  error: unknown,
  additionalInfo?: Record<string, unknown>
): void {
  const walletError = createWalletError(error);

  console.error(`[Wallet Error - ${context}]`, {
    type: walletError.type,
    message: walletError.message,
    originalError: walletError.originalError,
    ...additionalInfo,
  });
}

// ============================================================================
// Error Recovery Suggestions
// ============================================================================

/**
 * Get recovery suggestions for an error
 */
export function getErrorRecoverySuggestions(error: unknown): string[] {
  const errorType = classifyWalletError(error);

  switch (errorType) {
    case 'user_rejected':
      return [
        'Review the transaction details',
        'Try the transaction again when ready',
      ];

    case 'insufficient_funds':
      return [
        'Check your wallet balance',
        'Add more funds to your wallet',
        'Try swapping a smaller amount',
      ];

    case 'unsupported_chain':
      return [
        'Switch to a supported network',
        'Check the list of supported chains',
      ];

    case 'network_error':
      return [
        'Check your internet connection',
        'Try again in a few moments',
        'Switch to a different RPC endpoint',
      ];

    case 'contract_error':
      return [
        'Check transaction parameters',
        'Ensure sufficient gas',
        'Contact support if the issue persists',
      ];

    case 'unknown_error':
    default:
      return ['Try again', 'Check your wallet connection', 'Contact support'];
  }
}
