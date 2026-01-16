"use client";

import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import {
  fetchRewardsOverview,
  fetchCashbackProgress,
  fetchClaimableRewards,
  fetchMysteryBoxInfo,
  fetchReferralStats,
} from "@/lib/api/endpoints/rewards";
import RewardsOverviewPanel from "@/components/features/rewards/RewardsOverviewPanel";
import MysteryBoxesSection from "@/components/features/rewards/MysteryBoxesSection";
import RewardsStatsCards from "@/components/features/rewards/RewardsStatsCards";
import ReferralRewardsCard from "@/components/features/rewards/ReferralRewardsCard";
import NextStepsCard from "@/components/features/rewards/NextStepsCard";
import RewardsLoadingSkeleton from "@/components/features/rewards/RewardsLoadingSkeleton";

export default function RewardsPageClient() {
  const { address, isConnected } = useAccount();

  // Fetch all rewards data
  const { data: overview, isLoading: isLoadingOverview } = useQuery({
    queryKey: ["rewards-overview", address],
    queryFn: () => fetchRewardsOverview(address!),
    enabled: !!address && isConnected,
  });

  const { data: cashbackProgress, isLoading: isLoadingCashback } = useQuery({
    queryKey: ["cashback-progress", address],
    queryFn: () => fetchCashbackProgress(address!),
    enabled: !!address && isConnected,
  });

  const { data: claimable, isLoading: isLoadingClaimable } = useQuery({
    queryKey: ["claimable-rewards", address],
    queryFn: () => fetchClaimableRewards(address!),
    enabled: !!address && isConnected,
  });

  const { data: mysteryBoxInfo, isLoading: isLoadingMysteryBox } = useQuery({
    queryKey: ["mystery-box-info", address],
    queryFn: () => fetchMysteryBoxInfo(address!),
    enabled: !!address && isConnected,
  });

  const { data: referralStats } = useQuery({
    queryKey: ["referral-stats", address],
    queryFn: () => fetchReferralStats(address!),
    enabled: !!address && isConnected,
  });

  const isLoading =
    isLoadingOverview ||
    isLoadingCashback ||
    isLoadingClaimable ||
    isLoadingMysteryBox;

  if (!isConnected || !address) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: "url('/images/reward-bg.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 pt-32 pb-24 px-4 sm:px-4 md:px-6 lg:px-8 xl:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-burbank font-bold text-white mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-lg text-gray-300">
              Connect your wallet to view and claim your rewards
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: "url('/images/reward-bg.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 pt-32 pb-24 px-4 sm:px-4 md:px-6 lg:px-8 xl:px-12">
          <RewardsLoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/reward-bg.png')",
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Main Content */}
      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-4 md:px-6 lg:px-8 xl:px-12">
        <div className="max-w-[95%] xl:max-w-[92%] 2xl:max-w-[90%] mx-auto space-y-8">
          {/* Rewards Overview Panel - "Above the Fold" */}
          <RewardsOverviewPanel
            overview={overview}
            cashbackProgress={cashbackProgress}
            mysteryBoxInfo={mysteryBoxInfo}
          />

          {/* Mystery Boxes Section */}
          <MysteryBoxesSection
            mysteryBoxInfo={mysteryBoxInfo}
            walletAddress={address}
          />

          {/* Stats Cards Section */}
          <RewardsStatsCards
            claimable={claimable}
            overview={overview}
            walletAddress={address}
          />

          {/* Bottom Section - Referral & Next Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReferralRewardsCard
              referralStats={referralStats}
              walletAddress={address}
            />
            <NextStepsCard
              overview={overview}
              cashbackProgress={cashbackProgress}
              mysteryBoxInfo={mysteryBoxInfo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
