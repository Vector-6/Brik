/**
 * Admin Tokens API Endpoints
 * Handles CRUD operations for admin token management with file upload support
 */

import apiClient from '../client';
import type { AdminToken, AdminTokensResponse, AdminTokenQueryParams } from '@/lib/types/admin.types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert addresses object to array format expected by backend
 * @param addresses - Object with chainId as key and address as value
 * @returns Array of {chainId, address} objects
 */
const convertAddressesToArray = (addresses: Record<string, string>) => {
  return Object.entries(addresses).map(([chainId, address]) => ({
    chainId,
    address,
  }));
};

/**
 * Convert addresses array from backend to object format
 * @param addresses - Array of {chainId, address} objects
 * @returns Object with chainId as key and address as value
 */
const convertAddressesToObject = (addresses: Array<{ chainId: string; address: string }>) => {
  return addresses.reduce((acc, { chainId, address }) => {
    acc[chainId] = address;
    return acc;
  }, {} as Record<string, string>);
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all tokens from the database
 * @param params - Query parameters for filtering
 * @returns List of tokens with metadata
 */
export const fetchAdminTokens = async (
  params?: AdminTokenQueryParams
): Promise<AdminTokensResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.search) {
    queryParams.append('search', params.search);
  }
  
  if (params?.type) {
    queryParams.append('type', params.type);
  }
  
  if (params?.isActive !== undefined) {
    queryParams.append('isActive', String(params.isActive));
  }
  
  if (params?.chainId) {
    queryParams.append('chainId', params.chainId);
  }

  const url = `/tokens/database/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get<AdminTokensResponse>(url);
  
  // Convert addresses array to object format for frontend
  if (response.data.tokens) {
    response.data.tokens = response.data.tokens.map(token => ({
      ...token,
      addresses: Array.isArray(token.addresses) 
        ? convertAddressesToObject(token.addresses as any)
        : token.addresses,
    }));
  }
  
  return response.data;
};

/**
 * Create a new token
 * @param token - Token data to create
 * @param imageFile - Image file to upload
 * @returns Created token
 */
export const createAdminToken = async (
  token: Omit<AdminToken, '_id' | 'createdAt' | 'updatedAt'>,
  imageFile?: File
): Promise<AdminToken> => {
  const formData = new FormData();
  
  // Add token fields to form data
  formData.append('symbol', token.symbol);
  formData.append('name', token.name);
  formData.append('decimals', String(token.decimals));
  formData.append('coingeckoId', token.coingeckoId);
  formData.append('type', token.type);
  
  // Convert addresses to array format as per backend documentation
  const addressesArray = convertAddressesToArray(token.addresses);
  addressesArray.forEach((addr, index) => {
    formData.append(`addresses[${index}][chainId]`, addr.chainId);
    formData.append(`addresses[${index}][address]`, addr.address);
  });
  
  // Add image file if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  const response = await apiClient.post<AdminToken>('/tokens', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // Convert addresses array to object format for frontend
  return {
    ...response.data,
    addresses: Array.isArray(response.data.addresses)
      ? convertAddressesToObject(response.data.addresses as any)
      : response.data.addresses,
  };
};

/**
 * Update an existing token
 * @param tokenId - Token ID to update
 * @param token - Updated token data
 * @param imageFile - Optional image file to upload
 * @returns Updated token
 */
export const updateAdminToken = async (
  tokenId: string,
  token: Partial<AdminToken>,
  imageFile?: File
): Promise<AdminToken> => {
  const formData = new FormData();
  
  // Add token fields to form data (only if they exist)
  if (token.symbol) formData.append('symbol', token.symbol);
  if (token.name) formData.append('name', token.name);
  if (token.decimals !== undefined) formData.append('decimals', String(token.decimals));
  if (token.coingeckoId) formData.append('coingeckoId', token.coingeckoId);
  if (token.type) formData.append('type', token.type);
  
  // Convert addresses to array format as per backend documentation
  if (token.addresses) {
    const addressesArray = convertAddressesToArray(token.addresses);
    addressesArray.forEach((addr, index) => {
      formData.append(`addresses[${index}][chainId]`, addr.chainId);
      formData.append(`addresses[${index}][address]`, addr.address);
    });
  }
  
  // Add image file if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  const response = await apiClient.put<AdminToken>(`tokens/${tokenId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // Convert addresses array to object format for frontend
  return {
    ...response.data,
    addresses: Array.isArray(response.data.addresses)
      ? convertAddressesToObject(response.data.addresses as any)
      : response.data.addresses,
  };
};

/**
 * Delete a token
 * @param tokenId - Token ID to delete
 */
export const deleteAdminToken = async (tokenId: string): Promise<void> => {
  await apiClient.delete(`/tokens/${tokenId}`);
};
