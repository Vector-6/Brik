/**
 * Portfolio Header Component
 * Displays portfolio title and total value
 * Follows design patterns from AssetDetailHeader for visual consistency
 */

"use client";

import { motion } from "framer-motion";
import { Wallet, DollarSign } from "lucide-react";
import { PortfolioResponse } from "@/lib/types/portfolio.types";
import { GradientText } from '@/components/ui/common';

// ============================================================================
// Props
// ============================================================================

interface PortfolioHeaderProps {
  portfolio: PortfolioResponse;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format USD value with proper decimals
 */
function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ============================================================================
// Component
// ============================================================================

export default function PortfolioHeader({ portfolio }: PortfolioHeaderProps) {
  const { totalValueUSD, balances } = portfolio;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-12"
    >
      {/* Left: Portfolio Identity */}
      <div className="flex items-start gap-6">
        {/* Portfolio Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gold/15 border-2 border-gold/50 shadow-[0_24px_40px_rgba(0,0,0,0.35)] flex-shrink-0 flex items-center justify-center"
        >
          <Wallet
            className="w-10 h-10 lg:w-12 lg:h-12 text-[#ffd700]"
            aria-hidden="true"
          />
        </motion.div>

        {/* Title and Description */}
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1
              id="portfolio-title"
              className="text-3xl lg:text-4xl font-bold nothingclasstight leading-tight"
            >
              <GradientText preset="purple" animate="flow">Your Portfolio</GradientText>
            </h1>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed max-w-2xl">
            Track your tokenized real-world assets across multiple blockchains
          </p>
          <p className="text-xs text-gray-500 uppercase  font-semibold">
            {balances.length} {balances.length === 1 ? "Asset" : "Assets"}
          </p>
        </div>
      </div>

      {/* Right: Total Value */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:text-right space-y-3"
      >
        {/* Total Portfolio Value */}
        <div
          className="text-4xl lg:text-5xl font-bold text-white nothingclasstight"
          aria-live="polite"
          aria-atomic="true"
        >
          {formatUSD(totalValueUSD)}
        </div>

        {/* Label */}
        <div className="flex items-center gap-2 lg:justify-end">
          <DollarSign className="w-5 h-5 text-gray-500" aria-hidden="true" />
          <p className="text-xs text-gray-500 uppercase  font-medium">
            Total Portfolio Value
          </p>
        </div>
      </motion.div>
    </motion.header>
  );
}
