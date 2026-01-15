/**
 * Chain Configuration Constants
 * USDC addresses and chain-specific configurations
 */

export const CHAIN_CONFIG = {
  // Ethereum Mainnet
  1: {
    name: 'Ethereum',
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    rpcUrl: 'https://eth.llamarpc.com',
  },
  // Binance Smart Chain
  56: {
    name: 'BSC',
    usdc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC on BSC
    rpcUrl: 'https://bsc-dataseed.binance.org',
  },
  // Polygon
  137: {
    name: 'Polygon',
    usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC (native) on Polygon
    rpcUrl: 'https://polygon-rpc.com',
  },
  // Arbitrum
  42161: {
    name: 'Arbitrum',
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC (native) on Arbitrum
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
  },
  // Optimism
  10: {
    name: 'Optimism',
    usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', // USDC (native) on Optimism
    rpcUrl: 'https://mainnet.optimism.io',
  },
  // Avalanche C-Chain
  43114: {
    name: 'Avalanche',
    usdc: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC on Avalanche
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  },
} as const;

export type ChainId = keyof typeof CHAIN_CONFIG;

/**
 * Get USDC address for a specific chain
 */
export function getUsdcAddress(chainId: number): string {
  const config = CHAIN_CONFIG[chainId as ChainId];
  if (!config) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return config.usdc;
}

/**
 * Get chain name
 */
export function getChainName(chainId: number): string {
  const config = CHAIN_CONFIG[chainId as ChainId];
  if (!config) {
    return `Unknown Chain (${chainId})`;
  }
  return config.name;
}

/**
 * Check if chain is supported
 */
export function isSupportedChain(chainId: number): boolean {
  return chainId in CHAIN_CONFIG;
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(CHAIN_CONFIG).map(Number);
}
