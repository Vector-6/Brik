/**
 * AdminDashboard Component (Refactored)
 * 
 * Main dashboard for managing tokens
 * Features:
 * - Token listing with search and filters
 * - Add/Edit/Delete token functionality
 * - Responsive design with glassmorphism theme
 * - Protected route with auth check
 */

"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";
import type { AdminToken } from "@/lib/types/admin.types";
import AdminDashboardHeader from "./AdminDashboardHeader";
import AdminDashboardStats from "./AdminDashboardStats";
import AdminTokenFilters, { type FilterType } from "./AdminTokenFilters";
import AdminTokenTable from "./AdminTokenTable";
import AdminTokenModal from "./AdminTokenModal";

// Hardcoded token data for now (will be replaced with API calls)
const MOCK_TOKENS: AdminToken[] = [
  {
    _id: "676292d55bc8920d68f14e71",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    coingeckoId: "usd-coin",
    addresses: {
      "1": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "8453": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    },
    image: "https://assets.coingecko.com/coins/images/6319/large/usdc.png",
    type: "crypto",
    isActive: true,
    createdAt: "2024-12-18T07:30:45.123Z",
    updatedAt: "2024-12-18T07:30:45.123Z"
  },
  {
    _id: "676292d55bc8920d68f14e72",
    symbol: "PAXG",
    name: "Pax Gold",
    decimals: 18,
    coingeckoId: "pax-gold",
    addresses: {
      "1": "0x45804880De22913dAFE09f4980848ECE6EcbAf78"
    },
    image: "https://assets.coingecko.com/coins/images/9519/large/paxg.png",
    type: "rwa",
    isActive: true,
    createdAt: "2024-12-18T07:30:45.123Z",
    updatedAt: "2024-12-18T07:30:45.123Z"
  },
  {
    _id: "676292d55bc8920d68f14e73",
    symbol: "XAUT",
    name: "Tether Gold",
    decimals: 6,
    coingeckoId: "tether-gold",
    addresses: {
      "1": "0x68749665FF8D2d112Fa859AA293F07A622782F38"
    },
    image: "https://assets.coingecko.com/coins/images/10481/large/Tether_Gold.png",
    type: "rwa",
    isActive: true,
    createdAt: "2024-12-18T07:30:45.123Z",
    updatedAt: "2024-12-18T07:30:45.123Z"
  },
  {
    _id: "676292d55bc8920d68f14e74",
    symbol: "WETH",
    name: "Wrapped Ethereum",
    decimals: 18,
    coingeckoId: "weth",
    addresses: {
      "1": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "8453": "0x4200000000000000000000000000000000000006"
    },
    image: "https://assets.coingecko.com/coins/images/2518/large/weth.png",
    type: "crypto",
    isActive: true,
    createdAt: "2024-12-18T07:30:45.123Z",
    updatedAt: "2024-12-18T07:30:45.123Z"
  }
];

export default function AdminDashboard() {
  const { logout } = useAdminAuth();
  const [tokens, setTokens] = useState<AdminToken[]>(MOCK_TOKENS);
  const [filteredTokens, setFilteredTokens] = useState<AdminToken[]>(MOCK_TOKENS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingToken, setEditingToken] = useState<AdminToken | null>(null);

  // Filter tokens based on search and filters
  useEffect(() => {
    let result = [...tokens];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (token) =>
          token.symbol.toLowerCase().includes(query) ||
          token.name.toLowerCase().includes(query) ||
          token.coingeckoId.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filterType !== "all") {
      result = result.filter((token) => token.type === filterType);
    }

    // Active filter
    if (filterActive !== null) {
      result = result.filter((token) => token.isActive === filterActive);
    }

    // Chain filter
    if (selectedChainId) {
      result = result.filter((token) => 
        token.addresses && token.addresses[selectedChainId]
      );
    }

    setFilteredTokens(result);
  }, [tokens, searchQuery, filterType, filterActive, selectedChainId]);

  const handleLogout = () => {
    logout();
  };

  const handleDeleteToken = (tokenId: string) => {
    if (confirm("Are you sure you want to delete this token?")) {
      setTokens((prev) => prev.filter((t) => t._id !== tokenId));
    }
  };

  const handleSaveToken = (token: AdminToken) => {
    if (editingToken) {
      // Update existing token
      setTokens((prev) =>
        prev.map((t) => (t._id === token._id ? token : t))
      );
    } else {
      // Add new token
      setTokens((prev) => [...prev, { ...token, _id: Date.now().toString() }]);
    }
    setShowAddModal(false);
    setEditingToken(null);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingToken(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <AdminDashboardHeader onLogout={handleLogout} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <AdminDashboardStats tokens={tokens} />

        {/* Search and Filter Section */}
        <AdminTokenFilters
          searchQuery={searchQuery}
          filterType={filterType}
          filterActive={filterActive}
          selectedChainId={selectedChainId}
          onSearchChange={setSearchQuery}
          onFilterTypeChange={setFilterType}
          onFilterActiveChange={setFilterActive}
          onChainIdChange={setSelectedChainId}
          onAddToken={() => setShowAddModal(true)}
        />

        {/* Token List */}
        <AdminTokenTable
          tokens={filteredTokens}
          onEdit={setEditingToken}
          onDelete={handleDeleteToken}
        />
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingToken) && (
        <AdminTokenModal
          token={editingToken}
          onClose={handleCloseModal}
          onSave={handleSaveToken}
        />
      )}
    </div>
  );
}
