"use client";

/**
 * TransactionFilters Component
 * UI for filtering transactions by status, chain, token, date, and search
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Search, ChevronDown, Download } from "lucide-react";
import { TransactionStatusFilter } from "@/lib/api/types/transaction.types";
import {
  TransactionFilters as FilterState,
  DateRange,
  TransactionViewMode,
} from "../types/filter.types";
import { SUPPORTED_CHAINS } from "@/lib/constants/chains";
import { Z_INDEX } from "@/lib/constants/zIndex";

// ============================================================================
// Types
// ============================================================================

export interface TransactionFiltersProps {
  /** Current filters */
  filters: FilterState;
  /** View mode */
  viewMode: TransactionViewMode;
  /** Is wallet connected */
  isWalletConnected: boolean;
  /** Update status */
  onStatusChange: (status: TransactionStatusFilter) => void;
  /** Update chain */
  onChainChange: (chainId?: number) => void;
  /** Update token */
  onTokenChange: (token?: string) => void;
  /** Update date range */
  onDateRangeChange: (range?: DateRange) => void;
  /** Update search */
  onSearchChange: (search?: string) => void;
  /** Update view mode */
  onViewModeChange: (mode: TransactionViewMode) => void;
  /** Clear all filters */
  onClearFilters: () => void;
  /** Export to CSV handler */
  onExportCSV?: () => void;
  /** Active filter count */
  activeFilterCount: number;
}

// ============================================================================
// Status Options
// ============================================================================

const STATUS_OPTIONS: {
  value: TransactionStatusFilter;
  label: string;
  color: string;
}[] = [
  { value: "ALL", label: "All Transactions", color: "text-gray-400" },
  { value: "DONE", label: "Completed", color: "text-green-400" },
  { value: "PENDING", label: "Pending", color: "text-yellow-400" },
  { value: "FAILED", label: "Failed", color: "text-red-400" },
];

// ============================================================================
// Common Tokens
// ============================================================================

const COMMON_TOKENS = ["PAXG", "XAUT", "USDC", "USDT", "ETH", "WETH"];

// ============================================================================
// Component
// ============================================================================

