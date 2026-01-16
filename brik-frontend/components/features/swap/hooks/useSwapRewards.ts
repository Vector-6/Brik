/**
 * useSwapRewards Hook
 *
 * Hook to fetch and display swap reward feedback after successful swaps
 * Integrates with the backend rewards system to show points earned and cashback progress
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import apiClient from "@/lib/api/client";
import { estimatePointsEarned } from "@/lib/utils/swap-fees";

interface SwapRewardData {
  pointsEarned: number;
  swapsCompleted: number;
  swapsRemaining: number;
  brikFeeUsd: number;
  estimatedCashbackUsd?: number;
}

interface VerifySwapResponse {
  success: boolean;
  swap: {
    swapId: string;
    pointsEarned: number;
    brikFeeUsd: number;
  };
  progress: {
    swapsCompleted: number;
    swapsRemaining: number;
    estimatedCashbackUsd: number;
  };
}

export function useSwapRewards() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [showFeedback, setShowFeedback] = useState(false);
  const [rewardData, setRewardData] = useState<SwapRewardData | null>(null);

  /**
   * Verify swap with backend and fetch reward data
   */
  const verifySwapMutation = useMutation({
    mutationFn: async (params: {
      txHash: string;
      chainId: number;
      quoteData: Record<string, any>;
      swapValueUsd: number;
      brikFeeUsd: number;
    }) => {
      const { data } = await apiClient.post<VerifySwapResponse>(
        "/rewards/verify-swap",
        {
          walletAddress: address,
          txHash: params.txHash,
          chainId: params.chainId,
          quoteData: params.quoteData,
          swapValueUsd: params.swapValueUsd,
          brikFeeUsd: params.brikFeeUsd,
        }
      );
      return data;
    },
    onSuccess: (data) => {
      // Set reward data from verification
      setRewardData({
        pointsEarned: data.swap.pointsEarned,
        swapsCompleted: data.progress.swapsCompleted,
        swapsRemaining: data.progress.swapsRemaining,
        brikFeeUsd: data.swap.brikFeeUsd,
        estimatedCashbackUsd: data.progress.estimatedCashbackUsd,
      });

      // Show feedback modal
      setShowFeedback(true);

      // Invalidate rewards queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["rewards-overview"] });
      queryClient.invalidateQueries({ queryKey: ["cashback-progress"] });
      queryClient.invalidateQueries({ queryKey: ["claimable-rewards"] });
    },
    onError: (error) => {
      console.error("Failed to verify swap:", error);
      // Still show feedback with estimated data
      // This ensures users see something even if backend is slow
    },
  });

  /**
   * Trigger swap verification after successful swap
   * Call this from your swap success handler
   */
  const handleSwapSuccess = useCallback(
    (params: {
      txHash: string;
      chainId: number;
      quoteData: Record<string, any>;
      swapValueUsd: number;
      brikFeeUsd: number;
    }) => {
      if (!address) return;

      // Verify swap with backend
      verifySwapMutation.mutate({
        txHash: params.txHash,
        chainId: params.chainId,
        quoteData: params.quoteData,
        swapValueUsd: params.swapValueUsd,
        brikFeeUsd: params.brikFeeUsd,
      });

      // Show estimated rewards immediately
      // This prevents delay while backend processes
      const estimatedPoints = estimatePointsEarned(params.brikFeeUsd);
      setRewardData({
        pointsEarned: estimatedPoints,
        swapsCompleted: 0, // Will be updated by backend
        swapsRemaining: 3,
        brikFeeUsd: params.brikFeeUsd,
      });
      setShowFeedback(true);
    },
    [address, verifySwapMutation]
  );

  /**
   * Close reward feedback modal
   */
  const closeFeedback = useCallback(() => {
    setShowFeedback(false);
  }, []);

  return {
    showFeedback,
    rewardData,
    handleSwapSuccess,
    closeFeedback,
    isVerifying: verifySwapMutation.isPending,
  };
}
