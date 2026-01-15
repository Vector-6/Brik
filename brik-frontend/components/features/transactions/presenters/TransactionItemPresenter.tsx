"use client";

/**
 * TransactionItemPresenter Component
 * Displays a single transaction row with all relevant information
 */

import { motion } from "framer-motion";
import { ArrowRightIcon, ExternalLinkIcon, Loader2 } from "lucide-react";
import { ParsedTransaction } from "@/lib/api/types/transaction.types";
import {
  getTransactionStatusBgColor,
  getShortTxHash,
  formatTransactionAmount,
} from "@/lib/utils/transaction";

// ============================================================================
// Types
// ============================================================================

export interface TransactionItemPresenterProps {
  /** Parsed transaction data */
  transaction: ParsedTransaction;
  /** Animation delay for staggered effects (optional) */
  animationDelay?: number;
  /** Click handler (optional) */
  onClick?: (transaction: ParsedTransaction) => void;
  /** Token decimals map for amount conversion */
  tokenDecimalsMap?: Map<string, number>;
}

// ============================================================================
// Status Icon Component
// ============================================================================

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <div className="w-2 h-2 rounded-full bg-green-400" />;
    case "pending":
      return <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />;
    case "failed":
      return <div className="w-2 h-2 rounded-full bg-red-400" />;
    default:
      return <div className="w-2 h-2 rounded-full bg-gray-400" />;
  }
}

// ============================================================================
// Chain Badge Component
// ============================================================================

function ChainBadge({ chainName }: { chainName: string }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">
      {chainName}
    </span>
  );
}

// ============================================================================
// Component
// ============================================================================

/**
 * Transaction item presenter component
 * Displays transaction details in a compact, interactive row
 *
 * @example
 * <TransactionItemPresenter
 *   transaction={parsedTransaction}
 *   animationDelay={0.1}
 *   onClick={(tx) => window.open(tx.explorerUrl, '_blank')}
 * />
 */
export default function TransactionItemPresenter({
  transaction,
  animationDelay = 0,
  onClick,
  tokenDecimalsMap = new Map(),
}: TransactionItemPresenterProps) {
  const {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    fromChainName,
    toChainName,
    status,
    relativeTime,
    explorerUrl,
    formattedUsdValue,
    txHash,
  } = transaction;

  // Get decimals for tokens, default to 18 if not found
  const fromTokenDecimals = tokenDecimalsMap.get(fromToken) || 18;
  const toTokenDecimals = tokenDecimalsMap.get(toToken) || 18;

  // Format amounts from wei to ethers
  const formattedFromAmount = formatTransactionAmount(
    fromAmount,
    fromTokenDecimals
  );
  const formattedToAmount = formatTransactionAmount(toAmount, toTokenDecimals);

  // Handle click
  const handleClick = () => {
    if (onClick) {
      onClick(transaction);
    }
  };

  // Check if cross-chain
  const isCrossChain = fromChainName !== toChainName;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: animationDelay }}
      onClick={handleClick}
      className="group relative flex items-center justify-between p-3 rounded-lg hover:bg-background transition-all cursor-pointer border border-transparent hover:border-color-border"
    >
      {/* Status Indicator */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Left Section: Transaction Details */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Status Icon */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full ${getTransactionStatusBgColor(
            status
          )} flex items-center justify-center`}
        >
          <StatusIcon status={status} />
        </div>

        {/* Transaction Info */}
        <div className="flex-1 min-w-0">
          {/* Token Swap Details */}
          <div className="flex items-center gap-1.5 text-sm font-medium text-white mb-1">
            <span className="truncate">
              {formattedFromAmount} {fromToken}
            </span>
            <ArrowRightIcon className="w-3 h-3 flex-shrink-0 text-gray-400" />
            <span className="truncate">
              {formattedToAmount} {toToken}
            </span>
          </div>

          {/* Chain Info & Time */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {isCrossChain ? (
              <>
                <ChainBadge chainName={fromChainName} />
                <ArrowRightIcon className="w-2.5 h-2.5" />
                <ChainBadge chainName={toChainName} />
              </>
            ) : (
              <ChainBadge chainName={fromChainName} />
            )}
            <span className="text-gray-500">•</span>
            <span>{relativeTime}</span>
          </div>
        </div>
      </div>

      {/* Right Section: Value & Link */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* USD Value */}
        <div className="text-right hidden sm:block">
          <div className="text-sm font-semibold text-white">
            {formattedUsdValue}
          </div>
          {status === "pending" && (
            <div className="text-xs text-yellow-400">Processing...</div>
          )}
        </div>

        {/* External Link Icon */}
        {explorerUrl && (
          <ExternalLinkIcon className="w-4 h-4 text-gray-400 group-hover:text-gold transition-colors flex-shrink-0" />
        )}
      </div>

      {/* Tooltip on hover showing full tx hash */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-xs text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {getShortTxHash(txHash)}
      </div>
    </motion.div>
  );
}
