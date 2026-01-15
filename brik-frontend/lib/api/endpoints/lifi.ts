/**
 * LI.FI API Client
 * Client-side functions for calling LI.FI API routes (which use API key server-side)
 */

import type { RoutesRequest, QuoteRequest } from "@lifi/types";

const API_BASE = "/api/lifi";

// ============================================================================
// Types
// ============================================================================

export interface LiFiApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get supported chains from LI.FI
 * Uses server-side API route with API key
 */
export async function getLiFiChains() {
  const response = await fetch(`${API_BASE}?operation=chains`);
  return response.json() as Promise<LiFiApiResponse<any>>;
}

/**
 * Get tokens for a specific chain
 * Uses server-side API route with API key
 */
export async function getLiFiTokens(chainId: number) {
  const response = await fetch(
    `${API_BASE}?operation=tokens&chainId=${chainId}`
  );
  return response.json() as Promise<LiFiApiResponse<any>>;
}

/**
 * Get swap routes
 * Uses server-side API route with API key
 */
export async function getLiFiRoutes(request: RoutesRequest) {
  const response = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operation: "routes",
      ...request,
    }),
  });
  return response.json() as Promise<LiFiApiResponse<any>>;
}

/**
 * Get swap quote
 * Uses server-side API route with API key
 */
export async function getLiFiQuote(request: QuoteRequest) {
  const response = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operation: "quote",
      ...request,
    }),
  });
  return response.json() as Promise<LiFiApiResponse<any>>;
}
