/**
 * Asset Detail Skeleton Loaders
 * Animated loading states for asset detail page
 */

'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/feedback/LoadingSkeletons';

// ============================================================================
// Asset Detail Header Skeleton
// ============================================================================

export function AssetDetailHeaderSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-12"
    >
      {/* Left: Asset Info */}
      <div className="flex items-start gap-6">
        {/* Logo */}
        <Skeleton className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex-shrink-0" />

        {/* Name and Category */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      {/* Right: Price and Change */}
      <div className="lg:text-right space-y-2">
        <Skeleton className="h-12 w-48 lg:ml-auto" />
        <Skeleton className="h-8 w-32 lg:ml-auto rounded-lg" />
        <Skeleton className="h-4 w-40 lg:ml-auto" />
      </div>
    </motion.div>
  );
}

// ============================================================================
// Asset Metrics Grid Skeleton
// ============================================================================

export function AssetMetricsGridSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
    >
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-[#1f1f1f] backdrop-blur-xl border border-[#2a2a2a] rounded-xl p-6"
        >
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </motion.div>
  );
}

// ============================================================================
// Asset About Section Skeleton
// ============================================================================

export function AssetAboutSectionSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="grid lg:grid-cols-3 gap-8 mb-12"
    >
      {/* Left: Description */}
      <div className="lg:col-span-2 bg-[#1f1f1f] backdrop-blur-xl border border-[#2a2a2a] rounded-2xl p-8">
        <Skeleton className="h-7 w-32 mb-6" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* Custodian */}
        <div className="mt-8 pt-6 border-t border-slate-700/40">
          <Skeleton className="h-5 w-24 mb-3" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Right: Key Stats */}
      <div className="bg-[#1f1f1f] backdrop-blur-xl border border-[#2a2a2a] rounded-2xl p-8">
        <Skeleton className="h-7 w-28 mb-6" />
        <div className="space-y-5">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Asset Chains List Skeleton
// ============================================================================

export function AssetChainsListSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="bg-[#1f1f1f] backdrop-blur-xl border border-[#2a2a2a] rounded-2xl p-8 mb-12"
    >
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="flex flex-wrap gap-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-32 rounded-xl" />
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Similar Assets Carousel Skeleton
// ============================================================================

export function SimilarAssetsCarouselSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="mb-12"
    >
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-[#1f1f1f] backdrop-blur-xl border border-[#2a2a2a] rounded-2xl p-6 min-h-[320px]"
          >
            {/* Logo and Badge */}
            <div className="flex items-start justify-between mb-5">
              <Skeleton className="w-14 h-14 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* Name and Symbol */}
            <div className="mb-5">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>

            {/* Price */}
            <Skeleton className="h-8 w-24 mb-6" />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div>
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* Button */}
            <Skeleton className="h-10 w-full rounded-xl mt-auto" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Complete Asset Detail Page Skeleton
// ============================================================================

export function AssetDetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1c1c1c] via-[#1b1b1b] to-[#161616]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Header */}
        <AssetDetailHeaderSkeleton />

        {/* Metrics Grid */}
        <AssetMetricsGridSkeleton />

        {/* About Section */}
        <AssetAboutSectionSkeleton />

        {/* Chains List */}
        <AssetChainsListSkeleton />

        {/* Similar Assets */}
        <SimilarAssetsCarouselSkeleton />
      </div>
    </div>
  );
}
