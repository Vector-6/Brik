/**
 * Asset Detail Chart Component
 * Full-featured chart for asset detail pages
 */

'use client';

import { TokenChart } from '@/components/features/chart';
import { ChartTimeframe } from '@/lib/types/chart.types';

// ============================================================================
// Types
// ============================================================================

interface AssetDetailChartProps {
  symbol: string;
  tokenName?: string;
  className?: string;
  defaultTimeframe?: ChartTimeframe;
}

// ============================================================================
// Component
// ============================================================================

export default function AssetDetailChart({
  symbol,
  tokenName,
  className = '',
  defaultTimeframe = '30D',
}: AssetDetailChartProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Chart Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Price Chart</h2>
          <p className="text-gray-400">
            Historical price data for {tokenName || symbol.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Chart */}
      <TokenChart
        symbol={symbol}
        height={500}
        defaultTimeframe={defaultTimeframe}
        showTimeframes={true}
        showChartTypes={true}
        className="w-full"
      />
    </div>
  );
}
