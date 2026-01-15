/**
 * Filter Bar Presenter
 * Filter controls with search, dropdowns, and sorting
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterBarProps } from "@/lib/types/explore.types";
import { getSortOptions, getSortLabel } from "../utils/exploreSorting";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Z_INDEX } from "@/lib/constants/zIndex";
import Portal from "@/components/ui/common/Portal";

// ============================================================================
// Component
// ============================================================================

export default function FilterBarPresenter({
  filters,
  sortBy,
  onFilterChange,
  onSortChange,
  onClearFilters,
  availableCategories,
  availableChains,
  totalResults,
  activeFilterCount,
}: FilterBarProps) {
  // Dropdown states
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [apyPanelOpen, setApyPanelOpen] = useState(false);

  // Position states for portaled dropdowns
  const [categoryPosition, setCategoryPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [chainPosition, setChainPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [apyPosition, setApyPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [sortPosition, setSortPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // Refs for buttons and dropdowns
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const chainButtonRef = useRef<HTMLButtonElement>(null);
  const chainDropdownRef = useRef<HTMLDivElement>(null);
  const apyButtonRef = useRef<HTMLButtonElement>(null);
  const apyDropdownRef = useRef<HTMLDivElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown positions
  useEffect(() => {
    function updateCategoryPosition() {
      if (categoryButtonRef.current && categoryDropdownOpen) {
        const rect = categoryButtonRef.current.getBoundingClientRect();
        setCategoryPosition({
          top: rect.bottom + 12, // mt-3 = 12px
          left: rect.left,
          width: 256, // w-64 = 256px
        });
      } else {
        setCategoryPosition(null);
      }
    }

    function updateChainPosition() {
      if (chainButtonRef.current && chainDropdownOpen) {
        const rect = chainButtonRef.current.getBoundingClientRect();
        setChainPosition({
          top: rect.bottom + 12,
          left: rect.left,
          width: 256,
        });
      } else {
        setChainPosition(null);
      }
    }

    function updateApyPosition() {
      if (apyButtonRef.current && apyPanelOpen) {
        const rect = apyButtonRef.current.getBoundingClientRect();
        setApyPosition({
          top: rect.bottom + 12,
          left: rect.left,
          width: 320, // w-80 = 320px
        });
      } else {
        setApyPosition(null);
      }
    }

    function updateSortPosition() {
      if (sortButtonRef.current && sortDropdownOpen) {
        const rect = sortButtonRef.current.getBoundingClientRect();
        setSortPosition({
          top: rect.bottom + 12,
          left: rect.right - 256, // w-64 = 256px, align right
          width: 256,
        });
      } else {
        setSortPosition(null);
      }
    }

    if (categoryDropdownOpen) {
      updateCategoryPosition();
      window.addEventListener("scroll", updateCategoryPosition, true);
      window.addEventListener("resize", updateCategoryPosition);
    }
    if (chainDropdownOpen) {
      updateChainPosition();
      window.addEventListener("scroll", updateChainPosition, true);
      window.addEventListener("resize", updateChainPosition);
    }
    if (apyPanelOpen) {
      updateApyPosition();
      window.addEventListener("scroll", updateApyPosition, true);
      window.addEventListener("resize", updateApyPosition);
    }
    if (sortDropdownOpen) {
      updateSortPosition();
      window.addEventListener("scroll", updateSortPosition, true);
      window.addEventListener("resize", updateSortPosition);
    }

    return () => {
      window.removeEventListener("scroll", updateCategoryPosition, true);
      window.removeEventListener("resize", updateCategoryPosition);
      window.removeEventListener("scroll", updateChainPosition, true);
      window.removeEventListener("resize", updateChainPosition);
      window.removeEventListener("scroll", updateApyPosition, true);
      window.removeEventListener("resize", updateApyPosition);
      window.removeEventListener("scroll", updateSortPosition, true);
      window.removeEventListener("resize", updateSortPosition);
    };
  }, [categoryDropdownOpen, chainDropdownOpen, apyPanelOpen, sortDropdownOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        categoryDropdownOpen &&
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(target) &&
        categoryButtonRef.current &&
        !categoryButtonRef.current.contains(target)
      ) {
        setCategoryDropdownOpen(false);
      }
      if (
        chainDropdownOpen &&
        chainDropdownRef.current &&
        !chainDropdownRef.current.contains(target) &&
        chainButtonRef.current &&
        !chainButtonRef.current.contains(target)
      ) {
        setChainDropdownOpen(false);
      }
      if (
        sortDropdownOpen &&
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(target) &&
        sortButtonRef.current &&
        !sortButtonRef.current.contains(target)
      ) {
        setSortDropdownOpen(false);
      }
      if (
        apyPanelOpen &&
        apyDropdownRef.current &&
        !apyDropdownRef.current.contains(target) &&
        apyButtonRef.current &&
        !apyButtonRef.current.contains(target)
      ) {
        setApyPanelOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCategoryDropdownOpen(false);
        setChainDropdownOpen(false);
        setSortDropdownOpen(false);
        setApyPanelOpen(false);
      }
    };

    if (
      categoryDropdownOpen ||
      chainDropdownOpen ||
      sortDropdownOpen ||
      apyPanelOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [categoryDropdownOpen, chainDropdownOpen, sortDropdownOpen, apyPanelOpen]);

  // Handle category toggle
  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  // Handle chain toggle
  const toggleChain = (chain: string) => {
    const newChains = filters.chains.includes(chain)
      ? filters.chains.filter((c) => c !== chain)
      : [...filters.chains, chain];
    onFilterChange({ ...filters, chains: newChains });
  };

  // Handle APY range change
  const handleApyChange = (value: number, index: 0 | 1) => {
    const newRange: [number, number] = [...filters.apyRange];
    newRange[index] = value;

    // Ensure min is not greater than max
    if (index === 0 && newRange[0] > newRange[1]) {
      newRange[1] = newRange[0];
    }
    if (index === 1 && newRange[1] < newRange[0]) {
      newRange[0] = newRange[1];
    }

    onFilterChange({ ...filters, apyRange: newRange });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#1f1f1f] backdrop-blur-xl border border-[#2a2a2a] rounded-2xl p-8 shadow-[0_24px_40px_rgba(0,0,0,0.35)]"
    >
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center">
        {/* Search Bar - More Prominent */}
        <div className="relative flex-1 lg:max-w-xl">
          <label htmlFor="token-search" className="sr-only">
            Search for tokens by name or symbol
          </label>
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors"
            aria-hidden="true"
          />
          <input
            id="token-search"
            type="search"
            placeholder="Search tokens..."
            value={filters.searchQuery}
            onChange={(e) =>
              onFilterChange({ ...filters, searchQuery: e.target.value })
            }
            aria-label="Search for tokens by name or symbol"
            className="w-full pl-14 pr-6 py-4 bg-[rgba(31,31,31,0.88)] border border-[#2a2a2a] rounded-xl text-white text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgba(97,7,224,0.45)] focus:border-[rgba(97,7,224,0.45)] focus:bg-[rgba(31,31,31,0.96)] transition-all duration-200 hover:border-[#3a3a3a]"
          />
        </div>

        {/* Filter Controls - Better Spacing */}
        <div className="flex flex-wrap gap-3">
          {/* Category Filter */}
          <div className="relative">
            <motion.button
              ref={categoryButtonRef}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              aria-expanded={categoryDropdownOpen}
              aria-haspopup="menu"
              aria-label={`Filter by category${
                filters.categories.length > 0
                  ? `, ${filters.categories.length} selected`
                  : ""
              }`}
              className={`flex items-center gap-2.5 px-5 py-3.5 rounded-xl border transition-all duration-200 ${
                filters.categories.length > 0
                  ? "bg-[rgba(97,7,224,0.2)] border-[rgba(97,7,224,0.55)] text-[#d6c1ff] shadow-[0_18px_36px_rgba(97,7,224,0.18)]"
                  : "bg-[rgba(31,31,31,0.88)] border-[#2a2a2a] text-gray-300 hover:border-[#3a3a3a] hover:bg-[rgba(31,31,31,0.94)]"
              }`}
            >
              <Filter className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">
                Category{" "}
                {filters.categories.length > 0 &&
                  `(${filters.categories.length})`}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  categoryDropdownOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </motion.button>

            <AnimatePresence>
              {categoryDropdownOpen && categoryPosition && (
                <Portal>
                  <motion.div
                    ref={categoryDropdownRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "fixed",
                      top: `${categoryPosition.top}px`,
                      left: `${categoryPosition.left}px`,
                      width: `${categoryPosition.width}px`,
                    }}
                    className={`bg-[rgba(28,28,28,0.98)] backdrop-blur-xl border border-[#2a2a2a] rounded-xl shadow-[0_24px_40px_rgba(0,0,0,0.45)] overflow-hidden ${Z_INDEX.DROPDOWN}`}
                    role="menu"
                    aria-label="Category filter options"
                  >
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {availableCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => toggleCategory(category)}
                          role="menuitemcheckbox"
                          aria-checked={filters.categories.includes(category)}
                          className={`w-full px-5 py-3.5 text-left text-sm transition-all duration-200 flex items-center gap-3 ${
                            filters.categories.includes(category)
                              ? "bg-[rgba(97,7,224,0.18)] text-[#d6c1ff]"
                              : "hover:bg-[rgba(42,42,42,0.6)] text-gray-300"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                              filters.categories.includes(category)
                                ? "border-[#6107e0] bg-[#6107e0]"
                                : "border-[#3a3a3a]"
                            }`}
                          >
                            {filters.categories.includes(category) && (
                              <svg
                                className="w-3 h-3 text-white"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M2 6L5 9L10 3"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="capitalize">{category}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </Portal>
              )}
            </AnimatePresence>
          </div>

          {/* Chain Filter */}
          <div className="relative">
            <motion.button
              ref={chainButtonRef}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setChainDropdownOpen(!chainDropdownOpen)}
              aria-expanded={chainDropdownOpen}
              aria-haspopup="menu"
              aria-label={`Filter by blockchain${
                filters.chains.length > 0
                  ? `, ${filters.chains.length} selected`
                  : ""
              }`}
              className={`flex items-center gap-2.5 px-5 py-3.5 rounded-xl border transition-all duration-200 ${
                filters.chains.length > 0
                  ? "bg-[rgba(97,7,224,0.2)] border-[rgba(97,7,224,0.55)] text-[#d6c1ff] shadow-[0_18px_36px_rgba(97,7,224,0.18)]"
                  : "bg-[rgba(31,31,31,0.88)] border-[#2a2a2a] text-gray-300 hover:border-[#3a3a3a] hover:bg-[rgba(31,31,31,0.94)]"
              }`}
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">
                Chain{" "}
                {filters.chains.length > 0 && `(${filters.chains.length})`}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  chainDropdownOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </motion.button>

            <AnimatePresence>
              {chainDropdownOpen && chainPosition && (
                <Portal>
                  <motion.div
                    ref={chainDropdownRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "fixed",
                      top: `${chainPosition.top}px`,
                      left: `${chainPosition.left}px`,
                      width: `${chainPosition.width}px`,
                    }}
                    className={`bg-[rgba(28,28,28,0.98)] backdrop-blur-xl border border-[#2a2a2a] rounded-xl shadow-[0_24px_40px_rgba(0,0,0,0.45)] overflow-hidden ${Z_INDEX.DROPDOWN}`}
                    role="menu"
                    aria-label="Blockchain filter options"
                  >
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {availableChains.map((chain) => (
                        <button
                          key={chain}
                          onClick={() => toggleChain(chain)}
                          role="menuitemcheckbox"
                          aria-checked={filters.chains.includes(chain)}
                          className={`w-full px-5 py-3.5 text-left text-sm transition-all duration-200 flex items-center gap-3 ${
                            filters.chains.includes(chain)
                              ? "bg-[rgba(97,7,224,0.18)] text-[#d6c1ff]"
                              : "hover:bg-[rgba(42,42,42,0.6)] text-gray-300"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                              filters.chains.includes(chain)
                                ? "border-[#6107e0] bg-[#6107e0]"
                                : "border-[#3a3a3a]"
                            }`}
                          >
                            {filters.chains.includes(chain) && (
                              <svg
                                className="w-3 h-3 text-white"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M2 6L5 9L10 3"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <span>{chain}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </Portal>
              )}
            </AnimatePresence>
          </div>

          {/* APY Range Filter */}
          <div className="relative">
            <motion.button
              ref={apyButtonRef}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setApyPanelOpen(!apyPanelOpen)}
              aria-expanded={apyPanelOpen}
              aria-haspopup="dialog"
              aria-label={`Filter by APY range${
                filters.apyRange[0] !== 0 || filters.apyRange[1] !== 100
                  ? `, ${filters.apyRange[0]}% to ${filters.apyRange[1]}%`
                  : ""
              }`}
              className={`flex items-center gap-2.5 px-5 py-3.5 rounded-xl border transition-all duration-200 ${
                filters.apyRange[0] !== 0 || filters.apyRange[1] !== 100
                  ? "bg-[rgba(97,7,224,0.2)] border-[rgba(97,7,224,0.55)] text-[#d6c1ff] shadow-[0_18px_36px_rgba(97,7,224,0.18)]"
                  : "bg-[rgba(31,31,31,0.88)] border-[#2a2a2a] text-gray-300 hover:border-[#3a3a3a] hover:bg-[rgba(31,31,31,0.94)]"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">APY Range</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  apyPanelOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </motion.button>

            <AnimatePresence>
              {apyPanelOpen && apyPosition && (
                <Portal>
                  <motion.div
                    ref={apyDropdownRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "fixed",
                      top: `${apyPosition.top}px`,
                      left: `${apyPosition.left}px`,
                      width: `${apyPosition.width}px`,
                    }}
                    className={`bg-[rgba(28,28,28,0.98)] backdrop-blur-xl border border-[#2a2a2a] rounded-xl shadow-[0_24px_40px_rgba(0,0,0,0.45)] p-8 ${Z_INDEX.DROPDOWN}`}
                    role="dialog"
                    aria-label="APY range filter"
                  >
                    <div className="space-y-8">
                      <div>
                        <label
                          htmlFor="apy-min-range"
                          className="text-sm text-gray-300 mb-3 block font-medium"
                        >
                          Min APY (%)
                        </label>
                        <input
                          id="apy-min-range"
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={filters.apyRange[0]}
                          onChange={(e) =>
                            handleApyChange(Number(e.target.value), 0)
                          }
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={filters.apyRange[0]}
                          aria-label={`Minimum APY: ${filters.apyRange[0]}%`}
                          className="w-full slider"
                        />
                        <div className="text-center mt-3">
                          <span
                            className="text-xl font-semibold text-[#b493ff]"
                            aria-live="polite"
                          >
                            {filters.apyRange[0]}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="apy-max-range"
                          className="text-sm text-gray-300 mb-3 block font-medium"
                        >
                          Max APY (%)
                        </label>
                        <input
                          id="apy-max-range"
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={filters.apyRange[1]}
                          onChange={(e) =>
                            handleApyChange(Number(e.target.value), 1)
                          }
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={filters.apyRange[1]}
                          aria-label={`Maximum APY: ${filters.apyRange[1]}%`}
                          className="w-full slider"
                        />
                        <div className="text-center mt-3">
                          <span
                            className="text-xl font-semibold text-[#b493ff]"
                            aria-live="polite"
                          >
                            {filters.apyRange[1]}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Portal>
              )}
            </AnimatePresence>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <motion.button
              ref={sortButtonRef}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              aria-expanded={sortDropdownOpen}
              aria-haspopup="menu"
              aria-label={`Sort results: ${getSortLabel(sortBy)}`}
              className="flex items-center gap-2.5 px-5 py-3.5 bg-[rgba(31,31,31,0.88)] border border-[#2a2a2a] rounded-xl text-gray-300 hover:border-[#3a3a3a] hover:bg-[rgba(31,31,31,0.94)] transition-all duration-200"
            >
              <span className="text-sm font-medium">
                {getSortLabel(sortBy)}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  sortDropdownOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </motion.button>

            <AnimatePresence>
              {sortDropdownOpen && sortPosition && (
                <Portal>
                  <motion.div
                    ref={sortDropdownRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "fixed",
                      top: `${sortPosition.top}px`,
                      left: `${sortPosition.left}px`,
                      width: `${sortPosition.width}px`,
                    }}
                    className={`bg-[rgba(28,28,28,0.98)] backdrop-blur-xl border border-[#2a2a2a] rounded-xl shadow-[0_24px_40px_rgba(0,0,0,0.45)] overflow-hidden ${Z_INDEX.DROPDOWN}`}
                    role="menu"
                    aria-label="Sort options"
                  >
                    {getSortOptions().map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          onSortChange(option.value);
                          setSortDropdownOpen(false);
                        }}
                        role="menuitemradio"
                        aria-checked={sortBy === option.value}
                        className={`w-full px-5 py-3.5 text-left text-sm transition-all duration-200 ${
                          sortBy === option.value
                            ? "bg-[rgba(97,7,224,0.18)] text-[#d6c1ff]"
                            : "hover:bg-[rgba(42,42,42,0.6)] text-gray-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                </Portal>
              )}
            </AnimatePresence>
          </div>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClearFilters}
              className="flex items-center gap-2.5 px-5 py-3.5 bg-[rgba(255,215,0,0.12)] border border-[rgba(255,215,0,0.45)] text-[#ffd700] rounded-xl hover:bg-[rgba(255,215,0,0.18)] transition-all duration-200 shadow-[0_18px_36px_rgba(255,215,0,0.18)]"
            >
              <X className="w-4 h-4" />
              <span className="text-sm font-medium">
                Clear ({activeFilterCount})
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Results Count - Better Spacing */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-sm text-gray-400"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Showing <span className="text-gold font-semibold">{totalResults}</span>{" "}
        results
      </motion.div>
    </motion.div>
  );
}
