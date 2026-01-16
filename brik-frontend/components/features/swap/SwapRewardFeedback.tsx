"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface SwapRewardFeedbackProps {
  isOpen: boolean;
  onClose: () => void;
  swapData?: {
    pointsEarned: number;
    swapsCompleted: number;
    swapsRemaining: number;
    brikFeeUsd: number;
    estimatedCashbackUsd?: number;
  };
}

/**
 * Swap Confirmation Feedback
 *
 * Requirement: "After every verified swap, show a reward delta"
 * Example:
 * +40 Brik Points
 * 1 / 3 swaps toward cashback
 *
 * This feedback must be immediate.
 */
export default function SwapRewardFeedback({
  isOpen,
  onClose,
  swapData,
}: SwapRewardFeedbackProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && swapData) {
      // Trigger confetti on swap success
      setShowConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#7C0ADC", "#A855F7", "#F00CE6", "#FFD700"],
      });

      // Show for 5 seconds, then auto-close
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, swapData, onClose]);

  if (!swapData) return null;

  const {
    pointsEarned,
    swapsCompleted,
    swapsRemaining,
    brikFeeUsd,
    estimatedCashbackUsd,
  } = swapData;

  const cashbackProgress = Math.min((swapsCompleted / 3) * 100, 100);
  const isReadyForCashback = swapsRemaining === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-lg"
          >
            <div className="bg-gradient-to-br from-[rgba(15,15,20,0.98)] via-[rgba(97,7,224,0.25)] to-[rgba(15,15,20,0.98)] backdrop-blur-xl border-2 border-purple-500/50 rounded-3xl p-8 shadow-[0_24px_80px_rgba(97,7,224,0.6)] relative overflow-hidden">

              {/* Background Animation */}
              <div className="absolute inset-0 pointer-events-none">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/30 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-500/30 rounded-full blur-3xl"
                />
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="relative z-10">
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                    delay: 0.1,
                  }}
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.5)]"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <TrendingUp className="w-10 h-10 text-white" />
                  </motion.div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-burbank text-3xl font-bold text-center text-white mb-2"
                >
                  Swap Successful!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-400 text-sm text-center font-inter mb-8"
                >
                  You've earned rewards for this swap
                </motion.p>

                {/* Points Earned (Large & Prominent) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="bg-gradient-to-br from-purple-900/40 to-purple-800/30 rounded-2xl p-6 mb-6 border border-purple-500/30"
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    >
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                    </motion.div>
                    <span className="text-5xl md:text-6xl font-burbank font-bold text-white">
                      +{pointsEarned}
                    </span>
                  </div>
                  <p className="text-center text-gray-300 font-inter">
                    Brik Points Earned
                  </p>
                  <p className="text-center text-xs text-gray-500 font-inter mt-1">
                    From ${brikFeeUsd.toFixed(2)} swap fee
                  </p>
                </motion.div>

                {/* Cashback Progress */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-[rgba(97,7,224,0.2)] to-[rgba(244,114,182,0.2)] rounded-xl p-5 border border-pink-500/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-pink-400" />
                      <span className="font-burbank text-white text-lg">
                        Cashback Progress
                      </span>
                    </div>
                    <span className="text-2xl font-burbank font-bold text-white">
                      {swapsCompleted}/3
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-gray-800/70 rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cashbackProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                      className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.7)]"
                    />
                  </div>

                  {/* Required UX Copy */}
                  {isReadyForCashback ? (
                    <motion.p
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 }}
                      className="text-center text-green-400 font-inter text-sm font-semibold"
                    >
                      🎉 Cashback ready to claim!
                    </motion.p>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="text-center text-purple-300 font-inter text-sm"
                    >
                      {swapsCompleted} / 3 swaps toward cashback
                      {estimatedCashbackUsd && estimatedCashbackUsd > 0 && (
                        <span className="text-gray-400">
                          {" "}
                          (~${estimatedCashbackUsd.toFixed(2)} USDC)
                        </span>
                      )}
                    </motion.p>
                  )}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex gap-3 mt-6"
                >
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-inter font-semibold transition-colors"
                  >
                    Continue Swapping
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      window.location.href = "/rewards";
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-inter font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    View All Rewards
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
