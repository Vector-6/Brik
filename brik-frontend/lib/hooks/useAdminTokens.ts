/**
 * useAdminTokens Hook
 * Manages admin token data fetching and CRUD operations
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from './useAdminAuth';
import {
  fetchAdminTokens,
  createAdminToken,
  updateAdminToken,
  deleteAdminToken,
} from '@/lib/api/endpoints/admin-tokens';
import type { AdminToken, AdminTokenQueryParams } from '@/lib/types/admin.types';

// ============================================================================
// Hook
// ============================================================================

export function useAdminTokens() {
  const { getAuthHeader } = useAdminAuth();
  const [tokens, setTokens] = useState<AdminToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // ============================================================================
  // Fetch Tokens
  // ============================================================================

  const fetchTokens = useCallback(async (params?: AdminTokenQueryParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchAdminTokens(params);
      setTokens(response.tokens);
      setLastUpdated(response.lastUpdated);
      setIsLoading(false);
      return { success: true, data: response };
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Failed to fetch tokens';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  // ============================================================================
  // Create Token
  // ============================================================================

  const createToken = useCallback(async (
    token: Omit<AdminToken, '_id' | 'createdAt' | 'updatedAt'>,
    imageFile?: File
  ) => {
    setError(null);

    try {
      const newToken = await createAdminToken(token, imageFile);
      setTokens((prev) => [...prev, newToken]);
      return { success: true, data: newToken };
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Failed to create token';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // ============================================================================
  // Update Token
  // ============================================================================

  const updateToken = useCallback(async (
    tokenId: string,
    updates: Partial<AdminToken>,
    imageFile?: File
  ) => {
    setError(null);

    try {
      const updatedToken = await updateAdminToken(tokenId, updates, imageFile);
      setTokens((prev) =>
        prev.map((t) => (t._id === tokenId ? updatedToken : t))
      );
      return { success: true, data: updatedToken };
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Failed to update token';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // ============================================================================
  // Delete Token
  // ============================================================================

  const deleteToken = useCallback(async (tokenId: string) => {
    setError(null);

    try {
      await deleteAdminToken(tokenId);
      setTokens((prev) => prev.filter((t) => t._id !== tokenId));
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Failed to delete token';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // ============================================================================
  // Initial Fetch
  // ============================================================================

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  return {
    tokens,
    isLoading,
    error,
    lastUpdated,
    fetchTokens,
    createToken,
    updateToken,
    deleteToken,
    clearError: () => setError(null),
  };
}
