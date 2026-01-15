/**
 * Portfolio Empty State Component
 * Displayed when wallet has no RWA token holdings
 */

'use client';

import { Wallet, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import { GradientText } from '@/components/ui/common';

// ============================================================================
// Component
// ============================================================================

export default function PortfolioEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-4">
      {/* Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-[rgba(97,7,224,0.2)] rounded-full blur-2xl animate-pulse" />
        <div className="relative glass rounded-full p-8">
          <Wallet className="w-16 h-16 text-[#ffd700]" aria-hidden="true" />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
        <GradientText preset="purple" animate="flow">No RWA Tokens Found</GradientText>
      </h2>

      {/* Description */}
      <p className="text-lg text-gray-400 max-w-md text-center mb-8">
        Your wallet doesn&apos;t have any tokenized real-world assets yet. Start exploring and swapping to build your RWA portfolio.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Primary CTA: Explore */}
        <Link
          href="/explore"
          className="group flex items-center w-full  justify-center gap-2 rounded-xl  px-10 py-5  font-bold bg-[#ffd700] text-[#1c1c1c] shadow-[0_0_40px_-15px_rgba(97,7,224,0.6)] transition hover:scale-105 text-xl hover:bg-[#4d06b3] hover:shadow-[0_0_50px_-10px_rgba(97,7,224,0.8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c] active:scale-95 sm:w-auto font-burbank"
        >
          <Search className="w-5 h-5" aria-hidden="true" />
          <span>Explore RWA Tokens</span>
          <ArrowRight
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            aria-hidden="true"
          />
        </Link>

        {/* Secondary CTA: Swap */}
        <Link
          href="/swap"
          className="flex  w-full items-center justify-center gap-2 border bg-transparent border-purple-400 rounded-xl  px-10 py-5  font-bold  text-[#ffd700] shadow-[0_0_40px_-15px_rgba(97,7,224,0.6)] transition hover:scale-105 text-xl hover:bg-[#4d06b3] hover:shadow-[0_0_50px_-10px_rgba(97,7,224,0.8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2  active:scale-95 sm:w-auto font-burbank"
        >
          <span>Start Swapping</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Helper Text */}
      <div className="mt-12 p-6 glass rounded-xl max-w-2xl">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-[#ffd700]"
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
          What are RWA Tokens?
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          Real-World Asset (RWA) tokens are blockchain-based tokens that represent ownership of physical assets like gold, silver, real estate, and commodities. They combine the benefits of traditional assets with the flexibility of cryptocurrency.
        </p>
      </div>
    </div>
  );
}
