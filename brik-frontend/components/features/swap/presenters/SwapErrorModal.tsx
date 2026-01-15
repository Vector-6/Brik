"use client";

/**
 * SwapErrorModal Component
 * Displays error details when swap fails
 */

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, RefreshCw } from "lucide-react";

import { Z_INDEX } from "@/lib/constants/zIndex";
import type { SwapExecutionError } from "@/lib/types/lifi.types";

// ============================================================================
// Props
// ============================================================================

export interface SwapErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: SwapExecutionError;
  onRetry?: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Error modal component
 * Shows detailed error information with recovery options
 *
 * @example
 * <SwapErrorModal
 *   isOpen={hasError}
 *   onClose={handleClose}
 *   error={swapError}
 *   onRetry={handleRetry}
 * />
 */
export function SwapErrorModal({
  isOpen,
  onClose,
  error,
  onRetry,
}: SwapErrorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 flex items-center justify-center p-4 ${Z_INDEX.MODAL_BACKDROP}`}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-md bg-gradient-to-b from-[#1f1f1f] to-[#0f0f0f] border border-[rgba(253,164,175,0.35)] rounded-2xl shadow-[0_24px_40px_rgba(0,0,0,0.35)] overflow-hidden ${Z_INDEX.MODAL_CONTENT}`}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>

            {/* Content */}
            <div className="p-8 text-center space-y-6">
              {/* Error Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-red-400" />
                </div>
              </motion.div>

              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-white">Swap Failed</h2>
                <p className="mt-2 text-sm text-gray-400">
                  {getErrorTitle(error.type)}
                </p>
              </div>

              {/* Error Details */}
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-left">
                <div className="text-sm text-red-300">{error.message}</div>
                {error.suggestedAction && (
                  <div className="mt-3 pt-3 border-t border-red-500/20">
                    <div className="text-xs font-semibold text-red-400 uppercase nothingclasswide mb-1">
                      Suggested Action
                    </div>
                    <div className="text-sm text-red-300/80">
                      {error.suggestedAction}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                {error.recoverable && onRetry && (
                  <button
                    onClick={onRetry}
                    className="w-full py-4 rounded-lg bg-primary font-bold text-white hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span>Try Again</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Help Text */}
              <div className="text-xs text-gray-500">
                If the problem persists, please contact support or try again
                later.
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getErrorTitle(errorType: string): string {
  const titles: Record<string, string> = {
    user_rejected: "Transaction was rejected",
    insufficient_balance: "Insufficient balance",
    insufficient_gas: "Insufficient gas",
    slippage_exceeded: "Slippage tolerance exceeded",
    quote_expired: "Quote has expired",
    network_error: "Network error occurred",
    unsupported_route: "Route not supported",
    approval_failed: "Token approval failed",
    execution_failed: "Execution failed",
    unknown: "An unexpected error occurred",
  };

  return titles[errorType] || "An error occurred";
}
