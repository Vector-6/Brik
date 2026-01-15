"use client";

/**
 * TransactionListPresenter Component
 * Displays a list of transactions with loading, error, and empty states
 */

import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import {
  ParsedTransaction,
  TransactionErrorResponse,
} from "@/lib/api/types/transaction.types";
import TransactionItemPresenter from "./TransactionItemPresenter";

// ============================================================================
// Types
// ============================================================================

export interface TransactionListPresenterProps {
  /** Array of parsed transactions */
  transactions: ParsedTransaction[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  isError: boolean;
  /** Error object */
  error: TransactionErrorResponse | null;
  /** Whether more pages are available */
  hasMore: boolean;
  /** Whether currently refreshing */
  isRefreshing?: boolean;
  /** Load more handler */
  onLoadMore?: () => void;
  /** Refresh handler */
  onRefresh?: () => void;
  /** Whether loading more items */
  isLoadingMore?: boolean;
  /** Click handler for transaction items */
  onTransactionClick?: (transaction: ParsedTransaction) => void;
  /** Whether wallet is connected (for empty state) */
  isWalletConnected?: boolean;
  /** Show less handler to collapse transactions */
  onShowLess?: () => void;
  /** Initial page size to determine when to show "Show Less" button */
  initialPageSize?: number;
  /** Token decimals map for amount conversion */
  tokenDecimalsMap?: Map<string, number>;
}

// ============================================================================
// Loading Skeleton Component
// ============================================================================

function TransactionSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center justify-between p-3 rounded-lg bg-navy/30"
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Status Circle Skeleton */}
        <div className="w-8 h-8 rounded-full bg-navy/50 animate-pulse" />

        {/* Content Skeleton */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-navy/50 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-navy/30 rounded animate-pulse w-1/2" />
        </div>
      </div>

      {/* Value Skeleton */}
      <div className="w-20 h-4 bg-navy/50 rounded animate-pulse" />
    </motion.div>
  );
}

// ============================================================================
// Empty State Component
// ============================================================================

function EmptyState({ isConnected }: { isConnected: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-12"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gold"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {isConnected ? "No transactions yet" : "No recent swaps"}
      </h3>
      <p className="text-sm text-gray-400 max-w-xs mx-auto">
        {isConnected
          ? "Your transaction history will appear here once you make your first swap."
          : "Platform transactions will appear here as users make swaps."}
      </p>
    </motion.div>
  );
}

// ============================================================================
// Error State Component
// ============================================================================

function ErrorState({
  error,
  onRefresh,
}: {
  error: TransactionErrorResponse | null;
  onRefresh?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-12"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        Unable to load transactions
      </h3>
      <p className="text-sm text-gray-400 max-w-xs mx-auto mb-4">
        {error?.message || "Something went wrong while fetching transactions."}
      </p>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy hover:bg-navy/20 text-gold border border-gold/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </motion.div>
  );
}

// ============================================================================
// Component
// ============================================================================

/**
 * Transaction list presenter component
 * Handles display of transaction list with various states
 *
 * @example
 * <TransactionListPresenter
 *   transactions={parsedTransactions}
 *   isLoading={false}
 *   isError={false}
 *   error={null}
 *   hasMore={true}
 *   onLoadMore={handleLoadMore}
 *   onRefresh={handleRefresh}
 * />
 */
export default function TransactionListPresenter({
  transactions,
  isLoading,
  isError,
  error,
  hasMore,
  isRefreshing = false,
  onLoadMore,
  onRefresh,
  isLoadingMore = false,
  onTransactionClick,
  isWalletConnected = false,
  onShowLess,
  initialPageSize = 5,
  tokenDecimalsMap = new Map(),
}: TransactionListPresenterProps) {
  // ============================================================================
  // Loading State (Initial)
  // ============================================================================

  if (isLoading && transactions.length === 0) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <TransactionSkeleton key={index} index={index} />
        ))}
      </div>
    );
  }

  // ============================================================================
  // Error State
  // ============================================================================

  if (isError && transactions.length === 0) {
    return <ErrorState error={error} onRefresh={onRefresh} />;
  }

  // ============================================================================
  // Empty State
  // ============================================================================

  if (!isLoading && transactions.length === 0) {
    return <EmptyState isConnected={isWalletConnected} />;
  }

  // ============================================================================
  // Transactions List
  // ============================================================================

  return (
    <div className="space-y-3">
      {/* Refresh Indicator */}
      {isRefreshing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center justify-center gap-2 text-xs text-purple-400 pb-2"
        >
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Updating...</span>
        </motion.div>
      )}

      {/* Transactions - Scrollable Container */}
      <div className="max-h-[600px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
        {transactions.map((transaction, index) => (
          <TransactionItemPresenter
            key={transaction.id}
            transaction={transaction}
            animationDelay={index * 0.05}
            onClick={onTransactionClick}
            tokenDecimalsMap={tokenDecimalsMap}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 space-y-2">
        {/* Load More Button */}
        {hasMore && onLoadMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="w-full py-3 rounded-lg bg-primary hover:bg-primary-light text-white border border-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading more...</span>
                </>
              ) : (
                <span>Load More</span>
              )}
            </button>
          </motion.div>
        )}

        {/* Show Less Button - Only show if we have more than initial page */}
        {transactions.length > initialPageSize && onShowLess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={onShowLess}
              className="w-full py-2 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 text-gray-400 hover:text-gray-300 border border-gray-700/30 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-sm">Show Less</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* End Indicator */}
      {!hasMore && transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center pt-4 pb-2 text-xs text-gray-500"
        >
          No more transactions
        </motion.div>
      )}
    </div>
  );
}
