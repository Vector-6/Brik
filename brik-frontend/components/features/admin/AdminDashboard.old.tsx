"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  LogOut, 
  Plus, 
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  Save,
  Coins
} from "lucide-react";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";
import type { AdminToken } from "@/lib/types/admin.types";

/**
 * AdminDashboard Component
 * 
 * Main dashboard for managing tokens
 * Features:
 * - Token listing with search and filters
 * - Add/Edit/Delete token functionality
 * - Responsive design with glassmorphism theme
 * - Protected route with auth check
 */

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

type FilterType = "all" | "rwa" | "crypto";

export default function AdminDashboard() {
  const router = useRouter();
  const { logout, email } = useAdminAuth();
  const [tokens, setTokens] = useState<AdminToken[]>(MOCK_TOKENS);
  const [filteredTokens, setFilteredTokens] = useState<AdminToken[]>(MOCK_TOKENS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingToken, setEditingToken] = useState<AdminToken | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-[#6107e0]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#6107e0] to-[#8f48ff] shadow-[0_0_30px_rgba(97,7,224,0.4)]">
              <Shield className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white font-burbank">
                Admin Dashboard
              </h1>
              <p className="text-sm text-white/60">
                Manage platform tokens and settings
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Tokens"
            value={tokens.length}
            icon={<Coins className="w-5 h-5" />}
          />
          <StatCard
            title="RWA Tokens"
            value={tokens.filter((t) => t.type === "rwa").length}
            icon={<Coins className="w-5 h-5" />}
          />
          <StatCard
            title="Crypto Tokens"
            value={tokens.filter((t) => t.type === "crypto").length}
            icon={<Coins className="w-5 h-5" />}
          />
          <StatCard
            title="Active"
            value={tokens.filter((t) => t.isActive).length}
            icon={<Coins className="w-5 h-5" />}
          />
        </div>

        {/* Search and Filter Section */}
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
              >
                <option value="all">All Types</option>
                <option value="rwa">RWA Only</option>
                <option value="crypto">Crypto Only</option>
              </select>

              <select
                value={filterActive === null ? "" : filterActive.toString()}
                onChange={(e) => 
                  setFilterActive(
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
                onChange={(e) => setSelectedChainId(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
              />

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#6107e0] to-[#8f48ff] text-white font-medium shadow-[0_0_20px_rgba(97,7,224,0.3)] hover:shadow-[0_0_30px_rgba(97,7,224,0.5)] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Token</span>
              </button>
            </div>
          </div>
        </div>

        {/* Token List */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#130d26]/80 shadow-[0_20px_60px_rgba(97,7,224,0.15)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                    Token
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                    Symbol
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                    Decimals
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                    Chains
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white/80">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTokens.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-white/40">
                      No tokens found
                    </td>
                  </tr>
                ) : (
                  filteredTokens.map((token) => (
                    <TokenRow
                      key={token._id}
                      token={token}
                      onEdit={() => setEditingToken(token)}
                      onDelete={() => handleDeleteToken(token._id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingToken) && (
        <TokenModal
          token={editingToken}
          onClose={() => {
            setShowAddModal(false);
            setEditingToken(null);
          }}
          onSave={(token) => {
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
          }}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#130d26]/80 p-6 shadow-[0_10px_40px_rgba(97,7,224,0.1)]">
      <div className="flex items-center justify-between mb-2">
        <div className="text-white/60 text-sm font-medium">{title}</div>
        <div className="text-[#6107e0]">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-white font-burbank">{value}</div>
    </div>
  );
}

// Token Row Component
function TokenRow({
  token,
  onEdit,
  onDelete,
}: {
  token: AdminToken;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src={token.image}
            alt={token.name}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-white font-medium">{token.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-white/80">{token.symbol}</td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
            token.type === "rwa"
              ? "bg-purple-500/20 text-purple-300"
              : "bg-blue-500/20 text-blue-300"
          }`}
        >
          {token.type.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4 text-white/80">{token.decimals}</td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
            token.isActive
              ? "bg-green-500/20 text-green-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {token.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-6 py-4 text-white/80">
        {Object.keys(token.addresses || {}).length}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            aria-label="Edit token"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
            aria-label="Delete token"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// Token Modal Component
function TokenModal({
  token,
  onClose,
  onSave,
}: {
  token: AdminToken | null;
  onClose: () => void;
  onSave: (token: AdminToken) => void;
}) {
  const [formData, setFormData] = useState<AdminToken>(
    token || {
      _id: "",
      symbol: "",
      name: "",
      decimals: 18,
      coingeckoId: "",
      addresses: {},
      image: "",
      type: "crypto",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
  const [newChainId, setNewChainId] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddAddress = () => {
    if (newChainId && newAddress) {
      setFormData((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          [newChainId]: newAddress,
        },
      }));
      setNewChainId("");
      setNewAddress("");
    }
  };

  const handleRemoveAddress = (chainId: string) => {
    const newAddresses = { ...formData.addresses };
    delete newAddresses[chainId];
    setFormData((prev) => ({
      ...prev,
      addresses: newAddresses,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#130d26] p-8 shadow-[0_30px_80px_rgba(97,7,224,0.25)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-burbank">
            {token ? "Edit Token" : "Add New Token"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Symbol *
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, symbol: e.target.value }))
                }
                required
                className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
                placeholder="e.g., USDC"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
                placeholder="e.g., USD Coin"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Decimals *
              </label>
              <input
                type="number"
                value={formData.decimals}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    decimals: parseInt(e.target.value),
                  }))
                }
                required
                min="0"
                max="18"
                className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value as "crypto" | "rwa",
                  }))
                }
                className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
              >
                <option value="crypto">Crypto</option>
                <option value="rwa">RWA</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                CoinGecko ID *
              </label>
              <input
                type="text"
                value={formData.coingeckoId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    coingeckoId: e.target.value,
                  }))
                }
                required
                className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
                placeholder="e.g., usd-coin"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Image URL *
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, image: e.target.value }))
                }
                required
                className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white/80">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#6107e0] focus:ring-2 focus:ring-[#6107e0]/30"
              />
              Active
            </label>
          </div>

          {/* Addresses Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white/80">
              Chain Addresses
            </label>
            
            {/* Existing Addresses */}
            <div className="space-y-2">
              {Object.entries(formData.addresses || {}).map(([chainId, address]) => (
                <div
                  key={chainId}
                  className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex-1">
                    <div className="text-xs text-white/60 mb-1">
                      Chain ID: {chainId}
                    </div>
                    <div className="text-sm text-white/80 font-mono truncate">
                      {address}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAddress(chainId)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Address */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Chain ID (e.g., 1)"
                value={newChainId}
                onChange={(e) => setNewChainId(e.target.value)}
                className="w-32 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
              />
              <input
                type="text"
                placeholder="Contract Address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-[#6107e0] focus:outline-none focus:ring-2 focus:ring-[#6107e0]/30"
              />
              <button
                type="button"
                onClick={handleAddAddress}
                className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#6107e0] to-[#8f48ff] text-white font-medium shadow-[0_0_20px_rgba(97,7,224,0.3)] hover:shadow-[0_0_30px_rgba(97,7,224,0.5)] transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{token ? "Update" : "Create"} Token</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
