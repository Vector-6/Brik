/**
 * GlobalSearch Component
 * Search bar with fuzzy search for navbar
 */

'use client';

import { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalSearch } from '@/lib/hooks/useGlobalSearch';
import GlobalSearchResults from './GlobalSearchResults';

// ============================================================================
// Component
// ============================================================================

interface GlobalSearchProps {
  isMobile?: boolean;
  onResultClick?: () => void;
}

export default function GlobalSearch({ isMobile = false, onResultClick }: GlobalSearchProps) {
  const {
    query,
    setQuery,
    results,
    isOpen,
    setIsOpen,
    isLoading,
    selectedIndex,
    setSelectedIndex,
  } = useGlobalSearch();

  const inputRef = useRef<HTMLInputElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (inputRef.current && !inputRef.current.contains(target)) {
        const resultsPanel = document.getElementById('search-results');
        if (resultsPanel && !resultsPanel.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  // Handle search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results[selectedIndex]) {
      // Handle navigation based on result type
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div className={`relative ${isMobile ? 'w-full' : 'w-full max-w-lg'}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search
          className="absolute left-4  top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-200/60"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={isMobile ? "Search..." : "Search tokens, wallets, or features..."}
          className={`w-full pl-11 px-4 pr-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm text-white placeholder-yellow-200/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all ${
            isMobile ? 'py-2.5' : 'py-2.5'
          }`}
          aria-label="Global search"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-200/60 hover:text-yellow-200 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <GlobalSearchResults
            results={results}
            isLoading={isLoading}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            onClose={() => {
              setIsOpen(false);
              setQuery('');
              onResultClick?.();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