export default function TransactionFiltersComponent({
  filters,
  viewMode,
  isWalletConnected,
  onStatusChange,
  onChainChange,
  onTokenChange,
  onSearchChange,
  onViewModeChange,
  onClearFilters,
  onExportCSV,
  activeFilterCount,
}: TransactionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false);
  const [tokenDropdownOpen, setTokenDropdownOpen] = useState(false);

  const selectedStatus = STATUS_OPTIONS.find(
    (opt) => opt.value === filters.status
  );
  const selectedChain = SUPPORTED_CHAINS.find(
    (chain) => chain.id === filters.chainId
  );

  return (
    <div className="space-y-3">
      {/* Top Bar: View Mode Toggle + Quick Actions */}
      <div className="flex items-center justify-between gap-3">
        {/* View Mode Toggle (only show if wallet is connected) */}
        {isWalletConnected && (
          <div className="flex items-center gap-1 bg-background rounded-lg p-1 border border-[#2a2a2a]">
            <button
              onClick={() => onViewModeChange("user")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "user"
                  ? "bg-gold text-background"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              My Swaps
            </button>
            <button
              onClick={() => onViewModeChange("platform")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "platform"
                  ? "bg-gold text-background shadow-[0_12px_24px_rgba(97,7,224,0.22)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              All Swaps
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Export CSV Button */}
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="p-2 rounded-lg hover:bg-background text-gray-400 hover:text-[#ffd700] transition-colors cursor-pointer"
              title="Export to CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background hover:bg-background/20 text-gray-300 transition-colors border border-[#2a2a2a] cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span className="text-xs font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-purple-500 text-white text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-visible"
          >
            <div className="bg-background border border-color-border rounded-lg p-4 space-y-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={filters.search || ""}
                  onChange={(e) => onSearchChange(e.target.value || undefined)}
                  placeholder="Search by transaction hash..."
                  className="w-full pl-10 pr-4 py-2 bg-[rgba(28,28,28,0.92)] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(97,7,224,0.45)] transition-colors"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Status Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className="w-full px-3 py-2 bg-[rgba(28,28,28,0.92)] border border-[#2a2a2a] rounded-lg text-sm text-left flex items-center justify-between hover:border-[rgba(97,7,224,0.45)] transition-colors"
                  >
                    <span className={selectedStatus?.color}>
                      {selectedStatus?.label}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {statusDropdownOpen && (
                    <>
                      <div
                        className={`fixed inset-0 ${Z_INDEX.DROPDOWN}`}
                        onClick={() => setStatusDropdownOpen(false)}
                      />
                      <div
                        className={`absolute top-full left-0 right-0 mt-1 bg-[rgba(28,28,28,0.98)] border border-[#2a2a2a] rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.45)] overflow-hidden max-h-60 overflow-y-auto ${Z_INDEX.DROPDOWN}`}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              onStatusChange(option.value);
                              setStatusDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-sm text-left hover:bg-[rgba(42,42,42,0.9)] transition-colors ${option.color}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Chain Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setChainDropdownOpen(!chainDropdownOpen)}
                    className="w-full px-3 py-2 bg-[rgba(28,28,28,0.92)] border border-[#2a2a2a] rounded-lg text-sm text-left flex items-center justify-between hover:border-[rgba(97,7,224,0.45)] transition-colors"
                  >
                    <span className="text-gray-300">
                      {selectedChain?.name || "All Chains"}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {chainDropdownOpen && (
                    <>
                      <div
                        className={`fixed inset-0 ${Z_INDEX.DROPDOWN}`}
                        onClick={() => setChainDropdownOpen(false)}
                      />
                      <div
                        className={`absolute top-full left-0 right-0 mt-1 bg-[rgba(28,28,28,0.98)] border border-[#2a2a2a] rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.45)] overflow-hidden max-h-60 overflow-y-auto custom-scrollbar ${Z_INDEX.DROPDOWN}`}
                      >
                        <button
                          onClick={() => {
                            onChainChange(undefined);
                            setChainDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-[rgba(42,42,42,0.9)] transition-colors text-gray-300"
                        >
                          All Chains
                        </button>
                        {SUPPORTED_CHAINS.map((chain) => (
                          <button
                            key={chain.id}
                            onClick={() => {
                              onChainChange(chain.id);
                              setChainDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-sm text-left hover:bg-[rgba(42,42,42,0.9)] transition-colors text-gray-300"
                          >
                            {chain.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Token Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setTokenDropdownOpen(!tokenDropdownOpen)}
                    className="w-full px-3 py-2 bg-[rgba(28,28,28,0.92)] border border-[#2a2a2a] rounded-lg text-sm text-left flex items-center justify-between hover:border-[rgba(97,7,224,0.45)] transition-colors"
                  >
                    <span className="text-gray-300">
                      {filters.token || "All Tokens"}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {tokenDropdownOpen && (
                    <>
                      <div
                        className={`fixed inset-0 ${Z_INDEX.DROPDOWN}`}
                        onClick={() => setTokenDropdownOpen(false)}
                      />
                      <div
                        className={`absolute top-full left-0 right-0 mt-1 bg-[rgba(28,28,28,0.98)] border border-[#2a2a2a] rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.45)] overflow-hidden max-h-60 overflow-y-auto custom-scrollbar ${Z_INDEX.DROPDOWN}`}
                      >
                        <button
                          onClick={() => {
                            onTokenChange(undefined);
                            setTokenDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-[rgba(42,42,42,0.9)] transition-colors text-gray-300"
                        >
                          All Tokens
                        </button>
                        {COMMON_TOKENS.map((token) => (
                          <button
                            key={token}
                            onClick={() => {
                              onTokenChange(token);
                              setTokenDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-sm text-left hover:bg-[rgba(42,42,42,0.9)] transition-colors text-gray-300"
                          >
                            {token}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Clear Filters Button */}
              {activeFilterCount > 0 && (
                <button
                  onClick={onClearFilters}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[rgba(42,42,42,0.9)] transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
