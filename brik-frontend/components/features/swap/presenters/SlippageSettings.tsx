"use client";

/**
 * SlippageSettings Component
 * User interface for configuring slippage tolerance
 *
 * UI/UX Principles Applied:
 * - Hierarchy: Visual prominence for recommended values and current state
 * - Progressive Disclosure: Risk indicators appear contextually
 * - Consistency: Unified button states and input patterns
 * - Contrast: Color-coded risk zones with WCAG AA compliance
 * - Accessibility: Full ARIA support, keyboard navigation, screen reader labels
 * - Proximity: Related controls and feedback grouped together
 * - Alignment: Grid-based preset layout with consistent spacing
 */

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, CheckCircle2 } from "lucide-react";

// ============================================================================
// Props
// ============================================================================

export interface SlippageSettingsProps {
  value: number; // Current slippage in percentage (e.g., 0.5 for 0.5%)
  onChange: (value: number) => void;
  min?: number; // Minimum allowed slippage
  max?: number; // Maximum allowed slippage
  presets?: number[]; // Preset values to display as quick options
  recommendation?: string; // Contextual recommendation text
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_PRESETS = [0.1, 0.5, 1.0];
const DEFAULT_MIN = 0.01;
const DEFAULT_MAX = 50;

// ============================================================================
// Risk Level Utilities
// ============================================================================

type RiskLevel = "safe" | "balanced" | "high" | "extreme";

function getRiskLevel(value: number): RiskLevel {
  if (value <= 0.5) return "safe";
  if (value <= 1.5) return "balanced";
  if (value <= 5) return "high";
  return "extreme";
}

function getRiskColor(level: RiskLevel): string {
  const colors = {
    safe: "text-green-400",
    balanced: "text-blue-400",
    high: "text-yellow-400",
    extreme: "text-red-400",
  };
  return colors[level];
}

function getRiskBorderColor(level: RiskLevel): string {
  const colors = {
    safe: "border-green-500",
    balanced: "border-blue-500",
    high: "border-yellow-500",
    extreme: "border-red-500",
  };
  return colors[level];
}

function getRiskBackgroundColor(level: RiskLevel): string {
  const colors = {
    safe: "bg-green-900/20 border-green-500/30",
    balanced: "bg-blue-900/20 border-blue-500/30",
    high: "bg-yellow-900/20 border-yellow-500/30",
    extreme: "bg-red-900/20 border-red-500/30",
  };
  return colors[level];
}

function getRiskLabel(level: RiskLevel): string {
  const labels = {
    safe: "Protected",
    balanced: "Balanced",
    high: "High Risk",
    extreme: "Very High Risk",
  };
  return labels[level];
}

// ============================================================================
// Component
// ============================================================================

/**
 * Slippage settings component with enhanced accessibility and UX
 * Provides visual risk indicators and contextual guidance
 *
 * @example
 * <SlippageSettings
 *   value={0.5}
 *   onChange={(value) => setSlippage(value)}
 *   presets={[0.1, 0.5, 1.0, 3.0]}
 *   recommendation="Recommended for typical conditions"
 * />
 */
export function SlippageSettings({
  value,
  onChange,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  presets = DEFAULT_PRESETS,
  recommendation,
}: SlippageSettingsProps) {
  const [customValue, setCustomValue] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);

  const riskLevel = getRiskLevel(value);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handlePresetClick = useCallback(
    (preset: number) => {
      setIsCustom(false);
      setCustomValue("");
      onChange(preset);
    },
    [onChange]
  );

  const handleCustomChange = useCallback(
    (input: string) => {
      // Allow empty, decimal point, and valid numbers
      if (input === "" || input === "." || /^\d*\.?\d*$/.test(input)) {
        setCustomValue(input);
        setIsCustom(true);

        // Validate and parse input
        const numValue = parseFloat(input);
        if (!isNaN(numValue) && numValue >= min && numValue <= max) {
          onChange(numValue);
        }
      }
    },
    [onChange, min, max]
  );

  const handleCustomBlur = useCallback(() => {
    const numValue = parseFloat(customValue);
    if (isNaN(numValue) || customValue === "") {
      // Revert to current value if invalid
      setIsCustom(false);
      setCustomValue("");
    } else if (numValue < min) {
      setCustomValue(min.toString());
      onChange(min);
    } else if (numValue > max) {
      setCustomValue(max.toString());
      onChange(max);
    }
  }, [customValue, min, max, onChange]);

