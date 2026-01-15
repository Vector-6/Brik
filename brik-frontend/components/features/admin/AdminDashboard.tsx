/**
 * AdminDashboard Component (Refactored)
 * 
 * Main dashboard for managing tokens
 * Features:
 * - Token listing with search and filters
 * - Add/Edit/Delete token functionality
 * - Responsive design with glassmorphism theme
 * - Protected route with auth check
 * - Real API integration
 */

"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/hooks/useAdminAuth";
import { useAdminTokens } from "@/lib/hooks/useAdminTokens";
import type { AdminToken } from "@/lib/types/admin.types";
import AdminDashboardHeader from "./AdminDashboardHeader";
import AdminDashboardStats from "./AdminDashboardStats";
import AdminTokenFilters, { type FilterType } from "./AdminTokenFilters";
import AdminTokenTable from "./AdminTokenTable";
import AdminTokenModal from "./AdminTokenModal";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { logout } = useAdminAuth();
  const {
    tokens,
    isLoading,
    error: apiError,
    fetchTokens,
    createToken,
    updateToken,
    deleteToken,
  } = useAdminTokens();

  const [filteredTokens, setFilteredTokens] = useState<AdminToken[]>([]);
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

  const handleDeleteToken = async (tokenId: string) => {
    if (confirm("Are you sure you want to delete this token?")) {
      const deletePromise = deleteToken(tokenId);
      
      toast.promise(deletePromise, {
        loading: 'Deleting token...',
        success: 'Token deleted successfully! 🗑️',
        error: (err) => `Failed to delete: ${err?.error || 'Unknown error'}`,
      });
    }
  };

  const handleSaveToken = async (token: AdminToken, imageFile?: File) => {
    if (editingToken) {
      // Update existing token
      const updatePromise = updateToken(token._id, token, imageFile);
      
      toast.promise(updatePromise, {
        loading: 'Updating token...',
        success: (result) => {
          setShowAddModal(false);
          setEditingToken(null);
          return `${result.data?.symbol} updated successfully! ✅`;
        },
        error: (err) => `Failed to update: ${err?.error || 'Unknown error'}`,
      });
    } else {
      // Create new token
      const { _id, createdAt, updatedAt, ...tokenData } = token;
      const createPromise = createToken(tokenData, imageFile);
      
      toast.promise(createPromise, {
        loading: 'Creating token...',
        success: (result) => {
          setShowAddModal(false);
          setEditingToken(null);
          return `${result.data?.symbol} created successfully! 🎉`;
        },
        error: (err) => `Failed to create: ${err?.error || 'Unknown error'}`,
      });
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingToken(null);
  };

  // ============================================================================
  // Loading State
  // ============================================================================
  
  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <AdminDashboardHeader onLogout={handleLogout} />
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#6107e0]" />
            <p className="text-white/60">Loading tokens...</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Error State
  // ============================================================================
  
  if (apiError) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <AdminDashboardHeader onLogout={handleLogout} />
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-400 mb-4">Error: {apiError}</p>
            <button
              onClick={() => fetchTokens()}
              className="px-4 py-2 rounded-lg bg-[#6107e0] text-white hover:bg-[#7118f1] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
