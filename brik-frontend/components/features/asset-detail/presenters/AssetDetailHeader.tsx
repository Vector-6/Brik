/**
 * Asset Detail Header
 * Displays asset logo, name, price, and 24h change
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AssetDetailHeaderProps } from "@/lib/types/asset-detail.types";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format price with appropriate decimals
 */
function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString()}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

// ============================================================================
// Component
// ============================================================================

export default function AssetDetailHeader({ asset }: AssetDetailHeaderProps) {
  const isPositiveChange = asset.priceChangePercentage24h >= 0;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-12"
    >
      {/* Left: Asset Identity */}
      <div className="flex items-start gap-6">
        {/* Asset Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-[rgba(31,31,31,0.92)] border-2 border-color-border shadow-[0_24px_40px_rgba(0,0,0,0.35)] flex-shrink-0"
        >
          <Image
            src={asset.image}
            alt={`${asset.name} logo`}
            fill
            className="object-cover p-2.5 lg:p-3"
            sizes="(max-width: 1024px) 80px, 96px"
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/new/logo1.jpg";
            }}
          />
        </motion.div>

        {/* Name, Symbol, Category */}
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1
              id="asset-title"
              className="text-3xl lg:text-4xl font-bold text-white nothingclasstight leading-tight"
            >
              {asset.name}
            </h1>
            {asset.category && asset.category.length > 0 && (
              <span className="px-3 py-1.5 bg-gold/20 border border-gold/40 text-gold text-xs font-semibold uppercase  rounded-full backdrop-blur-sm">
                {asset.category[0]}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 uppercase  font-semibold">
            {asset.symbol}
          </p>
        </div>
      </div>

      {/* Right: Price Information */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:text-right space-y-3"
      >
        {/* Current Price */}
        <div
          className="text-4xl lg:text-5xl font-bold text-white nothingclasstight"
          aria-live="polite"
          aria-atomic="true"
        >
          {formatPrice(asset.price)}
        </div>

        {/* 24h Change */}
        <div className="flex items-center gap-2 lg:justify-end">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              isPositiveChange
                ? "bg-[rgba(82,214,154,0.16)] text-[#6ee7b7] border border-[rgba(82,214,154,0.4)]"
                : "bg-[rgba(253,164,175,0.16)] text-[#fda4af] border border-[rgba(253,164,175,0.4)]"
            }`}
          >
            {isPositiveChange ? (
              <TrendingUp className="w-5 h-5" aria-hidden="true" />
            ) : (
              <TrendingDown className="w-5 h-5" aria-hidden="true" />
            )}
            <span className="text-lg font-bold">
              {isPositiveChange ? "+" : ""}
              {asset.priceChangePercentage24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* 24h Label */}
        <p className="text-xs text-gray-500 uppercase  font-medium">
          24h Change
        </p>
      </motion.div>
    </motion.header>
  );
}
