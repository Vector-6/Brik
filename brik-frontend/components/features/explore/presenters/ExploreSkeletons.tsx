/**
 * Explore Page Skeleton Loaders
 * Animated loading states for explore page components
 */

'use client';

import { Skeleton } from '@/components/ui/feedback/LoadingSkeletons';

// ============================================================================
// RWA Card Skeleton
// ============================================================================

export function RWACardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className={`h-full flex flex-col bg-[#1f1f1f] backdrop-blur-xl border border-[#2a2a2a] rounded-2xl p-5 shadow-[0_24px_40px_rgba(0,0,0,0.35)] animate-fade-in-up ${
        index < 12 ? `animate-stagger-${(index % 12) + 1}` : ''
      }`}
      style={{ opacity: 0 }}
      role="status"
      aria-label="Loading asset card"
    >
      {/* Header: Logo + Name (no separate badge) */}
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-5 w-3/4 mb-1.5" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>

      {/* Primary Price with divider */}
      <div className="mb-4 pb-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-6 w-16 rounded" />
        </div>
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div>
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Chain Badges - Text style */}
      <div className="mb-4">
        <Skeleton className="h-3 w-20 mb-2" />
        <div className="flex gap-1.5 flex-wrap">
          <Skeleton className="h-6 w-20 rounded" />
          <Skeleton className="h-6 w-24 rounded" />
          <Skeleton className="h-6 w-16 rounded" />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-grow" />

      {/* View Details Link - Text style */}
      <div className="pt-3 border-t border-[#2a2a2a]">
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}

// ============================================================================
// Explore Grid Skeleton
// ============================================================================

export function ExploreGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
      {Array.from({ length: count }).map((_, i) => (
        <RWACardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

// ============================================================================
// Filter Bar Skeleton
// ============================================================================

export function FilterBarSkeleton() {
  return (
    <div className="bg-[rgba(31,31,31,0.9)] backdrop-blur-xl border border-[#2a2a2a] rounded-2xl p-6 mb-8 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <Skeleton className="h-12 w-full lg:w-80" />

        {/* Filter Buttons */}
        <div className="flex gap-3 w-full lg:w-auto">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
        </div>

        {/* Sort Dropdown */}
        <Skeleton className="h-12 w-full lg:w-48" />
      </div>
    </div>
  );
}

// ============================================================================
// Complete Page Skeleton
// ============================================================================

export function ExplorePageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Filter Bar */}
      <FilterBarSkeleton />

      {/* Results Count */}
      <Skeleton className="h-6 w-48 mb-6" />

      {/* Grid */}
      <ExploreGridSkeleton count={12} />
    </div>
  );
}
