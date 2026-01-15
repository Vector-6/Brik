/**
 * Supported Chains Configuration
 * Shared constants that can be imported from both client and server
 *
 * This file only contains chain definitions and constants - no client or server-specific code
 */

import {
  mainnet,
  bsc,
  polygon,
  arbitrum,
  optimism,
  avalanche,
} from 'wagmi/chains';

// ============================================================================
// Supported Chains
// ============================================================================

/**
 * List of all supported blockchains
 */
export const supportedChains = [
  mainnet,
  bsc,
  polygon,
  arbitrum,
  optimism,
  avalanche,
] as const;

// ============================================================================
// Individual Chain Exports
// ============================================================================

export { mainnet, bsc, polygon, arbitrum, optimism, avalanche };

// ============================================================================
// RPC URLs (Public)
// ============================================================================

/**
 * Public RPC URLs for each supported chain
 * Can be used from both client and server
 */
export const publicRpcUrls = {
  [mainnet.id]: 'https://eth.merkle.io',
  [bsc.id]: 'https://bsc-dataseed1.binance.org',
  [polygon.id]: 'https://polygon-rpc.com',
  [arbitrum.id]: 'https://arb1.arbitrum.io/rpc',
  [optimism.id]: 'https://mainnet.optimism.io',
  [avalanche.id]: 'https://api.avax.network/ext/bc/C/rpc',
} as const;
