'use client';

/**
 * QuoteDetailsPresenter
 * Displays quote details in a clean, professional card
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';

import { getChainName } from '@/lib/constants/chains';
import {
  formatPercentage,
  formatTokenAmount,
  formatUSDValue,
} from '@/lib/utils/numberFormatting';
import type { RouteExtended } from '@/lib/types/lifi.types';
import type { Token } from '@/lib/types/token.types';
import { buildQuoteMetrics } from '../utils/quoteMetrics';
import type { QuoteMetrics, StepSummary } from '../utils/quoteMetrics';

// ============================================================================
// Props Interface
// ============================================================================

export interface QuoteDetailsPresenterProps {
  quote: RouteExtended;
  toToken: Token;
  isLoadingQuote?: boolean;
}

interface SummaryItem {
  label: string;
  value: string;
  helper?: string;
  tone?: 'positive' | 'negative' | 'warning';
}

// ============================================================================
// Component
// ============================================================================

export default function QuoteDetailsPresenter({
  quote,
  toToken,
  isLoadingQuote = false,
}: QuoteDetailsPresenterProps) {
  const metrics: QuoteMetrics = useMemo(() => buildQuoteMetrics(quote, toToken), [quote, toToken]);

  const summaryItems = buildSummaryItems(metrics, toToken.symbol);
  const gasBreakdown = buildGasBreakdown(metrics);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="h-full"
    >
      <aside
        className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 shadow-xl"
        aria-labelledby="quote-details-heading"
        aria-busy={isLoadingQuote}
      >
        {/* Header */}
        <header className="mb-6 pb-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between gap-4">
            <h2 id="quote-details-heading" className="text-xl font-bold text-white">
              Quote Details
            </h2>
            {isLoadingQuote && (
              <span className="text-xs text-gray-400 animate-pulse" aria-live="polite">
                Refreshing…
              </span>
            )}
          </div>
        </header>

        <div className="space-y-8">
          {/* Summary Grid */}
          <section aria-labelledby="quote-summary-heading">
            <h3 id="quote-summary-heading" className="sr-only">
              Quote summary
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="bg-gray-900/40 border border-gray-800/60 rounded-xl px-4 py-3"
                >
                  <dt className="text-xs uppercase nothingclasswide text-gray-400 mb-1">
                    {item.label}
                  </dt>
                  <dd
                    className={`text-base font-semibold ${getToneClass(item.tone)} text-white`}
                  >
                    {item.value}
                  </dd>
                  {item.helper && (
                    <p className="text-xs text-gray-500 mt-1">{item.helper}</p>
                  )}
                </div>
              ))}
            </dl>
          </section>

          {/* Route Overview */}
          <section aria-labelledby="route-overview-heading" className="space-y-4">
            <div>
              <h3 id="route-overview-heading" className="text-sm font-semibold text-white mb-2">
                Execution Path
              </h3>
              <p className="text-xs text-gray-400">
                Optimised via LI.FI aggregator. Steps are executed sequentially.
              </p>
            </div>

            <ol className="space-y-3">
              {metrics.steps.map((step, index) => (
                <StepItem key={step.id} step={step} position={index + 1} />
              ))}
            </ol>
          </section>

          {/* Gas Breakdown */}
          {gasBreakdown.length > 0 && (
            <section aria-labelledby="gas-breakdown-heading" className="space-y-3">
              <div>
                <h3 id="gas-breakdown-heading" className="text-sm font-semibold text-white">
                  Network Fees
                </h3>
                <p className="text-xs text-gray-500">
                  Includes approval and swap transactions across every chain in the route.
                </p>
              </div>

              <div className="space-y-2">
                {gasBreakdown.map((entry) => (
                  <div
                    key={`${entry.chain ?? 'unknown'}-${entry.symbol}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-400">
                      {entry.chain ?? 'Unknown chain'}
                    </span>
                    <span className="text-white font-medium">
                      {entry.nativeDisplay}
                      {entry.usdDisplay ? ` (${entry.usdDisplay})` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tools Used */}
          {metrics.tools.length > 0 && (
            <section aria-labelledby="tools-used-heading" className="space-y-2">
              <h3 id="tools-used-heading" className="text-sm font-semibold text-white">
                Liquidity Sources
              </h3>
              <div className="flex flex-wrap gap-2">
                {metrics.tools.map((tool) => (
                  <span
                    key={tool}
                    className="text-xs font-medium text-purple-200 bg-purple-500/10 border border-purple-500/30 rounded-full px-3 py-1"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer Note */}
        <footer className="mt-8 pt-6 border-t border-gray-700/50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500" aria-hidden="true"></div>
            <span>Rates update every 30 seconds</span>
          </div>
        </footer>
      </aside>
    </motion.div>
  );
}

function buildSummaryItems(metrics: QuoteMetrics, toSymbol: string): SummaryItem[] {
  const minReceivedHelper = metrics.minReceivedUSD !== null ? formatUSDValue(metrics.minReceivedUSD) : undefined;

  const gasNative = buildGasNativeSummary(metrics);
  const gasHelper = metrics.gasCostTotalUSD !== null ? formatUSDValue(metrics.gasCostTotalUSD) : undefined;

  const estimatedTime = metrics.estimatedDurationSeconds
    ? detailedDuration(metrics.estimatedDurationSeconds)
    : '—';

  const slippageValue =
    metrics.slippagePercentage !== null ? formatPercentage(metrics.slippagePercentage) : '—';

  const priceImpactValue =
    metrics.priceImpactPercentage !== null ? formatPercentage(metrics.priceImpactPercentage) : '—';

  const priceImpactTone = derivePriceImpactTone(metrics.priceImpactPercentage);

  return [
    {
      label: 'Minimum received',
      value: metrics.minReceivedAmount
        ? `${formatTokenAmount(metrics.minReceivedAmount)} ${toSymbol}`
        : '—',
      helper: minReceivedHelper,
    },
    {
      label: 'Network fee',
      value: gasNative ?? '—',
      helper: gasHelper,
    },
    {
      label: 'Estimated time',
      value: estimatedTime,
    },
    {
      label: 'Max slippage',
      value: slippageValue,
    },
    {
      label: 'Price impact',
      value: priceImpactValue,
      tone: priceImpactTone,
    },
  ];
}

function buildGasNativeSummary(metrics: QuoteMetrics): string | null {
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

function buildGasBreakdown(metrics: QuoteMetrics): {
  chain: string | null;
  symbol: string;
  nativeDisplay: string;
  usdDisplay: string | null;
}[] {
  if (!metrics.gasCostBreakdown.length) {
    if (metrics.gasCostTotalUSD !== null) {
      return [
        {
          chain: null,
          symbol: 'USD',
          nativeDisplay: formatUSDValue(metrics.gasCostTotalUSD),
          usdDisplay: null,
        },
      ];
    }
    return [];
  }

  return metrics.gasCostBreakdown.map((entry) => {
    const chainName = entry.chainId !== null ? getChainName(entry.chainId) : null;
    const nativeDisplay = entry.amount
      ? `${formatTokenAmount(entry.amount, { maxDecimals: 5 })} ${entry.tokenSymbol}`
      : entry.tokenSymbol;

    const usdDisplay = entry.amountUSD !== null ? formatUSDValue(entry.amountUSD) : null;

    return {
      chain: chainName,
      symbol: entry.tokenSymbol,
      nativeDisplay,
      usdDisplay,
    };
  });
}

function StepItem({ step, position }: { step: StepSummary; position: number }) {
  const chainLabel = buildStepChainLabel(step);
  const duration =
    typeof step.executionDurationSeconds === 'number'
      ? detailedDuration(step.executionDurationSeconds)
      : null;

  return (
    <li className="bg-gray-900/40 border border-gray-800/60 rounded-xl px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10 text-purple-200 text-sm font-semibold">
            {position}
          </span>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            {step.toolLogoURI && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={step.toolLogoURI} alt="" className="h-4 w-4 rounded-full" aria-hidden="true" />
            )}
            <span className="text-sm font-semibold text-white">
              {step.typeLabel} via {step.toolName}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {step.fromTokenSymbol} → {step.toTokenSymbol}
            {chainLabel ? ` • ${chainLabel}` : ''}
            {duration ? ` • ~${duration}` : ''}
          </p>
        </div>
      </div>
    </li>
  );
}

function buildStepChainLabel(step: StepSummary): string {
  if (step.fromChainId === step.toChainId) {
    return getChainName(step.fromChainId);
  }

  const fromName = getChainName(step.fromChainId);
  const toName = getChainName(step.toChainId);
  return `${fromName} → ${toName}`;
}

function detailedDuration(totalSeconds: number): string {
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

function derivePriceImpactTone(value: number | null): SummaryItem['tone'] {
  if (value === null) {
    return undefined;
  }

  if (value < 0) {
    return 'negative';
  }

  if (value > 5) {
    return 'warning';
  }

  return undefined;
}

function getToneClass(tone: SummaryItem['tone']): string {
  switch (tone) {
    case 'negative':
      return 'text-red-300';
    case 'warning':
      return 'text-yellow-300';
    case 'positive':
      return 'text-emerald-300';
    default:
      return '';
  }
}
