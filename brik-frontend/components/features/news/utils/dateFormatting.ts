/**
 * Date Formatting Utilities
 * Helper functions for formatting news article dates
 */

import { FormattedTime } from '@/lib/types/news.types';

// ============================================================================
// Date Formatting Functions
// ============================================================================

/**
 * Format ISO date string to relative time (e.g., "2 hours ago")
 *
 * @param isoString - ISO 8601 date string
 * @returns Formatted relative time string
 *
 * @example
 * formatRelativeTime("2025-10-26T10:30:00Z") // "2 hours ago"
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
    } else {
      return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Unknown';
  }
}

/**
 * Format ISO date string to absolute date (e.g., "October 26, 2025")
 *
 * @param isoString - ISO 8601 date string
 * @returns Formatted absolute date string
 *
 * @example
 * formatAbsoluteDate("2025-10-26T10:30:00Z") // "October 26, 2025"
 */
export function formatAbsoluteDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting absolute date:', error);
    return 'Unknown date';
  }
}

/**
 * Format ISO date string to short date (e.g., "Oct 26, 2025")
 *
 * @param isoString - ISO 8601 date string
 * @returns Formatted short date string
 *
 * @example
 * formatShortDate("2025-10-26T10:30:00Z") // "Oct 26, 2025"
 */
export function formatShortDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting short date:', error);
    return 'Unknown';
  }
}

/**
 * Get comprehensive formatted time information
 *
 * @param isoString - ISO 8601 date string
 * @returns Object with relative, absolute, and ISO formats
 *
 * @example
 * const time = getFormattedTime("2025-10-26T10:30:00Z");
 * console.log(time.relative); // "2 hours ago"
 * console.log(time.absolute); // "October 26, 2025"
 * console.log(time.iso); // "2025-10-26T10:30:00Z"
 */
export function getFormattedTime(isoString: string): FormattedTime {
  return {
    relative: formatRelativeTime(isoString),
    absolute: formatAbsoluteDate(isoString),
    iso: isoString,
  };
}

/**
 * Check if a date is within the last N days
 *
 * @param isoString - ISO 8601 date string
 * @param days - Number of days to check against
 * @returns Whether the date is within the last N days
 *
 * @example
 * isWithinDays("2025-10-26T10:30:00Z", 7) // true if within last 7 days
 */
export function isWithinDays(isoString: string, days: number): boolean {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays <= days;
  } catch (error) {
    console.error('Error checking date range:', error);
    return false;
  }
}

/**
 * Check if a date is recent (within last 24 hours)
 *
 * @param isoString - ISO 8601 date string
 * @returns Whether the date is within the last 24 hours
 */
export function isRecent(isoString: string): boolean {
  return isWithinDays(isoString, 1);
}

/**
 * Sort articles by date (newest first)
 *
 * @param articles - Array of articles with publishedAt field
 * @returns Sorted articles array
 */
export function sortByDate<T extends { publishedAt: string }>(articles: T[]): T[] {
  return [...articles].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

/**
 * Sort articles by relevance score (highest first), then by date
 *
 * @param articles - Array of articles with optional relevanceScore and publishedAt
 * @returns Sorted articles array
 */
export function sortByRelevance<T extends { publishedAt: string; relevanceScore?: number }>(
  articles: T[]
): T[] {
  return [...articles].sort((a, b) => {
    const scoreA = a.relevanceScore ?? 0;
    const scoreB = b.relevanceScore ?? 0;

    // If relevance scores are significantly different, sort by score
    if (Math.abs(scoreA - scoreB) > 0.1) {
      return scoreB - scoreA;
    }

    // Otherwise, sort by date (newest first)
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}
