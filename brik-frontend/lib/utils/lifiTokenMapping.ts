/**
 * LI.FI Token Mapping Utilities
 * Convert internal token representations to LI.FI-compatible formats.
 */

import { ChainId } from "@lifi/types";

import { getLiFiChainId } from "@/lib/config/lifi";
import type { LiFiToken } from "@/lib/types/lifi.types";
import type { Token } from "@/lib/types/token.types";

// ============================================================================
// Constants
// ============================================================================

/**
 * Zero address used by LI.FI (and most aggregators) to represent native tokens.
 */
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Alternate address used in some ecosystems to represent native tokens.
 * (e.g. 1inch style "EEEE" address)
 */
const EEEE_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

/**
 * Polygon exposes a pseudo-address for the native MATIC token that some APIs use.
 */
const POLYGON_NATIVE_ADDRESS = "0x0000000000000000000000000000000000001010";

/**
 * Known sentinel values that identify native tokens across different providers.
 */
const NATIVE_ADDRESS_SENTINELS = new Set([
  ZERO_ADDRESS.toLowerCase(),
  EEEE_ADDRESS.toLowerCase(),
  POLYGON_NATIVE_ADDRESS.toLowerCase(),
  "native",
  "native_token",
]);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalize an address/string for comparison.
 */
function normalizeAddress(address?: string | null): string {
  return (address ?? "").trim().toLowerCase();
}

/**
 * Resolve the LI.FI ChainId for a given wagmi chain ID.
 * Throws an error if the chain is not supported by the current configuration.
 */
function resolveLiFiChainId(wagmiChainId: number): ChainId {
  const chainId = getLiFiChainId(wagmiChainId);

  if (chainId === undefined) {
    throw new Error(
      `Unsupported chainId ${wagmiChainId} for LI.FI integration. ` +
        "Ensure the chain is configured in lib/config/lifi."
    );
  }

  return chainId;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Determine whether a token represents a chain's native asset.
 */
export function isNativeToken(token: Token): boolean {
  const normalizedAddress = normalizeAddress(token.currentChainAddress);

  // Empty / undefined addresses are treated as native tokens.
  if (!normalizedAddress) {
    return true;
  }

  return NATIVE_ADDRESS_SENTINELS.has(normalizedAddress);
}

/**
 * Resolve the appropriate token address to send to LI.FI.
 * Native tokens are mapped to the zero address.
 */
export function getTokenAddress(token: Token): string {
  if (isNativeToken(token)) {
    return ZERO_ADDRESS;
  }

  return token.currentChainAddress;
}

/**
 * Map an internal Token object to the LI.FI Token schema.
 */
export function tokenToLiFiToken(token: Token): LiFiToken {
  const chainId = resolveLiFiChainId(token.currentChainId);
  const address = getTokenAddress(token);

  return {
    address,
    symbol: token.symbol,
    decimals: token.decimals,
    chainId,
    name: token.name,
    coinKey: token.symbol,
    priceUSD: token.marketData ? token.marketData.price.toString() : undefined,
    logoURI: token.logoUrl,
  };
}

/**
 * Convert a list of Token objects to LI.FI Token objects.
 * Provided for convenience when working with token lists.
 */
export function tokensToLiFiTokens(tokens: Token[]): LiFiToken[] {
  return tokens.map(tokenToLiFiToken);
}
