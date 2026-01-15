/**
 * Portfolio Chart Component
 * Chart specifically designed for portfolio token displays
 */

'use client';

import { TokenChart } from '@/components/features/chart';
import { ChartTimeframe } from '@/lib/types/chart.types';

// ============================================================================
// Types
// ============================================================================

interface PortfolioTokenChartProps {
  symbol: string;
  tokenName?: string;
  className?: string;
  defaultTimeframe?: ChartTimeframe;
}

// ============================================================================
// Component
// ============================================================================

export default function PortfolioTokenChart({
  symbol,
  tokenName,
  className = '',
  defaultTimeframe = '30D',
}: PortfolioTokenChartProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Chart Header */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-xl font-semibold text-white">
          {tokenName || symbol.toUpperCase()} Price Chart
        </h3>
      </div>

      {/* Chart */}
      <TokenChart
        symbol={symbol}
        height={300}
        defaultTimeframe={defaultTimeframe}
        showTimeframes={true}
        showChartTypes={false}
        className="w-full"
      />
    </div>
  );
}
