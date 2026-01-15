'use client';

/**
 * useChainSwitch Hook
 * Handles chain switching with verification, error handling, and user prompts
 *
 * Single Responsibility: Manage chain switching operations
 * - Execute chain switches with wagmi
 * - Verify chain after switch
 * - Classify and format errors
 * - Track switching state
 */

import { useSwitchChain, useAccount, useChainId } from 'wagmi';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Chain } from 'viem';
import { getChainName } from '@/lib/utils/chain';

// ============================================================================
// Types
// ============================================================================

/**
 * Chain switch error types
 */
export enum ChainSwitchErrorType {
  USER_REJECTED = 'USER_REJECTED',
  UNSUPPORTED_CHAIN = 'UNSUPPORTED_CHAIN',
  WALLET_ERROR = 'WALLET_ERROR',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  TIMEOUT = 'TIMEOUT',
  NOT_CONNECTED = 'NOT_CONNECTED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Chain switch error
 */
export interface ChainSwitchError {
  type: ChainSwitchErrorType;
  message: string;
  originalError?: Error;
  suggestedAction?: string;
  chainId?: number;
}

/**
 * Options for chain switching
 */
export interface SwitchChainOptions {
  /** Whether to verify chain after switch (default: true) */
  verify?: boolean;

  /** Verification timeout in milliseconds (default: 5000) */
  verifyTimeout?: number;

  /** Callback on successful switch */
  onSuccess?: (chain: Chain) => void;

  /** Callback on error */
  onError?: (error: ChainSwitchError) => void;

  /** Callback when verification starts */
  onVerifying?: () => void;
}

/**
 * Result of chain switch operation
 */
export interface SwitchChainResult {
  success: boolean;
  chain?: Chain;
  error?: ChainSwitchError;
}

/**
 * Hook return type
 */
export interface UseChainSwitchReturn {
  /** Switch to a specific chain with options */
  switchChain: (
    chainId: number,
    options?: SwitchChainOptions
  ) => Promise<SwitchChainResult>;

  /** Switch to a specific chain (async, throws on error) */
  switchChainAsync: (chainId: number) => Promise<Chain>;

  /** Require user to be on specific chain (throws if switch fails) */
  requireChainSwitch: (
    requiredChainId: number,
    options?: SwitchChainOptions
  ) => Promise<void>;

  /** Check if currently on specific chain */
  isOnChain: (chainId: number) => boolean;

  /** Whether chain switching is in progress */
  isPending: boolean;

  /** Whether last switch was successful */
  isSuccess: boolean;

  /** Whether last switch failed */
  isError: boolean;

  /** Whether verification is in progress */
  isVerifying: boolean;

  /** Error from chain switching */
  error: ChainSwitchError | null;

  /** Current chain ID */
  currentChainId: number | undefined;

  /** Available chains that can be switched to */
  chains: readonly Chain[];

