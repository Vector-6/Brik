'use client';

/**
 * Swap Notification Utilities
 * Toast notifications for swap events using react-hot-toast
 */

import toast from 'react-hot-toast';

// ============================================================================
// Toast Styles
// ============================================================================

const TOAST_OPTIONS = {
  success: {
    duration: 5000,
    style: {
      background: '#10B981',
      color: '#fff',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10B981',
    },
  },
  error: {
    duration: 6000,
    style: {
      background: '#EF4444',
      color: '#fff',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#EF4444',
    },
  },
  warning: {
    duration: 4000,
    style: {
      background: '#F59E0B',
      color: '#fff',
      fontWeight: '500',
    },
    icon: '⚠️',
  },
  info: {
    duration: 3000,
    style: {
      background: '#3B82F6',
      color: '#fff',
      fontWeight: '500',
    },
    icon: 'ℹ️',
  },
} as const;

// ============================================================================
// Notification Functions
// ============================================================================

/**
 * Show approval success notification
 */
export function notifyApprovalSuccess(tokenSymbol: string) {
  toast.success(`${tokenSymbol} approved successfully!`, TOAST_OPTIONS.success);
}

/**
 * Show approval error notification
 */
export function notifyApprovalError(tokenSymbol: string, error?: string) {
  const message = error
    ? `Failed to approve ${tokenSymbol}: ${error}`
    : `Failed to approve ${tokenSymbol}`;
  toast.error(message, TOAST_OPTIONS.error);
}

/**
 * Show swap initiation notification
 */
export function notifySwapInitiated(fromToken: string, toToken: string) {
  toast.loading(`Swapping ${fromToken} to ${toToken}...`, {
    id: 'swap-execution',
    duration: Infinity, // Keep until manually dismissed
  });
}

/**
 * Show swap success notification
 */
export function notifySwapSuccess(fromToken: string, toToken: string, txHash?: string) {
  // Dismiss loading toast
  toast.dismiss('swap-execution');

  const message = txHash
    ? `Successfully swapped ${fromToken} to ${toToken}`
    : `Swap completed: ${fromToken} → ${toToken}`;

  toast.success(message, TOAST_OPTIONS.success);
}

/**
 * Show swap error notification
 */
export function notifySwapError(error: string) {
  // Dismiss loading toast
  toast.dismiss('swap-execution');

  toast.error(`Swap failed: ${error}`, TOAST_OPTIONS.error);
}

/**
 * Show quote refresh notification
 */
export function notifyQuoteRefreshing() {
  toast.loading('Refreshing quote...', {
    id: 'quote-refresh',
    duration: 2000,
  });
}

/**
 * Show quote stale warning
 */
export function notifyQuoteStale() {
  toast('Quote data is outdated. Click refresh to get latest rates.', {
    ...TOAST_OPTIONS.warning,
    duration: 5000,
  });
}

/**
 * Show quote price change warning
 */
export function notifyPriceChange(percentChange: number) {
  const direction = percentChange > 0 ? 'increased' : 'decreased';
  const absChange = Math.abs(percentChange).toFixed(2);

  toast(
    `Price has ${direction} by ${absChange}% since last quote. Review before confirming.`,
    {
      ...TOAST_OPTIONS.warning,
      duration: 6000,
    }
  );
}

/**
 * Show gas price alert
 */
export function notifyHighGasPrice(gasPriceGwei: number) {
  toast(
    `High gas price detected: ${gasPriceGwei} Gwei. Consider waiting for lower fees.`,
    {
      ...TOAST_OPTIONS.warning,
      duration: 5000,
    }
  );
}

/**
 * Show network switch notification
 */
export function notifyNetworkSwitch(chainName: string) {
  toast.success(`Switched to ${chainName}`, TOAST_OPTIONS.success);
}

/**
 * Show insufficient balance warning
 */
export function notifyInsufficientBalance(tokenSymbol: string) {
  toast.error(
    `Insufficient ${tokenSymbol} balance`,
    TOAST_OPTIONS.error
  );
}

/**
 * Show transaction confirmed notification
 */
export function notifyTransactionConfirmed() {
  toast.success('Transaction confirmed on-chain', {
    ...TOAST_OPTIONS.success,
    duration: 4000,
  });
}

/**
 * Show wallet connection success
 */
export function notifyWalletConnected(address: string) {
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  toast.success(`Wallet connected: ${shortAddress}`, TOAST_OPTIONS.success);
}

/**
 * Show wallet disconnection
 */
export function notifyWalletDisconnected() {
  toast('Wallet disconnected', {
    ...TOAST_OPTIONS.info,
    duration: 2000,
  });
}

/**
 * Show slippage warning for high slippage
 */
export function notifyHighSlippage(slippage: number) {
  toast(
    `High slippage tolerance set: ${slippage}%. Your transaction may be frontrun.`,
    {
      ...TOAST_OPTIONS.warning,
      duration: 5000,
    }
  );
}

/**
 * Show token fetch error notification
 */
export function notifyTokenFetchError(error: string) {
  toast.error(`Failed to load tokens: ${error}`, TOAST_OPTIONS.error);
}

/**
 * Dismiss all active toasts
 */
export function dismissAllNotifications() {
  toast.dismiss();
}

/**
 * Custom toast with custom options
 */
export function notifyCustom(
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) {
  const options = TOAST_OPTIONS[type];

  switch (type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    default:
      toast(message, options);
  }
}