  // Determine if current value matches a preset
  const matchingPreset = presets.find((p) => Math.abs(p - value) < 0.001);
  const isPresetActive = !isCustom && matchingPreset !== undefined;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header with tooltip */}
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-sm font-semibold text-white">
              Slippage Tolerance
            </h3>
            {recommendation && matchingPreset === 0.5 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold/20 border border-gold/30 rounded text-xs text-gold">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                Recommended
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Your transaction will revert if the price changes unfavorably by
            more than this percentage.
          </p>
          {recommendation && (
            <p className="mt-1.5 text-xs text-gold">💡 {recommendation}</p>
          )}
        </div>

        {/* Info tooltip */}
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            aria-label="More information about slippage tolerance"
            className="p-1.5 hover:bg-charcoal rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Info className="h-4 w-4 text-gold" aria-hidden="true" />
          </button>

          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                transition={{ duration: 0.15 }}
                role="tooltip"
                className="absolute right-0 top-full mt-2 w-64 p-3 bg-charcoal border border-color-border rounded-lg shadow-xl z-10 text-xs text-gray-300 leading-relaxed"
              >
                Lower slippage protects you from unfavorable price movements but
                may cause your transaction to fail if the market is volatile.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Preset Buttons - using grid for alignment */}
      <div
        className="grid grid-cols-4 gap-3"
        role="radiogroup"
        aria-label="Slippage presets"
      >
        {presets.map((preset) => {
          const isActive = isPresetActive && matchingPreset === preset;
          return (
            <button
              key={preset}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`${preset} percent slippage`}
              onClick={() => handlePresetClick(preset)}
              className={`px-3 py-3 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                isActive
                  ? "bg-gold text-background shadow-lg"
                  : "bg-charcoal border-2 border-color-border text-gray-300 hover:bg-charcoal/80 hover:text-white"
              }`}
            >
              {preset}%
            </button>
          );
        })}
      </div>

      {/* Custom Input - improved accessibility and validation */}
      <div className="relative">
        <label htmlFor="custom-slippage" className="sr-only">
          Custom slippage percentage
        </label>
        <input
          ref={customInputRef}
          id="custom-slippage"
          type="text"
          inputMode="decimal"
          value={isCustom ? customValue : ""}
          onChange={(e) => handleCustomChange(e.target.value)}
          onFocus={() => setIsCustom(true)}
          onBlur={handleCustomBlur}
          placeholder="Custom"
          aria-label="Custom slippage percentage"
          aria-describedby="slippage-hint"
          className={`w-full px-4 py-3 pr-12 bg-charcoal border rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all ${
            isCustom
              ? `${getRiskBorderColor(riskLevel)} focus:ring-${
                  riskLevel === "safe"
                    ? "green"
                    : riskLevel === "balanced"
                    ? "blue"
                    : riskLevel === "high"
                    ? "yellow"
                    : "red"
                }-500/50`
              : "border-color-border focus:ring-purple-500/50 focus:border-purple-500"
          }`}
        />
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none"
          aria-hidden="true"
        >
          %
        </div>
      </div>

      <p id="slippage-hint" className="sr-only">
        Enter a custom slippage percentage between {min}% and {max}%
      </p>

      {/* Current Value Display with Risk Indicator - using hierarchy and contrast */}
      <div className="flex items-center justify-between text-xs pt-2">
        <span className="text-gray-400">Current: {value.toFixed(2)}%</span>
        <span className={`font-semibold ${getRiskColor(riskLevel)}`}>
          {getRiskLabel(riskLevel)}
        </span>
      </div>

      {/* Risk Warnings - using progressive disclosure and contrast */}
      <AnimatePresence mode="wait">
        {riskLevel === "extreme" && (
          <motion.div
            key="extreme"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            role="alert"
            aria-live="polite"
            className={`flex items-start gap-2 p-3 border rounded-lg ${getRiskBackgroundColor(
              riskLevel
            )}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="h-4 w-4 text-red-400"
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
            <div className="text-xs text-red-300">
              <div className="font-semibold">Very high slippage risk!</div>
              <div className="mt-1 opacity-90">
                Your transaction may be frontrun or result in significant value
                loss. Consider lowering your slippage tolerance.
              </div>
            </div>
          </motion.div>
        )}

        {riskLevel === "high" && (
          <motion.div
            key="high"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            role="alert"
            aria-live="polite"
            className={`flex items-start gap-2 p-3 border rounded-lg ${getRiskBackgroundColor(
              riskLevel
            )}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="h-4 w-4 text-yellow-400"
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
            <div className="text-xs text-yellow-300">
              <div className="font-semibold">High slippage warning</div>
              <div className="mt-1 opacity-90">
                Your transaction may be frontrun. Proceed with caution.
              </div>
            </div>
          </motion.div>
        )}

        {riskLevel === "safe" && value > 0 && (
          <motion.div
            key="safe"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`flex items-start gap-2 p-3 border rounded-lg ${getRiskBackgroundColor(
              riskLevel
            )}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              <CheckCircle2
                className="h-4 w-4 text-green-400"
                aria-hidden="true"
              />
            </div>
            <div className="text-xs text-green-300">
              <div className="font-semibold">Protected setting</div>
              <div className="mt-1 opacity-90">
                Low slippage protects against unfavorable price movements.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
