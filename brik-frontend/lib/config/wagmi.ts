/**
 * Wagmi Configuration
 * Web3 wallet connection and blockchain interaction setup
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import {
  mainnet,
  bsc,
  polygon,
  arbitrum,
  optimism,
  avalanche,
  supportedChains,
} from '@/lib/config/chains';

// ============================================================================
// Environment Variables
// ============================================================================

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
// const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

// Validate required environment variables
if (!projectId) {
  console.warn(
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Get your project ID at https://cloud.reown.com/'
  );
}

// ============================================================================
// RPC Transports Configuration
// ============================================================================

/**
 * Configure RPC transports for each chain
 * Uses custom RPC providers if available, otherwise falls back to public RPCs
 */
const transports = {
  // Ethereum Mainnet
  [mainnet.id]: http(

       'https://eth.merkle.io'
  ),

  // BNB Smart Chain
  [bsc.id]: http(
    // BSC doesn't have Alchemy support, using public RPC
    'https://bsc-dataseed1.binance.org'
  ),

  // Polygon
  [polygon.id]: http(
"https://polygon-rpc.com"
  ),

  // Arbitrum One
  [arbitrum.id]: http(
   "https://arb1.arbitrum.io/rpc"
  ),

  // Optimism
  [optimism.id]: http(
    "https://mainnet.optimism.io"
  ),

  // Avalanche C-Chain
  [avalanche.id]: http(
    // Avalanche doesn't have Alchemy support, using public RPC
    'https://api.avax.network/ext/bc/C/rpc'
  ),
};

// ============================================================================
// Wagmi Configuration
// ============================================================================

/**
 * Configure Wagmi with RainbowKit
 * Supports 6 chains: Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche
 */
export const config = getDefaultConfig({
  appName: 'Brik',
  projectId: projectId || 'PLACEHOLDER_PROJECT_ID',
  chains: [mainnet, bsc, polygon, arbitrum, optimism, avalanche],
  transports,
  ssr: true, // Enable server-side rendering support for Next.js
});

// ============================================================================
// Export Chain Constants for Easy Access
// ============================================================================

export { supportedChains, mainnet, bsc, polygon, arbitrum, optimism, avalanche };
