'use client';

/**
 * CollapsibleQuoteDetails
 * Collapsible quote details section with auto-expand functionality
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { formatPercentage, formatTokenAmount, formatUSDValue } from '@/lib/utils/numberFormatting';
import type { RouteExtended } from '@/lib/types/lifi.types';
import type { Token } from '@/lib/types/token.types';
import { buildQuoteMetrics } from '../utils/quoteMetrics';
import type { QuoteMetrics } from '../utils/quoteMetrics';

// ============================================================================
// Props Interface
// ============================================================================

export interface CollapsibleQuoteDetailsProps {
  quote: RouteExtended | null;
  toToken: Token | null;
  isLoadingQuote?: boolean;
  autoExpand?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export default function CollapsibleQuoteDetails({
  quote,
  toToken,
  isLoadingQuote = false,
  autoExpand = true,
}: CollapsibleQuoteDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const metrics: QuoteMetrics | null = useMemo(() => {
    if (!quote || !toToken) {
      return null;
    }

    return buildQuoteMetrics(quote, toToken);
  }, [quote, toToken]);

  // Auto-expand when quote loads
  useEffect(() => {
    if (autoExpand && quote && !isLoadingQuote) {
      setIsExpanded(true);
    }
  }, [autoExpand, isLoadingQuote, quote]);

  if (!quote || !toToken || !metrics) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded((previous) => !previous);
  };

  const minReceivedDisplay = metrics.minReceivedAmount
    ? `${formatTokenAmount(metrics.minReceivedAmount)} ${toToken.symbol}`
    : '—';

  const gasCostUSDDisplay = metrics.gasCostTotalUSD
    ? formatUSDValue(metrics.gasCostTotalUSD)
    : null;

  const gasCostNativeDisplay = buildGasCostNativeSummary(metrics);

  const estimatedTimeDisplay = metrics.estimatedDurationSeconds
    ? formatDuration(metrics.estimatedDurationSeconds)
    : null;

  const slippageDisplay = metrics.slippagePercentage !== null
    ? formatPercentage(metrics.slippagePercentage)
    : null;

  const priceImpactDisplay = metrics.priceImpactPercentage !== null
    ? formatPercentage(metrics.priceImpactPercentage)
    : null;

  const routeSummary = metrics.routeLabels.join(' → ');

  const collapsedSummaryParts = [routeSummary, gasCostUSDDisplay, estimatedTimeDisplay].filter(
    Boolean,
  );

  return (
    <section className="border-t border-gray-700/50 mt-4 pt-4" aria-labelledby="quote-details-heading">
      {/* Collapsible Header */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between text-left hover:bg-gray-800/20 rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-900"
        aria-expanded={isExpanded}
        aria-controls="quote-details-content"
      >
        <h3 id="quote-details-heading" className="text-sm font-semibold text-white">
          Quote Details
        </h3>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Collapsible Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id="quote-details-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <dl className="mt-3 space-y-3 px-3" aria-live={isLoadingQuote ? 'polite' : 'off'}>
              {/* Route */}
              <div className="flex items-start justify-between gap-4">
                <dt className="text-xs text-gray-400">Route</dt>
                <dd className="text-xs text-white font-medium text-right break-words">
                  {routeSummary}
                </dd>
              </div>

              {/* Minimum Received */}
              <div className="flex items-center justify-between">
                <dt className="text-xs text-gray-400">Minimum Received</dt>
                <dd className="text-xs text-white font-medium">{minReceivedDisplay}</dd>
              </div>

              {/* Network Fee */}
              {(gasCostUSDDisplay || gasCostNativeDisplay) && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-xs text-gray-400">Network Fee</dt>
                  <dd className="text-xs text-white font-medium text-right">
                    {gasCostNativeDisplay}
                    {gasCostUSDDisplay ? ` (${gasCostUSDDisplay})` : ''}
                  </dd>
                </div>
              )}

              {/* Estimated Time */}
              {estimatedTimeDisplay && (
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-gray-400">Est. Time</dt>
                  <dd className="text-xs text-white font-medium">{estimatedTimeDisplay}</dd>
                </div>
              )}

              {/* Slippage */}
              {slippageDisplay && (
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-gray-400">Max. Slippage</dt>
                  <dd className="text-xs text-white font-medium">{slippageDisplay}</dd>
                </div>
              )}

              {/* Price Impact */}
              {priceImpactDisplay && (
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-gray-400">Price Impact</dt>
                  <dd
                    className={`text-xs font-medium ${
                      metrics.priceImpactPercentage !== null && metrics.priceImpactPercentage < 0
                        ? 'text-red-300'
                        : 'text-white'
                    }`}
                  >
                    {priceImpactDisplay}
                  </dd>
                </div>
              )}
            </dl>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Essential Info - Always Visible When Collapsed */}
      {!isExpanded && (
        <div className="mt-2 px-3">
          <p className="text-xs text-gray-500">
            {isLoadingQuote ? 'Updating quote details…' : collapsedSummaryParts.join(' • ')}
          </p>
        </div>
      )}
    </section>
  );
}

function buildGasCostNativeSummary(metrics: QuoteMetrics): string | null {
  if (!metrics.gasCostBreakdown.length) {
    return null;
  }

  const parts = metrics.gasCostBreakdown
    .map((entry) => {
      if (!entry.amount) {
        return null;
      }

      return `${formatTokenAmount(entry.amount, { maxDecimals: 5 })} ${entry.tokenSymbol}`;
    })
    .filter(Boolean) as string[];

  if (!parts.length) {
    return null;
  }

  return parts.join(' + ');
}

function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return '—';
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);

  if (minutes > 0) {
    return `${minutes}m${seconds > 0 ? ` ${seconds}s` : ''}`;
  }

  return `${seconds}s`;
}
