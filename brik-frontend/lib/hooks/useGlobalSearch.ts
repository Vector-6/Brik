/**
 * useGlobalSearch Hook
 * Manages global search state and fuzzy search logic
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchExploreData } from '@/lib/api/endpoints/explore';
import {
  SearchResult,
  TokenSearchResult,
  PageSearchResult,
  WalletSearchResult,
} from '@/lib/types/search.types';
import {
  createTokenSearchIndex,
  createPageSearchIndex,
  isValidAddress,
  formatSearchQuery,
  debounce,
  SEARCHABLE_PAGES,
} from '@/lib/utils/searchUtils';

// ============================================================================
// Hook
// ============================================================================

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fetch tokens for search
  const { data: exploreData, isLoading } = useQuery({
    queryKey: ['explore-tokens'],
    queryFn: fetchExploreData,
    staleTime: 15 * 60 * 1000,
  });

  // Debounce search query
  const debouncedSetQuery = useMemo(
    () => debounce((value: string) => setDebouncedQuery(value), 300),
    []
  );

  useEffect(() => {
    debouncedSetQuery(query);
  }, [query, debouncedSetQuery]);

  // Create search indices
  const tokenSearchIndex = useMemo(() => {
    if (!exploreData?.tokens) return null;
    return createTokenSearchIndex(exploreData.tokens);
  }, [exploreData?.tokens]);

  const pageSearchIndex = useMemo(() => createPageSearchIndex(), []);

  // Perform search
  const results: SearchResult[] = useMemo(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) return [];

    const formattedQuery = formatSearchQuery(debouncedQuery);
    const allResults: SearchResult[] = [];

    // Search tokens
    if (tokenSearchIndex) {
      const tokenResults = tokenSearchIndex.search(formattedQuery);
      tokenResults.slice(0, 5).forEach((result) => {
        const token = result.item;
        allResults.push({
          id: `token-${token.symbol}`,
          type: 'token',
          title: token.symbol,
          subtitle: token.name,
          token,
        } as TokenSearchResult);
      });
    }

    // Search pages
    const pageResults = pageSearchIndex.search(formattedQuery);
    pageResults.slice(0, 4).forEach((result) => {
      const page = result.item;
      allResults.push({
        id: `page-${page.href}`,
        type: 'page',
        title: page.name,
        subtitle: page.description,
        href: page.href,
      } as PageSearchResult);
    });

    // Check for wallet address
    if (isValidAddress(debouncedQuery)) {
      allResults.unshift({
        id: 'wallet-address',
        type: 'wallet',
        title: 'Go to Wallet',
        subtitle: debouncedQuery,
        address: debouncedQuery,
      } as WalletSearchResult);
    }

    return allResults;
  }, [debouncedQuery, tokenSearchIndex, pageSearchIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setQuery('');
          break;
      }
    },
    [isOpen, results.length]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    query,
    setQuery,
    results,
    isOpen,
    setIsOpen,
    isLoading,
    selectedIndex,
    setSelectedIndex,
  };
}
