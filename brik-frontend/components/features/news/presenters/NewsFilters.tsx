/**
 * NewsFilters Component
 * Filter controls for sorting and view mode of news articles
 */

'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { NewsSortOption, NewsViewMode } from '@/lib/types/news.types';
import Portal from '@/components/ui/common/Portal';
import { Z_INDEX } from '@/lib/constants/zIndex';

// ============================================================================
// Types
// ============================================================================

interface NewsFiltersProps {
  /** Current sort option */
  sort: NewsSortOption;
  /** Current view mode */
  viewMode: NewsViewMode;
  /** Total articles count for display */
  totalArticles: number;
  /** Whether more articles are available */
  hasMore: boolean;
  /** Sort change handler */
  onSortChange: (sort: NewsSortOption) => void;
  /** View mode change handler */
  onViewModeChange: (viewMode: NewsViewMode) => void;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Dropdown Component
// ============================================================================

interface DropdownProps {
  /** Current selected value */
  value: string;
  /** Available options */
  options: Array<{ value: string; label: string }>;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

function Dropdown({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  // Calculate dropdown position
  useEffect(() => {
    function updateDropdownPosition() {
      if (buttonRef.current && isOpen) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4, // mt-1 = 4px
          left: rect.left,
          width: rect.width,
        });
      } else {
        setDropdownPosition(null);
      }
    }

    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
    }

    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-white bg-[rgba(31,31,31,0.88)] backdrop-blur-xl border border-[#2a2a2a] rounded-xl hover:border-[#3a3a3a] hover:bg-[rgba(31,31,31,0.94)] focus:outline-none focus:ring-2 focus:ring-[rgba(97,7,224,0.45)] focus:border-[rgba(97,7,224,0.45)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_18px_36px_rgba(0,0,0,0.35)]"
      >
        <span>{selectedOption?.label || placeholder}</span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && dropdownPosition && (
        <>
          {/* Backdrop */}
          <Portal>
            <div
              className={`fixed inset-0 ${Z_INDEX.DROPDOWN}`}
              style={{ zIndex: 39 }}
              onClick={() => setIsOpen(false)}
            />
          </Portal>

          {/* Dropdown menu - Portaled to escape clipping contexts */}
          <Portal>
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
              }}
              className={`bg-[rgba(28,28,28,0.98)] backdrop-blur-xl border border-[#2a2a2a] rounded-xl shadow-[0_24px_40px_rgba(0,0,0,0.45)] overflow-hidden ${Z_INDEX.DROPDOWN}`}
            >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-sm text-left transition-colors duration-200 ${
                  option.value === value
                    ? 'bg-[rgba(97,7,224,0.22)] text-white'
                    : 'text-gray-300 hover:bg-[rgba(42,42,42,0.65)] hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
          </Portal>
        </>
      )}
    </div>
  );
}

// ============================================================================
// View Mode Toggle Component
// ============================================================================

interface ViewModeToggleProps {
  /** Current view mode */
  value: NewsViewMode;
  /** Change handler */
  onChange: (viewMode: NewsViewMode) => void;
  /** Disabled state */
  disabled?: boolean;
}

function ViewModeToggle({ value, onChange, disabled = false }: ViewModeToggleProps) {
  const options = [
    {
      value: 'grid' as NewsViewMode,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      label: 'Grid View'
    },
    {
      value: 'list' as NewsViewMode,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ),
      label: 'List View'
    },
  ];

  return (
    <div className="flex border border-[#2a2a2a] rounded-xl overflow-hidden bg-[rgba(31,31,31,0.88)] backdrop-blur-xl shadow-[0_18px_36px_rgba(0,0,0,0.35)]" role="group" aria-label="View mode selection">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => !disabled && onChange(option.value)}
          disabled={disabled}
          className={`px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[rgba(97,7,224,0.4)] focus:ring-inset focus:z-10 disabled:opacity-50 disabled:cursor-not-allowed ${
            option.value === value
              ? 'bg-[rgba(97,7,224,0.24)] text-white shadow-[0_20px_40px_rgba(97,7,224,0.18)]'
              : 'bg-transparent text-gray-300 hover:bg-[rgba(42,42,42,0.65)] hover:text-white'
          }`}
          title={option.label}
          aria-label={option.label}
          aria-pressed={option.value === value}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Results Counter Component
// ============================================================================

interface ResultsCounterProps {
  /** Total articles count */
  totalArticles: number;
  /** Whether more articles are available */
  hasMore: boolean;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Compact mode for mobile */
  compact?: boolean;
}

