/**
 * Chain Logo and Metadata Configuration
 * Chain logos, colors, and visual identifiers for UI display
 */

// ============================================================================
// Chain Logo URLs (using public CDN)
// ============================================================================

export interface ChainLogoConfig {
  name: string;
  shortName: string;
  logo: string; // URL to chain logo
  color: string; // Primary brand color
  bgGradient: string; // Background gradient for badges
}

/**
 * Chain logo configurations with public CDN URLs
 * Using cryptocurrency-icons.com and chain official assets
 */
export const CHAIN_LOGOS: Record<string, ChainLogoConfig> = {
  Ethereum: {
    name: 'Ethereum',
    shortName: 'ETH',
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    color: '#627EEA',
    bgGradient: 'from-blue-500/20 to-indigo-600/20',
  },
  'BNB Smart Chain': {
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
    color: '#F0B90B',
    bgGradient: 'from-yellow-500/20 to-yellow-600/20',
  },
  Polygon: {
    name: 'Polygon',
    shortName: 'MATIC',
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
    color: '#8247E5',
    bgGradient: 'from-purple-500/20 to-violet-600/20',
  },
  'Arbitrum One': {
    name: 'Arbitrum One',
    shortName: 'ARB',
    logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg',
    color: '#28A0F0',
    bgGradient: 'from-blue-400/20 to-cyan-500/20',
  },
  Optimism: {
    name: 'Optimism',
    shortName: 'OP',
    logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg',
    color: '#FF0420',
    bgGradient: 'from-red-500/20 to-pink-600/20',
  },
  'Avalanche C-Chain': {
    name: 'Avalanche',
    shortName: 'AVAX',
    logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg',
    color: '#E84142',
    bgGradient: 'from-red-500/20 to-red-600/20',
  },
};

/**
 * Get chain logo configuration by name
 * Returns a default config if chain is not found
 */
export function getChainLogo(chainName: string): ChainLogoConfig {
  // Try exact match first
  if (CHAIN_LOGOS[chainName]) {
    return CHAIN_LOGOS[chainName];
  }

  // Try partial match (case-insensitive)
  const normalizedName = chainName.toLowerCase();
  const matchedKey = Object.keys(CHAIN_LOGOS).find((key) =>
    key.toLowerCase().includes(normalizedName)
  );

  if (matchedKey) {
    return CHAIN_LOGOS[matchedKey];
  }

  // Return default configuration for unknown chains
  return {
    name: chainName,
    shortName: chainName.substring(0, 3).toUpperCase(),
    logo: '', // Will use fallback in component
    color: '#6B7280',
    bgGradient: 'from-gray-500/20 to-gray-600/20',
  };
}

/**
 * Get multiple chain logos for display
 */
export function getChainLogos(chainNames: string[]): ChainLogoConfig[] {
  return chainNames.map((name) => getChainLogo(name));
}
