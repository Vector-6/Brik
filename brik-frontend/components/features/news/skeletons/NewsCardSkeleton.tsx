/**
 * News Card Skeleton Components
 * Loading states for news articles
 */

import { motion } from 'framer-motion';

// ============================================================================
// Base Skeleton Component
// ============================================================================

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

function Skeleton({ className = '', animate = true }: SkeletonProps) {
  const baseClasses = 'bg-[rgba(44,44,44,0.9)] rounded';
  const animationClasses = animate ? 'animate-pulse' : '';

  return (
    <div className={`${baseClasses} ${animationClasses} ${className}`} />
  );
}

// ============================================================================
// News Card Skeleton
// ============================================================================

interface NewsCardSkeletonProps {
  /** View mode affects the layout */
  viewMode?: 'grid' | 'list';
  /** Additional CSS classes */
  className?: string;
}

export function NewsCardSkeleton({
  viewMode = 'grid',
  className = ''
}: NewsCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex gap-4 p-4 bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl ${className}`}
      >
        {/* Image - 16:9 aspect ratio */}
        <Skeleton className="w-40 h-[90px] flex-shrink-0 rounded-lg" />

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Title */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-2" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view (default) - min-height matches actual card
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-[440px] flex flex-col bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl overflow-hidden ${className}`}
    >
      {/* Image - Fixed height */}
      <Skeleton className="w-full h-48 flex-shrink-0" />

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title */}
        <div className="space-y-2 mb-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>

        {/* Description */}
        <div className="space-y-2 mb-auto">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#2a2a2a] space-y-2">
          {/* Source and time */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-2" />
            <Skeleton className="h-3 w-16" />
          </div>

          {/* Categories */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// News Grid Skeleton
// ============================================================================

interface NewsGridSkeletonProps {
  /** Number of skeleton cards to show */
  count?: number;
  /** View mode affects the layout */
  viewMode?: 'grid' | 'list';
  /** Additional CSS classes */
  className?: string;
}

export function NewsGridSkeleton({
  count = 6,
  viewMode = 'grid',
  className = ''
}: NewsGridSkeletonProps) {
  const gridClasses = viewMode === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-4';

  return (
    <div className={`${gridClasses} ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardSkeleton
          key={i}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}

// ============================================================================
// News Hero Skeleton
// ============================================================================

export function NewsHeroSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-4 py-12"
    >
      {/* Title */}
      <Skeleton className="h-10 w-80 mx-auto" />

      {/* Subtitle */}
      <Skeleton className="h-5 w-96 mx-auto" />
    </motion.div>
  );
}

// ============================================================================
// News Filters Skeleton
// ============================================================================

export function NewsFiltersSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between py-4"
    >
      {/* Left side - Results count */}
      <Skeleton className="h-5 w-48" />

      {/* Right side - Controls */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Load More Button Skeleton
// ============================================================================

export function LoadMoreButtonSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-8"
    >
      <Skeleton className="h-12 w-48 mx-auto rounded-lg" />
    </motion.div>
  );
}

// ============================================================================
// Full Page Loading Skeleton
// ============================================================================

export function NewsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <NewsHeroSkeleton />

      {/* Filters */}
      <NewsFiltersSkeleton />

      {/* Grid */}
      <NewsGridSkeleton count={6} />

      {/* Load More */}
      <LoadMoreButtonSkeleton />
    </div>
  );
}
