/**
 * useAdminAuth Hook
 * Manages admin authentication state and operations
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin, adminLogout } from '@/lib/api/endpoints/auth';
import type { AdminAuthState, AdminLoginRequest } from '@/lib/types/admin.types';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  TOKEN: 'adminToken',
  EMAIL: 'adminEmail',
  AUTH: 'adminAuth', // Legacy key for backward compatibility
} as const;

// ============================================================================
// Hook
// ============================================================================

export function useAdminAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AdminAuthState>({
    isAuthenticated: false,
    token: null,
    email: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // Initialize auth state from localStorage
  // ============================================================================
  
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const email = localStorage.getItem(STORAGE_KEYS.EMAIL);

      if (token && email) {
        // Simply restore the auth state from localStorage
        // Token will be validated on the server when making API calls
        setAuthState({
          isAuthenticated: true,
          token,
          email,
        });
      }
      
      // Mark initialization as complete
      setIsInitialized(true);
    };

    initAuth();
  }, []);

  // ============================================================================
  // Login
  // ============================================================================

  const login = useCallback(async (credentials: AdminLoginRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminLogin(credentials);
      
      // Store auth data
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);
      localStorage.setItem(STORAGE_KEYS.EMAIL, response.email);
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true'); // For backward compatibility

      // Update state
      setAuthState({
        isAuthenticated: true,
        token: response.access_token,
        email: response.email,
      });

      setIsLoading(false);
      return { success: true, data: response };
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Invalid credentials. Please try again.';
      
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  // ============================================================================
  // Logout
  // ============================================================================

  const logout = useCallback(() => {
    // Clear localStorage
    adminLogout();
    
    // Clear state
    setAuthState({
      isAuthenticated: false,
      token: null,
      email: null,
    });

    // Redirect to login
    router.push('/admin');
  }, [router]);

  // ============================================================================
  // Get auth header for API calls
  // ============================================================================

  const getAuthHeader = useCallback(() => {
    if (!authState.token) return {};
    
    return {
      Authorization: `Bearer ${authState.token}`,
    };
  }, [authState.token]);

  // ============================================================================
  // Check if user is authenticated
  // ============================================================================

  const checkAuth = useCallback(() => {
    return authState.isAuthenticated && !!authState.token;
  }, [authState.isAuthenticated, authState.token]);

  return {
    ...authState,
    isLoading,
    isInitialized,
    error,
    login,
    logout,
    getAuthHeader,
    checkAuth,
    clearError: () => setError(null),
  };
}
