/**
 * Chain Utilities
 * Helper functions for chain management and validation
 */

import { CHAIN_IDS, SUPPORTED_CHAINS, isSupportedChain } from '@/lib/constants/chains';

// ============================================================================
// Chain Validation
// ============================================================================

/**
 * Check if the user is on the correct chain for a token
 */
export function isCorrectChain(
  currentChainId: number | undefined,
  requiredChainId: number
): boolean {
  return currentChainId === requiredChainId;
}

/**
 * Get chain mismatch error message
 */
export function getChainMismatchMessage(
  currentChainId: number | undefined,
  requiredChainId: number
): string {
  if (!currentChainId) {
    return 'Please connect your wallet';
  }

  const currentChain = SUPPORTED_CHAINS.find((c) => c.id === currentChainId);
  const requiredChain = SUPPORTED_CHAINS.find((c) => c.id === requiredChainId);

  if (!requiredChain) {
    return `Please switch to chain ID ${requiredChainId}`;
  }

  if (!currentChain) {
    return `Please switch to ${requiredChain.name}`;
  }

  return `Please switch from ${currentChain.name} to ${requiredChain.name}`;
}

// ============================================================================
// Chain Info
// ============================================================================

/**
 * Get chain name from chain ID
 */
export function getChainName(chainId: number): string {
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  return chain?.name || `Chain ${chainId}`;
}

/**
 * Get chain short name (symbol) from chain ID
 */
export function getChainShortName(chainId: number): string {
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  return chain?.shortName || `Chain ${chainId}`;
}

/**
 * Get block explorer URL for a transaction
 */
export function getBlockExplorerUrl(
  chainId: number,
  txHash: string
): string | null {
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  if (!chain) {
    return null;
  }

  return `${chain.blockExplorer}/tx/${txHash}`;
}

/**
 * Get block explorer URL for an address
 */
export function getAddressExplorerUrl(
  chainId: number,
  address: string
): string | null {
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  if (!chain) {
    return null;
  }

  return `${chain.blockExplorer}/address/${address}`;
}

// ============================================================================
// Chain Selection
// ============================================================================

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.values(CHAIN_IDS);
}

/**
 * Check if a chain requires chain switching
 */
export function requiresChainSwitch(
  currentChainId: number | undefined,
  targetChainId: number
): boolean {
  if (!currentChainId) {
    return true;
  }

  return currentChainId !== targetChainId;
}

// Export constants for convenience
export { CHAIN_IDS, SUPPORTED_CHAINS, isSupportedChain };
