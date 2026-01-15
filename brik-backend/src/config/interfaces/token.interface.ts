/**
 * Token Configuration Interface
 *
 * Defines the complete structure for supported tokens in the Brik RWA platform.
 * Includes contract addresses, decimals, CoinGecko ID, and metadata.
 */

export interface TokenConfig {
  /** Token symbol (e.g., PAXG, USDT) */
  symbol: string;

  /** Full token name */
  name: string;

  /** Number of decimal places */
  decimals: number;

  /** CoinGecko API identifier */
  coingeckoId: string;

  /** Contract addresses mapped by chain ID */
  addresses: { [chainId: number]: string };

  /** Token image URL from CoinGecko */
  image: string;
}

/**
 * Chain Configuration Interface
 *
 * Defines blockchain network configuration including RPC and block explorer URLs.
 */
export interface ChainConfig {
  /** Chain ID (e.g., 1 for Ethereum, 56 for BSC) */
  id: number;

  /** Chain name */
  name: string;

  /** RPC endpoint URL */
  rpcUrl: string;

  /** Native currency configuration */
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };

  /** Block explorer URL */
  blockExplorer: string;
}

/**
 * Token Lookup Map by Symbol
 * For O(1) access by normalized symbol (lowercase)
 */
export interface TokenLookupMap {
  [symbolNormalized: string]: TokenConfig;
}

/**
 * Token Lookup Map by CoinGecko ID
 * For O(1) access by CoinGecko identifier
 */
export interface TokenByCoinGeckoIdMap {
  [coingeckoId: string]: TokenConfig;
}

/**
 * Chain Lookup Map by Chain ID
 * For O(1) access by chain ID
 */
export interface ChainLookupMap {
  [chainId: number]: ChainConfig;
}

/**
 * Tokens by Chain Map
 * Maps chain ID to array of tokens available on that chain
 */
export interface TokensByChainMap {
  [chainId: number]: TokenConfig[];
}
