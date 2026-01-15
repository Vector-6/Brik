/**
 * NewsGrid Component
 * Container for displaying news articles in grid or list format
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { NewsArticle, NewsViewMode } from '@/lib/types/news.types';
import { NewsCard } from './NewsCard';
import { NewsGridSkeleton } from '../skeletons/NewsCardSkeleton';

// ============================================================================
// Types
// ============================================================================

interface NewsGridProps {
  /** Array of news articles to display */
  articles: NewsArticle[];
  /** View mode for layout */
  viewMode?: NewsViewMode;
  /** Loading state */
  isLoading?: boolean;
  /** Number of skeleton cards to show while loading */
  skeletonCount?: number;
  /** Additional CSS classes */
  className?: string;
  /** Click handler for analytics */
  onArticleClick?: (article: NewsArticle) => void;
}

// ============================================================================
// Grid Container Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// ============================================================================
// Empty State Component
// ============================================================================

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16 space-y-4"
    >
      <div className="w-16 h-16 mx-auto bg-[rgba(31,31,31,0.88)] rounded-full border border-[#2a2a2a] flex items-center justify-center">
        <svg
          className="w-8 h-8 text-[#ffd700]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-white">No articles found</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
          We couldn&apos;t find any RWA news articles at the moment. Check back later for fresh content.
        </p>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function NewsGrid({
  articles,
  viewMode = 'grid',
  isLoading = false,
  skeletonCount = 6,
  className = '',
  onArticleClick,
}: NewsGridProps) {
  // Show loading state
  if (isLoading && articles.length === 0) {
    return (
      <NewsGridSkeleton
        count={skeletonCount}
        viewMode={viewMode}
        className={className}
      />
    );
  }

  // Show empty state
  if (!isLoading && articles.length === 0) {
    return <EmptyState />;
  }

  // Layout classes based on view mode
  const gridClasses = viewMode === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-4';

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode} // Re-animate when view mode changes
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={gridClasses}
        >
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              variants={itemVariants}
              layout
              transition={{ duration: 0.3 }}
            >
              <NewsCard
                article={article}
                viewMode={viewMode}
                onClick={onArticleClick}
                index={index}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Grid with Load More
// ============================================================================

interface NewsGridWithLoadMoreProps extends NewsGridProps {
  /** Whether more articles are available */
  hasMore?: boolean;
  /** Whether next page is loading */
  isLoadingMore?: boolean;
  /** Load more function */
  onLoadMore?: () => void;
  /** Text for load more button */
  loadMoreText?: string;
}

export function NewsGridWithLoadMore({
  articles,
  viewMode = 'grid',
  isLoading = false,
  skeletonCount = 6,
  className = '',
  onArticleClick,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  loadMoreText = 'Load More Articles',
}: NewsGridWithLoadMoreProps) {
  return (
    <div className="space-y-8">
      {/* Main Grid */}
      <NewsGrid
        articles={articles}
        viewMode={viewMode}
        isLoading={isLoading}
        skeletonCount={skeletonCount}
        className={className}
        onArticleClick={onArticleClick}
      />

      {/* Load More Section */}
      {articles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          {hasMore ? (
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6107e0] via-[#7a3df2] to-[#ffd700] hover:from-[#6107e0] hover:via-[#8455f6] hover:to-[#ffe066] disabled:bg-[rgba(97,7,224,0.3)] text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading...
                </>
              ) : (
                loadMoreText
              )}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-500 text-sm"
            >
              You&apos;ve reached the end of the articles
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Loading More Skeletons */}
      {isLoadingMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <NewsGridSkeleton
            count={3}
            viewMode={viewMode}
          />
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// Export
// ============================================================================

export default NewsGrid;
