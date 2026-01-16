"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Gift, Clock } from "lucide-react";
import { RewardsOverview, CashbackProgress, MysteryBoxInfo } from "@/lib/api/endpoints/rewards";

interface RewardsOverviewPanelProps {
  overview?: RewardsOverview;
  cashbackProgress?: CashbackProgress;
  mysteryBoxInfo?: MysteryBoxInfo;
}

/**
 * Rewards Overview Landing Panel
 *
 * Requirement: "Above the fold" default landing with:
 * - Headline: "Your Access Score"
 * - Brik Points balance (large, prominent)
 * - Cashback progress bar (X/3 swaps)
 * - Claimable USDC
 * - Mystery box countdown timer
 *
 * This screen must answer: "Why should I do one more swap?"
 */
export default function RewardsOverviewPanel({
  overview,
  cashbackProgress,
  mysteryBoxInfo,
}: RewardsOverviewPanelProps) {
  const totalPoints = overview?.totalPoints || 0;
  const swapsCompleted = cashbackProgress?.swapsCompleted || 0;
  const swapsRemaining = cashbackProgress?.swapsRemaining || 3;
  const totalSwaps = overview?.totalSwaps || 0;
  const claimableUSDC = (overview?.claimableCashbackUsd || 0) + (overview?.claimableReferralEarningsUsd || 0);
  const canOpenMysteryBox = overview?.canOpenMysteryBox || false;
  const hoursUntilNextBox = mysteryBoxInfo?.hoursUntilNextBox || overview?.mysteryBoxCountdownHours || 0;

  // Calculate progress percentage for cashback (0-100%)
  const cashbackProgressPercent = Math.min((swapsCompleted / 3) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[rgba(15,15,20,0.95)] via-[rgba(97,7,224,0.15)] to-[rgba(15,15,20,0.95)] backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 md:p-10 shadow-[0_12px_48px_rgba(97,7,224,0.4)]"
    >
      {/* Header: "Your Access Score" */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-burbank text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2"
        >
          Your Access Score
        </motion.h1>
        <p className="text-gray-400 text-sm md:text-base">
          Track your progress and unlock rewards with every swap
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Left: Brik Points (Large & Prominent) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-2xl p-6 border border-purple-500/30 relative overflow-hidden"
        >
          {/* Background glow effect */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-400 text-sm font-inter uppercase tracking-wide">
                Brik Points
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="text-6xl md:text-7xl font-burbank font-bold text-white"
              >
                {totalPoints.toLocaleString()}
              </motion.span>
              <span className="text-2xl text-gray-400 font-burbank">PTS</span>
            </div>

            <p className="text-sm text-gray-400 font-inter">
              Earn points with every swap • Use for mystery boxes
            </p>
          </div>
        </motion.div>

        {/* Right: Claimable USDC */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-pink-900/30 to-pink-800/20 rounded-2xl p-6 border border-pink-500/30 relative overflow-hidden"
        >
          {/* Background glow effect */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-gray-400 text-sm font-inter uppercase tracking-wide">
                Claimable Rewards
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
                className="text-5xl md:text-6xl font-burbank font-bold text-white"
              >
                ${claimableUSDC.toFixed(2)}
              </motion.span>
              <span className="text-xl text-gray-400 font-burbank">USDC</span>
            </div>

            {claimableUSDC > 0 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-inter font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all"
              >
                Claim Now
              </motion.button>
            ) : (
              <p className="text-sm text-gray-400 font-inter mt-3">
                Complete swaps to earn cashback & referral rewards
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Cashback Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-[rgba(97,7,224,0.15)] to-[rgba(244,114,182,0.15)] rounded-2xl p-6 border border-purple-400/20 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-burbank text-xl text-white mb-1">
              Cashback Progress
            </h3>
            <p className="text-sm text-gray-400 font-inter">
              {swapsRemaining > 0
                ? `${swapsRemaining} swap${swapsRemaining !== 1 ? 's' : ''} until next cashback`
                : 'Cashback ready to claim!'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-burbank font-bold text-white">
              {swapsCompleted}/3
            </span>
            <p className="text-xs text-gray-400 font-inter">swaps</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-4 bg-gray-800/70 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${cashbackProgressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.7)]"
          />
        </div>

        {/* Required UX Copy */}
        {swapsRemaining > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-3 text-sm font-inter text-center text-purple-300"
          >
            {swapsCompleted} / 3 swaps completed — cashback loading...
          </motion.p>
        )}
      </motion.div>

      {/* Bottom Row: Mystery Box & Total Swaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Mystery Box Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-[rgba(97,7,224,0.1)] rounded-xl p-5 border border-purple-500/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-burbank text-white text-lg">Mystery Box</h4>
              <p className="text-xs text-gray-400 font-inter">
                {canOpenMysteryBox ? 'Ready to open!' : 'Come back tomorrow'}
              </p>
            </div>
          </div>

          {canOpenMysteryBox ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-inter font-semibold text-sm"
            >
              Open Mystery Box
            </motion.button>
          ) : hoursUntilNextBox > 0 && (
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-inter">
                {hoursUntilNextBox < 1
                  ? `${Math.ceil(hoursUntilNextBox * 60)} minutes`
                  : `${Math.floor(hoursUntilNextBox)} hours`}
              </span>
            </div>
          )}
        </motion.div>

        {/* Total Swaps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[rgba(244,114,182,0.1)] rounded-xl p-5 border border-pink-500/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h4 className="font-burbank text-white text-lg">Total Swaps</h4>
              <p className="text-xs text-gray-400 font-inter">
                Your platform activity
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-burbank font-bold text-white">
              {totalSwaps}
            </span>
            <span className="text-lg text-gray-400 font-burbank">swaps</span>
          </div>
        </motion.div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 text-center"
      >
        <p className="text-gray-400 font-inter text-sm mb-4">
          Why should I do one more swap?
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-xs font-inter">
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full">
            Earn More Points
          </span>
          <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full">
            Progress to Cashback
          </span>
          <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full">
            Build Your Streak
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
