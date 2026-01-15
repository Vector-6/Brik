/**
 * Relevance Indicator Utilities
 * Helper functions for determining and displaying relevance information
 */

import { NewsArticle } from '@/lib/types/news.types';

// ============================================================================
// Constants
// ============================================================================

/** Threshold for showing "Highly Relevant" badge */
export const HIGH_RELEVANCE_THRESHOLD = 0.8;

/** Threshold for showing "Relevant" badge */
export const MEDIUM_RELEVANCE_THRESHOLD = 0.5;

/** Threshold for showing any relevance indicator */
export const MIN_RELEVANCE_THRESHOLD = 0.1;

// ============================================================================
// Types
// ============================================================================

export type RelevanceLevel = 'high' | 'medium' | 'low' | 'none';

export interface RelevanceInfo {
  /** Relevance level category */
  level: RelevanceLevel;
  /** Display label for the relevance */
  label: string;
  /** CSS class name for styling */
  className: string;
  /** Whether to show a badge */
  showBadge: boolean;
  /** Badge color/variant */
  badgeVariant: 'success' | 'info' | 'warning' | 'default';
  /** Numeric score (0-1) */
  score: number;
}

// ============================================================================
// Relevance Functions
// ============================================================================

/**
 * Get relevance level from score
 *
 * @param score - Relevance score (0-1)
 * @returns Relevance level category
 *
 * @example
 * getRelevanceLevel(0.9) // 'high'
 * getRelevanceLevel(0.6) // 'medium'
 * getRelevanceLevel(0.3) // 'low'
 * getRelevanceLevel(0.05) // 'none'
 */
export function getRelevanceLevel(score: number = 0): RelevanceLevel {
  if (score >= HIGH_RELEVANCE_THRESHOLD) {
    return 'high';
  } else if (score >= MEDIUM_RELEVANCE_THRESHOLD) {
    return 'medium';
  } else if (score >= MIN_RELEVANCE_THRESHOLD) {
    return 'low';
  } else {
    return 'none';
  }
}

/**
 * Get comprehensive relevance information
 *
 * @param score - Relevance score (0-1)
 * @returns Complete relevance information object
 *
 * @example
 * const info = getRelevanceInfo(0.9);
 * console.log(info.label); // "Highly Relevant"
 * console.log(info.showBadge); // true
 * console.log(info.badgeVariant); // "success"
 */
export function getRelevanceInfo(score: number = 0): RelevanceInfo {
  const level = getRelevanceLevel(score);

  switch (level) {
    case 'high':
      return {
        level,
        label: 'Highly Relevant',
        className: 'relevance-high',
        showBadge: true,
        badgeVariant: 'success',
        score,
      };
    case 'medium':
      return {
        level,
        label: 'Relevant',
        className: 'relevance-medium',
        showBadge: true,
        badgeVariant: 'info',
        score,
      };
    case 'low':
      return {
        level,
        label: 'Somewhat Relevant',
        className: 'relevance-low',
        showBadge: false, // Don't show badge for low relevance
        badgeVariant: 'default',
        score,
      };
    case 'none':
    default:
      return {
        level: 'none',
        label: '',
        className: 'relevance-none',
        showBadge: false,
        badgeVariant: 'default',
        score,
      };
  }
}

/**
 * Check if article should show relevance badge
 *
 * @param article - News article
 * @returns Whether to show relevance badge
 */
export function shouldShowRelevanceBadge(article: NewsArticle): boolean {
  const info = getRelevanceInfo(article.relevanceScore);
  return info.showBadge;
}

/**
 * Get relevance badge text for article
 *
 * @param article - News article
 * @returns Badge text or null if no badge should be shown
 */
export function getRelevanceBadgeText(article: NewsArticle): string | null {
  const info = getRelevanceInfo(article.relevanceScore);
  return info.showBadge ? info.label : null;
}

/**
 * Get relevance badge variant for article
 *
 * @param article - News article
 * @returns Badge variant for styling
 */
export function getRelevanceBadgeVariant(article: NewsArticle): RelevanceInfo['badgeVariant'] {
  const info = getRelevanceInfo(article.relevanceScore);
  return info.badgeVariant;
}

/**
 * Filter articles by minimum relevance score
 *
 * @param articles - Array of news articles
 * @param minScore - Minimum relevance score (default: 0.1)
 * @returns Filtered articles array
 */
export function filterByRelevance(
  articles: NewsArticle[],
  minScore: number = MIN_RELEVANCE_THRESHOLD
): NewsArticle[] {
  return articles.filter(article =>
    (article.relevanceScore ?? 0) >= minScore
  );
}

/**
 * Get articles with high relevance only
 *
 * @param articles - Array of news articles
 * @returns High relevance articles only
 */
export function getHighRelevanceArticles(articles: NewsArticle[]): NewsArticle[] {
  return filterByRelevance(articles, HIGH_RELEVANCE_THRESHOLD);
}

/**
 * Calculate relevance distribution for analytics
 *
 * @param articles - Array of news articles
 * @returns Distribution of relevance levels
 */
export function getRelevanceDistribution(articles: NewsArticle[]): Record<RelevanceLevel, number> {
  const distribution: Record<RelevanceLevel, number> = {
    high: 0,
    medium: 0,
    low: 0,
    none: 0,
  };

  articles.forEach(article => {
    const level = getRelevanceLevel(article.relevanceScore);
    distribution[level]++;
  });

  return distribution;
}

/**
 * Format relevance score as percentage
 *
 * @param score - Relevance score (0-1)
 * @returns Formatted percentage string
 */
export function formatRelevanceScore(score: number = 0): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Get color for relevance visualization
 *
 * @param score - Relevance score (0-1)
 * @returns CSS color value
 */
export function getRelevanceColor(score: number = 0): string {
  const level = getRelevanceLevel(score);

  switch (level) {
    case 'high':
      return '#10b981'; // green-500
    case 'medium':
      return '#3b82f6'; // blue-500
    case 'low':
      return '#f59e0b'; // amber-500
    case 'none':
    default:
      return '#6b7280'; // gray-500
  }
}
