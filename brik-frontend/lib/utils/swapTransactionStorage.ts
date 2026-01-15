/**
 * Swap Transaction Storage Utility
 *
 * Handles localStorage operations for swap transactions following SRP.
 * Responsible ONLY for storage operations - no business logic.
 */

import type { Transaction } from '../api/types/transaction.types';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = '@brik/swap_transactions';
const MAX_STORED_TRANSACTIONS = 100; // Limit to prevent localStorage overflow

// ============================================================================
// Types
// ============================================================================

interface StoredTransaction extends Transaction {
  /** Local storage timestamp for cache management */
  _storedAt: number;
}

interface StorageMetadata {
  version: string;
  lastUpdated: number;
}

interface SwapTransactionStorage {
  metadata: StorageMetadata;
  transactions: StoredTransaction[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    // Test if we can actually use it
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current storage data or initialize empty storage
 */
function getStorageData(): SwapTransactionStorage {
  if (!isLocalStorageAvailable()) {
    return createEmptyStorage();
  }

  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return createEmptyStorage();
    }

    const parsed = JSON.parse(data) as SwapTransactionStorage;

    // Validate structure
    if (!parsed.metadata || !Array.isArray(parsed.transactions)) {
      console.warn('[SwapStorage] Invalid storage structure, resetting');
      return createEmptyStorage();
    }

    return parsed;
  } catch (error) {
    console.error('[SwapStorage] Error reading from localStorage:', error);
    return createEmptyStorage();
  }
}

/**
 * Create empty storage structure
 */
function createEmptyStorage(): SwapTransactionStorage {
  return {
    metadata: {
      version: '1.0.0',
      lastUpdated: Date.now(),
    },
    transactions: [],
  };
}

/**
 * Save storage data to localStorage
 */
function saveStorageData(data: SwapTransactionStorage): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    // Update metadata
    data.metadata.lastUpdated = Date.now();

    // Save to localStorage
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('[SwapStorage] Error writing to localStorage:', error);

    // If quota exceeded, try clearing old transactions and retry
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('[SwapStorage] Quota exceeded, clearing old transactions');
      try {
        data.transactions = data.transactions.slice(0, Math.floor(MAX_STORED_TRANSACTIONS / 2));
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Save a swap transaction to localStorage
 *
 * @param transaction - Transaction to save
 * @returns Success status
 *
 * @example
 * const success = saveSwapTransaction(transaction);
 * if (success) {
 *   console.log('Transaction saved');
 * }
 */
export function saveSwapTransaction(transaction: Transaction): boolean {
  const storage = getStorageData();

  // Check if transaction already exists (by id or txHash)
  const existingIndex = storage.transactions.findIndex(
    (tx) => tx.id === transaction.id || tx.txHash === transaction.txHash
  );

  const storedTransaction: StoredTransaction = {
    ...transaction,
    _storedAt: Date.now(),
  };

  if (existingIndex !== -1) {
    // Update existing transaction
    storage.transactions[existingIndex] = storedTransaction;
  } else {
    // Add new transaction at the beginning (most recent first)
    storage.transactions.unshift(storedTransaction);

    // Limit storage size
    if (storage.transactions.length > MAX_STORED_TRANSACTIONS) {
      storage.transactions = storage.transactions.slice(0, MAX_STORED_TRANSACTIONS);
    }
  }

  return saveStorageData(storage);
}

/**
 * Get a specific swap transaction by ID or txHash
 *
 * @param identifier - Transaction ID or transaction hash
 * @returns Transaction if found, null otherwise
 *
 * @example
 * const transaction = getSwapTransaction('tx-123');
 * if (transaction) {
 *   console.log('Found:', transaction);
 * }
 */
export function getSwapTransaction(identifier: string): Transaction | null {
  const storage = getStorageData();

  const transaction = storage.transactions.find(
    (tx) => tx.id === identifier || tx.txHash === identifier
  );

  if (!transaction) {
    return null;
  }

  // Remove internal _storedAt property before returning
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _storedAt, ...cleanTransaction } = transaction;
  return cleanTransaction;
}

/**
 * Get all swap transactions from localStorage
 *
 * @param options - Optional filtering and sorting options
 * @returns Array of transactions
 *
 * @example
 * // Get all transactions
 * const allTxs = getAllSwapTransactions();
 *
 * // Get only pending transactions
 * const pendingTxs = getAllSwapTransactions({ status: 'pending' });
 *
 * // Get transactions for a specific wallet
 * const walletTxs = getAllSwapTransactions({ walletAddress: '0x...' });
 */
