/**
 * Portfolio Holding Card with Chart
 * Enhanced portfolio holding card that includes a mini price chart
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ExternalLink, TrendingUp, TrendingDown, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { PortfolioBalance } from '@/lib/types/portfolio.types';
import { useTokenChart } from '@/components/features/chart/hooks/useTokenChart';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';

// ============================================================================
// Types
// ============================================================================

interface HoldingCardWithChartProps {
  balance: PortfolioBalance;
  index: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatUSD(value: number): string {
  if (!Number.isFinite(value) || isNaN(value)) {
    return '—';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatBalance(balance: string): string {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0';

  if (num >= 1000) return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (num >= 1) return num.toFixed(4);
  if (num >= 0.01) return num.toFixed(6);
  return num.toFixed(8);
}

function formatCompactPrice(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(value < 1 ? 4 : 2)}`;
}

// ============================================================================
// Mini Chart Component
// ============================================================================

interface MiniChartProps {
  symbol: string;
  className?: string;
}

function MiniChart({ symbol, className = '' }: MiniChartProps) {
  const { data, isLoading, error } = useTokenChart(symbol, {
    timeframe: '7D',
    enabled: true,
  });

  const chartColor = data && data.length > 1 && data[data.length - 1].price > data[0].price 
    ? '#10b981' // Green for positive
    : '#ef4444'; // Red for negative

  if (isLoading || error || !data || data.length === 0) {
    return (
      <div className={`h-12 bg-gray-800/30 rounded flex items-center justify-center ${className}`}>
        <BarChart3 className="w-4 h-4 text-gray-500" />
      </div>
    );
  }

  return (
    <div className={`h-12 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <XAxis dataKey="timestamp" hide />
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line
            type="monotone"
            dataKey="price"
            stroke={chartColor}
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function HoldingCardWithChart({ balance, index }: HoldingCardWithChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-hide chart when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setShowChart(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const priceDisplay = formatUSD(balance.price);

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.1 + (index % 9) * 0.05,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      layout
      className="group relative bg-[#1f1f1f] backdrop-blur-xl border border-[#2a2a2a] rounded-2xl shadow-[0_24px_40px_rgba(0,0,0,0.35)] hover:border-[#3a3a3a] hover:shadow-[0_30px_55px_rgba(0,0,0,0.45)] transition-all duration-300 overflow-hidden"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[rgba(97,7,224,0.18)] via-transparent to-[rgba(255,215,0,0.12)] rounded-2xl pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 p-6">
        {/* Token Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Token Logo */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[rgba(28,28,28,0.9)] border border-[#2a2a2a] flex-shrink-0">
            <Image
              src={balance.image}
              alt={`${balance.name} logo`}
              fill
              className="object-cover p-1.5"
              sizes="48px"
              quality={85}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/new/logo1.jpg';
              }}
            />
          </div>

          {/* Token Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate mb-1">
              {balance.name}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-400 uppercase font-semibold">
                {balance.symbol}
              </p>
              <span className="px-2 py-0.5 bg-[#2a2a2a] text-gray-300 text-xs font-medium rounded">
                {balance.chainName}
              </span>
            </div>
          </div>

          {/* Chart Toggle Button */}
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              setShowChart(!showChart);
            }}
            className="p-2 glass  hover:bg-[rgba(44,44,44,0.9)] rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6107e0]"
            aria-label={showChart ? 'Hide chart' : 'Show chart'}
          >
            {showChart ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <BarChart3 className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Mini Chart Preview (when not expanded) */}
        {!showChart && (
          <div className="mb-4">
            <MiniChart symbol={balance.symbol} />
          </div>
        )}

        {/* Token Stats */}
        <div className="space-y-3 mb-4 pb-4 border-b border-[#2a2a2a]">
          {/* Balance */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Balance</span>
            <span className="text-sm font-semibold text-white">
              {formatBalance(balance.balanceFormatted)} {balance.symbol}
            </span>
          </div>

          {/* Price */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Price</span>
            <span className="text-sm font-semibold text-white">
              {priceDisplay}
            </span>
          </div>

          {/* Total Value */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Total Value</span>
            <span className="text-lg font-bold text-[#ffd700]">
              {formatUSD(balance.usdValue)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {/* Swap CTA */}
          <Link
            href={`/swap?token=${balance.symbol}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ffd700] text-[#1c1c1c]  hover:bg-[#e7de8a]   font-semibold rounded-lg transition-all duration-200 hover:scale-105 font-burbank text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6107e0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"
          >
            <span>Swap</span>
            <ArrowRight className="w-4 h-4 font-burbank" aria-hidden="true" />
          </Link>

          {/* View Details */}
          <Link
            href={`/asset/${balance.symbol}`}
            className="flex items-center justify-center px-3 py-2.5 glass hover:bg-[rgba(44,44,44,0.9)] text-gray-300 text-sm font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6107e0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"
            aria-label={`View details for ${balance.name}`}
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Expanded Chart Section */}
      <AnimatePresence>
        {showChart && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative z-10 border-t border-[#2a2a2a] bg-[rgba(15,15,15,0.8)] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">
                  {balance.symbol} Price (7 Days)
                </h4>
                <Link
                  href={`/asset/${balance.symbol}`}
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                >
                  View Full Chart
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              
              <div className="h-32">
                <MiniChart symbol={balance.symbol} className="h-full" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
