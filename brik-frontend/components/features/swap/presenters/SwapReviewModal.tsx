"use client";

/**
 * SwapReviewModal Component
 * Pre-execution confirmation drawer showing swap details
 * Uses progressive disclosure and responsive drawer pattern
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Info,
  AlertTriangle,
  TrendingDown,
  ChevronDown,
  CopyCheck,
  Copy,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { RouteExtended } from "@/lib/types/lifi.types";
import type { Token } from "@/lib/types/token.types";
import {
  formatTokenAmount,
  formatUSDValue,
  formatPercentage,
  getFullPrecision,
} from "@/lib/utils/numberFormatting";
import { Z_INDEX } from "@/lib/constants/zIndex";
import { extractQuoteDetails } from "@/lib/utils/quoteDetails";

// ============================================================================
// Props
// ============================================================================

export interface SwapReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  quote: RouteExtended;
  isConfirming?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Review drawer component
 * Shows detailed swap information before execution using progressive disclosure
 * Responsive: right-side drawer on desktop, bottom drawer on mobile
 *
 * @example
 * <SwapReviewModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   onConfirm={handleConfirm}
 *   fromToken={fromToken}
 *   toToken={toToken}
 *   fromAmount="1.5"
 *   quote={route}
 * />
 */
export function SwapReviewModal({
  isOpen,
  onClose,
  onConfirm,
  fromToken,
  toToken,
  fromAmount,
  quote,
  isConfirming = false,
}: SwapReviewModalProps) {
  // State for progressive disclosure
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Extract real quote details
  const quoteDetails = extractQuoteDetails(quote, toToken, fromAmount);
  const {
    toAmount,
    minReceived,
    rate,
    priceImpact,
    gasCostUSD,
    routeProvider,
    estimatedTimeSeconds,
  } = quoteDetails;

  // Format amounts for display
  const formattedFromAmount = formatTokenAmount(fromAmount);
  const formattedToAmount = formatTokenAmount(toAmount);
  const formattedMinReceived = formatTokenAmount(minReceived);
  const formattedRate = formatTokenAmount(rate, { maxDecimals: 6 });
  const formattedPriceImpact = formatPercentage(priceImpact);
  const formattedGasCost = gasCostUSD ? formatUSDValue(gasCostUSD) : null;

  // Copy to clipboard handler
  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Keyboard navigation - ESC to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isConfirming) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isConfirming, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isConfirming ? onClose : undefined}
            className={`fixed inset-0 bg-black/20 backdrop-blur-xs ${Z_INDEX.MODAL_BACKDROP}`}
            aria-hidden="true"
          />

          {/* Drawer - Desktop: right side, Mobile: bottom */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="swap-review-title"
            initial={{
              x:
                typeof window !== "undefined" && window.innerWidth >= 768
                  ? "100%"
                  : 0,
              y:
                typeof window !== "undefined" && window.innerWidth < 768
                  ? "100%"
                  : 0,
            }}
            animate={{ x: 0, y: 0 }}
            exit={{
              x:
                typeof window !== "undefined" && window.innerWidth >= 768
                  ? "100%"
                  : 0,
              y:
                typeof window !== "undefined" && window.innerWidth < 768
                  ? "100%"
                  : 0,
            }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`
              fixed
              md:right-0 md:top-0 md:bottom-0 md:h-full
              bottom-0 left-0 right-0 md:left-auto
              w-full md:max-w-[440px]
              max-h-[90vh] md:max-h-full
              bg-background backdrop-blur-md
              md:border-l border-t md:border-t-0 border-color-border
              shadow-2xl
              rounded-t-3xl md:rounded-none
              flex flex-col
              ${Z_INDEX.MODAL_CONTENT}
            `}
          >
            {/* Mobile Handle Indicator */}
            <div
              className="md:hidden flex justify-center pt-3 pb-2 flex-shrink-0"
              aria-hidden="true"
            >
              <div className="w-12 h-1 bg-gray-700 rounded-full"></div>
            </div>

            {/* Header */}
            <header className="flex-shrink-0 bg-charcoal backdrop-blur-lg border-b border-color-border p-4 md:p-6">
              <div className="flex items-center justify-between">
                <h2
                  id="swap-review-title"
                  className="text-lg md:text-xl font-bold text-white"
                >
                  Confirm Swap
                </h2>
                <button
                  onClick={onClose}
                  disabled={isConfirming}
                  className="p-2 hover:bg-background rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  aria-label="Close swap review"
                >
                  <X className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </button>
              </div>
            </header>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-4 md:p-6 space-y-6 md:space-y-8">
                {/* Primary Information - Swap Amounts */}
                <section aria-labelledby="swap-amounts-heading">
                  <h3 id="swap-amounts-heading" className="sr-only">
                    Swap amounts
                  </h3>
                  <div className="space-y-4">
                    {/* From Amount */}
                    <div className="flex items-center justify-between gap-3 p-4 md:p-5 bg-charcoal rounded-xl border border-color-border min-w-0">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="text-xs font-medium text-gray-300 uppercase nothingclasswide">
                          You pay
                        </div>
                        <div
                          className="text-2xl md:text-3xl font-bold text-white truncate"
                          title={getFullPrecision(fromAmount)}
                        >
                          {formattedFromAmount}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        {fromToken.logoUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={fromToken.logoUrl}
                            alt=""
                            className="h-8 w-8 md:h-10 md:w-10 rounded-full flex-shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <div className="text-right min-w-0">
                          <div className="text-sm md:text-base font-semibold text-white truncate">
                            {fromToken.symbol}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-[100px]">
                            {fromToken.currentChainName}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow Separator */}
                    <div className="flex justify-center" aria-hidden="true">
                      <div className="text-xl md:text-2xl text-gold">↓</div>
                    </div>

                    {/* To Amount */}
                    <div className="flex items-center justify-between gap-3 p-4 md:p-5 bg-charcoal rounded-xl border border-color-border min-w-0">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="text-xs font-medium text-gray-300 uppercase nothingclasswide">
                          You receive
                        </div>
                        <div
                          className="text-2xl md:text-3xl font-bold text-green-400 truncate"
                          title={getFullPrecision(toAmount)}
                        >
                          {formattedToAmount}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        {toToken.logoUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={toToken.logoUrl}
                            alt=""
                            className="h-8 w-8 md:h-10 md:w-10 rounded-full flex-shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <div className="text-right min-w-0">
                          <div className="text-sm md:text-base font-semibold text-white truncate">
                            {toToken.symbol}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-[100px]">
                            {toToken.currentChainName}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Essential Transaction Details */}
                <section aria-labelledby="transaction-details-heading">
                  <h3
                    id="transaction-details-heading"
                    className="text-xs font-semibold text-gray-400 uppercase nothingclasswider mb-3 md:mb-4"
                  >
                    Key Details
                  </h3>
                  <dl className="space-y-3 md:space-y-4">
                    {/* Rate */}
                    <div className="flex items-center justify-between text-sm">
                      <dt className="text-gray-300">Exchange rate</dt>
                      <dd className="text-white font-semibold text-right">
                        1 {fromToken.symbol} = {formattedRate} {toToken.symbol}
                      </dd>
                    </div>

                    {/* Min Received */}
                    <div className="flex items-center justify-between text-sm">
                      <dt className="flex items-center gap-1.5">
                        <span className="text-gray-300">Minimum received</span>
                        <button
                          onClick={() =>
                            handleCopy(
                              getFullPrecision(minReceived),
                              "minReceived"
                            )
                          }
                          className="group relative"
                          aria-label="Copy full value"
                        >
                          {copiedField === "minReceived" ? (
                            <CopyCheck
                              className="h-3.5 w-3.5 text-green-400"
                              aria-hidden="true"
                            />
                          ) : (
                            <Copy
                              className="h-3.5 w-3.5 text-gray-500 group-hover:text-gray-400 transition-colors"
                              aria-label="Click to copy full value"
                            />
                          )}
                        </button>
                      </dt>
                      <dd className="text-white font-semibold text-right">
                        {formattedMinReceived} {toToken.symbol}
                      </dd>
                    </div>

                    {/* Network Fee */}
                    {formattedGasCost && (
                      <div className="flex items-center justify-between text-sm">
                        <dt className="text-gray-300">Network fee</dt>
                        <dd className="text-white font-medium">
                          {formattedGasCost}
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>

                {/* Advanced Details - Collapsible */}
                <section aria-labelledby="advanced-details-heading">
                  <button
                    onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
                    className="flex items-center justify-between w-full text-sm font-medium text-gold hover:text-gold transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 rounded p-2 -m-2"
                    aria-expanded={showAdvancedDetails}
                    aria-controls="advanced-details-content"
                  >
                    <span>Advanced details</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        showAdvancedDetails ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  <AnimatePresence>
                    {showAdvancedDetails && (
                      <motion.div
                        id="advanced-details-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <dl className="mt-4 space-y-3 md:space-y-4 pt-4 border-t border-gray-800">
                          {/* Price Impact */}
                          {priceImpact > 0.1 && (
                            <div className="flex items-center justify-between text-sm">
                              <dt className="flex items-center gap-1.5">
                                <span className="text-gray-300">
                                  Price impact
                                </span>
                                <TrendingDown
                                  className={`h-3.5 w-3.5 ${
                                    priceImpact > 5
                                      ? "text-red-400"
                                      : priceImpact > 3
                                      ? "text-orange-400"
                                      : "text-yellow-500"
                                  }`}
                                  aria-hidden="true"
                                />
                              </dt>
                              <dd
                                className={`font-semibold ${
                                  priceImpact > 5
                                    ? "text-red-400"
                                    : priceImpact > 3
                                    ? "text-orange-400"
                                    : "text-yellow-400"
                                }`}
                              >
                                {formattedPriceImpact}
                              </dd>
                            </div>
                          )}

                          {/* Route */}
                          <div className="flex items-center justify-between text-sm">
                            <dt className="text-gray-300">Route provider</dt>
                            <dd className="text-white font-medium text-right truncate max-w-[180px]">
                              {routeProvider}
                            </dd>
                          </div>

                          {/* Estimated Time */}
                          {estimatedTimeSeconds > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <dt className="text-gray-300">Estimated time</dt>
                              <dd className="text-white font-medium">
                                ~{estimatedTimeSeconds}s
                              </dd>
                            </div>
                          )}
                        </dl>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>

                {/* Warnings and Information */}
                <section aria-labelledby="warnings-heading">
                  <h3 id="warnings-heading" className="sr-only">
                    Important information
                  </h3>
                  <div className="space-y-3">
                    {/* High Price Impact Warning */}
                    {priceImpact > 5 && (
                      <div
                        role="alert"
                        className="flex items-start gap-3 p-3 md:p-4 bg-red-900/20 border border-red-500/30 rounded-xl"
                      >
                        <AlertTriangle
                          className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <div className="text-xs text-red-300 min-w-0">
                          <div className="font-semibold mb-1">
                            High price impact detected
                          </div>
                          <div className="opacity-90">
                            You may receive significantly less than expected.
                            Consider reducing your swap amount.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Slippage Protection Info */}
                    <div className="flex items-start gap-3 p-3 md:p-4 bg-charcoal rounded-xl border border-color-border">
                      <Info
                        className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div className="text-xs text-blue-300 min-w-0">
                        Output is estimated. You will receive at least{" "}
                        <strong className="font-semibold">
                          {formattedMinReceived} {toToken.symbol}
                        </strong>{" "}
                        or the transaction will revert to protect you.
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Footer - Sticky Actions */}
            <footer className="flex-shrink-0 bg-charcoal backdrop-blur-md border-t border-color-border p-4 md:p-6 pb-safe">
              <div className="space-y-3">
                <button
                  onClick={onConfirm}
                  disabled={isConfirming}
                  className="w-full py-3 md:py-4 rounded-xl bg-primary font-bold text-sm md:text-base text-white shadow-lg hover:shadow-2xl hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
                  aria-live="polite"
                >
                  {isConfirming ? "Confirming..." : "Confirm Swap"}
                </button>
                <button
                  onClick={onClose}
                  disabled={isConfirming}
                  className="w-full py-2.5 md:py-3 rounded-xl border border-color-border text-gray-300 font-medium text-sm hover:bg-charcoal/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
