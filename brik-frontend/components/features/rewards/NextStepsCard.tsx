"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { RewardsOverview, CashbackProgress, MysteryBoxInfo } from "@/lib/api/endpoints/rewards";

interface NextStepsCardProps {
  overview?: RewardsOverview;
  cashbackProgress?: CashbackProgress;
  mysteryBoxInfo?: MysteryBoxInfo;
}

export default function NextStepsCard({
  overview,
  cashbackProgress,
  mysteryBoxInfo,
}: NextStepsCardProps) {
  const steps = [
    {
      id: 1,
      text: "Make one more swap to unlock cashback",
      completed: cashbackProgress?.swapsRemaining === 0,
    },
    {
      id: 2,
      text: "Refer a friend to start earning referral rewards",
      completed: (overview?.claimableReferralEarningsUsd || 0) > 0,
    },
    {
      id: 3,
      text: "Come back tomorrow to open a mystery box",
      completed: false, // This would check if box was opened today
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-[rgba(15,15,20,0.85)] backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-[0_8px_32px_rgba(97,7,224,0.3)]"
    >
      <h3 className="flex items-center gap-2 text-lg font-burbank font-bold text-[#BD7BFF] mb-4">
        <img src="/images/claim.png" alt="Next Steps" className="w-8 h-8" />
        Next Steps
      </h3>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-3">
            <img src="/images/point.png" alt="Check" className="w-2 h-2" />
            <p
              className={`text-sm flex-1 ${
                step.completed ? "text-gray-400 line-through" : "text-gray-300"
              }`}
            >
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
