/**
 * Blockchain Service
 *
 * Single Responsibility: Handle on-chain data fetching
 * - Fetches token balances using viem multicall
 * - Supports multiple chains and tokens
 * - Efficient batch RPC calls
 *
 * Follows Dependency Inversion Principle:
 * - Independent service with no external dependencies
 */

import { Injectable, Logger } from '@nestjs/common';
import { createPublicClient, http, Address, PublicClient } from 'viem';
import {
  mainnet,
  bsc,
  polygon,
  arbitrum,
  optimism,
  avalanche,
} from 'viem/chains';
import { ERC20_ABI } from '../../config/constants/abis.constant';
import {
  ALL_CHAINS,
  TOKENS_BY_CHAIN,
} from '../../config/constants/tokens.constant';
import type { TokenConfig } from '../../config/interfaces/token.interface';

/**
 * Token balance result from blockchain
 */
export interface TokenBalance {
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  contractAddress: string;
  balance: bigint;
  balanceFormatted: string;
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private readonly clients: Map<number, PublicClient>;

  constructor() {
    // Initialize viem public clients for each supported chain
    this.clients = new Map();

    const chainConfigs = {
      1: { chain: mainnet, rpcUrl: 'https://eth.llamarpc.com' },
      56: { chain: bsc, rpcUrl: 'https://bsc-dataseed.binance.org' },
      137: { chain: polygon, rpcUrl: 'https://polygon-rpc.com' },
      42161: { chain: arbitrum, rpcUrl: 'https://arb1.arbitrum.io/rpc' },
      10: { chain: optimism, rpcUrl: 'https://mainnet.optimism.io' },
      43114: {
        chain: avalanche,
        rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
      },
    };

    Object.entries(chainConfigs).forEach(([chainId, config]) => {
      const client = createPublicClient({
        chain: config.chain,
        transport: http(config.rpcUrl),
      }) as PublicClient;
      this.clients.set(Number(chainId), client);
    });

    this.logger.log(
      `Initialized blockchain clients for ${this.clients.size} chains`,
    );
  }

  /**
   * Get all RWA token balances for a wallet address
   * Uses multicall for efficient batch fetching across all chains
   *
   * @param walletAddress Ethereum wallet address
   * @returns Array of token balances
   */
  async getAllRWATokenBalances(walletAddress: string): Promise<TokenBalance[]> {
    try {
      this.logger.debug(`Fetching RWA token balances for ${walletAddress}`);

      const allBalances: TokenBalance[] = [];

      // Fetch balances from each chain in parallel
      const chainPromises = ALL_CHAINS.map(async (chain) => {
        const tokensOnChain = TOKENS_BY_CHAIN[chain.id] || [];

        if (tokensOnChain.length === 0) {
          return [];
        }

        return this.getTokenBalancesOnChain(
          walletAddress as Address,
          chain.id,
          tokensOnChain,
        );
      });

      const chainResults = await Promise.all(chainPromises);

      // Flatten results
      chainResults.forEach((balances) => {
        allBalances.push(...balances);
      });

      const nonZeroBalances = allBalances.filter((b) => b.balance > 0n);

      this.logger.debug(
        `Found ${nonZeroBalances.length} non-zero balances out of ${allBalances.length} total tokens checked`,
      );

      return allBalances;
    } catch (error) {
      this.logger.error(`Error fetching RWA token balances:`, error);
      throw error;
    }
  }

  /**
   * Get token balances on a specific chain using multicall
   *
   * @param walletAddress Wallet address
   * @param chainId Chain ID
   * @param tokens Tokens to check
   * @returns Array of token balances
   */
  private async getTokenBalancesOnChain(
    walletAddress: Address,
    chainId: number,
    tokens: TokenConfig[],
  ): Promise<TokenBalance[]> {
    const client = this.clients.get(chainId);

    if (!client) {
      this.logger.warn(`No client configured for chain ${chainId}`);
      return [];
    }

    try {
      // Build multicall contracts array
      const contracts = tokens
        .filter((token) => token.addresses[chainId]) // Only tokens available on this chain
        .map((token) => ({
          address: token.addresses[chainId] as Address,
          abi: ERC20_ABI,
          functionName: 'balanceOf' as const,
          args: [walletAddress],
        }));

      if (contracts.length === 0) {
        return [];
      }

      this.logger.debug(
        `Fetching ${contracts.length} token balances on chain ${chainId}`,
      );

      // Execute multicall
      const results = await client.multicall({
        contracts,
        allowFailure: true,
      });

      // Process results
      const balances: TokenBalance[] = [];

      results.forEach((result, index) => {
        const token = tokens.filter((t) => t.addresses[chainId])[index];

        if (!token) {
          return;
        }

        const contractAddress = token.addresses[chainId];

        if (result.status === 'success' && result.result !== undefined) {
          const balance = result.result;
          const balanceFormatted = this.formatBalance(balance, token.decimals);

          balances.push({
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            chainId,
            contractAddress,
            balance,
            balanceFormatted,
          });
        } else {
          // Balance fetch failed, return zero balance
          this.logger.warn(
            `Failed to fetch balance for ${token.symbol} on chain ${chainId}: ${result.status === 'failure' ? result.error?.message : 'unknown error'}`,
          );

          balances.push({
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            chainId,
            contractAddress,
            balance: 0n,
            balanceFormatted: '0',
          });
        }
      });

      return balances;
    } catch (error) {
      this.logger.error(`Error fetching balances on chain ${chainId}:`, error);
      return [];
    }
  }

  /**
   * Format token balance from wei/smallest unit to human-readable format
   *
   * @param balance Balance in smallest unit (wei)
   * @param decimals Token decimals
   * @returns Formatted balance string
   */
  private formatBalance(balance: bigint, decimals: number): string {
    if (balance === 0n) {
      return '0';
    }

    const divisor = BigInt(10 ** decimals);
    const wholePart = balance / divisor;
    const fractionalPart = balance % divisor;

    if (fractionalPart === 0n) {
      return wholePart.toString();
    }

    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const trimmedFractional = fractionalStr.replace(/0+$/, '');

    if (trimmedFractional === '') {
      return wholePart.toString();
    }

    return `${wholePart}.${trimmedFractional}`;
  }
}
