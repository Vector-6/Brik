/**
 * Compact Token Chart
 * Small chart component for use in cards and previews
 */

'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useTokenChart } from './hooks/useTokenChart';
import { ChartTimeframe } from '@/lib/types/chart.types';
import { TrendingUp, TrendingDown, BarChart3, Loader2 } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface CompactTokenChartProps {
  symbol: string;
  timeframe?: ChartTimeframe;
  height?: number;
  showTrend?: boolean;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export default function CompactTokenChart({
  symbol,
  timeframe = '7D',
  height = 80,
  showTrend = true,
  className = '',
}: CompactTokenChartProps) {
  const { data, isLoading, error } = useTokenChart(symbol, {
    timeframe,
    enabled: !!symbol,
  });

  // Calculate trend
  const isPositive = data && data.length > 1 
    ? data[data.length - 1].price > data[0].price 
    : true;

  const chartColor = isPositive ? '#10b981' : '#ef4444';

  // ============================================================================
  // Render States
  // ============================================================================

  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-800/20 rounded-lg ${className}`}
        style={{ height }}
      >
        <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-800/20 rounded-lg ${className}`}
        style={{ height }}
      >
        <BarChart3 className="w-4 h-4 text-gray-500" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
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

      {/* Trend Indicator */}
      {showTrend && (
        <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          isPositive 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
        </div>
      )}
    </div>
  );
}
