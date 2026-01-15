/**
 * Portfolio Chain Filter Component
 * Filter portfolio holdings by blockchain
 */

'use client';

import { Filter, X } from 'lucide-react';
import { ChainPortfolioStats } from '@/lib/types/portfolio.types';

// ============================================================================
// Props
// ============================================================================

interface PortfolioChainFilterProps {
  /** Available chains with stats */
  chainStats: ChainPortfolioStats[];

  /** Currently selected chain IDs */
  selectedChains: number[];

  /** Callback when chain selection changes */
  onToggleChain: (chainId: number) => void;

  /** Callback to clear all filters */
  onClearFilters: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format USD value compactly
 */
function formatCompactUSD(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

// ============================================================================
// Component
// ============================================================================

export default function PortfolioChainFilter({
  chainStats,
  selectedChains,
  onToggleChain,
  onClearFilters,
}: PortfolioChainFilterProps) {
  const hasActiveFilters = selectedChains.length > 0;

  return (
    <div className="mb-8">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#ffd700]" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-white">Filter by Chain</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-[rgba(97,7,224,0.22)] text-[#d6c1ff] text-xs font-semibold rounded-full">
              {selectedChains.length}
            </span>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6107e0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] rounded"
            aria-label="Clear all chain filters"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Chain Pills */}
      <div className="flex flex-wrap gap-3">
        {chainStats.map((chain) => {
          const isSelected = selectedChains.includes(chain.chainId);

          return (
            <button
              key={chain.chainId}
              onClick={() => onToggleChain(chain.chainId)}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6107e0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]
                ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#6107e0] via-[#7a3df2] to-[#ffd700] text-white shadow-[0_20px_40px_rgba(97,7,224,0.24)]'
                    : 'glass hover:bg-[rgba(36,36,36,0.9)] text-gray-300'
                }
              `}
              aria-pressed={isSelected}
              aria-label={`Filter by ${chain.chainName}. ${chain.tokenCount} tokens worth ${formatCompactUSD(chain.totalValueUSD)}`}
            >
              {/* Chain Info */}
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold">{chain.chainName}</span>
                <span className="text-xs opacity-80">
                  {chain.tokenCount} {chain.tokenCount === 1 ? 'token' : 'tokens'}
                </span>
              </div>

              {/* Value */}
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold">
                  {formatCompactUSD(chain.totalValueUSD)}
                </span>
                <span className="text-xs opacity-80">
                  {chain.percentage.toFixed(1)}%
                </span>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* No chains available */}
      {chainStats.length === 0 && (
        <p className="text-sm text-gray-500 italic">No chains available</p>
      )}
    </div>
  );
}
