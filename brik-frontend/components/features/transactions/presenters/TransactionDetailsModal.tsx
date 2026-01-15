"use client";

/**
 * TransactionDetailsModal Component
 * Displays detailed information about a transaction in a modal
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { ParsedTransaction } from "@/lib/api/types/transaction.types";
import {
  formatAbsoluteTime,
  getTransactionStatusLabel,
  formatTransactionAmount,
} from "@/lib/utils/transaction";
import toast from "react-hot-toast";
import { Z_INDEX } from "@/lib/constants/zIndex";

// ============================================================================
// Types
// ============================================================================

export interface TransactionDetailsModalProps {
  /** Transaction to display */
  transaction: ParsedTransaction | null;
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Token decimals map for amount conversion */
  tokenDecimalsMap?: Map<string, number>;
}

// ============================================================================
// Component
// ============================================================================

export default function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
  tokenDecimalsMap = new Map(),
}: TransactionDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!transaction) return null;

  // Get decimals for tokens, default to 18 if not found
  const fromTokenDecimals = tokenDecimalsMap.get(transaction.fromToken) || 18;
  const toTokenDecimals = tokenDecimalsMap.get(transaction.toToken) || 18;

  // Format amounts from wei to ethers
  const formattedFromAmount = formatTransactionAmount(
    transaction.fromAmount,
    fromTokenDecimals
  );
  const formattedToAmount = formatTransactionAmount(
    transaction.toAmount,
    toTokenDecimals
  );

  // Copy to clipboard handler
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Status icon
  const StatusIcon = () => {
    switch (transaction.status) {
      case "completed":
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case "pending":
        return <Clock className="w-8 h-8 text-yellow-400 animate-pulse" />;
      case "failed":
        return <XCircle className="w-8 h-8 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`fixed inset-0 bg-black/80 backdrop-blur-sm ${Z_INDEX.MODAL_BACKDROP}`}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed inset-0 flex items-center justify-center p-4 pointer-events-none ${Z_INDEX.MODAL_CONTENT}`}
          >
            <div
              className="bg-background border border-color-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-charcoal backdrop-blur-lg border-b border-color-border p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon />
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Transaction Details
                    </h2>
                    <p className="text-sm text-gray-400 capitalize">
                      {getTransactionStatusLabel(transaction.status)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Transaction Overview */}
                <div className="bg-charcoal border border-color-border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">From</p>
                      <p className="text-lg font-bold text-white">
                        {formattedFromAmount} {transaction.fromToken}
                      </p>
                      <p className="text-xs text-gold mt-1">
                        {transaction.fromChainName}
                      </p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-500 flex-shrink-0 mx-4" />
                    <div className="flex-1 text-right">
                      <p className="text-xs text-gray-400 mb-1">To</p>
                      <p className="text-lg font-bold text-white">
                        {formattedToAmount} {transaction.toToken}
                      </p>
                      <p className="text-xs text-gold mt-1">
                        {transaction.toChainName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* USD Value */}
                <div>
                  <label className="text-xs text-gray-400 uppercase nothingclasswider mb-2 block">
                    Transaction Value
                  </label>
                  <div className="text-2xl font-bold text-white">
                    {transaction.formattedUsdValue}
                  </div>
                </div>

                {/* Transaction Hash */}
                <div>
                  <label className="text-xs text-gray-400 uppercase nothingclasswider mb-2 block">
                    Transaction Hash
                  </label>
                  <div className="flex items-center gap-2 bg-charcoal border border-color-border rounded-lg p-3">
                    <code className="text-sm text-gold font-mono flex-1 truncate">
                      {transaction.txHash}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(transaction.txHash, "Transaction Hash")
                      }
                      className="p-2 hover:bg-navy rounded transition-colors flex-shrink-0"
                      title="Copy"
                    >
                      {copiedField === "Transaction Hash" ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {transaction.explorerUrl && (
                      <a
                        href={transaction.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-navy rounded transition-colors flex-shrink-0"
                        title="View on Explorer"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Wallet Address */}
                <div>
                  <label className="text-xs text-gray-400 uppercase nothingclasswider mb-2 block">
                    Wallet Address
                  </label>
                  <div className="flex items-center gap-2 bg-charcoal border border-color-border rounded-lg p-3">
                    <code className="text-sm text-gray-300 font-mono flex-1 truncate">
                      {transaction.walletAddress}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          transaction.walletAddress,
                          "Wallet Address"
                        )
                      }
                      className="p-2 hover:bg-navy rounded transition-colors flex-shrink-0"
                      title="Copy"
                    >
                      {copiedField === "Wallet Address" ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase nothingclasswider mb-2 block">
                      Time
                    </label>
                    <p className="text-sm text-white">
                      {formatAbsoluteTime(transaction.timestamp)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase nothingclasswider mb-2 block">
                      Relative
                    </label>
                    <p className="text-sm text-white">
                      {transaction.relativeTime}
                    </p>
                  </div>
                </div>

                {/* Chain IDs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase nothingclasswider mb-2 block">
                      From Chain ID
                    </label>
                    <p className="text-sm text-white">
                      {transaction.fromChain}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase nothingclasswider mb-2 block">
                      To Chain ID
                    </label>
                    <p className="text-sm text-white">{transaction.toChain}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-charcoal backdrop-blur-lg border-t border-color-border p-6">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-primary hover:bg-primary-light cursor-pointer text-white font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