export function getAllSwapTransactions(options?: {
  walletAddress?: string;
  status?: Transaction['status'];
  limit?: number;
}): Transaction[] {
  const storage = getStorageData();
  let transactions = storage.transactions;

  // Filter by wallet address if provided
  if (options?.walletAddress) {
    transactions = transactions.filter(
      (tx) => tx.walletAddress.toLowerCase() === options.walletAddress!.toLowerCase()
    );
  }

  // Filter by status if provided
  if (options?.status) {
    transactions = transactions.filter((tx) => tx.status === options.status);
  }

  // Limit results if specified
  if (options?.limit && options.limit > 0) {
    transactions = transactions.slice(0, options.limit);
  }

  // Remove internal _storedAt property before returning
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return transactions.map(({ _storedAt, ...cleanTransaction }) => cleanTransaction);
}

/**
 * Get count of stored transactions
 *
 * @param walletAddress - Optional wallet address to filter by
 * @returns Number of stored transactions
 *
 * @example
 * const count = getSwapTransactionCount();
 * console.log(`${count} transactions stored`);
 */
export function getSwapTransactionCount(walletAddress?: string): number {
  const storage = getStorageData();

  if (!walletAddress) {
    return storage.transactions.length;
  }

  return storage.transactions.filter(
    (tx) => tx.walletAddress.toLowerCase() === walletAddress.toLowerCase()
  ).length;
}

/**
 * Remove a specific swap transaction
 *
 * @param identifier - Transaction ID or transaction hash
 * @returns Success status
 *
 * @example
 * const removed = removeSwapTransaction('tx-123');
 */
export function removeSwapTransaction(identifier: string): boolean {
  const storage = getStorageData();

  const initialLength = storage.transactions.length;
  storage.transactions = storage.transactions.filter(
    (tx) => tx.id !== identifier && tx.txHash !== identifier
  );

  // Only save if something was actually removed
  if (storage.transactions.length < initialLength) {
    return saveStorageData(storage);
  }

  return false;
}

/**
 * Clear all swap transactions from localStorage
 *
 * @param walletAddress - Optional wallet address to clear only that wallet's transactions
 * @returns Success status
 *
 * @example
 * // Clear all transactions
 * clearSwapTransactions();
 *
 * // Clear only transactions for a specific wallet
 * clearSwapTransactions('0x...');
 */
export function clearSwapTransactions(walletAddress?: string): boolean {
  const storage = getStorageData();

  if (walletAddress) {
    // Clear only transactions for specific wallet
    storage.transactions = storage.transactions.filter(
      (tx) => tx.walletAddress.toLowerCase() !== walletAddress.toLowerCase()
    );
  } else {
    // Clear all transactions
    storage.transactions = [];
  }

  return saveStorageData(storage);
}

/**
 * Clean up old transactions to free up space
 * Removes transactions older than the specified days
 *
 * @param daysToKeep - Number of days to keep (default: 30)
 * @returns Number of transactions removed
 *
 * @example
 * const removed = cleanupOldTransactions(7); // Keep only last 7 days
 * console.log(`Removed ${removed} old transactions`);
 */
export function cleanupOldTransactions(daysToKeep: number = 30): number {
  const storage = getStorageData();
  const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

  const initialCount = storage.transactions.length;
  storage.transactions = storage.transactions.filter(
    (tx) => tx._storedAt > cutoffTime
  );

  const removedCount = initialCount - storage.transactions.length;

  if (removedCount > 0) {
    saveStorageData(storage);
  }

  return removedCount;
}

/**
 * Update transaction status (useful for pending transactions)
 *
 * @param identifier - Transaction ID or transaction hash
 * @param newStatus - New status to set
 * @returns Success status
 *
 * @example
 * // Update a pending transaction to completed
 * updateSwapTransactionStatus('0x123...', 'completed');
 */
export function updateSwapTransactionStatus(
  identifier: string,
  newStatus: Transaction['status']
): boolean {
  const storage = getStorageData();

  const transaction = storage.transactions.find(
    (tx) => tx.id === identifier || tx.txHash === identifier
  );

  if (!transaction) {
    return false;
  }

  transaction.status = newStatus;
  transaction._storedAt = Date.now(); // Update stored timestamp

  return saveStorageData(storage);
}

/**
 * Check if localStorage is available and working
 *
 * @returns True if localStorage is available
 *
 * @example
 * if (!isStorageAvailable()) {
 *   console.warn('localStorage not available, transactions will not be persisted');
 * }
 */
export function isStorageAvailable(): boolean {
  return isLocalStorageAvailable();
}

/**
 * Get storage metadata
 *
 * @returns Storage metadata including version and last updated time
 */
export function getStorageMetadata(): StorageMetadata {
  const storage = getStorageData();
  return storage.metadata;
}
