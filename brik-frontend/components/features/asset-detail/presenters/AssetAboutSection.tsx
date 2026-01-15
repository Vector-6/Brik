/**
 * Asset About Section
 * Displays asset description and key information
 */

"use client";

import { motion } from "framer-motion";
import { Info, Shield, ExternalLink } from "lucide-react";
import { AssetAboutSectionProps } from "@/lib/types/asset-detail.types";

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
 * Format date to readable string
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ============================================================================
// Component
// ============================================================================

export default function AssetAboutSection({ asset }: AssetAboutSectionProps) {
  return (
    <section aria-labelledby="about-section" className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid lg:grid-cols-3 gap-8"
      >
        {/* Left Column: Description and Details */}
        <div className="lg:col-span-2 bg-[#1f1f1f] backdrop-blur-xl border border-color-border rounded-2xl p-8 shadow-[0_24px_40px_rgba(0,0,0,0.35)]">
          {/* About Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gold/10 border border-gold/20 rounded-lg text-gold">
              <Info className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2
              id="about-section"
              className="text-2xl font-bold text-white nothingclasstight"
            >
              About {asset.name}
            </h2>
          </div>

          {/* Description */}
          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-slate-300 leading-relaxed">
              {asset.description || "No description available for this asset."}
            </p>
          </div>

          {/* Custodian Information */}
          {asset.custodian && (
            <div className="pt-6 border-t border-slate-700/40">
              <div className="flex items-start gap-3 mb-3">
                <Shield
                  className="w-5 h-5 text-purple-400 mt-0.5"
                  aria-hidden="true"
                />
                <h3 className="text-lg font-semibold text-white">Custodian</h3>
              </div>
              <p className="text-slate-300 ml-8">{asset.custodian}</p>
            </div>
          )}

          {/* Source */}
          {asset.source && (
            <div className="mt-6">
              <div className="flex items-start gap-3 mb-3">
                <ExternalLink
                  className="w-5 h-5 text-gold mt-0.5"
                  aria-hidden="true"
                />
                <h3 className="text-lg font-semibold text-white">Source</h3>
              </div>
              <p className="text-slate-300 ml-8">{asset.source}</p>
            </div>
          )}

          {/* External Links */}
          {(asset.website || asset.whitepaper) && (
            <div className="mt-6 pt-6 border-t border-slate-700/40">
              <div className="flex flex-wrap gap-3">
                {asset.website && (
                  <a
                    href={asset.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/50 text-gold hover:text-gold/90 rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    <span>Website</span>
                  </a>
                )}
                {asset.whitepaper && (
                  <a
                    href={asset.whitepaper}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/50 text-gold hover:text-gold/90 rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    <span>Whitepaper</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Key Stats */}
        <div className="bg-[#1f1f1f] backdrop-blur-xl border border-[#2a2a2a] rounded-2xl p-8 shadow-[0_24px_40px_rgba(0,0,0,0.35)] h-fit">
          <h3 className="text-xl font-bold text-white mb-6 nothingclasstight">
            Key Statistics
          </h3>

          <dl className="space-y-5">
            {/* Market Cap */}
            <div>
              <dt className="text-xs text-slate-500 uppercase  font-semibold mb-2">
                Market Cap
              </dt>
              <dd className="text-lg font-semibold text-slate-200">
                {formatLargeNumber(asset.marketCap)}
              </dd>
            </div>

            {/* 24h Volume */}
            <div>
              <dt className="text-xs text-slate-500 uppercase  font-semibold mb-2">
                24h Volume
              </dt>
              <dd className="text-lg font-semibold text-slate-200">
                {formatLargeNumber(asset.volume24h)}
              </dd>
            </div>

            {/* TVL */}
            {asset.totalValueLocked !== undefined && (
              <div>
                <dt className="text-xs text-slate-500 uppercase  font-semibold mb-2">
                  Total Value Locked
                </dt>
                <dd className="text-lg font-semibold text-slate-200">
                  {formatLargeNumber(asset.totalValueLocked)}
                </dd>
              </div>
            )}

            {/* APY */}
            {asset.apy !== undefined && (
              <div>
                <dt className="text-xs text-slate-500 uppercase  font-semibold mb-2">
                  APY
                </dt>
                <dd className="text-lg font-semibold text-green-400">
                  {asset.apy.toFixed(2)}%
                </dd>
              </div>
            )}

            {/* Available Chains */}
            <div>
              <dt className="text-xs text-slate-500 uppercase  font-semibold mb-2">
                Available Chains
              </dt>
              <dd className="text-lg font-semibold text-slate-200">
                {asset.chainsAvailable.length}
              </dd>
            </div>

            {/* Last Updated */}
            {asset.lastUpdated && (
              <div className="pt-5 border-t border-slate-700/40">
                <dt className="text-xs text-slate-500 uppercase  font-semibold mb-2">
                  Last Updated
                </dt>
                <dd className="text-sm text-slate-400">
                  {formatDate(asset.lastUpdated)}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </motion.div>
    </section>
  );
}
