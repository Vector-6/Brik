"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MysteryBoxInfo } from "@/lib/api/endpoints/rewards";
import { openMysteryBox } from "@/lib/api/endpoints/rewards";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { useState } from "react";

interface MysteryBoxesSectionProps {
  mysteryBoxInfo?: MysteryBoxInfo;
  walletAddress: string;
}

export default function MysteryBoxesSection({
  mysteryBoxInfo,
  walletAddress,
}: MysteryBoxesSectionProps) {
  const queryClient = useQueryClient();
  const { chainId } = useAccount();
  const [openingBox, setOpeningBox] = useState<number | null>(null);
  const [openedBoxes, setOpenedBoxes] = useState<Set<number>>(new Set());

  const openBoxMutation = useMutation({
    mutationFn: () =>
      openMysteryBox({
        walletAddress,
        pointsToSpend: 100,
        chainId: chainId || 1,
      }),
    onSuccess: (data) => {
      toast.success(data.message);
      // Mark the box as opened
      if (openingBox !== null) {
        setOpenedBoxes((prev) => new Set(prev).add(openingBox));
      }
      queryClient.invalidateQueries({ queryKey: ["rewards-overview", walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["mystery-box-info", walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["claimable-rewards", walletAddress] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to open mystery box");
    },
    onSettled: () => {
      setOpeningBox(null);
    },
  });

  const handleOpenBox = (index: number) => {
    if (!mysteryBoxInfo?.canOpen) {
      toast.error("You cannot open a mystery box right now");
      return;
    }
    setOpeningBox(index);
    openBoxMutation.mutate();
  };

  // Generate 5 mystery box images
  const mysteryBoxes = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    image: `/images/mystery-box-${i + 1}.png`,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-6 md:p-8"
    >
      <div className="flex justify-center items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full">
        {mysteryBoxes.map((box, index) => (
          <motion.div
            key={box.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative cursor-pointer flex-shrink-0"
            style={{
              width: 'clamp(50px, calc((100vw - 120px) / 5 - 8px), 192px)',
              height: 'clamp(50px, calc((100vw - 120px) / 5 - 8px), 192px)',
            }}
            onClick={() => handleOpenBox(index)}
          >
            {/* Glowing effect behind the image */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/50 to-pink-500/50 rounded-xl blur-xl opacity-60 animate-pulse -z-10" />
            
            {/* Mystery box image - no border, no background container */}
            {openingBox === index && openBoxMutation.isPending ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            ) : (
              <motion.div
                className="relative w-full h-full"
                key={`box-${index}-${openedBoxes.has(index) ? 'opened' : 'closed'}`}
                initial={openedBoxes.has(index) ? false : {}}
                animate={
                  openedBoxes.has(index)
                    ? {
                        scale: [1, 1.3, 1],
                        rotate: [0, 360],
                      }
                    : {}
                }
                transition={
                  openedBoxes.has(index)
                    ? {
                        duration: 0.8,
                        ease: "easeOut",
                      }
                    : {}
                }
              >
                <motion.div
                  key={openedBoxes.has(index) ? 'opened' : 'closed'}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Image
                    src={openedBoxes.has(index) ? "/images/gift-2.png" : "/images/mystery-box.png"}
                    alt={openedBoxes.has(index) ? `Opened Mystery Box ${box.id}` : `Mystery Box ${box.id}`}
                    width={224}
                    height={224}
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.6)] hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] transition-all"
                    unoptimized
                  />
                </motion.div>
                {/* Opening effect - sparkles/particles */}
                {openedBoxes.has(index) && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                        style={{
                          left: "50%",
                          top: "50%",
                        }}
                        animate={{
                          x: [
                            0,
                            Math.cos((i * Math.PI * 2) / 12) * 50,
                            Math.cos((i * Math.PI * 2) / 12) * 80,
                          ],
                          y: [
                            0,
                            Math.sin((i * Math.PI * 2) / 12) * 50,
                            Math.sin((i * Math.PI * 2) / 12) * 80,
                          ],
                          opacity: [1, 1, 0],
                          scale: [1, 1.5, 0],
                        }}
                        transition={{
                          duration: 1.2,
                          delay: 0.2,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      {mysteryBoxInfo && !mysteryBoxInfo.canOpen && (
        <p className="text-center text-sm text-gray-400 mt-4">
          {mysteryBoxInfo.hoursUntilNextBox
            ? `Come back in ${Math.ceil(mysteryBoxInfo.hoursUntilNextBox)} hours to open another box`
            : "You need 100 points to open a mystery box"}
        </p>
      )}
    </motion.div>
  );
}