  /** Reset error state */
  reset: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_VERIFY_TIMEOUT = 5000; // 5 seconds

// ============================================================================
// Utility Functions (Single Responsibility: Error Classification)
// ============================================================================

/**
 * Classify error from chain switch attempt
 */
function classifyChainSwitchError(
  error: unknown,
  chainId?: number
): ChainSwitchError {
  const originalError = error instanceof Error ? error : undefined;
  const message = extractErrorMessage(error);
  const lowerMessage = message.toLowerCase();

  // User rejection
  if (
    lowerMessage.includes('user rejected') ||
    lowerMessage.includes('user denied') ||
    lowerMessage.includes('user cancelled') ||
    lowerMessage.includes('rejected') ||
    lowerMessage.includes('denied')
  ) {
    return {
      type: ChainSwitchErrorType.USER_REJECTED,
      message: 'You rejected the chain switch request in your wallet.',
      originalError,
      suggestedAction:
        'Please approve the chain switch in your wallet to continue.',
      chainId,
    };
  }

  // Unsupported chain
  if (
    lowerMessage.includes('not supported') ||
    lowerMessage.includes('unsupported') ||
    lowerMessage.includes('invalid chain')
  ) {
    return {
      type: ChainSwitchErrorType.UNSUPPORTED_CHAIN,
      message: chainId
        ? `Chain ${getChainName(chainId)} (ID: ${chainId}) is not supported by your wallet.`
        : 'The requested chain is not supported by your wallet.',
      originalError,
      suggestedAction:
        'Please add this network to your wallet or select a different chain.',
      chainId,
    };
  }

  // Timeout
  if (lowerMessage.includes('timeout')) {
    return {
      type: ChainSwitchErrorType.TIMEOUT,
      message: 'Chain switch verification timed out.',
      originalError,
      suggestedAction:
        'Please check your wallet and try again. If the issue persists, try refreshing the page.',
      chainId,
    };
  }

  // Verification failed
  if (lowerMessage.includes('verification failed')) {
    return {
      type: ChainSwitchErrorType.VERIFICATION_FAILED,
      message: 'Failed to verify chain switch completion.',
      originalError,
      suggestedAction:
        'Please check your wallet to confirm the chain switch was successful.',
      chainId,
    };
  }

  // Not connected
  if (
    lowerMessage.includes('not connected') ||
    lowerMessage.includes('no wallet') ||
    lowerMessage.includes('no provider')
  ) {
    return {
      type: ChainSwitchErrorType.NOT_CONNECTED,
      message: 'Wallet is not connected.',
      originalError,
      suggestedAction: 'Please connect your wallet first.',
      chainId,
    };
  }

  // Generic wallet error
  if (
    lowerMessage.includes('wallet') ||
    lowerMessage.includes('provider') ||
    lowerMessage.includes('metamask') ||
    lowerMessage.includes('coinbase')
  ) {
    return {
      type: ChainSwitchErrorType.WALLET_ERROR,
      message: `Wallet error: ${message}`,
      originalError,
      suggestedAction:
        'Please check your wallet connection and try again. If the issue persists, try reconnecting your wallet.',
      chainId,
    };
  }

  // Unknown error
  return {
    type: ChainSwitchErrorType.UNKNOWN,
    message: message || 'An unknown error occurred while switching chains.',
    originalError,
    suggestedAction:
      'Please try again. If the issue persists, try refreshing the page.',
    chainId,
  };
}

/**
 * Extract error message from unknown error
 */
function extractErrorMessage(error: unknown): string {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return String(error);
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Chain switching hook with verification and comprehensive error handling
 *
 * Features:
 * - Switch chains with automatic verification
 * - Classify errors with user-friendly messages
 * - Support for callbacks and custom options
 * - Chain requirement enforcement for swap flow
 * - State tracking (pending, success, error, verifying)
 *
 * @example Basic usage
 * ```tsx
 * const { switchChain, isPending, error } = useChainSwitch();
 *
 * const handleSwitch = async () => {
 *   const result = await switchChain(137); // Polygon
 *   if (result.success) {
 *     console.log('Switched to', result.chain?.name);
 *   }
 * };
 * ```
 *
 * @example With options
 * ```tsx
 * const { switchChain } = useChainSwitch();
 *
 * await switchChain(137, {
 *   verify: true,
 *   verifyTimeout: 10000,
 *   onSuccess: (chain) => console.log('Switched to', chain.name),
 *   onError: (error) => console.error(error.message),
 * });
 * ```
 *
 * @example Require chain for swap
 * ```tsx
 * const { requireChainSwitch, isOnChain } = useChainSwitch();
 *
 * const handleSwap = async () => {
 *   if (!isOnChain(sourceChainId)) {
 *     await requireChainSwitch(sourceChainId);
 *   }
 *   // Proceed with swap
 * };
 * ```
 */
export function useChainSwitch(): UseChainSwitchReturn {
  // ============================================================================
  // Wagmi Hooks
  // ============================================================================

  const {
    switchChainAsync: switchChainAsyncMutation,
    isPending: isSwitchPending,
    isSuccess: isSwitchSuccess,
    isError: isSwitchError,
    error: switchError,
    chains,
    reset: resetMutation,
  } = useSwitchChain();

  const { isConnected } = useAccount();
  const currentChainId = useChainId();

  // ============================================================================
  // Local State
  // ============================================================================

  const [customError, setCustomError] = useState<ChainSwitchError | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetChainIdRef = useRef<number | null>(null);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const error: ChainSwitchError | null = customError
    ? customError
    : switchError
      ? classifyChainSwitchError(
          switchError,
          targetChainIdRef.current ?? undefined
        )
      : null;

  const isPending = isSwitchPending || isVerifying;

  // ============================================================================
  // Verification Logic (Single Responsibility: Verify Chain Switch)
  // ============================================================================

  /**
   * Verify that chain switch was successful
   */
  const verifyChainSwitch = useCallback(
    (
      targetChainId: number,
      timeout: number = DEFAULT_VERIFY_TIMEOUT
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        setIsVerifying(true);

        const startTime = Date.now();
        const checkInterval = 100; // Check every 100ms

        const checkChain = () => {
          if (currentChainId === targetChainId) {
            if (verificationTimeoutRef.current) {
              clearTimeout(verificationTimeoutRef.current);
              verificationTimeoutRef.current = null;
            }
            setIsVerifying(false);
            resolve();
            return;
          }

          const elapsed = Date.now() - startTime;
          if (elapsed >= timeout) {
            if (verificationTimeoutRef.current) {
              clearTimeout(verificationTimeoutRef.current);
              verificationTimeoutRef.current = null;
            }
            setIsVerifying(false);
            reject(
              new Error(
                `Chain switch verification timed out after ${timeout}ms. Expected chain ${targetChainId}, but current chain is ${currentChainId}.`
              )
            );
            return;
          }

          verificationTimeoutRef.current = setTimeout(checkChain, checkInterval);
        };

        checkChain();
      });
    },
    [currentChainId]
  );

