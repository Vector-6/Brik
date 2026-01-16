"use client";

import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ClaimableRewards, RewardsOverview } from "@/lib/api/endpoints/rewards";
import { useState } from "react";
import ClaimRewardModal from "./ClaimRewardModal";

interface RewardsStatsCardsProps {
  claimable?: ClaimableRewards;
  overview?: RewardsOverview;
  walletAddress: string;
}

// Generate chart data based on user's actual claimable rewards
const generateChartData = (claimableUsd: number) => {
  const today = new Date();
  const data = [];

  // Generate 8 data points (last 8 days)
  for (let i = 7; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Simulate cumulative growth: rewards accumulate over time
    const progress = (7 - i) / 7;
    const value = claimableUsd * progress;

    data.push({ date: dateStr, value: Math.max(0, value) });
  }

  return data;
};

const QUESTS = [
  {
    reward: "+1500",
    label: "Refer 3 more people",
    progress: 3 / 6,
  },
  {
    reward: "+3000",
    label: "Trade 15 more SOL in Volume",
    progress: 10 / 15,
  },
  {
    reward: "+5000",
    label: "Make 25 more transactions",
    progress: 20 / 25,
  },
];

const SIZE = 130;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function RewardsStatsCards({
  claimable,
  overview,
  walletAddress,
}: RewardsStatsCardsProps) {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const claimableUsd = claimable?.totalUsd || 0;
  const claimablePoints = overview?.totalPoints || 0;

  // Generate chart data based on user's actual claimable rewards
  const chartData = generateChartData(claimableUsd);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* USDC Rewards Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[rgba(15,15,20,0.85)] backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-[0_8px_32px_rgba(97,7,224,0.3)]"
      >
        <h5 className="flex items-center gap-2 mb-4 text-lg font-burbank font-bold text-[#BD7BFF]">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-[#BD7BFF]">
            $
          </span>
          USDC Rewards
        </h5>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 'dataMax']}
                tickFormatter={(value) => value.toFixed(3)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15,15,20,0.95)",
                  border: "1px solid rgba(168,85,247,0.3)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Claim Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[rgba(15,15,20,0.85)] backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-[0_8px_32px_rgba(97,7,224,0.3)] flex flex-col justify-between"
      >
        <h3 className="flex items-center gap-2 text-lg font-burbank font-bold text-[#BD7BFF] mb-4">
          <img src="/images/claim.png" alt="Claim" className="w-8 h-8" />
          Claim
        </h3>
        <div className="flex justify-center mb-6">
          <div className="flex gap-4">
            {/* USDC pill */}
            <div className="flex items-center gap-3 px-7 py-3 rounded-full 
                    bg-[#120b1a] border border-purple-600/40">
              <img
                src="/images/jfs-3.png"
                alt="USDC"
                className="w-8 h-8"
              />
              <span className="text-white font-Inter">
                +{claimableUsd.toFixed(3)}
              </span>
            </div>

            {/* Points pill */}
            <div className="flex items-center gap-3 px-7 py-3 rounded-full 
                    bg-[#120b1a] border border-purple-600/40">
              <img
                src="/images/brik-vault-logo-1.png"
                alt="Points"
                className="w-6 h-6"
              />
              <span className="text-white font-Inter">
                +{claimablePoints.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsClaimModalOpen(true)}
          disabled={claimableUsd === 0}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-Inter font-bold text-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Claim All
        </motion.button>
      </motion.div>

      {/* Quests Card */}




      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="
        bg-[rgba(15,15,20,0.85)]
        backdrop-blur-xl
        border border-purple-500/20
        rounded-2xl
        p-6
        shadow-[0_8px_32px_rgba(97,7,224,0.3)]
      "
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="flex items-center gap-2 text-lg font-burbank font-bold text-[#BD7BFF]">
            <img src="/images/quests.png" alt="Quests" className="w-8 h-8" />
            Quests
          </h3>
          <span className="flex items-center gap-2 text-sm text-white hover:text-purple-300 cursor-pointer font-Inter">
            <img src="/images/jb-1.png" alt="Points" className="w-3 h-3" />
            Points Breakdown
          </span>
        </div>

        {/* Circles row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 md:gap-6 lg:gap-8">
          {QUESTS.map((q, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              {/* Circle */}
              <div className="relative z-10 w-[91px] h-[91px] sm:w-[110px] sm:h-[110px] md:w-[130px] md:h-[130px] flex-shrink-0">
                <svg
                  width="100%"
                  height="100%"
                  className="-rotate-90"
                  viewBox={`0 0 ${SIZE} ${SIZE}`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient id={`quest-gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7C0ADC" />
                      <stop offset="100%" stopColor="#F00CE6" />
                    </linearGradient>
                  </defs>
                  {/* Background ring */}
                  <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    stroke="rgba(168,85,247,0.2)"
                    strokeWidth={STROKE}
                    fill="none"
                  />

                  {/* Progress ring */}
                  <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    stroke={`url(#quest-gradient-${i})`}
                    strokeWidth={STROKE}
                    fill="none"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={CIRCUMFERENCE * (1 - q.progress)}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Reward text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm sm:text-base md:text-lg font-Inter font-bold text-white">
                    {q.reward}
                  </span>
                </div>
              </div>

              {/* Label */}
              <p className="mt-2 sm:mt-3 max-w-[120px] sm:max-w-[100px] md:max-w-[110px] text-xs sm:text-xs md:text-sm leading-tight text-gray-300 px-2 sm:px-0">
                {q.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Claim Reward Modal */}
      <ClaimRewardModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        walletAddress={walletAddress}
        rewardBreakdown={{
          cashbackUsd: claimable?.cashbackUsd || 0,
          referralUsd: claimable?.referralUsd || 0,
          mysteryBoxUsd: claimable?.mysteryBoxUsd || 0,
          mysteryBoxIds: claimable?.mysteryBoxIds || [],
          totalUsd: claimable?.totalUsd || 0,
        }}
      />
    </div>
  );
}
