"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, ChevronRight, Loader2, CheckCircle, ExternalLink, Copy, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimRewards } from "@/lib/api/endpoints/rewards";
import toast from "react-hot-toast";

/**
 * Claim Reward Modal - Complete 4-Step Flow
 *
 * Requirement: "Claim button flow:
 * 1. Reward breakdown modal
 * 2. User confirmation
 * 3. Pending state
 * 4. Tx hash receipt"
 *
 * Additional Requirements:
 * - No auto-withdrawals. No surprises.
 * - Claim-based system (user-initiated)
 * - Show transaction hash on completion
 */

type ClaimStep = "breakdown" | "confirm" | "pending" | "success";

interface RewardBreakdown {
  cashbackUsd: number;
  referralUsd: number;
  mysteryBoxUsd: number;
  mysteryBoxIds: string[]; // Array of mystery box IDs for claiming
  totalUsd: number;
}

interface ClaimRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  rewardBreakdown: RewardBreakdown;
}

export default function ClaimRewardModal({
  isOpen,
  onClose,
  walletAddress,
  rewardBreakdown,
}: ClaimRewardModalProps) {
  const [currentStep, setCurrentStep] = useState<ClaimStep>("breakdown");
  const [payoutId, setPayoutId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const queryClient = useQueryClient();

  const claimMutation = useMutation({
    mutationFn: async () => {
      // Claim cashback
      let cashbackResult = null;
      if (rewardBreakdown.cashbackUsd > 0) {
        cashbackResult = await claimRewards({
          type: "cashback",
          walletAddress,
        });
      }

      // Claim referral
      let referralResult = null;
      if (rewardBreakdown.referralUsd > 0) {
        referralResult = await claimRewards({
          type: "referral",
          walletAddress,
        });
      }

      // Claim mystery box - claim first available mystery box
      let mysteryBoxResult = null;
      if (rewardBreakdown.mysteryBoxUsd > 0 && rewardBreakdown.mysteryBoxIds.length > 0) {
        mysteryBoxResult = await claimRewards({
          type: "mystery_box",
          walletAddress,
          mysteryBoxId: rewardBreakdown.mysteryBoxIds[0], // Claim the first mystery box
        });
      }

      // Return the first available result
      return cashbackResult || referralResult || mysteryBoxResult;
    },
    onSuccess: (data) => {
      if (data?.payoutId) {
        setPayoutId(data.payoutId);
      }
      setCurrentStep("success");

      // Show success message
      toast.success(data?.message || "Claim request submitted successfully!");

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["rewards-overview"] });
      queryClient.invalidateQueries({ queryKey: ["claimable-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["cashback-progress"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to claim rewards");
      setCurrentStep("breakdown"); // Go back to start on error
    },
  });

  const handleCopyPayoutId = async () => {
    if (payoutId) {
      try {
        await navigator.clipboard.writeText(payoutId);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
        toast.success("Payout ID copied!");
      } catch (err) {
        toast.error("Failed to copy");
      }
    }
  };

  const handleConfirm = () => {
    setCurrentStep("pending");
    claimMutation.mutate();
  };

  const handleClose = () => {
    setCurrentStep("breakdown"); // Reset for next time
    setPayoutId(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-lg"
          >
            <div className="bg-gradient-to-br from-[rgba(15,15,20,0.98)] via-[rgba(97,7,224,0.15)] to-[rgba(15,15,20,0.98)] backdrop-blur-xl border-2 border-purple-500/40 rounded-3xl shadow-[0_24px_80px_rgba(97,7,224,0.6)] overflow-hidden">

              {/* Close Button */}
              {currentStep !== "pending" && (
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {/* Step 1: Reward Breakdown */}
                  {currentStep === "breakdown" && (
                    <motion.div
                      key="breakdown"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h2 className="text-2xl md:text-3xl font-burbank font-bold text-white mb-2">
                        Reward Breakdown
                      </h2>
                      <p className="text-gray-400 text-sm font-inter mb-6">
                        Review your claimable rewards before proceeding
                      </p>

                      {/* Reward Items */}
                      <div className="space-y-4 mb-6">
                        {rewardBreakdown.cashbackUsd > 0 && (
                          <div className="bg-[rgba(97,7,224,0.1)] border border-purple-500/30 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-400 font-inter">Cashback Rewards</p>
                                <p className="text-xs text-gray-500 font-inter mt-1">
                                  From your last 3 swaps
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-burbank font-bold text-white">
                                  ${rewardBreakdown.cashbackUsd.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-400 font-inter">USDC</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {rewardBreakdown.referralUsd > 0 && (
                          <div className="bg-[rgba(244,114,182,0.1)] border border-pink-500/30 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-400 font-inter">Referral Earnings</p>
                                <p className="text-xs text-gray-500 font-inter mt-1">
                                  5% from referred users
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-burbank font-bold text-white">
                                  ${rewardBreakdown.referralUsd.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-400 font-inter">USDC</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {rewardBreakdown.mysteryBoxUsd > 0 && (
                          <div className="bg-[rgba(251,191,36,0.1)] border border-yellow-500/30 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-400 font-inter">Mystery Box Rewards</p>
                                <p className="text-xs text-gray-500 font-inter mt-1">
                                  From opened mystery boxes
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-burbank font-bold text-white">
                                  ${rewardBreakdown.mysteryBoxUsd.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-400 font-inter">USDC</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Total */}
                        <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-400/40 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-burbank font-bold text-white">Total</p>
                            <div className="text-right">
                              <p className="text-3xl font-burbank font-bold text-white">
                                ${rewardBreakdown.totalUsd.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-400 font-inter">USDC</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Next Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentStep("confirm")}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-inter font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        Continue
                        <ChevronRight className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Step 2: User Confirmation */}
                  {currentStep === "confirm" && (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h2 className="text-2xl md:text-3xl font-burbank font-bold text-white mb-2">
                        Confirm Claim
                      </h2>
                      <p className="text-gray-400 text-sm font-inter mb-6">
                        You're about to claim your rewards. This action cannot be undone.
                      </p>

                      {/* Confirmation Summary */}
                      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/40 rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <span className="text-3xl font-burbank font-bold text-white">
                              $
                            </span>
                          </div>
                        </div>
                        <p className="text-center text-4xl font-burbank font-bold text-white mb-2">
                          ${rewardBreakdown.totalUsd.toFixed(2)}
                        </p>
                        <p className="text-center text-sm text-gray-400 font-inter">
                          Will be sent to your wallet as USDC
                        </p>
                      </div>

                      {/* Important Notice */}
                      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
                        <p className="text-xs text-yellow-200 font-inter">
                          <strong>Important:</strong> Your claim will be queued for processing. An admin will review and send the USDC to your wallet within 24-48 hours.
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setCurrentStep("breakdown")}
                          className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-inter font-semibold transition-all"
                        >
                          Back
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleConfirm}
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-inter font-bold shadow-lg hover:shadow-xl transition-all"
                        >
                          Confirm Claim
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Pending State */}
                  {currentStep === "pending" && (
                    <motion.div
                      key="pending"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-20 h-20 mx-auto mb-6"
                      >
                        <Loader2 className="w-full h-full text-purple-400" />
                      </motion.div>

                      <h2 className="text-2xl md:text-3xl font-burbank font-bold text-white mb-2">
                        Processing Claim
                      </h2>
                      <p className="text-gray-400 text-sm font-inter mb-4">
                        Please wait while we process your reward claim...
                      </p>
                      <p className="text-xs text-gray-500 font-inter">
                        This may take a few moments. Do not close this window.
                      </p>
                    </motion.div>
                  )}

                  {/* Step 4: Tx Hash Receipt */}
                  {currentStep === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      {/* Success Icon */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.5)]"
                      >
                        <CheckCircle className="w-12 h-12 text-white" />
                      </motion.div>

                      <h2 className="text-2xl md:text-3xl font-burbank font-bold text-white mb-2 text-center">
                        Claim Submitted!
                      </h2>
                      <p className="text-gray-400 text-sm font-inter mb-6 text-center">
                        Your claim request has been submitted and is pending admin processing
                      </p>

                      {/* Amount Claimed */}
                      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/40 rounded-xl p-6 mb-6">
                        <p className="text-center text-sm text-gray-400 font-inter mb-2">
                          Amount Requested
                        </p>
                        <p className="text-center text-4xl font-burbank font-bold text-white">
                          ${rewardBreakdown.totalUsd.toFixed(2)} USDC
                        </p>
                      </div>

                      {/* Payout ID */}
                      {payoutId && (
                        <div className="bg-[rgba(97,7,224,0.1)] border border-purple-500/30 rounded-xl p-4 mb-6">
                          <p className="text-sm text-gray-400 font-inter mb-2">Payout Request ID</p>
                          <div className="flex items-center gap-2 mb-3">
                            <code className="flex-1 text-xs text-white font-mono bg-black/40 px-3 py-2 rounded border border-gray-700 truncate">
                              {payoutId}
                            </code>
                            <button
                              onClick={handleCopyPayoutId}
                              className="p-2 hover:bg-purple-500/20 rounded transition-colors"
                              aria-label="Copy payout ID"
                            >
                              {copiedId ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-gray-400 font-inter text-center">
                            Status: Pending Admin Processing
                          </p>
                        </div>
                      )}

                      {/* Processing Notice */}
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-6">
                        <p className="text-xs text-blue-200 font-inter text-center">
                          Your claim is queued for processing. You'll receive the USDC in your wallet within 24-48 hours. Check your transaction history to track the status.
                        </p>
                      </div>

                      {/* Done Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleClose}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-inter font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        Done
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
