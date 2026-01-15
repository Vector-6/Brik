/**
 * Token Filter Utilities
 * Functions for filtering, searching, and sorting tokens
 */

import { Token } from '@/lib/types/token.types';

// ============================================================================
// Search & Filter Functions
// ============================================================================

/**
 * Search tokens by symbol or name (case-insensitive)
 *
 * @param tokens - Array of tokens to search
 * @param query - Search query string
 * @returns Filtered tokens matching the query
 *
 * @example
 * const results = searchTokens(allTokens, 'gold');
 * // Returns tokens with 'gold' in symbol or name (e.g., PAXG - PAX Gold)
 */
export function searchTokens(tokens: Token[], query: string): Token[] {
  if (!query || query.trim() === '') {
    return tokens;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return tokens.filter((token) => {
    const symbolMatch = token.symbol.toLowerCase().includes(normalizedQuery);
    const nameMatch = token.name.toLowerCase().includes(normalizedQuery);
    return symbolMatch || nameMatch;
  });
}

/**
 * Exclude a specific token from the list
 * Used to prevent selecting the same token in both "from" and "to"
 * Compares both symbol and chain ID to handle multi-chain tokens
 *
 * @param tokens - Array of tokens
 * @param excludedToken - Token to exclude (or null)
 * @returns Filtered tokens without the excluded token
 *
 * @example
 * const availableTokens = excludeToken(allTokens, selectedFromToken);
 */
export function excludeToken(
  tokens: Token[],
  excludedToken: Token | null
): Token[] {
  if (!excludedToken) {
    return tokens;
  }

  return tokens.filter(
    (token) =>
      token.symbol !== excludedToken.symbol ||
      token.currentChainId !== excludedToken.currentChainId
  );
}

/**
 * Filter tokens by chain ID
 *
 * @param tokens - Array of tokens
 * @param chainId - Blockchain chain ID
 * @returns Tokens available on the specified chain
 */
export function filterTokensByChain(tokens: Token[], chainId: number): Token[] {
  return tokens.filter((token) =>
    token.chainsAvailable.some((chain) => chain.chainId === chainId)
  );
}

/**
 * Filter tokens that have market data
 *
 * @param tokens - Array of tokens
 * @returns Tokens with market data
 */
export function filterTokensWithMarketData(tokens: Token[]): Token[] {
  return tokens.filter((token) => token.marketData !== undefined);
}

// ============================================================================
// Sorting Functions
// ============================================================================

/**
 * Sort tokens by market capitalization (descending)
 * Tokens without market data are placed at the end
 *
 * @param tokens - Array of tokens to sort
 * @returns Sorted tokens
 */
export function sortTokensByMarketCap(tokens: Token[]): Token[] {
  return [...tokens].sort((a, b) => {
    // Tokens with market data come first
    if (a.marketData && !b.marketData) return -1;
    if (!a.marketData && b.marketData) return 1;
    if (!a.marketData && !b.marketData) return 0;

    // Sort by market cap
    return (b.marketData!.marketCap || 0) - (a.marketData!.marketCap || 0);
  });
}

/**
 * Sort tokens alphabetically by symbol
 *
 * @param tokens - Array of tokens to sort
 * @returns Sorted tokens
 */
export function sortTokensAlphabetically(tokens: Token[]): Token[] {
  return [...tokens].sort((a, b) => a.symbol.localeCompare(b.symbol));
}

/**
 * Sort tokens with popular tokens first, then alphabetically
 *
 * @param tokens - Array of tokens to sort
 * @param popularSymbols - Array of popular token symbols
 * @returns Sorted tokens
 */
export function sortTokensByPopularity(
  tokens: Token[],
  popularSymbols: string[] = []
): Token[] {
  return [...tokens].sort((a, b) => {
    const aIsPopular = popularSymbols.includes(a.symbol);
    const bIsPopular = popularSymbols.includes(b.symbol);

    // Popular tokens first
    if (aIsPopular && !bIsPopular) return -1;
    if (!aIsPopular && bIsPopular) return 1;

    // Then alphabetically
    return a.symbol.localeCompare(b.symbol);
  });
}

// ============================================================================
// Lookup Functions
// ============================================================================

/**
 * Find a token by its symbol (returns first match)
 * Note: Since tokens can exist on multiple chains, use getTokensBySymbol
 * or getTokenBySymbolAndChain for more precise lookups
 *
 * @param tokens - Array of tokens
 * @param symbol - Token symbol to find
 * @returns First token matching the symbol, undefined otherwise
 */
export function getTokenBySymbol(
  tokens: Token[],
  symbol: string
): Token | undefined {
  return tokens.find(
    (token) => token.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

/**
 * Find all tokens matching a symbol (across all chains)
 *
 * @param tokens - Array of tokens
 * @param symbol - Token symbol to find
 * @returns Array of tokens matching the symbol
 */
export function getTokensBySymbol(tokens: Token[], symbol: string): Token[] {
  return tokens.filter(
    (token) => token.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

/**
 * Find a token by symbol and chain ID
 *
 * @param tokens - Array of tokens
 * @param symbol - Token symbol to find
 * @param chainId - Chain ID
 * @returns Token if found, undefined otherwise
 */
export function getTokenBySymbolAndChain(
  tokens: Token[],
  symbol: string,
  chainId: number
): Token | undefined {
  return tokens.find(
    (token) =>
      token.symbol.toLowerCase() === symbol.toLowerCase() &&
      token.currentChainId === chainId
  );
}

/**
 * Find a token by its CoinGecko ID
 *
 * @param tokens - Array of tokens
 * @param coingeckoId - CoinGecko ID
 * @returns Token if found, undefined otherwise
 */
export function getTokenByCoingeckoId(
  tokens: Token[],
  coingeckoId: string
): Token | undefined {
  return tokens.find((token) => token.coingeckoId === coingeckoId);
}

// ============================================================================
// Combined Filter & Sort
// ============================================================================

/**
 * Apply multiple filters and sorting to tokens
 *
 * @param tokens - Array of tokens
 * @param options - Filter and sort options
 * @returns Filtered and sorted tokens
 */
export function filterAndSortTokens(
  tokens: Token[],
  options: {
    searchQuery?: string;
    excludeToken?: Token | null;
    chainId?: number;
    onlyWithMarketData?: boolean;
    sortBy?: 'marketCap' | 'alphabetical' | 'popularity';
    popularSymbols?: string[];
  } = {}
): Token[] {
  let result = tokens;

  // Apply filters
  if (options.searchQuery) {
    result = searchTokens(result, options.searchQuery);
  }

  if (options.excludeToken) {
    result = excludeToken(result, options.excludeToken);
  }

  if (options.chainId) {
    result = filterTokensByChain(result, options.chainId);
  }

  if (options.onlyWithMarketData) {
    result = filterTokensWithMarketData(result);
  }

  // Apply sorting
  switch (options.sortBy) {
    case 'marketCap':
      result = sortTokensByMarketCap(result);
      break;
    case 'popularity':
      result = sortTokensByPopularity(result, options.popularSymbols);
      break;
    case 'alphabetical':
    default:
      result = sortTokensAlphabetically(result);
      break;
  }

  return result;
}
