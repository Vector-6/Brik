"use client";

/**
 * SwapExecutionModal Component
 * Shows real-time progress during swap execution with data from LI.FI SDK
 *
 * Single Responsibility: Pure presentation component that displays execution state
 * - Does NOT contain business logic for execution
 * - Does NOT manage execution state
 * - Only transforms and displays progress data from useRouteExecution hook
 *
 * Data Flow:
 * 1. Receives ExecutionProgress from useRouteExecution.state.progress
 * 2. Receives SwapApprovalState from useSwapState.approval.state
 * 3. Transforms data into UI steps (approval, swap, confirmation)
 * 4. Displays transaction hashes with explorer links from LI.FI
 * 5. Shows estimated time remaining from route execution
 *
 * UI/UX Principles Applied:
 * - Hierarchy: Prominent status indicators guide attention to current step
 * - Progressive Disclosure: Step-by-step reveal without overwhelming details
 * - Consistency: Drawer pattern matches SwapReviewModal and SwapSettingsPanel
 * - Contrast: WCAG AA compliant colors with clear visual feedback
 * - Accessibility: ARIA live regions, focus management, keyboard navigation
 * - Proximity: Related transaction details grouped logically
 * - Alignment: Responsive drawer layout maintains visual rhythm
 *
 * Integration with LI.FI SDK:
 * - ExecutionProgress.transactions: Array of transaction hashes and explorer links
 * - ExecutionProgress.currentStepName: Name of current step from route (e.g., "Uniswap V3: USDC → ETH")
 * - ExecutionProgress.currentStepStatus: Current execution status (approving, executing, confirming, etc.)
 * - ExecutionProgress.estimatedTimeRemaining: Time remaining in seconds
 * - ExecutionProgress.currentStep/totalSteps: Progress through multi-step routes
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, ExternalLink, Clock } from "lucide-react";

import { Z_INDEX } from "@/lib/constants/zIndex";
import { SwapExecutionStatus } from "@/lib/types/lifi.types";
import type { ExecutionProgress } from "@/lib/types/lifi.types";
import type { Token } from "@/lib/types/token.types";

const Status = SwapExecutionStatus;

// ============================================================================
// Props
// ============================================================================

export interface SwapExecutionModalProps {
  isOpen: boolean;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  progress: ExecutionProgress | null;
  approvalState?: {
    isRequired: boolean;
    isApproving: boolean;
    isApproved: boolean;
    txHash?: string;
  };
}

// ============================================================================
// Component
// ============================================================================

/**
 * Execution drawer component - Responsive design
 * Desktop: Right-side panel with slide-in animation
 * Mobile: Bottom sheet with slide-up animation
 *
 * Maintains consistency with review and settings drawers for seamless UX
 *
 * @example
 * <SwapExecutionModal
 *   isOpen={isExecuting}
 *   fromToken={fromToken}
 *   toToken={toToken}
 *   fromAmount="1.5"
 *   progress={executionProgress}
 * />
 */
