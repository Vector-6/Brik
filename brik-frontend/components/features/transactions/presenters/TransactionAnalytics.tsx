'use client';

/**
 * TransactionAnalytics Component
 * Displays analytics and insights about transaction data
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Repeat, DollarSign } from 'lucide-react';
import { useMemo } from 'react';
import { ParsedTransaction } from '@/lib/api/types/transaction.types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { GradientText } from '@/components/ui/common';
import { Z_INDEX } from '@/lib/constants/zIndex';

// ============================================================================
// Types
// ============================================================================

export interface TransactionAnalyticsProps {
  /** Transactions to analyze */
  transactions: ParsedTransaction[];
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
}

// ============================================================================
// Colors
// ============================================================================

const COLORS = ['#7B61FF', '#FFD700', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// ============================================================================
// Component
// ============================================================================

export default function TransactionAnalytics({
  transactions,
  isOpen,
  onClose,
}: TransactionAnalyticsProps) {
  // ============================================================================
  // Analytics Calculations
  // ============================================================================

  const analytics = useMemo(() => {
    if (transactions.length === 0) {
      return {
        totalVolume: 0,
        averageSize: 0,
        totalTransactions: 0,
        tokenPairs: [],
        volumeByDay: [],
        chainDistribution: [],
      };
    }

    // Total volume
    const totalVolume = transactions.reduce((sum, tx) => sum + tx.usdValue, 0);

    // Average transaction size
    const averageSize = totalVolume / transactions.length;

    // Popular token pairs
    const pairCounts: Record<string, number> = {};
    transactions.forEach((tx) => {
      const pair = `${tx.fromToken}/${tx.toToken}`;
      pairCounts[pair] = (pairCounts[pair] || 0) + 1;
    });

    const tokenPairs = Object.entries(pairCounts)
      .map(([pair, count]) => ({ pair, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Volume by day (last 7 days)
    const volumeByDay: Record<string, number> = {};
    transactions.forEach((tx) => {
      const date = new Date(tx.timestamp);
      const dateKey = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      volumeByDay[dateKey] = (volumeByDay[dateKey] || 0) + tx.usdValue;
    });

    const volumeByDayArray = Object.entries(volumeByDay)
      .map(([date, volume]) => ({ date, volume }))
      .slice(-7);

    // Chain distribution
    const chainCounts: Record<string, number> = {};
    transactions.forEach((tx) => {
      chainCounts[tx.fromChainName] = (chainCounts[tx.fromChainName] || 0) + 1;
    });

    const chainDistribution = Object.entries(chainCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalVolume,
      averageSize,
      totalTransactions: transactions.length,
      tokenPairs,
      volumeByDay: volumeByDayArray,
      chainDistribution,
    };
  }, [transactions]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`fixed inset-0 bg-black/80 backdrop-blur-sm ${Z_INDEX.MODAL_BACKDROP}`}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed inset-0 flex items-center justify-center p-4 pointer-events-none ${Z_INDEX.MODAL_CONTENT}`}
          >
            <div
              className="bg-gray-900 border border-purple-500/20 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    <GradientText preset="purple" animate="flow">Transaction Analytics</GradientText>
                  </h2>
                  <p className="text-sm text-gray-400">
                    Insights from {analytics.totalTransactions} transactions
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Volume */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <DollarSign className="w-5 h-5 text-purple-400" />
                      </div>
                      <p className="text-sm text-gray-400">Total Volume</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      ${analytics.totalVolume.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Average Size */}
                  <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-yellow-400" />
                      </div>
                      <p className="text-sm text-gray-400">Average Size</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      ${analytics.averageSize.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Total Transactions */}
                  <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Repeat className="w-5 h-5 text-green-400" />
                      </div>
                      <p className="text-sm text-gray-400">Transactions</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {analytics.totalTransactions.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Volume Chart */}
                {analytics.volumeByDay.length > 0 && (
                  <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Volume by Day
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.volumeByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="date"
                          stroke="#9CA3AF"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis
                          stroke="#9CA3AF"
                          style={{ fontSize: '12px' }}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number | undefined) => [
                            `$${(value ?? 0).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`,
                            'Volume',
                          ]}
                        />
                        <Bar dataKey="volume" fill="#7B61FF" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Popular Token Pairs & Chain Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Popular Token Pairs */}
                  <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Popular Token Pairs
                    </h3>
                    <div className="space-y-3">
                      {analytics.tokenPairs.map((pair, index) => (
                        <div
                          key={pair.pair}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm text-gray-300">{pair.pair}</span>
                          </div>
                          <span className="text-sm font-semibold text-white">
                            {pair.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chain Distribution */}
                  <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Chain Distribution
                    </h3>
                    <div className="space-y-2">
                      {analytics.chainDistribution.map((chain, index) => {
                        const percentage = (
                          (chain.value / analytics.totalTransactions) *
                          100
                        ).toFixed(1);
                        return (
                          <div
                            key={chain.name}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-sm text-gray-300">{chain.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-white">
                              {chain.value} ({percentage}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 p-6">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
