"use client";

/**
 * SwapSettingsPanel Component
 * Comprehensive settings panel for swap configuration
 *
 * UI/UX Principles Applied:
 * - Hierarchy: Visual prominence guides user attention to key actions
 * - Progressive Disclosure: Collapsible help section reduces cognitive load
 * - Consistency: Unified component patterns and spacing
 * - Contrast: WCAG AA compliant colors with clear visual feedback
 * - Accessibility: ARIA labels, focus management, keyboard navigation
 * - Proximity: Related controls grouped logically
 * - Alignment: Grid-based layout maintains visual rhythm
 * - Responsive: Mobile bottom sheet, desktop side panel
 * - User Flow: Explicit save/discard with unsaved changes indicator
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Settings as SettingsIcon,
  ChevronDown,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { SlippageSettings } from "./SlippageSettings";
import { Z_INDEX } from "@/lib/constants/zIndex";

// ============================================================================
// Props
// ============================================================================

export interface SwapSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  slippage: number;
  onSlippageChange: (value: number) => void;
  deadline?: number; // Transaction deadline in minutes
  onDeadlineChange?: (value: number) => void;
  swapSize?: number; // Optional: for contextual recommendations
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_SLIPPAGE = 0.5;
const DEFAULT_DEADLINE = 20;

// ============================================================================
// Component
// ============================================================================

/**
 * Settings panel component with enhanced UX
 * - Mobile: Opens as bottom sheet with slide-up animation
 * - Desktop: Opens as right-side panel with slide-in animation
 * - Changes require explicit save (Done button) to persist
 * - Unsaved changes indicator prevents accidental data loss
 *
 * @example
 * <SwapSettingsPanel
 *   isOpen={showSettings}
 *   onClose={() => setShowSettings(false)}
 *   slippage={0.5}
 *   onSlippageChange={setSlippage}
 *   deadline={20}
 *   onDeadlineChange={setDeadline}
 * />
 */