export function SwapExecutionModal({
  isOpen,
  fromToken,
  toToken,
  fromAmount,
  progress,
  approvalState,
}: SwapExecutionModalProps) {
  // ============================================================================
  // State Management
  // ============================================================================

  const [isMobile, setIsMobile] = useState(false);
  const firstFocusableRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // Detect Mobile Viewport for Responsive Animations
  // ============================================================================

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ============================================================================
  // Focus Management - Accessibility
  // ============================================================================

  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      // Focus first element when drawer opens
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  // ============================================================================
  // Step Status Calculation - Fixed loading state logic
  // ============================================================================

  const effectiveProgress: ExecutionProgress = progress ?? {
    currentStep: 0,
    totalSteps: 0,
    currentStepName: "",
    currentStepStatus: Status.IDLE, // Use IDLE instead of EXECUTING to prevent premature "completed" status
    transactions: [],
    estimatedTimeRemaining: undefined,
  };

  // Get the latest transaction for explorer link
  const latestTx =
    effectiveProgress.transactions[
      effectiveProgress.transactions.length - 1
    ];

  const steps = [
    {
      id: "approval",
      label: "Token Approval",
      description: approvalState?.isApproving
        ? "⚠️ Check your wallet - Approval signature required"
        : approvalState?.isApproved
        ? "✅ Token spending approved"
        : effectiveProgress.currentStepStatus === Status.APPROVING
        ? "⚠️ Check your wallet - Approval signature required"
        : "Approve token spending",
      status: getApprovalStatus(effectiveProgress, approvalState),
    },
    {
      id: "swap",
      label: "Swap Execution",
      description: effectiveProgress.currentStepStatus === Status.SIGNING
        ? "⚠️ Check your wallet - Transaction signature required"
        : effectiveProgress.currentStepStatus === Status.EXECUTING
        ? "Broadcasting transaction to blockchain..."
        : effectiveProgress.currentStepName || "Preparing transaction",
      status: getSwapStatus(effectiveProgress),
      explorerUrl: latestTx?.explorerUrl || null,
    },
    {
      id: "confirmation",
      label: "Confirmation",
      description: "Confirming on blockchain",
      status: getConfirmationStatus(effectiveProgress),
    },
  ];

  // Get current status message
  const statusMessage = getStatusMessage(effectiveProgress.currentStepStatus);

  // ============================================================================
  // Keyboard Navigation - ESC to close (disabled during processing)
  // ============================================================================

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      // Prevent closing during critical transaction steps
      // User must wait for completion or failure
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

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
            className={`fixed inset-0 bg-black/40 backdrop-blur-sm ${Z_INDEX.MODAL_BACKDROP}`}
            aria-hidden="true"
          />

          {/* Drawer - Responsive: bottom sheet on mobile, side panel on desktop */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="swap-execution-title"
            aria-describedby="swap-execution-description"
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
              md:border-l border-t md:border-t-0 border-color-border
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

            {/* Header - Hierarchy: Most important info prominently displayed */}
            <header className="flex-shrink-0 bg-charcoal backdrop-blur-lg border-b border-color-border p-4 md:p-6">
              <div
                ref={firstFocusableRef}
                tabIndex={-1}
                className="focus:outline-none"
              >
                <h2
                  id="swap-execution-title"
                  className="text-lg md:text-xl font-bold text-white"
                >
                  Swapping
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {fromAmount} {fromToken.symbol} → {toToken.symbol}
                </p>
              </div>
            </header>

            <p id="swap-execution-description" className="sr-only">
              Transaction in progress. Please wait while your swap is being
              processed on the blockchain.
            </p>

            {/* ARIA Live Region - Accessibility: Screen reader announcements */}
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {statusMessage}
            </div>

            {/* Wallet Action Required Banner - Prominent Alert */}
            {(effectiveProgress.currentStepStatus === Status.APPROVING ||
              effectiveProgress.currentStepStatus === Status.SIGNING ||
              approvalState?.isApproving) && (
              <div className="mx-4 mt-4 md:mx-6 md:mt-6 p-4 bg-gradient-to-r from-[rgba(255,215,0,0.15)] to-[rgba(255,215,0,0.05)] border-2 border-[#ffd700] rounded-xl animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="h-6 w-6 text-[#ffd700]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-[#ffd700]">
                      Action Required in Your Wallet
                    </h3>
                    <p className="mt-1 text-sm text-gray-300">
                      Please check your wallet (MetaMask, etc.) and approve the transaction to continue.
                      The wallet prompt may have opened in a new window.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content - Scrollable area */}
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
              <div className="p-4 md:p-6 space-y-6 md:space-y-8">
                {/* Current Status Banner - Contrast: Color-coded for quick scanning */}
                <div className="p-4 md:p-5 bg-charcoal border border-color-border rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Loader2
                        className="h-5 w-5 text-gold animate-spin"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm md:text-base font-semibold text-gold">
                        {statusMessage}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {effectiveProgress.estimatedTimeRemaining
                          ? `Est. ${formatTimeRemaining(effectiveProgress.estimatedTimeRemaining)}`
                          : "This may take a few moments"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Steps - Proximity: Related steps grouped with clear hierarchy */}
                <section aria-labelledby="progress-steps-heading">
                  <h3
                    id="progress-steps-heading"
                    className="text-xs font-semibold text-gray-400 uppercase nothingclasswider mb-4"
                  >
                    Transaction Progress
                    {effectiveProgress.totalSteps > 0 && (
                      <span className="ml-2 font-normal">
                        (Step {effectiveProgress.currentStep} of {effectiveProgress.totalSteps})
                      </span>
                    )}
                  </h3>
                  <div className="space-y-6">
                    {steps.map((step) => (
                      <div key={step.id} className="flex items-start gap-4">
                        {/* Step Icon - Visual hierarchy with larger, more prominent indicators */}
                        <div className="flex-shrink-0">
                          {step.status === "completed" ? (
                            <div
                              className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500"
                              aria-label={`${step.label} completed`}
                            >
                              <Check
                                className="h-5 w-5 text-white"
                                aria-hidden="true"
                              />
                            </div>
                          ) : step.status === "active" ? (
                            <div
                              className="flex items-center justify-center w-8 h-8"
                              aria-label={`${step.label} in progress`}
                            >
                              <Loader2
                                className="h-8 w-8 text-gold animate-spin"
                                aria-hidden="true"
                              />
                            </div>
                          ) : (
                            <div
                              className="w-8 h-8 rounded-full border-2 border-gray-700 flex items-center justify-center"
                              aria-label={`${step.label} pending`}
                            >
                              <Clock
                                className="h-4 w-4 text-gray-600"
                                aria-hidden="true"
                              />
                            </div>
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div
                            className={`text-base font-semibold ${
                              step.status === "completed"
                                ? "text-green-400"
                                : step.status === "active"
                                ? "text-white"
                                : "text-gray-500"
                            }`}
                          >
                            {step.label}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {step.description}
                          </div>

                          {/* Explorer Link - Progressive disclosure: Show only when relevant */}
                          {step.explorerUrl && step.status !== "pending" && (
                            <a
                              href={step.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded px-2 py-1 -mx-2"
                            >
                              <span>View on Explorer</span>
                              <ExternalLink
                                className="h-3 w-3"
                                aria-hidden="true"
                              />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            {/* Important Notice - Fixed at bottom: Always visible regardless of scroll position */}
            <div className="flex-shrink-0 border-t border-color-border bg-background">
              <div className="p-4 md:p-6">
                <div className="flex items-start gap-3 p-4 bg-charcoal border border-color-border rounded-xl">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 text-xs text-blue-300">
                    <div className="font-semibold mb-1">Please wait</div>
                    <div className="opacity-90">
                      Don&apos;t close this window until the transaction
                      completes. Closing may result in transaction failure.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

type StepStatus = "pending" | "active" | "completed";

/**
 * Determine approval step status based on execution progress and approval state
 *
 * Single Responsibility: Only determines the visual status of the approval step
 * - Uses approvalState for definitive approval status
 * - Falls back to progress.transactions to check if approval tx exists
 *
 * @param progress - Execution progress from LI.FI route execution
 * @param approvalState - Approval state from useSwapState
 * @returns StepStatus - pending, active, or completed
 */
function getApprovalStatus(
  progress: ExecutionProgress | null,
  approvalState?: {
    isRequired: boolean;
    isApproving: boolean;
    isApproved: boolean;
    txHash?: string | null;
  }
): StepStatus {
  // If approval state is available, use it as primary source
  if (approvalState) {
    // Currently approving means active
    if (approvalState.isApproving) {
      return "active";
    }

    // Approved with transaction hash means completed
    if (approvalState.isApproved && approvalState.txHash) {
      return "completed";
    }

    // If approval is not required, check if execution has actually started
    // to determine if this step should be marked as completed
    if (!approvalState.isRequired) {
      // Only mark as completed if execution has progressed beyond approval phase
      if (progress) {
        const hasStartedExecution =
          progress.currentStepStatus === Status.EXECUTING ||
          progress.currentStepStatus === Status.CONFIRMING ||
          progress.currentStepStatus === Status.COMPLETED;

        if (hasStartedExecution) {
          return "completed";
        }
      }
      // Still in pre-execution phase, show as pending
      return "pending";
    }

    // Required but not approved and not currently approving means pending
    return "pending";
  }

  // Fallback: Check progress for approval transactions
  if (!progress) {
    return "pending";
  }

  // Check execution status for approval phase
  if (progress.currentStepStatus === Status.APPROVING) {
    return "active";
  }

  // Check if any transaction is an approval (usually the first one in ERC-20 swaps)
  const hasApprovalTx = progress.transactions.some(
    (tx) => tx.status === "confirmed" || tx.status === "pending"
  );

  if (hasApprovalTx) {
    // If we have confirmed approval tx, mark as completed
    const hasConfirmedApproval = progress.transactions.some(
      (tx) => tx.status === "confirmed"
    );
    return hasConfirmedApproval ? "completed" : "active";
  }

  // If we're past approval phase, mark as completed
  if (
    progress.currentStepStatus === Status.EXECUTING ||
    progress.currentStepStatus === Status.CONFIRMING ||
    progress.currentStepStatus === Status.COMPLETED
  ) {
    return "completed";
  }

  return "pending";
}

/**
 * Determine swap execution step status based on execution progress
 *
 * Single Responsibility: Only determines the visual status of the swap step
 * - Checks if we have transaction hash to mark as completed
 * - Uses progress.currentStepStatus to determine if actively executing
 *
 * @param progress - Execution progress from LI.FI route execution
 * @returns StepStatus - pending, active, or completed
 */
function getSwapStatus(progress: ExecutionProgress | null): StepStatus {
  if (!progress) {
    return "pending";
  }

  const { currentStepStatus, transactions } = progress;

  // If completed, mark as completed
  if (currentStepStatus === Status.COMPLETED) {
    return "completed";
  }

  // Still in pre-execution phases
  if (
    currentStepStatus === Status.IDLE ||
    currentStepStatus === Status.FETCHING_QUOTE ||
    currentStepStatus === Status.QUOTE_READY ||
    currentStepStatus === Status.REVIEWING ||
    currentStepStatus === Status.APPROVING
  ) {
    return "pending";
  }

  // Check if we have a confirmed swap transaction (not just approval)
  // Swap transactions usually come after approval transactions
  const hasSwapTx = transactions.length > 0;
  const hasConfirmedSwapTx = transactions.some(
    (tx) => tx.status === "confirmed"
  );

  // If we have a transaction hash, swap execution is complete
  // Even if blockchain is still confirming, the swap step itself is done
  if (hasSwapTx && (currentStepStatus === Status.CONFIRMING || hasConfirmedSwapTx)) {
    return "completed";
  }

  // Currently executing or signing
  if (
    currentStepStatus === Status.EXECUTING ||
    currentStepStatus === Status.SIGNING
  ) {
    return "active";
  }

  // If confirming, mark as completed (confirmation is next step)
  if (currentStepStatus === Status.CONFIRMING) {
    return "completed";
  }

  return "active";
}

/**
 * Determine confirmation step status based on execution progress
 *
 * Single Responsibility: Only determines the visual status of the confirmation step
 * - Checks transaction confirmation status
 * - Uses progress.currentStepStatus to determine if confirming
 *
 * @param progress - Execution progress from LI.FI route execution
 * @returns StepStatus - pending, active, or completed
 */
function getConfirmationStatus(progress: ExecutionProgress | null): StepStatus {
  if (!progress) {
    return "pending";
  }

  const { currentStepStatus, transactions } = progress;

  // If completed, all confirmations are done
  if (currentStepStatus === Status.COMPLETED) {
    return "completed";
  }

  // Still in pre-confirmation phases
  if (
    currentStepStatus === Status.IDLE ||
    currentStepStatus === Status.FETCHING_QUOTE ||
    currentStepStatus === Status.QUOTE_READY ||
    currentStepStatus === Status.REVIEWING ||
    currentStepStatus === Status.APPROVING ||
    currentStepStatus === Status.SIGNING ||
    currentStepStatus === Status.EXECUTING
  ) {
    return "pending";
  }

  // Actively confirming
  if (currentStepStatus === Status.CONFIRMING) {
    return "active";
  }

  // Check if all transactions are confirmed
  const allConfirmed = transactions.every((tx) => tx.status === "confirmed");
  if (allConfirmed && transactions.length > 0) {
    return "completed";
  }

  return "active";
}

/**
 * Get human-readable status message for screen readers and UI
 *
 * Single Responsibility: Converts execution status enum to user-friendly message
 *
 * @param status - Current execution status
 * @returns User-friendly status message
 */
function getStatusMessage(status: SwapExecutionStatus): string {
  switch (status) {
    case Status.IDLE:
      return "Preparing transaction...";
    case Status.FETCHING_QUOTE:
      return "Fetching best quote...";
    case Status.QUOTE_READY:
      return "Quote ready";
    case Status.REVIEWING:
      return "Review transaction details";
    case Status.APPROVING:
      return "Approving token spending...";
    case Status.SIGNING:
      return "Please confirm in your wallet";
    case Status.EXECUTING:
      return "Broadcasting transaction to blockchain...";
    case Status.CONFIRMING:
      return "Waiting for blockchain confirmations...";
    case Status.COMPLETED:
      return "Transaction completed successfully!";
    case Status.FAILED:
      return "Transaction failed";
    case Status.CANCELLED:
      return "Transaction cancelled";
    default:
      return "Processing...";
  }
}

/**
 * Format time remaining in seconds to human-readable format
 *
 * Single Responsibility: Converts seconds to readable time format
 *
 * @param seconds - Time remaining in seconds
 * @returns Formatted time string (e.g., "2m 30s", "45s", "1m")
 */
function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) {
    return `${Math.ceil(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.ceil(seconds % 60);

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}
