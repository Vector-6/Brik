/**
 * Asset Chains List
 * Displays available blockchain networks for the asset
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Link2 } from "lucide-react";
import { AssetChainsListProps } from "@/lib/types/asset-detail.types";
import { getChainLogos } from "@/lib/constants/chainLogos";

// ============================================================================
// Component
// ============================================================================

export default function AssetChainsList({
  chains,
  contracts,
}: AssetChainsListProps) {
  const chainLogos = getChainLogos(chains);

  if (chainLogos.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      aria-labelledby="chains-section"
      className="bg-[#1f1f1f] backdrop-blur-xl border border-color-border rounded-2xl p-8 shadow-[0_24px_40px_rgba(0,0,0,0.35)] mb-12"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gold/20 border border-gold/40 rounded-lg text-gold">
          <Link2 className="w-5 h-5" aria-hidden="true" />
        </div>
        <h2
          id="chains-section"
          className="text-2xl font-bold text-white nothingclasstight"
        >
          Available on {chainLogos.length}{" "}
          {chainLogos.length === 1 ? "Chain" : "Chains"}
        </h2>
      </div>

      {/* Chain Badges Grid */}
      <div className="flex flex-wrap gap-4">
        {chainLogos.map((chain, index) => {
          // Find contract info for this chain if available
          const contract = contracts?.find(
            (c) => c.chain.toLowerCase() === chain.name.toLowerCase()
          );

          return (
            <motion.div
              key={chain.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: 0.3 + index * 0.05,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="group relative"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-[rgba(31,31,31,0.92)] border border-color-border rounded-xl hover:border-[#3a3a3a] hover:bg-[rgba(42,42,42,0.9)] transition-all duration-200 cursor-pointer">
                {/* Chain Logo */}
                {chain.logo ? (
                  <div className="relative w-8 h-8 rounded-full bg-[rgba(31,31,31,0.92)] border border-color-border p-1 flex-shrink-0">
                    <Image
                      src={chain.logo}
                      alt={`${chain.name} logo`}
                      fill
                      className="object-contain p-0.5"
                      sizes="32px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        if (target.parentElement) {
                          target.parentElement.innerHTML = `<div class=\"flex items-center justify-center w-full h-full text-[10px] font-bold text-gray-400\">${chain.shortName}</div>`;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[rgba(31,31,31,0.92)] border border-color-border flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-gray-400">
                      {chain.shortName}
                    </span>
                  </div>
                )}

                {/* Chain Name */}
                <span className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors duration-200">
                  {chain.name}
                </span>

                {/* Contract Badge (if available) */}
                {contract && (
                  <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-semibold uppercase nothingclasswider rounded-full">
                    Contract
                  </span>
                )}
              </div>

              {/* Tooltip with contract address */}
              {contract && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[rgba(31,31,31,0.92)] border border-color-border rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-20 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                  <div className="space-y-1">
                    <p className="text-gray-400 font-medium">
                      Contract Address:
                    </p>
                    <p className="font-mono text-gold">
                      {contract.address.slice(0, 6)}...
                      {contract.address.slice(-4)}
                    </p>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-color-border" />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Info Text */}
      <p className="mt-6 text-sm text-gray-400">
        This asset is available across multiple blockchain networks, allowing
        you to choose the most suitable chain for your needs.
      </p>
    </motion.section>
  );
}
