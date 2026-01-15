"use client";

import { motion } from "framer-motion";
import { CheckCircle, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { getBlockExplorerUrl } from "@/lib/utils/chain";
import { Z_INDEX } from "@/lib/constants/zIndex";

interface SwapStatusModalProps {
  isOpen: boolean;
  status: "idle" | "loading" | "success" | "error";
  onClose: () => void;
  fromAsset?: string;
  toAsset?: string;
  amount?: string;
  transactionHash?: string;
  chainId?: number;
  errorMessage?: string;
}

export default function SwapStatusModal({
  isOpen,
  status,
  onClose,
  fromAsset = "ETH",
  toAsset = "Gold",
  amount = "2.5",
  transactionHash,
  chainId,
  errorMessage,
}: SwapStatusModalProps) {
  if (status === "idle" || !isOpen) return null;

  // Get block explorer URL if transaction hash and chain ID are available
  const explorerUrl =
    transactionHash && chainId
      ? getBlockExplorerUrl(chainId, transactionHash)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm ${Z_INDEX.MODAL_BACKDROP}`}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass rounded-3xl p-8 max-w-md w-full mx-4 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Loader2 className="w-16 h-16 text-primary" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Processing Swap
            </h3>
            <p className="text-gray-400 mb-4">
              Swapping {amount} {fromAsset} for {toAsset}
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-between">
                <span>Confirming transaction...</span>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-primary rounded-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-block mb-4"
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Swap Successful!
            </h3>
            <p className="text-gray-400 mb-4">
              Successfully swapped {amount} {fromAsset} for {toAsset}
            </p>

            {/* Transaction Hash */}
            {transactionHash && (
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                <p className="text-xs text-white font-mono break-all">
                  {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {/* View on Explorer Button */}
              {explorerUrl && (
                <motion.a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                >
                  View on Explorer
                  <ExternalLink className="w-4 h-4" />
                </motion.a>
              )}

              {/* Done Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-gold text-white font-semibold"
              >
                Done
              </motion.button>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-block mb-4"
            >
              <AlertCircle className="w-16 h-16 text-red-500" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Swap Failed</h3>
            <p className="text-gray-400 mb-4">
              {errorMessage ||
                "There was an error processing your swap. Please try again."}
            </p>

            {/* Transaction Hash (if available even on error) */}
            {transactionHash && (
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                <p className="text-xs text-white font-mono break-all">
                  {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {/* View on Explorer Button (if hash available) */}
              {explorerUrl && (
                <motion.a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                >
                  View on Explorer
                  <ExternalLink className="w-4 h-4" />
                </motion.a>
              )}

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
              >
                Close
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
