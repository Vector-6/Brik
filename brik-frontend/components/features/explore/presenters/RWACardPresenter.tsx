/**
 * RWA Card Presenter - Refined Design
 * Premium token card with improved visual hierarchy and professional aesthetics
 */

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { RWACardProps } from '@/lib/types/explore.types';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { getChainLogos } from '@/lib/constants/chainLogos';

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

// ============================================================================
// Component
// ============================================================================

export default function RWACardPresenter({ token, index }: RWACardProps) {
  const isPositiveChange = token.priceChangePercentage24h >= 0;
  const chainLogos = token.chainsAvailable
    ? getChainLogos(token.chainsAvailable)
    : [];

  return (
    <Link
      href={`/asset/${token.symbol}`}
      className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6107e0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] rounded-2xl"
    >
      <motion.article
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.4,
          delay: index * 0.05,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        whileHover={{
          y: -6,
          transition: { duration: 0.3, ease: 'easeIn' },
        }}
        className="group relative h-full flex flex-col bg-[#1f1f1f] backdrop-blur-xl border border-[#2a2a2a] rounded-2xl shadow-[0_24px_40px_rgba(0,0,0,0.35)] hover:border-[#3a3a3a] hover:shadow-[0_30px_55px_rgba(0,0,0,0.45)] transition-all duration-300 cursor-pointer overflow-hidden"
      >
      {/* Subtle Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-purple-600/20  to-pink-500/20 rounded-2xl pointer-events-none" />

      {/* Refined Top Border Accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#6107e0]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content - Optimized Padding */}
      <div className="relative z-10 flex flex-col h-full p-5">
        {/* Header Section: Logo + Name */}
        <div className="flex items-start gap-3 mb-4">
          {/* Token Logo */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[rgba(28,28,28,0.9)] border border-[#2a2a2a] shadow-md group-hover:border-[#3a3a3a] transition-all duration-300 flex-shrink-0">
            <Image
              src={token.image}
              alt={`${token.name} logo`}
              fill
              className="object-cover p-1.5"
              sizes="48px"
              loading="lazy"
              quality={85}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/new/logo1.jpg';
              }}
            />
          </div>

          {/* Token Name and Symbol */}
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-white mb-0.5 truncate leading-tight group-hover:text-[#c8acff] transition-colors duration-300">
              {token.name}
            </h3>
            <p className="text-xs text-slate-400 uppercase nothingclasswider font-semibold">
              {token.symbol}
            </p>
          </div>

          {/* RWA Category Badge - Progressive Disclosure */}
          {token.category && token.category.length > 0 && (
            <span className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 px-2.5 py-1 bg-[rgba(255,215,0,0.12)] border border-[rgba(255,215,0,0.4)] text-[#ffd700] text-[10px] font-semibold uppercase  rounded-full backdrop-blur-sm flex-shrink-0">
              {token.category[0]}
            </span>
          )}
        </div>

        {/* Primary Price Display - Optimized Hierarchy */}
        <div className="mb-4 pb-4 border-b border-[#2a2a2a]">
          <div className="flex items-baseline gap-2 flex-wrap mb-2">
            <span className="text-2xl font-bold text-white">
              {formatPrice(token.price)}
            </span>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                isPositiveChange
                  ? 'bg-[rgba(46,204,113,0.14)] text-[#6ee7b7]'
                  : 'bg-[rgba(244,114,182,0.14)] text-[#fca5a5]'
              }`}
            >
              {isPositiveChange ? (
                <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span className="text-xs font-bold">
                {isPositiveChange ? '+' : ''}
                {token.priceChangePercentage24h.toFixed(2)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400">24H Change</p>
        </div>

        {/* Secondary Stats - Compact Two-Column Layout */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Market Cap */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Market cap</p>
            <p className="text-base font-semibold text-gray-200">
              {formatLargeNumber(token.marketCap)}
            </p>
          </div>

          {/* 24h Volume */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Volume 24h</p>
            <p className="text-base font-semibold text-gray-200">
              {formatLargeNumber(token.volume24h)}
            </p>
          </div>
        </div>

        {/* Chains Available - Text Badge Design matching Similar Assets */}
        {chainLogos.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Available on</p>
            <div className="flex flex-wrap gap-1.5">
              {chainLogos.slice(0, 3).map((chain) => (
                <span
                  key={chain.name}
                  className="px-2 py-1 bg-[#2a2a2a] text-gray-300 text-xs font-medium rounded"
                  title={chain.name}
                >
                  {chain.name}
                </span>
              ))}
              {chainLogos.length > 3 && (
                <span
                  className="px-2 py-1 bg-[#2a2a2a] text-gray-400 text-xs font-medium rounded"
                  title={`${chainLogos.slice(3).map(c => c.name).join(', ')}`}
                >
                  +{chainLogos.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Spacer to push footer to bottom */}
        <div className="flex-grow" />

        {/* View Details Link - Subtle Text Pattern */}
        <div className="flex items-center justify-between text-[#ffd700] group-hover:text-[#ffe066] transition-colors duration-200 text-sm font-semibold pt-3 border-t border-[#2a2a2a]">
          <span>View details</span>
          <ArrowRight
            className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Subtle Animated Border Gradient on Hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/20 via-purple-500/20 to-pink-500/20 blur-xl" />
      </div>
    </motion.article>
    </Link>
  );
}
