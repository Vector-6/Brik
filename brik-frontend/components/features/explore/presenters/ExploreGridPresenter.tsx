/**
 * Explore Grid Presenter
 * Responsive grid layout with CSS animations
 */

'use client';

import { ExploreGridProps } from '@/lib/types/explore.types';
import RWACardPresenter from './RWACardPresenter';
import { ExploreGridSkeleton } from './ExploreSkeletons';
import ExploreErrorPresenter from './ExploreErrorPresenter';

// ============================================================================
// Component
// ============================================================================

export default function ExploreGridPresenter({
  tokens,
  isLoading,
  error,
  onRetry,
}: ExploreGridProps) {
  // Loading state
  if (isLoading) {
    return <ExploreGridSkeleton count={12} />;
  }

  // Error state
  if (error) {
    return <ExploreErrorPresenter error={error} onRetry={onRetry} />;
  }

  // Empty state
  if (tokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center animate-fade-in-scale">
        <div className="text-8xl mb-6 animate-scale-rotate">
          🔍
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">No tokens found</h3>
        <p className="text-gray-400 max-w-md">
          Try adjusting your filters or search query to find more RWA tokens.
        </p>
      </div>
    );
  }

  // Grid with tokens - Optimized spacing and card heights for better density
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr animate-fade-in">
      {tokens.map((token, index) => (
        <div
          key={token.symbol}
          className={`h-full animate-fade-in-scale-small ${
            index < 12 ? `animate-stagger-${(index % 12) + 1}` : ''
          }`}
          style={{ opacity: 0 }}
        >
          <RWACardPresenter token={token} index={index} />
        </div>
      ))}
    </div>
  );
}
