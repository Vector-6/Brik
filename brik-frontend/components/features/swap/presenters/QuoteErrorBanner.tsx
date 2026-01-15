"use client";

/**
 * QuoteErrorBanner
 * User-friendly error display for quote-related errors
 * Handles rate limits with countdown, dismissal, and recovery suggestions
 */

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Clock, X, RefreshCw } from "lucide-react";

import type { SwapQuoteError } from "../hooks/useSwapQuote";

// ============================================================================
// Props Interface
// ============================================================================

export interface QuoteErrorBannerProps {
  error: SwapQuoteError | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  isDismissed: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format seconds into human-readable time
 * Examples: "2m 30s", "1h 15m", "45s"
 */
function formatRetryTime(seconds: number): string {
  if (seconds <= 0) {
    return "now";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0 && hours === 0) {
    // Only show seconds if less than 1 hour
    parts.push(`${secs}s`);
  }

  return parts.join(" ") || "now";
}

/**
 * Get error icon color based on error type
 */
function getErrorColor(errorType: string): string {
  switch (errorType) {
    case "rate_limit":
      return "#ffd700"; // Gold for rate limits (temporary/wait)
    case "network":
      return "#fda4af"; // Pink for network errors
    case "validation":
      return "#fda4af"; // Pink for validation errors
    default:
      return "#fda4af"; // Pink for unknown errors
  }
}

/**
 * Get error title based on error type
 */
function getErrorTitle(errorType: string): string {
  switch (errorType) {
    case "rate_limit":
      return "Rate Limit Reached";
    case "network":
      return "Network Error";
    case "validation":
      return "Validation Error";
    default:
      return "Quote Error";
  }
}

// ============================================================================
// Component
// ============================================================================

export function QuoteErrorBanner({
  error,
  onDismiss,
  onRetry,
  isDismissed,
}: QuoteErrorBannerProps): React.JSX.Element | null {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // Initialize countdown for rate limit errors
  useEffect(() => {
    if (error?.type === "rate_limit" && error.retryAfter) {
      setTimeRemaining(error.retryAfter);
      setIsCountingDown(true);
    } else {
      setTimeRemaining(null);
      setIsCountingDown(false);
    }
  }, [error]);

  // Countdown timer
  useEffect(() => {
    if (!isCountingDown || timeRemaining === null || timeRemaining <= 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          setIsCountingDown(false);
          // Auto-retry when countdown reaches 0
          if (onRetry) {
            setTimeout(() => onRetry(), 500);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCountingDown, timeRemaining, onRetry]);

  const handleDismiss = useCallback(() => {
    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);

  // Don't render if no error or dismissed
  if (!error || isDismissed) {
    return null;
  }

  const errorColor = getErrorColor(error.type);
  const errorTitle = getErrorTitle(error.type);
  const isRateLimit = error.type === "rate_limit";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4 overflow-hidden"
      >
        <div
          className={`p-4 rounded-xl border ${
            isRateLimit
              ? "bg-[rgba(255,215,0,0.12)] border-[rgba(255,215,0,0.35)]"
              : "bg-[rgba(244,114,182,0.12)] border-[rgba(244,114,182,0.35)]"
          }`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {isRateLimit ? (
                <Clock
                  className="w-5 h-5"
                  style={{ color: errorColor }}
                  aria-hidden="true"
                />
              ) : (
                <AlertCircle
                  className="w-5 h-5"
                  style={{ color: errorColor }}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3
                className="text-sm font-semibold mb-1"
                style={{ color: errorColor }}
              >
                {errorTitle}
              </h3>

              {/* Message */}
              <p className="text-sm text-gray-300 mb-2">{error.message}</p>

              {/* Countdown for rate limits */}
              {isRateLimit && timeRemaining !== null && timeRemaining > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>
                    Retry available in{" "}
                    <span className="font-semibold text-[#ffd700]">
                      {formatRetryTime(timeRemaining)}
                    </span>
                  </span>
                </div>
              )}

              {/* Auto-refresh message */}
              {isRateLimit && timeRemaining !== null && timeRemaining > 0 && (
                <p className="text-xs text-gray-500">
                  The page will automatically refresh when ready
                </p>
              )}

              {/* Retry button for other errors */}
              {!isRateLimit && onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-[rgba(244,114,182,0.2)] hover:bg-[rgba(244,114,182,0.3)] border border-[rgba(244,114,182,0.4)] rounded-lg text-sm font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-[rgba(244,114,182,0.45)] focus:ring-offset-2 focus:ring-offset-[#1f1f1f]"
                  aria-label="Retry fetching quote"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Try Again
                </button>
              )}
            </div>

            {/* Dismiss button */}
            {onDismiss && (
              <button
                onClick={handleDismiss}
                className={`flex-shrink-0 p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1f1f1f] ${
                  isRateLimit
                    ? "hover:bg-[rgba(255,215,0,0.2)] focus:ring-[rgba(255,215,0,0.45)]"
                    : "hover:bg-[rgba(244,114,182,0.2)] focus:ring-[rgba(244,114,182,0.45)]"
                }`}
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4 text-gray-400" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default QuoteErrorBanner;
