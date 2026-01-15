/**
 * Token Price Chart Component
 * Responsive chart component for displaying token price history
 * Uses Recharts for lightweight, responsive charting
 */

'use client';

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign, BarChart3, Activity } from 'lucide-react';
import { useTokenChart } from './hooks/useTokenChart';
import { ChartTimeframe, ChartType, ChartData } from '@/lib/types/chart.types';

// ============================================================================
// Types
// ============================================================================

interface TokenChartProps {
  symbol: string;
  className?: string;
  height?: number;
  showTimeframes?: boolean;
  showChartTypes?: boolean;
  defaultTimeframe?: ChartTimeframe;
  defaultType?: ChartType;
}

// ============================================================================
// Constants
// ============================================================================

const TIMEFRAMES: Array<{ key: ChartTimeframe; label: string; shortLabel: string }> = [
  { key: '1D', label: '1 Day', shortLabel: '1D' },
  { key: '7D', label: '7 Days', shortLabel: '7D' },
  { key: '30D', label: '30 Days', shortLabel: '30D' },
  { key: '90D', label: '90 Days', shortLabel: '90D' },
  { key: '180D', label: '180 Days', shortLabel: '180D' },
  { key: '1Y', label: '1 Year', shortLabel: '1Y' },
  
];

const CHART_TYPES: Array<{ key: ChartType; label: string; icon: any }> = [
  { key: 'price', label: 'Price', icon: DollarSign },
  { key: 'marketCap', label: 'Market Cap', icon: BarChart3 },
  { key: 'volume', label: 'Volume', icon: Activity },
];

// ============================================================================
// Helper Functions
// ============================================================================

function formatPrice(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(value < 1 ? 6 : 2)}`;
}

function formatTooltipValue(value: number, type: ChartType): string {
  switch (type) {
    case 'price':
      return formatPrice(value);
    case 'marketCap':
      return formatPrice(value);
    case 'volume':
      return formatPrice(value);
    default:
      return value.toString();
  }
}

function getChartColor(data: ChartData[], type: ChartType): string {
  if (!data.length) return '#6366f1';
  
  const firstValue = getValueFromData(data[0], type);
  const lastValue = getValueFromData(data[data.length - 1], type);
  
  if (lastValue > firstValue) return '#10b981'; // Green for positive
  return '#ef4444'; // Red for negative
}

function getValueFromData(data: ChartData, type: ChartType): number {
  switch (type) {
    case 'price':
      return data.price;
    case 'marketCap':
      return data.marketCap || 0;
    case 'volume':
      return data.volume || 0;
    default:
      return data.price;
  }
}

function calculateChange(data: ChartData[], type: ChartType): { value: number; percentage: number; isPositive: boolean } {
  if (data.length < 2) return { value: 0, percentage: 0, isPositive: true };
  
  const firstValue = getValueFromData(data[0], type);
  const lastValue = getValueFromData(data[data.length - 1], type);
  
  const value = lastValue - firstValue;
  const percentage = firstValue !== 0 ? (value / firstValue) * 100 : 0;
  
  return {
    value,
    percentage,
    isPositive: value >= 0,
  };
}

// ============================================================================
// Custom Tooltip Component
// ============================================================================

function CustomTooltip({ active, payload, label, chartType }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const value = getValueFromData(data, chartType);

  return (
    <div className="glass border border-white/20 rounded-lg p-3 shadow-xl">
      <p className="text-sm text-gray-300 mb-1">
        {new Date(data.timestamp).toLocaleDateString()} {new Date(data.timestamp).toLocaleTimeString()}
      </p>
      <p className="text-lg font-semibold text-white">
        {formatTooltipValue(value, chartType)}
      </p>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function TokenChart({
  symbol,
  className = '',
  height = 400,
  showTimeframes = true,
  showChartTypes = true,
  defaultTimeframe = '30D',
  defaultType = 'price',
}: TokenChartProps) {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>(defaultTimeframe);
  const [chartType, setChartType] = useState<ChartType>(defaultType);

  // Fetch chart data
  const { data, isLoading, error } = useTokenChart(symbol, {
    timeframe,
    enabled: !!symbol,
  });

  // Memoize chart data and calculations
  const { chartData, chartColor, change } = useMemo(() => {
    if (!data) return { chartData: [], chartColor: '#6366f1', change: { value: 0, percentage: 0, isPositive: true } };

    return {
      chartData: data,
      chartColor: getChartColor(data, chartType),
      change: calculateChange(data, chartType),
    };
  }, [data, chartType]);

  // ============================================================================
  // Render States
  // ============================================================================

  if (error) {
    return (
      <div className={`glass rounded-xl p-6 ${className}`} style={{ height }}>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="p-3 rounded-full bg-red-500/20 mb-4">
            <TrendingDown className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Chart Unavailable</h3>
          <p className="text-sm text-gray-400">
            {error.message || 'Unable to load chart data for this token.'}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className={`glass rounded-xl p-6 ${className}`} style={{ height }}>
        <div className="animate-pulse h-full flex flex-col">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 bg-gray-700/50 rounded w-1/3"></div>
            <div className="flex gap-2">
              {showTimeframes && (
                <div className="flex gap-1">
                  {TIMEFRAMES.slice(0, 4).map((_, i) => (
                    <div key={i} className="h-8 w-12 bg-gray-700/50 rounded"></div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Chart skeleton */}
          <div className="flex-1 bg-gradient-to-br from-gray-700/20 to-gray-600/20 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass rounded-xl p-4 sm:p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        {/* Chart Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-white">
              {symbol.toUpperCase()} {CHART_TYPES.find(t => t.key === chartType)?.label}
            </h3>
          </div>
          
          {/* Price Change Indicator */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            change.isPositive 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {change.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(change.percentage).toFixed(2)}%
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Chart Type Selector */}
          {showChartTypes && (
            <div className="flex bg-gray-800/50 rounded-lg p-1">
              {CHART_TYPES.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setChartType(key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    chartType === key
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Timeframe Selector */}
          {showTimeframes && (
            <div className="flex bg-gray-800/50 rounded-lg p-1 overflow-x-auto">
              {TIMEFRAMES.map(({ key, label, shortLabel }) => (
                <button
                  key={key}
                  onClick={() => setTimeframe(key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    timeframe === key
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                  title={label}
                >
                  {shortLabel}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: height - 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="timestamp"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                if (timeframe === '1D') {
                  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
              }}
              minTickGap={50}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => formatPrice(value)}
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip 
              content={<CustomTooltip chartType={chartType} />}
              cursor={{ stroke: chartColor, strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Line
              type="monotone"
              dataKey={(data) => getValueFromData(data, chartType)}
              stroke={chartColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: chartColor, strokeWidth: 2, fill: '#1f2937' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
