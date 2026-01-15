"use client";

import { motion } from "framer-motion";
import { Share2, Edit3 } from "lucide-react";
import { RewardsOverview, CashbackProgress, ReferralStats } from "@/lib/api/endpoints/rewards";

interface RewardsTopSectionProps {
  overview?: RewardsOverview;
  cashbackProgress?: CashbackProgress;
  referralStats?: ReferralStats | null;
}

export default function RewardsTopSection({
  overview,
  cashbackProgress,
  referralStats,
}: RewardsTopSectionProps) {
  const totalPoints = overview?.totalPoints || 0;
  const pointsEarned = 0.011; // This would come from recent activity
  const progressPercentage = Math.min((totalPoints / 2500) * 100, 100); // Next level at 2.5K points

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[rgba(15,15,20,0.85)] backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(97,7,224,0.3)]"
    >
      {/* Top Row: Points, Earned, and Buttons */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-2">
        {/* Left: Points and Earned Display */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Points Section */}
          <div className="flex items-center gap-3">
            <img src="/images/mask-group-8.png" alt="B Logo" className="w-10 h-10 object-contain" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-burbank font-bold text-white">
                {totalPoints.toLocaleString()}
              </span>
              <span className="text-lg text-white font-burbank">Points</span>
            </div>
          </div>

          {/* Earned Section */}
          <div className="flex items-center gap-3">
            <img src="/images/jfs-2.png" alt="earned log" className="w-6 h-6 object-contain font-burbank" />
            <div className="flex items-baseline gap-1">
              <span className="text-lg md:text-xl font-burbank font-bold text-white">
                {pointsEarned}
              </span>
              <span className="text-sm text-white font-burbank">Earned</span>
            </div>
          </div>
        </div>

        {/* Right: Referral Buttons */}
        <div className="flex gap-3 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-pink-200 text-black hover:bg-pink-300 transition-all flex items-center gap-2 font-inter text-sm whitespace-nowrap"
          >
            Edit Referrals
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 transition-all flex items-center gap-2 text-sm font-inter shadow-md whitespace-nowrap"
          >
            Share Referrals
          </motion.button>
        </div>
      </div>

      {/* Middle Row: Level Information */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
        <p className="text-sm text-gray-400">
          Next Level : 2.5KPs Rewards rate for Points
        </p>
        {cashbackProgress && cashbackProgress.swapsRemaining > 0 ? (
          <p className="text-sm text-gray-400 text-left sm:text-right">
            You're almost there! Trade {cashbackProgress.swapsRemaining} more swap{cashbackProgress.swapsRemaining !== 1 ? 's' : ''} to reach Silver.
          </p>
        ) : (
          <p className="text-sm text-gray-400 text-left sm:text-right">
            You're almost there! Trade 8,656.56 SOL to reach Silver
          </p>
        )}
      </div>

      {/* Bottom: Progress Bar */}
      <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-[#7C0ADC] via-[#A855F7] to-[#F00CE6] rounded-full shadow-[0_0_20px_rgba(168,85,247,0.6)]"
        />
      </div>
    </motion.div>
  );
}
