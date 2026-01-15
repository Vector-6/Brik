/**
 * Portfolio Metrics Grid
 * Displays portfolio performance metrics in a card grid layout
 * Follows design patterns from AssetMetricsGrid for visual consistency
 */

"use client";

import { motion } from "framer-motion";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { PortfolioPerformance } from "@/lib/types/portfolio.types";

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

/**
 * Format percentage with sign
 */
function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

// ============================================================================
// Types
// ============================================================================

interface PortfolioMetricsGridProps {
  performance: PortfolioPerformance;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  percentage: number;
  index: number;
}

// ============================================================================
// Metric Card Component
// ============================================================================

function MetricCard({
  icon,
  label,
  value,
  percentage,
  index,
}: MetricCardProps) {
  const isPositive = percentage >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.1 + index * 0.05,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      className="group relative bg-[#1f1f1f] backdrop-blur-xl border border-[#2a2a2a] rounded-2xl p-6 shadow-[0_24px_40px_rgba(0,0,0,0.35)] hover:border-[#3a3a3a] hover:shadow-[0_30px_55px_rgba(0,0,0,0.45)] transition-all duration-300"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[rgba(97,7,224,0.18)] via-transparent to-[rgba(255,215,0,0.12)] rounded-2xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 space-y-3">
        {/* Icon and Label */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gold/20 border border-gold/40 rounded-lg text-gold group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
          <p className="text-xs text-gray-500 uppercase  font-semibold">
            {label}
          </p>
        </div>

        {/* Value Display */}
        <div>
          {/* Change Amount */}
          <div className="flex items-center gap-2 mb-1">
            {isPositive ? (
              <TrendingUp
                className="w-5 h-5 text-[#52d69a]"
                aria-hidden="true"
              />
            ) : (
              <TrendingDown
                className="w-5 h-5 text-[#f47174]"
                aria-hidden="true"
              />
            )}
            <p
              className={`text-2xl font-bold nothingclasstight ${
                isPositive ? "text-[#6ee7b7]" : "text-[#fda4af]"
              }`}
            >
              {formatUSD(Math.abs(value))}
            </p>
          </div>

          {/* Percentage Change */}
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold ${
                isPositive ? "text-[#6ee7b7]" : "text-[#fda4af]"
              }`}
            >
              {formatPercentage(percentage)}
            </span>
            <span className="text-xs text-gray-500">
              {value >= 0 ? "gain" : "loss"}
            </span>
          </div>
        </div>
      </div>

      {/* Screen Reader Text */}
      <span className="sr-only">
        {label} change: {formatPercentage(percentage)} ({formatUSD(value)})
      </span>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function PortfolioMetricsGrid({
  performance,
}: PortfolioMetricsGridProps) {
  const metrics = [
    {
      icon: <Calendar className="w-5 h-5" aria-hidden="true" />,
      label: "24 Hours",
      timeframe: "24h",
      value: performance.change24h,
      percentage: performance.change24hPercent,
    },
    {
      icon: <Calendar className="w-5 h-5" aria-hidden="true" />,
      label: "7 Days",
      timeframe: "7d",
      value: performance.change7d,
      percentage: performance.change7dPercent,
    },
    {
      icon: <Calendar className="w-5 h-5" aria-hidden="true" />,
      label: "30 Days",
      timeframe: "30d",
      value: performance.change30d,
      percentage: performance.change30dPercent,
    },
  ];

  return (
    <section aria-label="Portfolio Performance Metrics" className="mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.timeframe}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            percentage={metric.percentage}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
