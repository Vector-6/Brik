"use client";

/**
 * SwapSuccessModal Component
 * Displays success message after swap completion
 *
 * UI/UX Principles Applied:
 * - Hierarchy: Success icon and amounts prominently displayed for quick verification
 * - Progressive Disclosure: Transaction details persist until user dismisses
 * - Consistency: Drawer pattern matches execution, review, and settings
 * - Contrast: Green success colors meet WCAG AA standards
 * - Accessibility: ARIA announcements, keyboard navigation, focus management
 * - Proximity: Transaction details grouped logically
 * - Alignment: Responsive drawer maintains visual balance
 *
 * CRITICAL FIX: Amounts no longer disappear - they persist until user closes drawer
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  ExternalLink,
  X,
  Copy,
  Check,
  ArrowDownIcon,
} from "lucide-react";
import type { Token } from "@/lib/types/token.types";
import { Z_INDEX } from "@/lib/constants/zIndex";
import { useSwapRewards } from "../hooks/useSwapRewards";
import { calculateSwapMetrics } from "@/lib/utils/swap-fees";

// ============================================================================
// Props
// ============================================================================

export interface SwapSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  txHash?: string;
  chainId?: number;
  quoteData?: Record<string, any>;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Success drawer component - Responsive design
 * Desktop: Right-side panel with slide-in animation
 * Mobile: Bottom sheet with slide-up animation
 *
 * Maintains consistency with execution and review drawers for seamless UX
 * Transaction details persist until user explicitly closes
 *
 * @example
 * <SwapSuccessModal
 *   isOpen={isSuccess}
 *   onClose={handleClose}
 *   fromToken={fromToken}
 *   toToken={toToken}
 *   fromAmount="1.5"
 *   toAmount="1.502"
 *   txHash="0x..."
 *   chainId={1}
 * />
 */
