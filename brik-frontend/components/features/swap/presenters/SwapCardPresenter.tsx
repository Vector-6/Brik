"use client";

/**
 * SwapCardPresenter
 * Main swap card UI component (pure presentation)
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownUp, Settings, AlertCircle, RefreshCw, X, Loader2 } from "lucide-react";

import { getErrorMessage } from "@/lib/api/client";
import { Z_INDEX } from "@/lib/constants/zIndex";
import type { RouteExtended, SwapExecutionError } from "@/lib/types/lifi.types";
import type { Token } from "@/lib/types/token.types";
import { CustomConnectButton } from "@/components/features/auth/ConnectButton";

import type { SwapQuoteError } from "../hooks/useSwapQuote";
import SwapInputPresenter from "./SwapInputPresenter";
import { QuoteErrorBanner } from "./QuoteErrorBanner";

type ApprovalState = {
  isRequired: boolean;
  isApproving: boolean;
  isApproved: boolean;
  txHash?: string | null;
  error?: SwapExecutionError | null;
};

// ============================================================================
// Props Interface
// ============================================================================

export interface SwapCardPresenterProps {
  // From input
  fromAmount: string;
  fromToken: Token | null;
  availableFromTokens: Token[];
  isFromDropdownOpen: boolean;
  fromAmountUSD?: string; // USD value from quote
  onFromAmountChange: (value: string) => void;
  onFromTokenSelect: (token: Token) => void;
  onToggleFromDropdown: () => void;
  onCloseFromDropdown: () => void;

  // To input
  toAmount: string;
  toToken: Token | null;
  availableToTokens: Token[];
  isToDropdownOpen: boolean;
  toAmountUSD?: string; // USD value from quote
  onToTokenSelect: (token: Token) => void;
  onToggleToDropdown: () => void;
  onCloseToDropdown: () => void;

  // Actions
  onSwitchTokens: () => void;
  onSwap: () => void;
  onOpenSettings?: () => void;

  // State
  isSwapDisabled: boolean;
  conversionRate: number;
  isLoading?: boolean;
  isLoadingTokens?: boolean;
  tokenFetchError?: unknown | null;
  onRetryTokens?: () => void;
  isWalletConnected?: boolean; // New prop for wallet connection status

  // Quote data (for validation, not display)
  quote: RouteExtended | null;
  isLoadingQuote?: boolean;
  quoteError: SwapQuoteError | null;

  // Approval
  approvalState: ApprovalState;
  onApprove: () => void;

  // Injected components
  quoteDetailsComponent?: React.ReactNode;
  quoteRefreshComponent?: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

export default function SwapCardPresenter({
  fromAmount,
  fromToken,
  availableFromTokens,
  isFromDropdownOpen,
  fromAmountUSD,
  onFromAmountChange,
  onFromTokenSelect,
  onToggleFromDropdown,
  onCloseFromDropdown,

  toAmount,
  toToken,
  availableToTokens,
  isToDropdownOpen,
  toAmountUSD,
  onToTokenSelect,
  onToggleToDropdown,
  onCloseToDropdown,

  onSwitchTokens,
  onSwap,
  onOpenSettings,

  isSwapDisabled,
  conversionRate,
  isLoading = false,
  isLoadingTokens = false,
  tokenFetchError = null,
  onRetryTokens,
  isWalletConnected = false, // Default to false

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  quote,
  isLoadingQuote = false,
  quoteError,

  approvalState,
  onApprove,

  // Injected components
  quoteDetailsComponent,
  quoteRefreshComponent,
}: SwapCardPresenterProps): React.JSX.Element {
  const [isErrorBannerDismissed, setIsErrorBannerDismissed] = useState(false);
  const [isQuoteErrorDismissed, setIsQuoteErrorDismissed] = useState(false);
  const errorMessage: string | null = tokenFetchError ? getErrorMessage(tokenFetchError) : null;
  const showErrorBanner: boolean = Boolean(tokenFetchError && !isErrorBannerDismissed);

  // Reset error banner dismissal when error is cleared (successful retry)
  useEffect(() => {
    if (!tokenFetchError) {
      setIsErrorBannerDismissed(false);
    }
  }, [tokenFetchError]);

  // Reset quote error dismissal when error changes or is cleared
  useEffect(() => {
    setIsQuoteErrorDismissed(false);
  }, [quoteError]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full"
      >
      {/* Main Card */}
      <article className="bg-[#1f1f1f] backdrop-blur-md border border-[#2a2a2a] rounded-2xl p-6 shadow-[0_24px_40px_rgba(0,0,0,0.35)]">
        {/* Header with Settings */}
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Swap</h2>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 hover:bg-[rgba(44,44,44,0.8)] rounded-lg transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-[rgba(97,7,224,0.45)] focus:ring-offset-2 focus:ring-offset-[#0f0f0f]"
              aria-label="Open swap settings"
            >
              <Settings className="h-5 w-5 text-gray-400 group-hover:text-[#ffd700] group-hover:rotate-90 transition-all duration-300" />
            </button>
          )}
        </header>

        {/* Error Banner */}
        {showErrorBanner && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-[rgba(244,114,182,0.12)] border border-[rgba(244,114,182,0.35)] rounded-xl"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-[#fda4af]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[#fda4af] mb-1">
                  Failed to Load Tokens
                </h3>
                <p className="text-sm text-gray-300">{errorMessage}</p>
                {onRetryTokens && (
                  <button
                    onClick={() => {
                      setIsErrorBannerDismissed(false);
                      onRetryTokens();
                    }}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-[rgba(244,114,182,0.2)] hover:bg-[rgba(244,114,182,0.3)] border border-[rgba(244,114,182,0.4)] rounded-lg text-sm font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-[rgba(244,114,182,0.45)] focus:ring-offset-2 focus:ring-offset-[#1f1f1f]"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsErrorBannerDismissed(true)}
                className="flex-shrink-0 p-1 hover:bg-[rgba(244,114,182,0.2)] rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[rgba(244,114,182,0.45)] focus:ring-offset-2 focus:ring-offset-[#1f1f1f]"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </motion.div>
        )}

        {/* From Section */}
        <section className="relative mb-2" aria-labelledby="swap-you-pay">
          <SwapInputPresenter
            label="You pay"
            amount={fromAmount}
            token={fromToken}
            availableTokens={availableFromTokens}
            isDropdownOpen={isFromDropdownOpen}
            usdValue={fromAmountUSD}
            isLoadingTokens={isLoadingTokens}
            onAmountChange={onFromAmountChange}
            onTokenSelect={onFromTokenSelect}
            onToggleDropdown={onToggleFromDropdown}
            onCloseDropdown={onCloseFromDropdown}
          />
        </section>

        {/* Switch Button */}
        <div
          className={`flex justify-center my-3 relative ${Z_INDEX.SWAP_SWITCH_BUTTON}`}
        >
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={onSwitchTokens}
            disabled={isLoading}
            className="p-2.5 rounded-full bg-gold border-2 border-navy shadow-[0_20px_40px_rgba(255, 215, 0, .24)] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[rgba(255, 215, 0, .45)] focus:ring-offset-2 focus:ring-offset-[#0f0f0f]"
            aria-label="Switch token positions"
          >
            <ArrowDownUp className="w-4 h-4 text-navy" />
          </motion.button>
        </div>

        {/* To Section */}
        <section className="relative mb-4" aria-labelledby="swap-you-receive">
          <SwapInputPresenter
            label="You receive"
            amount={toAmount}
            token={toToken}
            availableTokens={availableToTokens}
            isDropdownOpen={isToDropdownOpen}
            usdValue={toAmountUSD}
            isLoadingTokens={isLoadingTokens}
            readOnly
            onAmountChange={() => {}} // No-op for read-only
            onTokenSelect={onToTokenSelect}
            onToggleDropdown={onToggleToDropdown}
            onCloseDropdown={onCloseToDropdown}
          />
        </section>

        {/* Quote Error State - Enhanced with QuoteErrorBanner */}
        {quoteError && fromToken && toToken && fromAmount && (
          <QuoteErrorBanner
            error={quoteError}
            onDismiss={() => setIsQuoteErrorDismissed(true)}
            onRetry={undefined} // Quote errors auto-retry via useQuery
            isDismissed={isQuoteErrorDismissed}
          />
        )}

        {/* Wallet Connection Check - Show Connect Button or Swap Button */}
        {!isWalletConnected ? (
          <div className="w-full flex justify-center">
            <CustomConnectButton />
          </div>
        ) : (
          <>
            {/* Unified Action Button - Handles both approval and swap */}
            <motion.button
              whileHover={{ scale: isSwapDisabled || isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isSwapDisabled || isLoading ? 1 : 0.98 }}
              disabled={isSwapDisabled || isLoading}
              onClick={approvalState.isRequired ? onApprove : onSwap}
              className="w-full py-4 rounded-xl bg-[#ffd700] text-[#1c1c1c] font-bold text-base  shadow-[0_24px_40px_rgba(97,7,224,0.24)] hover:shadow-[0_30px_55px_rgba(97,7,224,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[rgba(97,7,224,0.45)] focus:ring-offset-2 focus:ring-offset-[#0f0f0f] font-burbank"
              aria-label={
                isLoading
                  ? "Processing transaction"
                  : isLoadingQuote
                  ? "Fetching quote"
                  : approvalState.isRequired
                  ? `Approve ${fromToken?.symbol || "token"} to continue`
                  : "Execute swap"
              }
            >
              <span className="flex items-center text-xl justify-center gap-2">
                {/* Show spinner when loading transaction or fetching quote */}
                {(isLoading || isLoadingQuote) && (
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                )}
                <span>
                  {isLoading
                    ? "Processing..."
                    : isLoadingQuote
                    ? "Fetching quote..."
                    : approvalState.isApproving
                    ? `Approving ${fromToken?.symbol}...`
                    : approvalState.isRequired
                    ? `Approve ${fromToken?.symbol}`
                    : "Swap"}
                </span>
              </span>
            </motion.button>

            {/* Approval Info Banner */}
            {approvalState.isRequired &&
              fromToken &&
              !approvalState.isApproving && (
                <div className="mt-3 p-3 bg-[rgba(255,215,0,0.12)] border border-[rgba(255,215,0,0.4)] rounded-lg">
                  <p className="text-xs text-[#ffd700] text-center">
                    Approval required before swapping. This is a one-time
                    transaction for {fromToken.symbol}.
                  </p>
                </div>
              )}
          </>
        )}

        {/* Collapsible Quote Details */}
        {quoteDetailsComponent}

        {/* Quote Refresh Indicator */}
        <div className="flex justify-center items-center">

        {quoteRefreshComponent}
        </div>

        {/* Rate Info */}
        {fromToken && toToken && conversionRate > 0 && (
          <footer className="mt-4 pt-4 border-t border-[#2a2a2a] space-y-1.5">
            <p className="text-sm text-gray-300 font-medium text-center">
              Rate: 1 {fromToken.symbol} ={" "}
              {conversionRate.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}{" "}
              {toToken.symbol}
            </p>
            <p className="text-xs text-gray-500 text-center">Powered by Brik</p>
          </footer>
        )}
      </article>

      {/* Loading Overlay */}
      {isLoading && (
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center ${Z_INDEX.FLOATING}`}
          role="status"
          aria-live="polite"
        >
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"
            aria-hidden="true"
          ></div>
          <span className="sr-only">Processing transaction...</span>
        </div>
      )}
      </motion.div>
    </>
  );
}