  // ============================================================================
  // Cleanup Effect
  // ============================================================================

  useEffect(() => {
    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, []);

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Check if currently on specific chain
   */
  const isOnChain = useCallback(
    (chainId: number): boolean => {
      return currentChainId === chainId;
    },
    [currentChainId]
  );

  /**
   * Reset error state
   */
  const reset = useCallback(() => {
    setCustomError(null);
    resetMutation();
    targetChainIdRef.current = null;
  }, [resetMutation]);

  /**
   * Switch to a specific chain with options and verification
   */
  const switchChain = useCallback(
    async (
      chainId: number,
      options: SwitchChainOptions = {}
    ): Promise<SwitchChainResult> => {
      const {
        verify = true,
        verifyTimeout = DEFAULT_VERIFY_TIMEOUT,
        onSuccess,
        onError,
        onVerifying,
      } = options;

      try {
        // Reset previous errors
        setCustomError(null);
        targetChainIdRef.current = chainId;

        // Check if wallet is connected
        if (!isConnected) {
          const error: ChainSwitchError = {
            type: ChainSwitchErrorType.NOT_CONNECTED,
            message: 'Wallet is not connected.',
            suggestedAction: 'Please connect your wallet first.',
            chainId,
          };
          setCustomError(error);
          onError?.(error);
          return { success: false, error };
        }

        // Check if already on target chain
        if (currentChainId === chainId) {
          const chain = chains.find((c) => c.id === chainId);
          if (chain) {
            onSuccess?.(chain);
            return { success: true, chain };
          }
        }

        // Validate chain is supported
        const chain = chains.find((c) => c.id === chainId);
        if (!chain) {
          const error: ChainSwitchError = {
            type: ChainSwitchErrorType.UNSUPPORTED_CHAIN,
            message: `Chain ${getChainName(chainId)} (ID: ${chainId}) is not configured in the application.`,
            suggestedAction: 'Please select a different chain.',
            chainId,
          };
          setCustomError(error);
          onError?.(error);
          return { success: false, error };
        }

        // Trigger chain switch
        await switchChainAsyncMutation({ chainId });

        // Verify chain switch if requested
        if (verify) {
          onVerifying?.();
          try {
            await verifyChainSwitch(chainId, verifyTimeout);
          } catch (verifyError) {
            const error = classifyChainSwitchError(verifyError, chainId);
            setCustomError(error);
            onError?.(error);
            return { success: false, error };
          }
        }

        // Success
        onSuccess?.(chain);
        return { success: true, chain };
      } catch (cause) {
        const error = classifyChainSwitchError(cause, chainId);
        setCustomError(error);
        onError?.(error);
        return { success: false, error };
      } finally {
        targetChainIdRef.current = null;
      }
    },
    [
      isConnected,
      currentChainId,
      chains,
      switchChainAsyncMutation,
      verifyChainSwitch,
    ]
  );

  /**
   * Switch to a specific chain (async, throws on error)
   */
  const switchChainAsync = useCallback(
    async (chainId: number): Promise<Chain> => {
      const result = await switchChain(chainId);
      if (!result.success || !result.chain) {
        throw result.error || new Error('Chain switch failed');
      }
      return result.chain;
    },
    [switchChain]
  );

  /**
   * Require user to be on specific chain (throws if switch fails)
   * Useful for swap flow to ensure correct chain before execution
   */
  const requireChainSwitch = useCallback(
    async (
      requiredChainId: number,
      options?: SwitchChainOptions
    ): Promise<void> => {
      if (isOnChain(requiredChainId)) {
        return;
      }

      const result = await switchChain(requiredChainId, options);
      if (!result.success) {
        throw (
          result.error ||
          new Error(`Failed to switch to required chain ${requiredChainId}`)
        );
      }
    },
    [isOnChain, switchChain]
  );

  // ============================================================================
  // Return
  // ============================================================================

  return {
    switchChain,
    switchChainAsync,
    requireChainSwitch,
    isOnChain,
    isPending,
    isSuccess: isSwitchSuccess && !isVerifying,
    isError: isSwitchError || !!customError,
    isVerifying,
    error,
    currentChainId,
    chains,
    reset,
  };
}
