/**
 * LI.FI SDK Server-Side Configuration
 * Configure LI.FI SDK with API key for server-side operations only
 *
 * IMPORTANT: This file should ONLY be imported in server-side code (API routes, Server Components)
 * Never import this in client components as it contains the API key
 */

import { createConfig } from "@lifi/sdk";
import { ChainId } from "@lifi/types";
import type { RouteOptions } from "@lifi/types";
import type { SDKConfig, RPCUrls } from "@lifi/sdk";
import {
  mainnet,
  bsc,
  polygon,
  arbitrum,
  optimism,
  avalanche,
} from "@/lib/config/chains";

// ============================================================================
// Environment Variables
// ============================================================================

// Server-side only: API key from environment variables (not NEXT_PUBLIC_)
const lifiApiKey = process.env.LIFI_API_KEY;

if (!lifiApiKey) {
  console.warn(
    "LIFI_API_KEY is not set. Some LI.FI features may be limited. " +
      "Set LIFI_API_KEY in your .env.local file (server-side only, not NEXT_PUBLIC_)."
  );
}

// ============================================================================
// Chain ID Mapping: Wagmi Chain IDs to LI.FI ChainIds
// ============================================================================

const chainIdMap: Record<number, ChainId> = {
  [mainnet.id]: ChainId.ETH,
  [bsc.id]: ChainId.BSC,
  [polygon.id]: ChainId.POL,
  [arbitrum.id]: ChainId.ARB,
  [optimism.id]: ChainId.OPT,
  [avalanche.id]: ChainId.AVA,
};

// ============================================================================
// RPC URLs Configuration
// ============================================================================

const rpcUrls: RPCUrls = {
  [ChainId.ETH]: ["https://eth.merkle.io"],
  [ChainId.BSC]: ["https://bsc-dataseed1.binance.org"],
  [ChainId.POL]: ["https://polygon-rpc.com"],
  [ChainId.ARB]: ["https://arb1.arbitrum.io/rpc"],
  [ChainId.OPT]: ["https://mainnet.optimism.io"],
  [ChainId.AVA]: ["https://api.avax.network/ext/bc/C/rpc"],
};

// ============================================================================
// Route Options Configuration
// ============================================================================

const defaultRouteOptions: RouteOptions = {
  slippage: 0.005, // 0.5%
  integrator: "Brik-Labs",
  allowSwitchChain: true,
  // TEST ENVIRONMENT: 50% fee for testing
  fee: 0.5, // 50% platform fee (TEST ONLY)
};

// ============================================================================
// Server-Side SDK Configuration (with API Key)
// ============================================================================

/**
 * LI.FI SDK configuration for server-side use
 * Includes API key for enhanced features like rate limiting and analytics
 */
const serverSdkConfig: SDKConfig = {
  integrator: "Brik-Labs",
  rpcUrls,
  routeOptions: defaultRouteOptions,
  debug: process.env.NODE_ENV === "development",
  preloadChains: true,

  // Disable package update checks to avoid CSP violations
  disableVersionCheck: true,

  // API key included for server-side operations only
  ...(lifiApiKey && { apiKey: lifiApiKey }),
};

// ============================================================================
// Initialize Server-Side SDK
// ============================================================================

/**
 * Server-side LI.FI SDK instance with API key
 * Use this in API routes and Server Components only
 */
export const lifiServerConfig = createConfig(serverSdkConfig);

// ============================================================================
// Exports
// ============================================================================

export { chainIdMap, defaultRouteOptions, rpcUrls };

export function getLiFiChainId(wagmiChainId: number): ChainId | undefined {
  return chainIdMap[wagmiChainId];
}

export function getWagmiChainId(lifiChainId: ChainId): number | undefined {
  const entry = Object.entries(chainIdMap).find(
    ([, lifiId]) => lifiId === lifiChainId
  );
  return entry ? Number(entry[0]) : undefined;
}
