/**
 * Search Utilities
 * Helper functions for global search functionality
 */

import Fuse from 'fuse.js';
import { ExploreToken } from '@/lib/types/explore.types';
import { SearchablePages } from '@/lib/types/search.types';

// ============================================================================
// Search Configuration
// ============================================================================

export const SEARCHABLE_PAGES: SearchablePages[] = [
  {
    name: 'Swap',
    href: '/swap',
    keywords: ['swap', 'trade', 'exchange', 'convert'],
    description: 'Swap tokens',
  },
  {
    name: 'Explore',
    href: '/explore',
    keywords: ['explore', 'browse', 'discover', 'tokens', 'rwa'],
    description: 'Explore RWA tokens',
  },
  {
    name: 'Portfolio',
    href: '/portfolio',
    keywords: ['portfolio', 'holdings', 'balance', 'wallet', 'assets'],
    description: 'View your portfolio',
  },
  {
    name: 'News',
    href: '/news',
    keywords: ['news', 'updates', 'articles', 'blog'],
    description: 'Latest news',
  },
  {
    name: 'About',
    href: '/about',
    keywords: ['about', 'team', 'company', 'mission'],
    description: 'About Brik',
  },
  {
    name: 'Contact',
    href: '/contact',
    keywords: ['contact', 'support', 'help', 'email'],
    description: 'Contact us',
  },
];

// ============================================================================
// Fuse.js Configurations
// ============================================================================

export const tokenFuseConfig = {
  keys: ['symbol', 'name'],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 1,
};

export const pageFuseConfig = {
  keys: ['name', 'keywords', 'description'],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
};

// ============================================================================
// Search Functions
// ============================================================================

/**
 * Create Fuse instance for token search
 */
export function createTokenSearchIndex(tokens: ExploreToken[]) {
  return new Fuse(tokens, tokenFuseConfig);
}

/**
 * Create Fuse instance for page search
 */
export function createPageSearchIndex() {
  return new Fuse(SEARCHABLE_PAGES, pageFuseConfig);
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(query: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(query.trim());
}

/**
 * Format search query
 */
export function formatSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
