/**
 * Asset Metrics Grid
 * Displays key financial metrics in a card grid layout
 */

"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign, PieChart, Layers } from "lucide-react";
import { AssetMetricsGridProps } from "@/lib/types/asset-detail.types";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format large numbers with K/M/B suffix
 */
function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
}

/**
 * Format supply numbers
 */
function formatSupply(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  return num.toLocaleString();
}

// ============================================================================
// Types
// ============================================================================

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  index: number;
}

// ============================================================================
// Metric Card Component
// ============================================================================

function MetricCard({ icon, label, value, subtext, index }: MetricCardProps) {
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
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-2xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 space-y-3">
        {/* Icon and Label */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gold/10 border border-gold/20 rounded-lg text-gold group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
          <p className="text-xs text-gray-500 uppercase  font-semibold">
            {label}
          </p>
        </div>

        {/* Value */}
        <div>
          <p className="text-2xl font-bold text-white nothingclasstight">
            {value}
          </p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AssetMetricsGrid({ asset }: AssetMetricsGridProps) {
  const metrics = [
    {
      icon: <DollarSign className="w-5 h-5" aria-hidden="true" />,
      label: "Market Cap",
      value: formatLargeNumber(asset.marketCap),
      subtext: undefined,
    },
    {
      icon: <TrendingUp className="w-5 h-5" aria-hidden="true" />,
      label: "24h Volume",
      value: formatLargeNumber(asset.volume24h),
      subtext: undefined,
    },
    asset.totalValueLocked !== undefined
      ? {
          icon: <PieChart className="w-5 h-5" aria-hidden="true" />,
          label: "Total Value Locked",
          value: formatLargeNumber(asset.totalValueLocked),
          subtext: undefined,
        }
      : null,
    asset.apy !== undefined
      ? {
          icon: <TrendingUp className="w-5 h-5" aria-hidden="true" />,
          label: "APY",
          value: `${asset.apy.toFixed(2)}%`,
          subtext: "Annual Percentage Yield",
        }
      : null,
    asset.circulatingSupply !== undefined
      ? {
          icon: <Layers className="w-5 h-5" aria-hidden="true" />,
          label: "Circulating Supply",
          value: formatSupply(asset.circulatingSupply),
          subtext:
            asset.supply !== undefined
              ? `of ${formatSupply(asset.supply)} total`
              : undefined,
        }
      : null,
  ].filter((metric): metric is NonNullable<typeof metric> => metric !== null);

  return (
    <section aria-label="Asset Metrics" className="mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            subtext={metric.subtext}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
