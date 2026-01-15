/**
 * Asset Detail Error States
 * Handles 404, network errors, and rate limiting
 */

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { SearchX, WifiOff, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { AssetDetailErrorProps } from '@/lib/types/asset-detail.types';

// ============================================================================
// Component
// ============================================================================

export default function AssetDetailError({
  error,
  assetId,
  onRetry,
}: AssetDetailErrorProps) {
  // Determine error type
  const errorMessage = error instanceof Error ? error.message : String(error);
  const is404 = errorMessage.includes('404') || errorMessage.toLowerCase().includes('not found');
  const isRateLimit = errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit');
  const isNetworkError = errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection');

  // Determine which error state to show
  let icon: React.ReactNode;
  let title: string;
  let description: string;
  let showRetry: boolean;

  if (is404) {
    icon = <SearchX className="w-16 h-16" aria-hidden="true" />;
    title = 'Asset Not Found';
    description = `We couldn't find the asset "${assetId}". It may have been delisted or is currently unavailable.`;
    showRetry = false;
  } else if (isRateLimit) {
    icon = <Clock className="w-16 h-16" aria-hidden="true" />;
    title = 'Too Many Requests';
    description = "We're experiencing high traffic right now. Please wait a moment and try again later.";
    showRetry = false;
  } else if (isNetworkError) {
    icon = <WifiOff className="w-16 h-16" aria-hidden="true" />;
    title = 'Connection Failed';
    description = 'Unable to load asset details. Please check your internet connection and try again.';
    showRetry = true;
  } else {
    icon = <WifiOff className="w-16 h-16" aria-hidden="true" />;
    title = 'Something Went Wrong';
    description = 'We encountered an error while loading this asset. Please try again.';
    showRetry = true;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1c1c1c] via-[#1b1b1b] to-[#161616]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-[#1f1f1f] border-2 border-[#2a2a2a] rounded-full text-[#ffd700] mb-8"
          >
            {icon}
          </motion.div>

          {/* Error Title */}
          <h1 className="text-4xl font-bold text-white mb-4 nothingclasstight">
            {title}
          </h1>

          {/* Error Description */}
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Back to Explore */}
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6107e0] via-[#7a3df2] to-[#ffd700] text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_24px_40px_rgba(97,7,224,0.24)] hover:shadow-[0_30px_55px_rgba(97,7,224,0.3)]"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to Explore</span>
            </Link>

            {/* Retry Button (conditional) */}
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[rgba(31,31,31,0.92)] hover:bg-[rgba(42,42,42,0.9)] border border-[#2a2a2a] hover:border-[#3a3a3a] text-gray-200 hover:text-white font-semibold rounded-xl transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span>Try Again</span>
              </button>
            )}
          </div>

          {/* Additional Help Text */}
          {is404 && (
            <p className="mt-8 text-sm text-slate-500">
              Looking for something specific?{' '}
              <Link
                href="/explore"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Browse all available assets
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
