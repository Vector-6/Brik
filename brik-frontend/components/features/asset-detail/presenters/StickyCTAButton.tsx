/**
 * Sticky CTA Button
 * Floating "Swap Now" button with pulse animation
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRightLeft } from "lucide-react";
import { StickyCTAButtonProps } from "@/lib/types/asset-detail.types";

// ============================================================================
// Component
// ============================================================================

export default function StickyCTAButton({ asset }: StickyCTAButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="fixed bottom-8 right-8 z-40"
    >
      <Link
        href={`/swap?token=${asset.symbol}`}
        className="group relative"
        aria-label={`Swap ${asset.symbol} now`}
      >
        {/* Pulsing Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 animate-pulse-glow" />

        {/* Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="relative flex items-center gap-3 px-8 py-4  hover:bg-primary/20 hover:border bg-[#ffd700]  text-[#1c1c1c] hover:border-primary  hover:text-primary-light font-bold rounded-2xl shadow-2xl shadow-primary/40 transition-all duration-300"
        >
          <ArrowRightLeft className="w-5 h-5" aria-hidden="true" />
          <span className="text-lg font-burbank font-stretch-50%">Swap Now</span>
        </motion.div>
      </Link>
    </motion.div>
  );
}
