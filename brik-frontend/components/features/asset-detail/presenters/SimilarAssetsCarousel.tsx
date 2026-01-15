/**
 * Similar Assets Carousel
 * Displays related RWA assets in a horizontal scrollable carousel
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp, TrendingDown, ArrowRight, Sparkles } from "lucide-react";
import { SimilarToken } from "@/lib/api/endpoints/asset-detail";
import { SimilarAssetsCarouselSkeleton } from "../skeletons/AssetDetailSkeletons";

// ============================================================================
// Types
// ============================================================================

interface SimilarAssetsCarouselProps {
  assets: SimilarToken[];
  currentAssetId: string;
  isLoading?: boolean;
  error?: unknown;
}

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
 * Format price with appropriate decimals
 */
function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString()}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

/**
 * Get similarity percentage display
 */
function getSimilarityPercentage(score: number): string {
  return `${Math.round(score * 100)}%`;
}

// ============================================================================
// Component
// ============================================================================

export default function SimilarAssetsCarousel({
  assets,
  currentAssetId,
  isLoading,
  error,
}: SimilarAssetsCarouselProps) {
  // Show skeleton during loading
  if (isLoading) {
    return <SimilarAssetsCarouselSkeleton />;
  }

  // Don't render if no assets or error
  if (error || !assets || assets.length === 0) {
    return null;
  }

  // Filter out the current asset
  const filteredAssets = assets.filter(
    (asset) => asset.symbol !== currentAssetId
  );

  if (filteredAssets.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      aria-labelledby="similar-assets-section"
      className="mb-12"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gold/10 border border-gold/20 rounded-lg text-gold">
          <Sparkles className="w-5 h-5" aria-hidden="true" />
        </div>
        <h2
          id="similar-assets-section"
          className="text-2xl font-bold text-white nothingclasstight"
        >
          Similar Assets
        </h2>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredAssets.slice(0, 4).map((asset, index) => {
          const isPositiveChange =
            asset.priceChangePercentage24h !== undefined &&
            asset.priceChangePercentage24h >= 0;
          const hasMarketData = asset.price !== undefined;

          return (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.35 + index * 0.08,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              whileHover={{
                y: -6,
                transition: { duration: 0.2 },
              }}
            >
              <Link
                href={`/asset/${asset.symbol}`}
                className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-2xl"
              >
                <div className="relative h-full flex flex-col bg-[#1f1f1f] backdrop-blur-xl border border-[#2a2a2a] rounded-2xl p-5 shadow-[0_24px_40px_rgba(0,0,0,0.35)] hover:border-[#3a3a3a] hover:shadow-[0_30px_55px_rgba(0,0,0,0.45)] transition-all duration-300">
                  {/* Subtle hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-2xl pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header: Logo + Name */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[rgba(31,31,31,0.92)] border border-[#2a2a2a] shadow-md group-hover:border-[#3a3a3a] transition-all duration-300 flex-shrink-0">
                        <Image
                          src={asset.image}
                          alt={`${asset.name} logo`}
                          fill
                          className="object-cover p-1.5"
                          sizes="48px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/new/logo1.jpg";
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-bold text-white mb-0.5 truncate leading-tight group-hover:text-purple-200 transition-colors duration-300">
                          {asset.name}
                        </h3>
                        <p className="text-xs text-slate-400 uppercase nothingclasswider font-semibold">
                          {asset.symbol}
                        </p>
                      </div>
                    </div>

                    {/* Similarity Score */}
                    <div className="mb-4 pb-4 border-b border-slate-700/40">
                      <div className="flex items-baseline gap-1.5 mb-3">
                        <span className="text-xs text-slate-400 font-medium">
                          Similar
                        </span>
                        <span className="text-sm font-bold text-gold">
                          ({getSimilarityPercentage(asset.similarityScore)})
                        </span>
                      </div>

                      {/* Shared Categories */}
                      {asset.sharedCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {asset.sharedCategories
                            .slice(0, 2)
                            .map((category) => (
                              <span
                                key={category}
                                className="px-2 py-1 bg-[#2a2a2a] text-gray-300 text-xs font-medium rounded"
                              >
                                {category}
                              </span>
                            ))}
                          {asset.sharedCategories.length > 2 && (
                            <span className="px-2 py-1 bg-[#2a2a2a] text-gray-400 text-xs font-medium rounded">
                              +{asset.sharedCategories.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Price and Performance */}
                    {hasMarketData && (
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-white">
                            {formatPrice(asset.price!)}
                          </span>
                          {asset.priceChangePercentage24h !== undefined && (
                            <div
                              className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                                isPositiveChange
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {isPositiveChange ? (
                                <TrendingUp
                                  className="w-3.5 h-3.5"
                                  aria-hidden="true"
                                />
                              ) : (
                                <TrendingDown
                                  className="w-3.5 h-3.5"
                                  aria-hidden="true"
                                />
                              )}
                              <span className="text-xs font-bold">
                                {isPositiveChange ? "+" : ""}
                                {asset.priceChangePercentage24h.toFixed(2)}%
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Single most relevant metric */}
                        {asset.marketCap !== undefined && (
                          <p className="text-xs text-slate-400 mt-2">
                            Market cap:{" "}
                            <span className="text-slate-300 font-semibold">
                              {formatLargeNumber(asset.marketCap)}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Chains Available - only show when no market data */}
                    {!hasMarketData && asset.chainsAvailable.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-400 mb-2">
                          Available on
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {asset.chainsAvailable.slice(0, 3).map((chain) => (
                            <span
                              key={chain.chainId}
                              className="px-2 py-1 bg-[#2a2a2a] text-gray-300 text-xs font-medium rounded"
                            >
                              {chain.chainName}
                            </span>
                          ))}
                          {asset.chainsAvailable.length > 3 && (
                            <span className="px-2 py-1 bg-[#2a2a2a] text-gray-400 text-xs font-medium rounded">
                              +{asset.chainsAvailable.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-grow" />

                    {/* View Details CTA */}
                    <div className="flex items-center justify-between text-gold group-hover:text-gold/90 transition-colors duration-200 text-sm font-semibold pt-3 border-t border-slate-700/40">
                      <span>View details</span>
                      <ArrowRight
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* View All Link */}
      {filteredAssets.length > 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3  hover:bg-primary/20 border border-primary/30 hover:border-primary/50  hover:text-primary-light rounded-xl transition-all duration-200 bg-[#ffd700] text-[#1c1c1c] font-semibold font-burbank"
          >
            <span>View All Assets</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </motion.div>
      )}
    </motion.section>
  );
}
