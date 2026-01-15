/**
 * Transaction Utility Functions
 * Helper functions for formatting and displaying transaction data
 */

import { Transaction, ParsedTransaction, TransactionStatus } from '../api/types/transaction.types';
import { getChainName, getBlockExplorerUrl } from './chain';
import { fromSmallestUnit } from './amountConversion';

// ============================================================================
// Time Formatting
// ============================================================================

/**
 * Format ISO timestamp to relative time string
 *
 * @param timestamp - ISO 8601 timestamp
 * @returns Relative time string (e.g., "2 min ago", "5 hours ago")
 *
 * @example
 * formatTransactionTime("2025-10-21T10:30:00.000Z") // "2 min ago"
 */
export function formatTransactionTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin} min${diffMin !== 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    } else {
      // Format as date for older transactions
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  } catch (error) {
    console.error('Error formatting transaction time:', error);
    return 'Unknown';
  }
}

/**
 * Format timestamp to absolute date time
 *
 * @param timestamp - ISO 8601 timestamp
 * @returns Formatted date time string
 *
 * @example
 * formatAbsoluteTime("2025-10-21T10:30:00.000Z") // "Oct 21, 2025 10:30 AM"
 */
export function formatAbsoluteTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Error formatting absolute time:', error);
    return 'Unknown';
  }
}

// ============================================================================
// Status Utilities
// ============================================================================

/**
 * Get Tailwind color class for transaction status
 *
 * @param status - Transaction status
 * @returns Tailwind color class string
 *
 * @example
 * getTransactionStatusColor('completed') // 'text-green-400'
 */
export function getTransactionStatusColor(status: TransactionStatus): string {
  switch (status) {
    case 'completed':
      return 'text-green-400';
    case 'pending':
      return 'text-yellow-400';
    case 'failed':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get background color class for transaction status badge
 *
 * @param status - Transaction status
 * @returns Tailwind background color class string
 */
export function getTransactionStatusBgColor(status: TransactionStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-green-500/10';
    case 'pending':
      return 'bg-yellow-500/10';
    case 'failed':
      return 'bg-red-500/10';
    default:
      return 'bg-gray-500/10';
  }
}

/**
 * Get display label for transaction status
 *
 * @param status - Transaction status
 * @returns Human-readable status label
 */
export function getTransactionStatusLabel(status: TransactionStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
}

// ============================================================================
// Amount Formatting
// ============================================================================

/**
 * Format transaction amount with proper decimals
 *
 * @param amount - Amount as string (in smallest unit/wei)
 * @param decimals - Token decimals (e.g., 18 for ETH, 6 for USDC)
 * @param maxDecimals - Maximum decimal places to display (default: 6)
 * @returns Formatted amount string
 *
 * @example
 * formatTransactionAmount("1000000000000000000", 18) // "1"
 * formatTransactionAmount("1500000", 6) // "1.5"
 */
export function formatTransactionAmount(
  amount: string,
  decimals: number = 18,
  maxDecimals: number = 6
): string {
  try {
    // Convert from smallest unit (wei) to token amount
    const convertedAmount = fromSmallestUnit(amount, decimals, maxDecimals);
    const numAmount = parseFloat(convertedAmount);

    // Format with appropriate decimal places
    if (numAmount === 0) {
      return '0';
    } else if (numAmount < 0.000001) {
      return '< 0.000001';
    } else if (numAmount < 1) {
      // Show more decimals for small amounts
      return parseFloat(convertedAmount).toFixed(maxDecimals).replace(/\.?0+$/, '');
    } else if (numAmount < 1000) {
      // Show fewer decimals for regular amounts
      return parseFloat(convertedAmount).toFixed(Math.min(4, maxDecimals)).replace(/\.?0+$/, '');
    } else {
      // Show even fewer decimals for large amounts and add commas
      return numAmount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    }
  } catch (error) {
    console.error('Error formatting transaction amount:', error);
    // Return the raw amount if conversion fails
    return amount;
  }
}

/**
 * Format USD value with currency symbol
 *
 * @param value - USD value as number
 * @returns Formatted USD string
 *
 * @example
 * formatUsdValue(1234.56) // "$1,234.56"
 */
export function formatUsdValue(value: number): string {
  try {
    if (value === 0) {
      return '$0.00';
    } else if (value < 0.01) {
      return '< $0.01';
    }

    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch (error) {
    console.error('Error formatting USD value:', error);
    return `$${value}`;
  }
}

// ============================================================================
// Transaction Parsing
// ============================================================================

/**
 * Parse raw transaction into frontend-friendly format with computed properties
 *
 * @param transaction - Raw transaction from API
 * @returns Parsed transaction with display properties
 *
 * @example
 * const parsed = parseTransaction(rawTransaction);
 * console.log(parsed.relativeTime); // "2 min ago"
 * console.log(parsed.explorerUrl); // "https://etherscan.io/tx/0x..."
 */
export function parseTransaction(transaction: Transaction): ParsedTransaction {
  return {
    ...transaction,
    relativeTime: formatTransactionTime(transaction.timestamp),
    explorerUrl: getBlockExplorerUrl(transaction.fromChain, transaction.txHash),
    statusColor: getTransactionStatusColor(transaction.status),
    formattedUsdValue: formatUsdValue(transaction.usdValue),
    fromChainName: getChainName(transaction.fromChain),
    toChainName: getChainName(transaction.toChain),
  };
}

/**
 * Parse multiple transactions
 *
 * @param transactions - Array of raw transactions
 * @returns Array of parsed transactions
 */
export function parseTransactions(transactions: Transaction[]): ParsedTransaction[] {
  return transactions.map(parseTransaction);
}

// ============================================================================
// Transaction Helpers
// ============================================================================

/**
 * Check if transaction is cross-chain
 *
 * @param transaction - Transaction object
 * @returns True if transaction is cross-chain
 */
export function isCrossChain(transaction: Transaction): boolean {
  return transaction.fromChain !== transaction.toChain;
}

/**
 * Get short transaction hash for display
 *
 * @param txHash - Full transaction hash
 * @returns Short hash (e.g., "0x1234...5678")
 */
export function getShortTxHash(txHash: string): string {
  if (!txHash || txHash.length < 10) {
    return txHash;
  }
  return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
}

/**
 * Sort transactions by timestamp (newest first)
 *
 * @param transactions - Array of transactions
 * @returns Sorted array (newest first)
 */
export function sortTransactionsByTime(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateB - dateA; // Newest first
  });
}

/**
 * Filter transactions by status
 *
 * @param transactions - Array of transactions
 * @param status - Status to filter by
 * @returns Filtered transactions
 */
export function filterTransactionsByStatus(
  transactions: Transaction[],
  status: TransactionStatus
): Transaction[] {
  return transactions.filter((tx) => tx.status === status);
}

/**
 * Check if there are any pending transactions
 *
 * @param transactions - Array of transactions
 * @returns True if any transactions are pending
 */
export function hasPendingTransactions(transactions: Transaction[]): boolean {
  return transactions.some((tx) => tx.status === 'pending');
}
