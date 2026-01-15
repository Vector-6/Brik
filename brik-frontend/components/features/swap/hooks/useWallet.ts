'use client';

/**
 * useWallet Hook
 * Wrapper around wagmi hooks for simplified wallet state management
 */

import { useAccount, useBalance, useChainId, useDisconnect } from 'wagmi';
import { useMemo } from 'react';
import type { WalletState, WalletBalance } from '@/lib/types/wallet.types';
import type { Address } from 'viem';

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UseWalletReturn {
  /** Wallet connection state */
  wallet: WalletState;

  /** Native token balance */
  balance: WalletBalance | null;

  /** Whether balance is loading */
  isLoadingBalance: boolean;

  /** Disconnect wallet */
  disconnect: () => void;

  /** Short formatted address (e.g., "0x1234...5678") */
  shortAddress: string | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Wallet state management hook
 * Provides easy access to wallet connection status, address, chain, and balance
 *
 * @returns Wallet state and methods
 *
 * @example
 * const { wallet, balance, disconnect, shortAddress } = useWallet();
 *
 * if (!wallet.isConnected) {
 *   return <ConnectButton />;
 * }
 *
 * return (
 *   <div>
 *     <p>Address: {shortAddress}</p>
 *     <p>Balance: {balance?.formatted} {balance?.symbol}</p>
 *     <button onClick={disconnect}>Disconnect</button>
 *   </div>
 * );
 */
export function useWallet(): UseWalletReturn {
  // ============================================================================
  // Wagmi Hooks
  // ============================================================================

  const {
    address,
    isConnected,
    isConnecting,
    isReconnecting,
    isDisconnected,
    chain,
    connector,
  } = useAccount();

  const chainId = useChainId();

  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    isError: isBalanceError,
  } = useBalance({
    address: address as Address | undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  const { disconnect } = useDisconnect();

  // ============================================================================
  // Computed Values
  // ============================================================================

  /**
   * Wallet state object
   */
  const wallet: WalletState = useMemo(
    () => ({
      isConnected,
      isConnecting,
      isReconnecting,
      isDisconnecting: isDisconnected,
      address: address as Address | undefined,
      chainId,
      chain,
      connector: connector?.name,
    }),
    [
      isConnected,
      isConnecting,
      isReconnecting,
      isDisconnected,
      address,
      chainId,
      chain,
      connector,
    ]
  );

  /**
   * Formatted balance
   */
  const balance: WalletBalance | null = useMemo(() => {
    if (!balanceData || isBalanceError) {
      return null;
    }

    return {
      value: balanceData.value,
      formatted: balanceData.formatted,
      decimals: balanceData.decimals,
      symbol: balanceData.symbol,
    };
  }, [balanceData, isBalanceError]);

  /**
   * Short formatted address (0x1234...5678)
   */
  const shortAddress: string | null = useMemo(() => {
    if (!address) {
      return null;
    }

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    wallet,
    balance,
    isLoadingBalance,
    disconnect,
    shortAddress,
  };
}
