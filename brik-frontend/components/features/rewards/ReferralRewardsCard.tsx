"use client";

import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { ReferralStats } from "@/lib/api/endpoints/rewards";
import { createReferralCode } from "@/lib/api/endpoints/rewards";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from "react";

interface ReferralRewardsCardProps {
  referralStats?: ReferralStats | null;
  walletAddress: string;
}

export default function ReferralRewardsCard({
  referralStats,
  walletAddress,
}: ReferralRewardsCardProps) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const createCodeMutation = useMutation({
    mutationFn: () => createReferralCode(walletAddress),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["referral-stats", walletAddress] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create referral code");
    },
    onSettled: () => {
      setIsCreating(false);
    },
  });

  const handleCreateCode = () => {
    setIsCreating(true);
    createCodeMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-[rgba(15,15,20,0.85)] backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-[0_8px_32px_rgba(97,7,224,0.3)]"
    >
      <h3 className="text-[40px] font-burbank text-white mb-4">
        Referral Rewards
      </h3>
      <div className="space-y-4">
        <p className="flex items-center gap-2 text-sm text-gray-300 font-Inter font-medium">
          <img src="/images/point.png" alt="Referral" className="w-2 h-2" />
          Earn 5% fees from your friends you refer.
        </p>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Active Referrals</span>
          <span className="text-white font-Inter">
            {referralStats?.activeReferees || 0}
          </span>
        </div>
        {referralStats && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Total Earnings</span>
            <span className="text-white font-burbank font-bold">
              ${referralStats.totalEarningsUsd.toFixed(2)}
            </span>
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateCode}
          disabled={isCreating || !!referralStats}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-burbank font-bold flex items-center justify-center gap-2 shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus className="w-5 h-5" />
          {isCreating
            ? "Creating..."
            : referralStats
              ? `Code: ${referralStats.code}`
              : "Invite Friends"}
        </motion.button>
      </div>
    </motion.div>
  );
}
