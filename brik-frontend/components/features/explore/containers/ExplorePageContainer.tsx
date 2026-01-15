"use client";

import React from "react";
import { ExploreFilters } from "@/lib/types/explore.types";
import { useExploreData } from "../hooks/useExploreData";
import { useExploreFilters } from "../hooks/useExploreFilters";
import { useExploreSorting } from "../hooks/useExploreSorting";
import FilterBarPresenter from "../presenters/FilterBarPresenter";
import ExploreGridPresenter from "../presenters/ExploreGridPresenter";
import { GradientText } from "@/components/ui/common";

/**
 * Main container component for the Explore page
 * Orchestrates data fetching, filtering, sorting, and presentation
 */
export default function ExplorePageContainer() {
  // Fetch explore data
  const { data, isLoading, error, refetch } = useExploreData();

  // Apply filters to the fetched data
  const {
    filteredTokens,
    filters,
    setCategories,
    setChains,
    setApyRange,
    setSearchQuery,
    clearFilters,
  } = useExploreFilters(data?.tokens ?? []);

  // Apply sorting to the filtered data
  const { sortedTokens, sortBy, setSortBy } = useExploreSorting(filteredTokens);

  // Handle filter changes from FilterBar
  const handleFilterChange = React.useCallback((newFilters: ExploreFilters) => {
    setCategories(newFilters.categories);
    setChains(newFilters.chains);
    setApyRange(newFilters.apyRange);
    setSearchQuery(newFilters.searchQuery);
  }, [setCategories, setChains, setApyRange, setSearchQuery]);

  // Count active filters
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.chains.length > 0) count++;
    if (filters.apyRange[0] > 0 || filters.apyRange[1] < 100) count++;
    if (filters.searchQuery.trim()) count++;
    return count;
  }, [filters]);

  // Extract unique categories and chains for filter dropdowns
  const uniqueCategories = React.useMemo(() => {
    if (!data?.tokens) return [];
    const categories = new Set<string>();
    data.tokens.forEach((token) => {
      token.category.forEach((cat) => categories.add(cat));
    });
    return Array.from(categories);
  }, [data?.tokens]);

  const uniqueChains = React.useMemo(() => {
    if (!data?.tokens) return [];
    const chains = new Set<string>();
    data.tokens.forEach((token) => {
      token.chainsAvailable.forEach((chain) => chains.add(chain));
    });
    return Array.from(chains);
  }, [data?.tokens]);

  return (
    <div className="min-h-screen mt-24 bg-gradient-to-br from-[#1c1c1c] via-[#1b1b1b] to-[#161616]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects - More Subtle */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[rgba(97,7,224,0.12)] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[rgba(255,215,0,0.08)] rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto">
          {/* Heading with Better Spacing and Toned-Down Gradient */}
          <div className="text-center mb-16">
            <h1 
            className="font-burbank mb-6 animate-gradient"
            style={{ 
              fontWeight: 700,
              fontSize: '74px',
              background: 'linear-gradient(90deg, #870BDD 0%, #FF0CE7 50%, #870BDD 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: '64px',
              letterSpacing: '0.02em',
              animation: 'gradient-flow 3s ease infinite'
            }}
          >
              Explore Real World Assets
            </h1>
            <p className="text-lg sm:text-xl text-gray-300/90 max-w-3xl mx-auto leading-relaxed px-4">
              Discover tokenized real-world assets across multiple blockchains.
              Compare yields, track performance, and find the perfect investment
              opportunities.
            </p>
          </div>

          {/* Filter Bar with Increased Top Margin */}
          <div className="mt-12">
            <FilterBarPresenter
              filters={filters}
              sortBy={sortBy}
              onFilterChange={handleFilterChange}
              onSortChange={setSortBy}
              onClearFilters={clearFilters}
              availableCategories={uniqueCategories}
              availableChains={uniqueChains}
              totalResults={sortedTokens.length}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </div>
      </section>

      {/* Explore Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24" aria-labelledby="token-grid-heading">
        <div className="max-w-7xl mx-auto">
          {/* Add H2 heading for proper hierarchy and accessibility */}
          <h2 id="token-grid-heading" className="sr-only">
            Available Token Listings
          </h2>
          <ExploreGridPresenter
            tokens={sortedTokens}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
          />
        </div>
      </section>
    </div>
  );
}
