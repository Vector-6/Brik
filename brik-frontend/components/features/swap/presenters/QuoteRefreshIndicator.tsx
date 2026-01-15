"use client";

/**
 * QuoteRefreshIndicator Component
 * Shows countdown timer and manual refresh button for quotes
 */

import { motion } from "framer-motion";
import { RefreshCw, Clock, AlertTriangle } from "lucide-react";

// ============================================================================
// Props
// ============================================================================

export interface QuoteRefreshIndicatorProps {
  /** Seconds until next auto-refresh */
  secondsUntilRefresh: number;
  /** Whether the quote is stale */
  isStale: boolean;
  /** Whether a refresh is in progress */
  isRefreshing?: boolean;
  /** Whether initial quote is loading */
  isLoading?: boolean;
  /** Whether any quote fetching is in progress */
  isFetching?: boolean;
  /** Manual refresh callback */
  onRefresh: () => void;
  /** Whether to show the indicator */
  show?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Quote refresh indicator with countdown timer
 *
 * @example
 * <QuoteRefreshIndicator
 *   secondsUntilRefresh={25}
 *   isStale={false}
 *   isRefreshing={false}
 *   isLoading={false}
 *   isFetching={true}
 *   onRefresh={handleRefresh}
 * />
 */
export function QuoteRefreshIndicator({
  secondsUntilRefresh,
  isStale,
  isRefreshing = false,
  isLoading = false,
  isFetching = false,
  onRefresh,
  show = true,
}: QuoteRefreshIndicatorProps) {
  if (!show) return null;

  // Determine if any loading state is active
  const isAnyLoading = isRefreshing || isLoading || isFetching;

  // Determine appropriate button text
  const getButtonText = () => {
    if (isLoading) return "Fetching...";
    if (isRefreshing) return "Refreshing...";
    if (isFetching) return "Updating...";
    return "Refresh";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 text-sm"
      role="status"
      aria-live="polite"
    >
      {/* Countdown Timer */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
        <span
          className={`font-mono ${
            isStale ? "text-amber-500" : "text-gray-400"
          }`}
        >
          {isStale ? "Quote stale" : `${secondsUntilRefresh}s`}
        </span>
      </div>

      {/* Stale Warning */}
      {isStale && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1 text-amber-500"
          role="alert"
        >
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <span className="text-xs">Outdated</span>
        </motion.div>
      )}

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isAnyLoading}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg
          transition-all duration-200
          ${
            isStale
              ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              : "bg-gold/20 text-gold hover:bg-gold/30"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-gray-900
          group
        `}
        aria-label={
          isAnyLoading ? "Fetching quote" : "Refresh quote manually"
        }
      >
        <RefreshCw
          className={`h-4 w-4 transition-transform duration-300 ${
            isAnyLoading ? "animate-spin" : "group-hover:rotate-180"
          }`}
          aria-hidden="true"
        />
        <span className="text-xs font-medium">
          {getButtonText()}
        </span>
      </button>
    </motion.div>
  );
}

// ============================================================================
// Compact Version (for limited space)
// ============================================================================

export interface CompactQuoteRefreshProps {
  secondsUntilRefresh: number;
  isStale: boolean;
  isRefreshing?: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  onRefresh: () => void;
}

/**
 * Compact version showing only icon button
 */
export function CompactQuoteRefresh({
  secondsUntilRefresh,
  isStale,
  isRefreshing = false,
  isLoading = false,
  isFetching = false,
  onRefresh,
}: CompactQuoteRefreshProps) {
  const isAnyLoading = isRefreshing || isLoading || isFetching;

  return (
    <div className="flex items-center gap-2">
      {/* Timer Badge */}
      <div
        className={`
          px-2 py-1 rounded-md text-xs font-mono
          ${
            isStale
              ? "bg-amber-500/20 text-amber-400"
              : "bg-gray-800 text-gray-400"
          }
        `}
      >
        {isStale ? "Stale" : `${secondsUntilRefresh}s`}
      </div>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isAnyLoading}
        className={`
          p-2 rounded-lg transition-all
          ${
            isStale
              ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }
          disabled:opacity-50
        `}
        aria-label="Refresh quote"
      >
        <RefreshCw
          className={`h-4 w-4 ${isAnyLoading ? "animate-spin" : ""}`}
        />
      </button>
    </div>
  );
}