export function SwapSettingsPanel({
  isOpen,
  onClose,
  slippage,
  onSlippageChange,
  deadline = DEFAULT_DEADLINE,
  onDeadlineChange,
  swapSize,
}: SwapSettingsPanelProps) {
  // ============================================================================
  // State Management - Draft changes (not saved until "Done" is clicked)
  // ============================================================================

  const [isHelpExpanded, setIsHelpExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Draft values (local state until saved)
  const [draftSlippage, setDraftSlippage] = useState(slippage);
  const [draftDeadline, setDraftDeadline] = useState(deadline);
  const [deadlineValue, setDeadlineValue] = useState(deadline.toString());

  // Track if there are unsaved changes
  const hasUnsavedChanges =
    draftSlippage !== slippage || draftDeadline !== deadline;

  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  // ============================================================================
  // Detect mobile viewport for responsive animations
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
  // Sync draft values when props change or panel opens
  // ============================================================================

  useEffect(() => {
    if (isOpen) {
      setDraftSlippage(slippage);
      setDraftDeadline(deadline);
      setDeadlineValue(deadline.toString());
    }
  }, [isOpen, slippage, deadline]);

  // ============================================================================
  // Handlers - Draft changes management
  // ============================================================================

  // Discard changes and close panel
  const handleDiscard = useCallback(() => {
    // Reset to original values
    setDraftSlippage(slippage);
    setDraftDeadline(deadline);
    setDeadlineValue(deadline.toString());
    onClose();
  }, [slippage, deadline, onClose]);

  // Save changes and close panel
  const handleSave = useCallback(() => {
    onSlippageChange(draftSlippage);
    if (onDeadlineChange) {
      onDeadlineChange(draftDeadline);
    }
    onClose();
  }, [
    draftSlippage,
    draftDeadline,
    onSlippageChange,
    onDeadlineChange,
    onClose,
  ]);

  // Reset to default values
  const handleReset = useCallback(() => {
    setDraftSlippage(DEFAULT_SLIPPAGE);
    setDraftDeadline(DEFAULT_DEADLINE);
    setDeadlineValue(DEFAULT_DEADLINE.toString());
  }, []);

  // Update draft slippage
  const handleSlippageChange = useCallback((value: number) => {
    setDraftSlippage(value);
  }, []);

  // Update draft deadline
  const handleDeadlineChange = useCallback((value: string) => {
    setDeadlineValue(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 60) {
      setDraftDeadline(numValue);
    }
  }, []);

  const handleDeadlineBlur = useCallback(() => {
    const numValue = parseInt(deadlineValue);
    if (isNaN(numValue) || numValue < 1) {
      setDeadlineValue(DEFAULT_DEADLINE.toString());
      setDraftDeadline(DEFAULT_DEADLINE);
    } else if (numValue > 60) {
      setDeadlineValue("60");
      setDraftDeadline(60);
    }
  }, [deadlineValue]);

  // Backdrop click handler - warn about unsaved changes
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleDiscard();
      }
    },
    [handleDiscard]
  );

  // ============================================================================
  // Focus Management - Accessibility
  // ============================================================================

  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      // Focus first interactive element when panel opens
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  // Trap focus within modal for keyboard users
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDiscard();
      }

      // Tab key focus trap
      if (e.key === "Tab") {
        if (
          e.shiftKey &&
          document.activeElement === firstFocusableRef.current
        ) {
          e.preventDefault();
          lastFocusableRef.current?.focus();
        } else if (
          !e.shiftKey &&
          document.activeElement === lastFocusableRef.current
        ) {
          e.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    },
    [handleDiscard]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // ============================================================================
  // Contextual Recommendations
  // ============================================================================

  const getSlippageRecommendation = useCallback(() => {
    // Contextual guidance based on swap size (if provided)
    if (swapSize && swapSize > 10000) {
      return "For large swaps, consider 1% to avoid failures";
    }
    return "Recommended for typical conditions";
  }, [swapSize]);

  // ============================================================================
  // Render - Responsive: mobile bottom sheet, desktop side panel
  // ============================================================================

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with click-outside-to-close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className={`fixed inset-0 bg-black/20 backdrop-blur-xs ${Z_INDEX.MODAL_BACKDROP}`}
            aria-hidden="true"
          />

          {/* Panel - Responsive: bottom sheet on mobile, side panel on desktop */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="swap-settings-title"
            aria-describedby="swap-settings-description"
            // Mobile: slide up from bottom
            // Desktop: slide in from right
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
              md:border-l border-t md:border-t-0 border-[#2a2a2a]
              shadow-[0_24px_40px_rgba(0,0,0,0.35)]
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
              <div className="w-12 h-1 bg-[#3a3a3a] rounded-full"></div>
            </div>

            {/* Header - sticky at top */}
            <div className="flex-shrink-0 bg-charcoal backdrop-blur-lg border-b border-[#2a2a2a] p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 bg-[rgba(97,7,224,0.2)] rounded-lg"
                    aria-hidden="true"
                  >
                    <SettingsIcon className="h-5 w-5 text-[#ffd700]" />
                  </div>
                  <div>
                    <h2
                      id="swap-settings-title"
                      className="text-lg md:text-xl font-bold text-white"
                    >
                      Swap Settings
                    </h2>
                    {/* Unsaved changes indicator - using contrast for visibility */}
                    {hasUnsavedChanges && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-yellow-400 mt-0.5 flex items-center gap-1"
                      >
                        <span
                          className="inline-block w-1.5 h-1.5 bg-yellow-400 rounded-full"
                          aria-hidden="true"
                        />
                        Unsaved changes
                      </motion.p>
                    )}
                  </div>
                </div>
                <button
                  ref={firstFocusableRef}
                  onClick={handleDiscard}
                  aria-label="Close settings panel and discard changes"
                  className="p-2 hover:bg-[rgba(44,44,44,0.8)] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[rgba(97,7,224,0.45)]"
                >
                  <X className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </button>
              </div>
            </div>

            <p id="swap-settings-description" className="sr-only">
              Configure slippage tolerance and transaction deadline for your
              swap. Changes will be saved when you click Done.
            </p>

            {/* Content - scrollable area */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-4 md:p-6 space-y-8 md:space-y-10">
                {/* Slippage Settings */}
                <div>
                  <SlippageSettings
                    value={draftSlippage}
                    onChange={handleSlippageChange}
                    presets={[0.1, 0.5, 1.0, 3.0]}
                    recommendation={getSlippageRecommendation()}
                  />
                </div>

                {/* Transaction Deadline */}
                {onDeadlineChange && (
                  <div className="pt-8 border-t border-[#2a2a2a]">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <label
                            htmlFor="transaction-deadline"
                            className="text-sm font-semibold text-white block"
                          >
                            Transaction Deadline
                          </label>
                          <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
                            Your transaction will revert if it is pending for
                            more than this long.
                          </p>
                        </div>
                      </div>

                      {/* Deadline Input - improved unit consistency */}
                      <div className="relative">
                        <input
                          id="transaction-deadline"
                          type="number"
                          value={deadlineValue}
                          onChange={(e) => handleDeadlineChange(e.target.value)}
                          onBlur={handleDeadlineBlur}
                          min={1}
                          max={60}
                          aria-label="Transaction deadline in minutes"
                          aria-describedby="deadline-hint"
                          className="w-full px-4 py-3 pr-16 bg-[rgba(31,31,31,0.88)] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(97,7,224,0.45)] focus:border-[rgba(97,7,224,0.45)] transition-all"
                        />
                        <div
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none"
                          aria-hidden="true"
                        >
                          min
                        </div>
                      </div>

                      {/* Validation Feedback - using contrast for warnings */}
                      {parseInt(deadlineValue) < 5 &&
                        parseInt(deadlineValue) >= 1 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-2 p-3 bg-[rgba(255,215,0,0.12)] border border-[rgba(255,215,0,0.4)] rounded-lg"
                            role="alert"
                            aria-live="polite"
                          >
                            <AlertCircle
                              className="h-4 w-4 text-[#ffd700] flex-shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                            <div className="text-xs text-[#ffd700]">
                              <div className="font-semibold">
                                Short deadline
                              </div>
                              <div className="mt-1 opacity-90">
                                May cause transactions to fail during network
                                congestion.
                              </div>
                            </div>
                          </motion.div>
                        )}

                      <p id="deadline-hint" className="sr-only">
                        Enter a value between 1 and 60 minutes
                      </p>
                    </div>
                  </div>
                )}

                {/* How it Works - Progressive Disclosure */}
                <div className="pt-8 border-t border-color-border">
                  <button
                    onClick={() => setIsHelpExpanded(!isHelpExpanded)}
                    aria-expanded={isHelpExpanded}
                    aria-controls="help-content"
                    className="w-full flex items-center justify-between text-sm font-semibold text-white hover:text-gold transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 rounded-lg p-2 -m-2"
                  >
                    <span>How it Works</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isHelpExpanded ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  <AnimatePresence>
                    {isHelpExpanded && (
                      <motion.div
                        id="help-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 mt-4">
                          <div className="p-4 bg-charcoal border border-color-border rounded-lg">
                            <div className="text-xs font-semibold text-gold mb-2">
                              Slippage Tolerance
                            </div>
                            <div className="text-xs text-gray-400 leading-relaxed">
                              The maximum percentage difference between your
                              expected price and the execution price. Lower
                              values protect against price impact but may cause
                              transaction failures.
                            </div>
                          </div>

                          <div className="p-4 bg-charcoal border border-color-border rounded-lg">
                            <div className="text-xs font-semibold text-gold mb-2">
                              Transaction Deadline
                            </div>
                            <div className="text-xs text-gray-400 leading-relaxed">
                              Time limit for your transaction to be confirmed.
                              If the deadline passes, the transaction will
                              automatically revert to protect you from executing
                              at stale prices.
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom padding to ensure content doesn't hide behind sticky footer */}
                <div className="h-4" aria-hidden="true" />
              </div>
            </div>

            {/* Footer - sticky at bottom, always visible */}
            <div className="flex-shrink-0 bg-charcoal backdrop-blur-md border-t border-[#2a2a2a] p-6 space-y-4">
              {/* Help text - clarity about save behavior */}
              <p className="text-xs text-center text-gray-400">
                Click <span className="font-semibold text-gold">Done</span> to
                save your changes
              </p>

              {/* Secondary Action: Reset to defaults */}
              <button
                onClick={handleReset}
                aria-label="Reset to default settings"
                className="w-full py-2.5 rounded-lg border border-gray-700/50 text-sm font-medium text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset to Defaults
              </button>

              {/* Primary Action: Save and close - using golden gradient */}
              <button
                ref={lastFocusableRef}
                onClick={handleSave}
                className="w-full py-3 rounded-lg bg-primary font-semibold text-white hover:shadow-xl hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
