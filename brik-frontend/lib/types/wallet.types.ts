/**
 * Wallet Type Definitions
 * Types for wallet state, connections, and transactions
 */

import type { Address, Chain } from 'viem';

// ============================================================================
// Wallet Connection Types
// ============================================================================

/**
 * Wallet connection state
 */
export interface WalletState {
  /** Whether a wallet is connected */
  isConnected: boolean;

  /** Whether wallet is connecting */
  isConnecting: boolean;

  /** Whether wallet is reconnecting */
  isReconnecting: boolean;

  /** Whether wallet is disconnecting */
  isDisconnecting: boolean;

  /** Connected wallet address */
  address?: Address;

  /** Current chain ID */
  chainId?: number;

  /** Current chain object */
  chain?: Chain;

  /** Connector name (e.g., 'MetaMask', 'WalletConnect') */
  connector?: string;
}

/**
 * Wallet balance information
 */
export interface WalletBalance {
  /** Balance value in smallest unit */
  value: bigint;

  /** Balance formatted as string */
  formatted: string;

  /** Number of decimals */
  decimals: number;

  /** Token symbol */
  symbol: string;
}

// ============================================================================
// Transaction Types
// ============================================================================

/**
 * Transaction status
 */
export type TransactionStatus =
  | 'idle'
  | 'preparing'
  | 'signing'
  | 'pending'
  | 'success'
  | 'error';

/**
 * Transaction state
 */
export interface TransactionState {
  /** Current transaction status */
  status: TransactionStatus;

  /** Transaction hash */
  hash?: Address;

  /** Error message if transaction failed */
  error?: string;

  /** Block number where transaction was mined */
  blockNumber?: bigint;

  /** Number of confirmations */
  confirmations?: number;
}

/**
 * Swap transaction data
 */
export interface SwapTransaction {
  /** From token address */
  fromToken: Address;

  /** To token address */
  toToken: Address;

  /** Amount to swap (in smallest unit) */
  amount: bigint;

  /** Minimum amount to receive (slippage protection) */
  minAmountOut: bigint;

  /** User's wallet address */
  userAddress: Address;

  /** Source chain ID */
  fromChainId: number;

  /** Destination chain ID */
  toChainId: number;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Wallet error types
 */
export type WalletErrorType =
  | 'user_rejected'
  | 'insufficient_funds'
  | 'unsupported_chain'
  | 'network_error'
  | 'contract_error'
  | 'unknown_error';

/**
 * Wallet error
 */
export interface WalletError {
  type: WalletErrorType;
  message: string;
  originalError?: Error;
}

// ============================================================================
// Chain Switching Types
// ============================================================================

/**
 * Chain switch request
 */
export interface ChainSwitchRequest {
  /** Target chain ID */
  chainId: number;

  /** Whether to show user prompt */
  showPrompt?: boolean;

  /** Callback on success */
  onSuccess?: () => void;

  /** Callback on error */
  onError?: (error: Error) => void;
}
