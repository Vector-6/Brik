"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, Zap, Gift } from "lucide-react";
import Link from "next/link";
import {
  fetchRewardsOverview,
  fetchCashbackProgress,
  fetchMysteryBoxInfo,
} from "@/lib/api/endpoints/rewards";

/**
 * Persistent Progress Widget
 *
 * Requirement: "Users must ALWAYS see:
 * - current progress
 * - next unlock
 * - time/actions remaining to reward"
 *
 * This widget appears on ALL pages (sticky) to maintain engagement
 */
export default function PersistentProgressWidget() {
  const { address, isConnected } = useAccount();
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch rewards data
  const { data: overview } = useQuery({
    queryKey: ["rewards-overview", address],
    queryFn: () => fetchRewardsOverview(address!),
    enabled: !!address && isConnected,
    refetchInterval: 30000, // Refresh every 30s
  });

  const { data: cashbackProgress } = useQuery({
    queryKey: ["cashback-progress", address],
    queryFn: () => fetchCashbackProgress(address!),
    enabled: !!address && isConnected,
    refetchInterval: 30000,
  });

  const { data: mysteryBoxInfo } = useQuery({
    queryKey: ["mystery-box-info", address],
    queryFn: () => fetchMysteryBoxInfo(address!),
    enabled: !!address && isConnected,
    refetchInterval: 60000, // Refresh every minute
  });

  // Don't show if wallet not connected
  if (!isConnected || !address) {
    return null;
  }

  const totalPoints = overview?.totalPoints || 0;
  const swapsCompleted = cashbackProgress?.swapsCompleted || 0;
  const swapsRemaining = cashbackProgress?.swapsRemaining || 3;
  const canOpenMysteryBox = overview?.canOpenMysteryBox || false;
  const cashbackProgressPercent = Math.min((swapsCompleted / 3) * 100, 100);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="pointer-events-auto">
          {/* Collapsed View */}
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-gradient-to-r from-purple-900/95 via-purple-800/95 to-pink-900/95 backdrop-blur-xl border-2 border-purple-500/50 rounded-t-2xl shadow-[0_-8px_32px_rgba(97,7,224,0.5)] cursor-pointer"
                onClick={() => setIsExpanded(true)}
              >
                <div className="px-4 md:px-6 py-3">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Points */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-burbank text-white">
                        {totalPoints.toLocaleString()} PTS
                      </span>
                    </div>

                    {/* Center: Cashback Progress with Required UX Copy */}
                    <div className="flex-1 hidden md:block">
                      <div className="flex items-center justify-center gap-3">
                        <Zap className="w-4 h-4 text-pink-400" />
                        <div className="flex-1 max-w-md">
                          {swapsRemaining > 0 ? (
                            <>
                              {/* Required UX Copy */}
                              <p className="text-xs text-purple-200 font-inter mb-1 text-center">
                                {swapsCompleted} / 3 swaps completed — cashback loading...
                              </p>
                              <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${cashbackProgressPercent}%` }}
                                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                                />
                              </div>
                            </>
                          ) : (
                            <p className="text-xs text-green-400 font-inter text-center">
                              ✓ Cashback ready to claim!
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Expand Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-inter"
                    >
                      <span className="hidden sm:inline">View Progress</span>
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mobile Progress Bar */}
                  <div className="md:hidden mt-2">
                    {swapsRemaining > 0 ? (
                      <>
                        <p className="text-xs text-purple-200 font-inter mb-1">
                          {swapsCompleted} / 3 swaps completed — cashback loading...
                        </p>
                        <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${cashbackProgressPercent}%` }}
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-green-400 font-inter text-center">
                        ✓ Cashback ready to claim!
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Expanded View */
              <motion.div
                key="expanded"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-gradient-to-br from-purple-900/98 via-purple-800/98 to-pink-900/98 backdrop-blur-xl border-2 border-purple-500/50 rounded-t-3xl shadow-[0_-8px_48px_rgba(97,7,224,0.6)]"
              >
                <div className="px-4 md:px-6 py-4">
                  {/* Header with Close */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-burbank text-lg text-white">
                      Your Progress
                    </h3>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                      aria-label="Collapse progress widget"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    {/* Brik Points */}
                    <div className="bg-black/30 rounded-xl p-4 border border-purple-400/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-gray-300 font-inter uppercase">
                          Points
                        </span>
                      </div>
                      <p className="text-2xl font-burbank font-bold text-white">
                        {totalPoints.toLocaleString()}
                      </p>
                    </div>

                    {/* Cashback Progress */}
                    <div className="bg-black/30 rounded-xl p-4 border border-pink-400/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-pink-400" />
                        <span className="text-xs text-gray-300 font-inter uppercase">
                          Next Cashback
                        </span>
                      </div>
                      <p className="text-2xl font-burbank font-bold text-white">
                        {swapsRemaining > 0
                          ? `${swapsRemaining} swap${swapsRemaining !== 1 ? 's' : ''}`
                          : 'Ready!'}
                      </p>
                      {swapsRemaining > 0 && (
                        <p className="text-xs text-gray-400 font-inter mt-1">
                          {swapsCompleted}/3 completed
                        </p>
                      )}
                    </div>

                    {/* Mystery Box */}
                    <div className="bg-black/30 rounded-xl p-4 border border-purple-400/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-gray-300 font-inter uppercase">
                          Mystery Box
                        </span>
                      </div>
                      <p className="text-lg font-burbank font-bold text-white">
                        {canOpenMysteryBox ? (
                          <span className="text-green-400">Available!</span>
                        ) : (
                          <span className="text-gray-400">Locked</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Cashback Progress Bar with Required Copy */}
                  {swapsRemaining > 0 && (
                    <div className="bg-black/30 rounded-xl p-4 border border-purple-400/20 mb-4">
                      <p className="text-sm text-purple-200 font-inter mb-2 text-center">
                        {swapsCompleted} / 3 swaps completed — cashback loading...
                      </p>
                      <div className="w-full h-3 bg-gray-800/70 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cashbackProgressPercent}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.7)]"
                        />
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Link href="/rewards">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-inter font-semibold shadow-lg hover:shadow-xl transition-all"
                      onClick={() => setIsExpanded(false)}
                    >
                      View Full Rewards Dashboard
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
