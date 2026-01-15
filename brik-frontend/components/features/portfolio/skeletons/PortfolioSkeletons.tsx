/**
 * Portfolio Loading Skeletons
 * Loading states for portfolio page components
 */

'use client';

import { Skeleton } from '@/components/ui/feedback/LoadingSkeletons';

// ============================================================================
// Portfolio Header Skeleton
// ============================================================================

export function PortfolioHeaderSkeleton() {
  return (
    <div className="mb-12">
      {/* Total Value */}
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-48 mx-auto mb-4" />
        <Skeleton className="h-16 w-64 mx-auto mb-2" />
        <Skeleton className="h-6 w-32 mx-auto" />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-xl p-6">
            <Skeleton className="h-5 w-20 mb-3" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Portfolio Filters Skeleton
// ============================================================================

export function PortfolioFiltersSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <Skeleton className="h-10 w-full sm:w-64" />
      <Skeleton className="h-10 w-full sm:w-48" />
      <Skeleton className="h-10 w-full sm:w-32 ml-auto" />
    </div>
  );
}

// ============================================================================
// Portfolio Holdings Grid Skeleton
// ============================================================================

export function PortfolioHoldingsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-xl p-6">
          {/* Token Header */}
          <div className="flex items-start gap-4 mb-4">
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Token Stats */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>

          {/* Action Button */}
          <Skeleton className="h-10 w-full mt-4 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Full Page Skeleton
// ============================================================================

export function PortfolioPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1c1c1c] via-[#1b1b1b] to-[#161616]">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="pt-20 pb-16">
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-[500px] mx-auto" />
        </section>

        {/* Portfolio Header */}
        <PortfolioHeaderSkeleton />

        {/* Filters */}
        <PortfolioFiltersSkeleton />

        {/* Holdings Grid */}
        <PortfolioHoldingsGridSkeleton count={6} />
      </div>
    </div>
  );
}

// ============================================================================
// Chain Stats Skeleton
// ============================================================================

export function ChainStatsSkeleton() {
  return (
    <div className="glass rounded-xl p-6 mb-8">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