function ResultsCounter({ totalArticles, hasMore, isLoading = false, compact = false }: ResultsCounterProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-600 border-t-purple-500" />
        {compact ? 'Loading...' : 'Loading articles...'}
      </div>
    );
  }

  if (totalArticles === 0) {
    return (
      <div className="text-sm text-gray-500">
        {compact ? 'No articles' : 'No articles found'}
      </div>
    );
  }

  const estimatedTotal = hasMore ? `${totalArticles}+` : totalArticles.toString();

  if (compact) {
    return (
      <div className="text-sm text-gray-400">
        <span className="font-medium text-white">{totalArticles}</span> {hasMore ? 'of ' : ''}
        {hasMore && <span className="font-medium text-white">{estimatedTotal}</span>}
        {!hasMore && 'articles'}
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-400">
      Showing <span className="font-medium text-white">{totalArticles}</span> of{' '}
      <span className="font-medium text-white">{estimatedTotal}</span> articles
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function NewsFilters({
  sort,
  viewMode,
  totalArticles,
  hasMore,
  onSortChange,
  onViewModeChange,
  isLoading = false,
  className = '',
}: NewsFiltersProps) {
  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'date', label: 'Most Recent' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`py-6 bg-[#1f1f1f] backdrop-blur-xl rounded-xl border border-[#2a2a2a] shadow-[0_24px_40px_rgba(0,0,0,0.35)] ${className}`}
      role="region"
      aria-label="News filters and sorting"
    >
      {/* Desktop layout (md and up) */}
      <div className="hidden md:flex items-center justify-between gap-4 max-w-7xl mx-auto px-4">
        {/* Left side - Results counter */}
        <ResultsCounter
          totalArticles={totalArticles}
          hasMore={hasMore}
          isLoading={isLoading}
        />

        {/* Right side - Controls */}
        <div className="flex items-center gap-4">
          {/* Sort dropdown */}
          <div className="min-w-[140px]">
            <Dropdown
              value={sort}
              options={sortOptions}
              onChange={(value) => onSortChange(value as NewsSortOption)}
              disabled={isLoading}
              placeholder="Sort by..."
            />
          </div>

          {/* View mode toggle */}
          <ViewModeToggle
            value={viewMode}
            onChange={onViewModeChange}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Tablet layout (sm to md) */}
      <div className="hidden sm:flex md:hidden flex-col gap-3 max-w-7xl mx-auto px-4">
        <ResultsCounter
          totalArticles={totalArticles}
          hasMore={hasMore}
          isLoading={isLoading}
        />
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Dropdown
              value={sort}
              options={sortOptions}
              onChange={(value) => onSortChange(value as NewsSortOption)}
              disabled={isLoading}
              placeholder="Sort by..."
            />
          </div>
          <ViewModeToggle
            value={viewMode}
            onChange={onViewModeChange}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Mobile layout (< sm) */}
      <div className="flex sm:hidden flex-col gap-3 px-4">
        <ResultsCounter
          totalArticles={totalArticles}
          hasMore={hasMore}
          isLoading={isLoading}
          compact={true}
        />
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <Dropdown
              value={sort}
              options={sortOptions}
              onChange={(value) => onSortChange(value as NewsSortOption)}
              disabled={isLoading}
              placeholder="Sort..."
            />
          </div>
          <ViewModeToggle
            value={viewMode}
            onChange={onViewModeChange}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* ARIA live region for screen readers */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {isLoading ? 'Loading articles' : `Showing ${totalArticles} articles`}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Mobile-optimized Filters
// ============================================================================

export function MobileNewsFilters({
  sort,
  viewMode,
  totalArticles,
  hasMore,
  onSortChange,
  onViewModeChange,
  isLoading = false,
  className = '',
}: NewsFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-3 py-4 border-b border-[#2a2a2a] ${className}`}
      role="region"
      aria-label="News filters and sorting"
    >
      {/* Results counter - compact for mobile */}
      <ResultsCounter
        totalArticles={totalArticles}
        hasMore={hasMore}
        isLoading={isLoading}
        compact={true}
      />

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <Dropdown
            value={sort}
            options={[
              { value: 'relevance', label: 'Most Relevant' },
              { value: 'date', label: 'Most Recent' },
            ]}
            onChange={(value) => onSortChange(value as NewsSortOption)}
            disabled={isLoading}
            placeholder="Sort..."
          />
        </div>

        <ViewModeToggle
          value={viewMode}
          onChange={onViewModeChange}
          disabled={isLoading}
        />
      </div>

      {/* ARIA live region for screen readers */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {isLoading ? 'Loading articles' : `Showing ${totalArticles} articles`}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Export
// ============================================================================

export default NewsFilters;
