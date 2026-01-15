/**
 * Blockchain Chain Constants
 * Supported chains and their configurations
 */

// ============================================================================
// Chain IDs
// ============================================================================

export const CHAIN_IDS = {
  ETHEREUM: 1,
  BNB_SMART_CHAIN: 56,
  POLYGON: 137,
  ARBITRUM_ONE: 42161,
  OPTIMISM: 10,
  AVALANCHE: 43114,
} as const;

// ============================================================================
// Chain Names
// ============================================================================

export const CHAIN_NAMES: Record<number, string> = {
  [CHAIN_IDS.ETHEREUM]: 'Ethereum',
  [CHAIN_IDS.BNB_SMART_CHAIN]: 'BNB Smart Chain',
  [CHAIN_IDS.POLYGON]: 'Polygon',
  [CHAIN_IDS.ARBITRUM_ONE]: 'Arbitrum One',
  [CHAIN_IDS.OPTIMISM]: 'Optimism',
  [CHAIN_IDS.AVALANCHE]: 'Avalanche C-Chain',
};

// ============================================================================
// Chain Configuration
// ============================================================================

export interface ChainConfig {
  id: number;
  name: string;
  shortName: string;
  symbol: string; // Native token symbol
  blockExplorer: string;
  rpcUrl?: string;
}

export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    id: CHAIN_IDS.ETHEREUM,
    name: 'Ethereum',
    shortName: 'ETH',
    symbol: 'ETH',
    blockExplorer: 'https://etherscan.io',
  },
  {
    id: CHAIN_IDS.BNB_SMART_CHAIN,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    symbol: 'BNB',
    blockExplorer: 'https://bscscan.com',
  },
  {
    id: CHAIN_IDS.POLYGON,
    name: 'Polygon',
    shortName: 'MATIC',
    symbol: 'MATIC',
    blockExplorer: 'https://polygonscan.com',
  },
  {
    id: CHAIN_IDS.ARBITRUM_ONE,
    name: 'Arbitrum One',
    shortName: 'ARB',
    symbol: 'ETH',
    blockExplorer: 'https://arbiscan.io',
  },
  {
    id: CHAIN_IDS.OPTIMISM,
    name: 'Optimism',
    shortName: 'OP',
    symbol: 'ETH',
    blockExplorer: 'https://optimistic.etherscan.io',
  },
  {
    id: CHAIN_IDS.AVALANCHE,
    name: 'Avalanche C-Chain',
    shortName: 'AVAX',
    symbol: 'AVAX',
    blockExplorer: 'https://snowtrace.io',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get chain name by ID
 */
export function getChainName(chainId: number): string {
  return CHAIN_NAMES[chainId] || 'Unknown Chain';
}

/**
 * Get chain configuration by ID
 */
export function getChainConfig(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId);
}

/**
 * Check if chain is supported
 */
export function isSupportedChain(chainId: number): boolean {
  return chainId in CHAIN_NAMES;
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.values(CHAIN_IDS);
}
