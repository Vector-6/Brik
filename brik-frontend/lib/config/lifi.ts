/**
 * LI.FI SDK Configuration
 * Configure LI.FI SDK for swap functionality with RPC URLs and route options
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
} from "@/lib/config/wagmi";

// ============================================================================
// Environment Variables
// ============================================================================

// Note: LI.FI API key should NOT be exposed in the browser
// The API key is used server-side via the API route at /api/lifi
// For client-side operations, use the client functions from '@/lib/api/endpoints/lifi'
// For server-side operations, use '@/lib/config/lifi.server'
// See: https://docs.li.fi/integrate-li.fi-sdk/configuration

// ============================================================================
// Chain ID Mapping: Wagmi Chain IDs to LI.FI ChainIds
// ============================================================================

/**
 * Map wagmi chain IDs to LI.FI ChainId enum values
 * LI.FI uses specific enum values for chain identification
 */
const chainIdMap: Record<number, ChainId> = {
  [mainnet.id]: ChainId.ETH, // Ethereum Mainnet
  [bsc.id]: ChainId.BSC, // BNB Smart Chain
  [polygon.id]: ChainId.POL, // Polygon
  [arbitrum.id]: ChainId.ARB, // Arbitrum One
  [optimism.id]: ChainId.OPT, // Optimism
  [avalanche.id]: ChainId.AVA, // Avalanche C-Chain
};

// ============================================================================
// RPC URLs Configuration
// ============================================================================

/**
 * Extract RPC URLs for LI.FI SDK
 * These URLs are used by LI.FI SDK to interact with blockchain networks
 *
 * Note: LI.FI SDK accepts an array of RPC URLs per chain for fallback support
 * The SDK will try URLs in order if one fails
 */
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

/**
 * Default route options for LI.FI swaps
 * These can be overridden per-request, but provide sensible defaults
 */
const defaultRouteOptions: RouteOptions = {
  // Default slippage tolerance: 0.5% (matches useSwapSettings default)
  slippage: 0.005,

  // Integrator identifier for analytics and tracking
  integrator: "Brik-Labs",

  // Maximum price impact allowed (optional, defaults to SDK default)
  // maxPriceImpact: 0.5, // 50% max price impact

  // Allow chain switching if needed for the route
  allowSwitchChain: true,

  // Fee configuration (Brik platform fee)
  // TEST ENVIRONMENT: 50% fee for testing
  fee: 0.5, // 50% platform fee (TEST ONLY)
};

// ============================================================================
// SDK Configuration
// ============================================================================

/**
 * LI.FI SDK configuration
 *
 * This configuration:
 * - Sets integrator to "Brik-Labs" for analytics tracking
 * - Configures RPC URLs for all supported chains
 * - Sets default route options (slippage, etc.)
 * - Enables debug mode in development
 * - IMPORTANT: Providers are configured separately in the client-side context
 *   where wagmi hooks are available. See app/providers.tsx
 *
 * The SDK will be initialized when this module is imported
 */
const sdkConfig: SDKConfig = {
  // Required: Integrator identifier for analytics
  integrator: "Brik-Labs",

  // RPC URLs for all supported chains
  rpcUrls,

  // Default route options
  routeOptions: defaultRouteOptions,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",

  // Preload chain information for better performance
  preloadChains: true,

  // Disable package update checks to avoid CSP violations
  disableVersionCheck: true,

  // NOTE: Providers are NOT configured here because they need access to wagmi hooks
  // which are only available in React component context. The EVM provider will be
  // configured dynamically in app/providers.tsx using the LiFiSDKProviders component

  // NOTE: API key should NOT be included here as this config is used client-side
  // If you need API key features, implement them in server-side API routes only
  // The SDK works fine without an API key for standard swap functionality
  // Optional: Custom API URL (defaults to LI.FI production API)
  // apiUrl: 'https://li.quest',
};

// ============================================================================
// Initialize SDK
// ============================================================================

/**
 * Create and export the configured LI.FI SDK instance
 * This should be called once when the module is imported
 *
 * Note: The providers array is empty here and will be populated dynamically
 * in the LiFiSDKProviders component (app/providers.tsx) using config.setProviders()
 */
export const lifiConfig = createConfig(sdkConfig);

// ============================================================================
// Exports
// ============================================================================

/**
 * Export chain ID mapping utility
 * Useful for converting between wagmi chain IDs and LI.FI ChainIds
 */
export { chainIdMap };

/**
 * Get LI.FI ChainId from wagmi chain ID
 */
export function getLiFiChainId(wagmiChainId: number): ChainId | undefined {
  return chainIdMap[wagmiChainId];
}

/**
 * Get wagmi chain ID from LI.FI ChainId
 */
export function getWagmiChainId(lifiChainId: ChainId): number | undefined {
  const entry = Object.entries(chainIdMap).find(
    ([, lifiId]) => lifiId === lifiChainId
  );
  return entry ? Number(entry[0]) : undefined;
}

/**
 * Default route options (can be imported and customized per request)
 */
export { defaultRouteOptions };

/**
 * RPC URLs mapping (can be used for custom RPC configuration)
 */
export { rpcUrls };
