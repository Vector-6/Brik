/**
 * Admin Token Types
 * Database token structure for admin management
 */

// ============================================================================
// Auth Types
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

export interface AdminAuthState {
  isAuthenticated: boolean;
  token: string | null;
  email: string | null;
}

// ============================================================================
// Token Types
// ============================================================================

export interface AdminToken {
  _id: string;
  symbol: string;
  name: string;
  decimals: number;
  coingeckoId: string;
  addresses: Record<string, string>; // chainId -> contract address
  image: string;
  type: "crypto" | "rwa";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTokensResponse {
  tokens: AdminToken[];
  total: number;
  lastUpdated: string;
}

export interface AdminTokenQueryParams {
  type?: "rwa" | "crypto";
  isActive?: boolean;
  search?: string;
  chainId?: string;
}
