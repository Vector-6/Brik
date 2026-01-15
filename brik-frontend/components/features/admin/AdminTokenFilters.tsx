/**
 * AdminTokenFilters Component
 * Search and filter controls for token management
 */

import { Search, Plus } from "lucide-react";

export type FilterType = "all" | "rwa" | "crypto";

interface AdminTokenFiltersProps {
  searchQuery: string;
  filterType: FilterType;
  filterActive: boolean | null;
  selectedChainId: string;
  onSearchChange: (query: string) => void;
  onFilterTypeChange: (type: FilterType) => void;
  onFilterActiveChange: (active: boolean | null) => void;
  onChainIdChange: (chainId: string) => void;
  onAddToken: () => void;
}

export default function AdminTokenFilters({
  searchQuery,
  filterType,
  filterActive,
  selectedChainId,
  onSearchChange,
  onFilterTypeChange,
  onFilterActiveChange,
  onChainIdChange,
  onAddToken,
}: AdminTokenFiltersProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#130d26]/80 p-6 mb-6 shadow-[0_20px_60px_rgba(97,7,224,0.15)]">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search by symbol, name, or CoinGecko ID..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value as FilterType)}
            className="px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
          >
            <option value="all">All Types</option>
            <option value="rwa">RWA Only</option>
            <option value="crypto">Crypto Only</option>
          </select>

          <select
            value={filterActive === null ? "" : filterActive.toString()}
            onChange={(e) =>
              onFilterActiveChange(
                e.target.value === "" ? null : e.target.value === "true"
              )
            }
            className="px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
          >
            <option value="">All Status</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          <input
            type="text"
            placeholder="Chain ID (e.g., 1)"
            value={selectedChainId}
            onChange={(e) => onChainIdChange(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
          />

          <button
            onClick={onAddToken}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#6107e0] to-[#8f48ff] text-white font-medium shadow-[0_0_20px_rgba(97,7,224,0.3)] hover:shadow-[0_0_30px_rgba(97,7,224,0.5)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Token</span>
          </button>
        </div>
      </div>
    </div>
  );
}