export function SwapSuccessModal({
  isOpen,
  onClose,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  txHash,
  chainId,
  quoteData,
}: SwapSuccessModalProps) {
  // ============================================================================
  // State Management
  // ============================================================================

  const [isMobile, setIsMobile] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [hasAnnounced, setHasAnnounced] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const doneButtonRef = useRef<HTMLButtonElement>(null);

  // ============================================================================
  // Rewards Integration
  // ============================================================================

  const { handleSwapSuccess } = useSwapRewards();

  // Trigger rewards verification when swap is successful
  useEffect(() => {
    if (isOpen && txHash && chainId && quoteData) {
      // Extract token price from quoteData (LiFi route object)
      // Try multiple possible locations for the token price
      const fromTokenPrice =
        quoteData?.fromToken?.priceUSD ||
        quoteData?.action?.fromToken?.priceUSD ||
        quoteData?.steps?.[0]?.action?.fromToken?.priceUSD ||
        fromToken.marketData?.price ||
        0;

      console.log('Debug - fromAmount:', fromAmount);
      console.log('Debug - fromTokenPrice:', fromTokenPrice);
      console.log('Debug - quoteData:', quoteData);
      console.log('Debug - fromToken.marketData:', fromToken.marketData);

      // Calculate swap metrics
      const { swapValueUsd, brikFeeUsd } = calculateSwapMetrics(
        fromAmount,
        fromTokenPrice
      );

      console.log('Debug - swapValueUsd:', swapValueUsd);
      console.log('Debug - brikFeeUsd:', brikFeeUsd);

      // Only trigger if we have valid values
      if (swapValueUsd > 0 && brikFeeUsd > 0) {
        // Trigger rewards verification
        handleSwapSuccess({
          txHash,
          chainId,
          quoteData,
          swapValueUsd,
          brikFeeUsd,
        });
      } else {
        console.error('Invalid swap metrics - cannot verify rewards. SwapValueUsd:', swapValueUsd, 'BrikFeeUsd:', brikFeeUsd);
      }
    }
  }, [isOpen, txHash, chainId, quoteData, fromAmount, fromToken, handleSwapSuccess]);

  // ============================================================================
  // Detect Mobile Viewport for Responsive Animations
  // ============================================================================

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ============================================================================
  // Focus Management & Accessibility Announcement
  // ============================================================================

  useEffect(() => {
    if (isOpen) {
      // Focus close button when drawer opens
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      }
      // Announce success to screen readers (only once)
      if (!hasAnnounced) {
        setHasAnnounced(true);
      }
    } else {
      // Reset announcement state when closed
      setHasAnnounced(false);
    }
  }, [isOpen, hasAnnounced]);

  // ============================================================================
  // Copy Transaction Hash Handler
  // ============================================================================

  const handleCopyHash = useCallback(async () => {
    if (txHash) {
      try {
        await navigator.clipboard.writeText(txHash);
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2000);
      } catch (err) {
        console.error("Failed to copy transaction hash:", err);
      }
    }
  }, [txHash]);

  // ============================================================================
  // Keyboard Navigation
  // ============================================================================

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      // Tab key focus trap between close and done buttons
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === closeButtonRef.current) {
          e.preventDefault();
          doneButtonRef.current?.focus();
        } else if (
          !e.shiftKey &&
          document.activeElement === doneButtonRef.current
        ) {
          e.preventDefault();
          closeButtonRef.current?.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Generate explorer link
  const explorerUrl =
    txHash && chainId ? getExplorerLink(txHash, chainId) : null;

  // ============================================================================
  // Render - Drawer Pattern with Responsive Animations
  // ============================================================================

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
            className={`fixed inset-0 bg-black/40 backdrop-blur-sm ${Z_INDEX.MODAL_BACKDROP}`}
            aria-hidden="true"
          />

          {/* Drawer - Responsive: bottom sheet on mobile, side panel on desktop */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="swap-success-title"
            aria-describedby="swap-success-description"
            // Mobile: slide up from bottom, Desktop: slide in from right
            initial={{
              opacity: 0,
              x: isMobile ? 0 : "100%",
              y: isMobile ? "100%" : 0,
            }}
            animate={{
              opacity: 1,
              x: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              x: isMobile ? 0 : "100%",
              y: isMobile ? "100%" : 0,
            }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`
              fixed
              md:right-0 md:top-0 md:bottom-0 md:h-full
              bottom-0 left-0 right-0 md:left-auto
              w-full md:max-w-[440px]
              max-h-[90vh] md:max-h-full
              bg-background backdrop-blur-md
              md:border-l border-t md:border-t-0 border-gray-700/50
              shadow-2xl
              rounded-t-3xl md:rounded-none
              flex flex-col
              ${Z_INDEX.SIDE_PANEL}
            `}
          >
            {/* Mobile Handle Indicator */}
            <div
              className="md:hidden flex justify-center pt-3 pb-2 flex-shrink-0"
              aria-hidden="true"
            >
              <div className="w-12 h-1 bg-gray-700 rounded-full"></div>
            </div>

            {/* Header with Close Button */}
            <header className="flex-shrink-0 bg-charcoal backdrop-blur-lg border-b border-color-border p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="p-2 bg-green-500/20 rounded-lg"
                    aria-hidden="true"
                  >
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </motion.div>
                  <div>
                    <h2
                      id="swap-success-title"
                      className="text-lg md:text-xl font-bold text-white"
                    >
                      Swap Successful!
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Transaction confirmed
                    </p>
                  </div>
                </div>
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  aria-label="Close success details"
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50"
                >
                  <X className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </button>
              </div>
            </header>

            <p id="swap-success-description" className="sr-only">
              Your swap has been completed successfully. Review the transaction
              details below.
            </p>

            {/* ARIA Live Region - Accessibility: Announce success to screen readers */}
            {hasAnnounced && (
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
              >
                Swap successful! You swapped {fromAmount} {fromToken.symbol} and
                received {toAmount} {toToken.symbol}.
              </div>
            )}

            {/* Content - Scrollable area */}
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
              <div className="p-4 md:p-6 space-y-6 md:space-y-8">
                {/* Success Banner - Contrast: Green theme for positive reinforcement */}
                <div className="p-4 md:p-5 bg-green-900/20 border border-green-500/30 rounded-xl text-center">
                  <div className="text-sm md:text-base font-semibold text-green-300">
                    Your swap has been completed successfully
                  </div>
                </div>

                {/* Transaction Details - Hierarchy: Amounts prominently displayed */}
                <section aria-labelledby="transaction-details-heading">
                  <h3
                    id="transaction-details-heading"
                    className="text-xs font-semibold text-gray-400 uppercase nothingclasswider mb-4"
                  >
                    Transaction Details
                  </h3>
                  <div className="space-y-4">
                    {/* Swapped Amount - CRITICAL: These values never disappear */}
                    <div className="p-4 md:p-5 bg-charcoal border border-color-border rounded-xl">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-400 mb-1">
                            Swapped
                          </div>
                          <div
                            className="text-2xl md:text-3xl font-bold text-white truncate"
                            title={fromAmount}
                          >
                            {fromAmount}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                          {fromToken.logoUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={fromToken.logoUrl}
                              alt=""
                              className="h-8 w-8 md:h-10 md:w-10 rounded-full"
                              aria-hidden="true"
                            />
                          )}
                          <div className="text-right">
                            <div className="text-sm md:text-base font-semibold text-white">
                              {fromToken.symbol}
                            </div>
                            <div className="text-xs text-gray-400 truncate max-w-[100px]">
                              {fromToken.currentChainName}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow Separator */}
                    <div className="flex justify-center" aria-hidden="true">
                      <ArrowDownIcon className="text-2xl text-gold" />
                    </div>

                    {/* Received Amount - CRITICAL: These values never disappear */}
                    <div className="p-4 md:p-5 bg-charcoal border border-color-border rounded-xl">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-400 mb-1">
                            Received
                          </div>
                          <div
                            className="text-2xl md:text-3xl font-bold text-gold truncate"
                            title={toAmount}
                          >
                            {toAmount}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                          {toToken.logoUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={toToken.logoUrl}
                              alt=""
                              className="h-8 w-8 md:h-10 md:w-10 rounded-full"
                              aria-hidden="true"
                            />
                          )}
                          <div className="text-right">
                            <div className="text-sm md:text-base font-semibold text-white">
                              {toToken.symbol}
                            </div>
                            <div className="text-xs text-gray-400 truncate max-w-[100px]">
                              {toToken.currentChainName}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Transaction Hash - Progressive Disclosure */}
                {txHash && (
                  <section aria-labelledby="blockchain-verification-heading">
                    <h3
                      id="blockchain-verification-heading"
                      className="text-xs font-semibold text-gray-400 uppercase nothingclasswider mb-3"
                    >
                      Blockchain Verification
                    </h3>
                    <div className="p-4 bg-charcoal border border-color-border rounded-xl space-y-3">
                      <div>
                        <div className="text-xs text-gray-400 mb-2">
                          Transaction Hash
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs text-white font-mono bg-background px-3 py-2 rounded border border-color-border truncate">
                            {txHash}
                          </code>
                          <button
                            onClick={handleCopyHash}
                            aria-label="Copy transaction hash"
                            className="flex-shrink-0 p-2 hover:bg-gold/20 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 cursor-pointer group"
                          >
                            {copiedHash ? (
                              <Check
                                className="h-4 w-4 text-gold"
                                aria-hidden="true"
                              />
                            ) : (
                              <Copy
                                className="h-4 w-4 text-gray-400 group-hover:text-gold"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Explorer Link */}
                      {explorerUrl && (
                        <a
                          href={explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2.5 bg-gold/20 hover:bg-gold/30 border border-gold/30 rounded-lg text-sm font-medium text-gold transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50"
                        >
                          <span>View on Explorer</span>
                          <ExternalLink
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </a>
                      )}
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Footer - Sticky at bottom */}
            <footer className="flex-shrink-0 bg-charcoal backdrop-blur-md border-t border-color-border p-4 md:p-6">
              <button
                ref={doneButtonRef}
                onClick={onClose}
                className="w-full py-3 md:py-4 rounded-lg bg-primary font-bold text-sm md:text-base text-white hover:shadow-xl hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
              >
                Done
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate block explorer URL for transaction verification
 */
function getExplorerLink(txHash: string, chainId: number): string {
  const explorers: Record<number, string> = {
    1: "https://etherscan.io",
    56: "https://bscscan.com",
    137: "https://polygonscan.com",
    42161: "https://arbiscan.io",
    10: "https://optimistic.etherscan.io",
    43114: "https://snowtrace.io",
  };

  const baseUrl = explorers[chainId] || "https://etherscan.io";
  return `${baseUrl}/tx/${txHash}`;
}
