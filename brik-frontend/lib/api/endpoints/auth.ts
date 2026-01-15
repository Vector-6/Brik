/**
 * Auth API Endpoints
 * Handles admin authentication
 */

import apiClient from '../client';

// ============================================================================
// Types
// ============================================================================

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  email: string;
  expiresIn: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Admin login
 * @param credentials - Admin email and password
 * @returns Authentication token and admin details
 */
export const adminLogin = async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
  const response = await apiClient.post<AdminLoginResponse>('/auth/login', credentials);
  return response.data;
};

/**
 * Admin logout (client-side cleanup)
 * Clears all authentication data from localStorage
 */
export const adminLogout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminAuth');
  }
};
