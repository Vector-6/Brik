/**
 * NewsCard Component
 * Display individual news article in card format
 */

'use client';

import { motion } from 'framer-motion';
import { NewsArticle } from '@/lib/types/news.types';
import { getFormattedTime, isRecent } from '../utils/dateFormatting';
import { shouldShowRelevanceBadge, getRelevanceBadgeText, getRelevanceBadgeVariant } from '../utils/relevanceIndicator';
import { ImageWithFallback } from './ImageWithFallback';
import { NewsArticleSchema } from './NewsArticleSchema';

// ============================================================================
// Types
// ============================================================================

interface NewsCardProps {
  /** News article data */
  article: NewsArticle;
  /** View mode affects the layout */
  viewMode?: 'grid' | 'list';
  /** Additional CSS classes */
  className?: string;
  /** Click handler for analytics */
  onClick?: (article: NewsArticle) => void;
  /** Index in the list for LCP optimization */
  index?: number;
}

// ============================================================================
// Badge Components
// ============================================================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'info' | 'warning' | 'default';
  className?: string;
}

function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClasses = {
    success: 'bg-green-500/90 text-green-50 border-green-400/50',
    info: 'bg-blue-500/90 text-blue-50 border-blue-400/50',
    warning: 'bg-amber-500/90 text-amber-50 border-amber-400/50',
    default: 'bg-[#ffd700]/90 text-[#1f1f1f] border-purple-400/50',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

function RelevanceBadge({ article }: { article: NewsArticle }) {
  if (!shouldShowRelevanceBadge(article)) return null;

  const text = getRelevanceBadgeText(article);
  const variant = getRelevanceBadgeVariant(article);

  if (!text) return null;

  return (
    <Badge variant={variant} className="text-xs">
      {text}
    </Badge>
  );
}

function CategoryTags({ categories }: { categories: string[] }) {
  if (!categories.length) return null;

  // Show only the first category for cleaner design
  const displayCategory = categories[0];

  return (
    <Badge variant="default" className="text-xs capitalize">
      {displayCategory}
    </Badge>
  );
}

function RecentIndicator({ publishedAt }: { publishedAt: string }) {
  if (!isRecent(publishedAt)) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/90 backdrop-blur-sm rounded-full border border-green-400/50">
      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
      <span className="text-xs text-white font-medium">New</span>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function NewsCard({
  article,
  viewMode = 'grid',
  className = '',
  onClick,
  index = 0,
}: NewsCardProps) {
  const formattedTime = getFormattedTime(article.publishedAt);

  // First card in grid view should have priority loading for LCP optimization
  const isFirstCard = index === 0;
  const shouldPrioritizeImage = isFirstCard && viewMode === 'grid';

  const handleClick = () => {
    onClick?.(article);
    // Open in new tab to maintain user flow
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        <NewsArticleSchema article={article} />
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className={`group cursor-pointer ${className}`}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`Read article: ${article.title}`}
        >
        {/* Desktop & Tablet: Horizontal layout */}
        <div className="relative hidden sm:flex gap-4 md:gap-6 p-4 bg-[#1f1f1f] backdrop-blur-xl border border-[#2a2a2a] hover:border-[#3a3a3a] focus-within:border-[rgba(97,7,224,0.45)] focus-within:ring-2 focus-within:ring-[rgba(97,7,224,0.25)] focus-within:ring-offset-2 focus-within:ring-offset-[#0f0f0f] rounded-2xl transition-all duration-300 outline-none shadow-[0_24px_40px_rgba(0,0,0,0.35)] hover:shadow-[0_30px_55px_rgba(0,0,0,0.45)]">
          {/* Hover glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[rgba(97,7,224,0.18)] via-transparent to-[rgba(255,215,0,0.12)] rounded-2xl pointer-events-none" />
          {/* Image - Responsive width */}
          <div className="relative w-28 sm:w-32 md:w-40 aspect-video flex-shrink-0 rounded-lg overflow-hidden bg-[#2a2a2a]">
            <ImageWithFallback
              src={article.imageUrl}
              alt={article.title}
              fill
              className="relative w-full h-full"
              imageClassName="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 128px, 160px"
              loading={shouldPrioritizeImage ? 'eager' : 'lazy'}
              priority={shouldPrioritizeImage}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title - Responsive size */}
            <h3 className="text-lg md:text-xl font-semibold text-white group-hover:text-[#c8acff] transition-colors line-clamp-2 leading-tight">
              {article.title}
            </h3>

            {/* Description - Hide on small tablets */}
            <p className="hidden md:block text-gray-300 text-sm line-clamp-2 leading-relaxed">
              {article.description}
            </p>

            {/* Footer - Source, time, and badges */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pt-1">
              <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
                <span className="text-gray-400 font-medium">{article.source}</span>
                <span className="text-gray-600">·</span>
                <time
                  dateTime={article.publishedAt}
                  title={formattedTime.absolute}
                >
                  {formattedTime.relative}
                </time>
                <RecentIndicator publishedAt={article.publishedAt} />
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <CategoryTags categories={article.category} />
                <RelevanceBadge article={article} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Vertical layout */}
        <div className="relative flex sm:hidden flex-col bg-[#1f1f1f] backdrop-blur-xl border border-[#2a2a2a] hover:border-[#3a3a3a] focus-within:border-[rgba(97,7,224,0.45)] focus-within:ring-2 focus-within:ring-[rgba(97,7,224,0.25)] focus-within:ring-offset-2 focus-within:ring-offset-[#0f0f0f] rounded-2xl overflow-hidden transition-all duration-300 outline-none shadow-[0_24px_40px_rgba(0,0,0,0.35)] hover:shadow-[0_30px_55px_rgba(0,0,0,0.45)]">
          {/* Hover glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[rgba(97,7,224,0.18)] via-transparent to-[rgba(255,215,0,0.12)] rounded-2xl pointer-events-none" />

          {/* Image - Full width */}
          <div className="relative w-full aspect-video bg-[#2a2a2a]">
            <ImageWithFallback
              src={article.imageUrl}
              alt={article.title}
              fill
              className="relative w-full h-full"
              imageClassName="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="100vw"
              loading={shouldPrioritizeImage ? 'eager' : 'lazy'}
              priority={shouldPrioritizeImage}
            />
            {/* New indicator on image */}
            <div className="absolute top-2 right-2">
              <RecentIndicator publishedAt={article.publishedAt} />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            {/* Title */}
            <h3 className="text-lg font-semibold text-white group-hover:text-[#c8acff] transition-colors line-clamp-2 leading-tight">
              {article.title}
            </h3>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="text-gray-400 font-medium truncate">{article.source}</span>
              <span className="text-gray-600">·</span>
                <time
                  dateTime={article.publishedAt}
                  title={formattedTime.absolute}
                  className="truncate"
                >
                  {formattedTime.relative}
                </time>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <CategoryTags categories={article.category} />
              </div>
            </div>
          </div>
        </div>
      </motion.article>
      </>
    );
  }

  // Grid view (default)
  return (
    <>
      <NewsArticleSchema article={article} />
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className={`group cursor-pointer ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Read article: ${article.title}`}
    >
      <div className="relative h-full min-h-[440px] flex flex-col bg-[#1f1f1f] backdrop-blur-xl border border-[#2a2a2a] hover:border-[#3a3a3a] focus-within:border-[rgba(97,7,224,0.45)] focus-within:ring-2 focus-within:ring-[rgba(97,7,224,0.25)] focus-within:ring-offset-2 focus-within:ring-offset-[#0f0f0f] rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_24px_40px_rgba(0,0,0,0.35)] hover:shadow-[0_30px_55px_rgba(0,0,0,0.45)] outline-none will-change-transform">
        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[rgba(97,7,224,0.18)] via-transparent to-[rgba(255,215,0,0.12)] rounded-2xl pointer-events-none" />

        {/* Image - Fixed height for consistency */}
        <div className="relative w-full h-48 overflow-hidden flex-shrink-0 bg-[#2a2a2a] z-10">
          <ImageWithFallback
            src={article.imageUrl}
            alt={article.title}
            fill
            className="relative w-full h-full"
            imageClassName="object-cover group-hover:scale-105 transition-transform duration-200 will-change-transform"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            loading={shouldPrioritizeImage ? 'eager' : 'lazy'}
            priority={shouldPrioritizeImage}
          />

          {/* Only show "New" indicator on image */}
          <div className="absolute top-3 right-3">
            <RecentIndicator publishedAt={article.publishedAt} />
          </div>
        </div>

        {/* Content - Flex grow to fill space */}
        <div className="relative z-10 flex flex-col flex-1 p-5">
          {/* Title - Improved size and spacing */}
          <h3 className="text-xl font-semibold text-white group-hover:text-[#ffd700] transition-colors line-clamp-2 leading-tight mb-3">
            {article.title}
          </h3>

          {/* Description - Improved contrast */}
          <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed mb-auto">
            {article.description}
          </p>

          {/* Footer - Better spacing, no border */}
          <div className="mt-6 space-y-3">
            {/* Source and time grouped together */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="text-gray-400 font-medium">{article.source}</span>
              <span className="text-gray-600">·</span>
              <time
                dateTime={article.publishedAt}
                title={formattedTime.absolute}
              >
                {formattedTime.relative}
              </time>
            </div>

            {/* Categories and relevance badge - horizontal grouping */}
            <div className="flex items-center gap-2">
              <CategoryTags categories={article.category} />
              {/* Progressive disclosure: Show relevance badge on hover/focus */}
              <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                <RelevanceBadge article={article} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
    </>
  );
}

// ============================================================================
// Export
// ============================================================================

export default NewsCard;
