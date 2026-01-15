/**
 * Portfolio Service
 *
 * Single Responsibility: Handle business logic for portfolio management
 * - Aggregates token balances across multiple chains
 * - Enriches balances with current prices
 * - Calculates historical performance metrics
 *
 * Follows Dependency Inversion Principle:
 * - Depends on CoingeckoService abstraction for market data
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CoingeckoService } from '../coingecko/coingecko.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { MarketDataDto } from '../coingecko/dto/market-data.dto';
import {
  PortfolioResponseDto,
  TokenBalanceDto,
  PerformanceDto,
} from './dto/portfolio-response.dto';
import { ALL_RWA_TOKENS } from '../../config/constants/tokens.constant';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    private readonly coingeckoService: CoingeckoService,
    private readonly blockchainService: BlockchainService,
  ) {}

  /**
   * Get complete portfolio for a wallet address
   *
   * @param walletAddress Ethereum wallet address
   * @param includePerformance Whether to include historical performance metrics
   * @returns Portfolio response with balances and performance
   */
  async getPortfolio(
    walletAddress: string,
    includePerformance: boolean = true,
  ): Promise<PortfolioResponseDto> {
    try {
      this.logger.debug(
        `Fetching portfolio for ${walletAddress}, includePerformance: ${includePerformance}`,
      );

      // Get RWA token CoinGecko IDs
      const rwaTokenIds = ALL_RWA_TOKENS.map((t) => t.coingeckoId);

      // Fetch current market data for all RWA tokens
      const marketData = await this.coingeckoService.getMarketsData({
        vs_currency: 'usd',
        ids: rwaTokenIds.join(','),
        order: 'market_cap_desc',
        per_page: 250,
        price_change_percentage: includePerformance ? '7d,30d' : undefined,
        sparkline: false,
      });

      this.logger.debug(`Fetched market data for ${marketData.length} tokens`);

      // Fetch on-chain balances for all RWA tokens
      const blockchainBalances =
        await this.blockchainService.getAllRWATokenBalances(walletAddress);

      this.logger.debug(
        `Fetched ${blockchainBalances.length} blockchain balances`,
      );

      // Enrich balances with market data (prices, images)
      const balances: TokenBalanceDto[] = this.enrichBalancesWithMarketData(
        blockchainBalances,
        marketData,
      );

      // Calculate total portfolio value
      const totalValueUSD = balances.reduce(
        (sum, balance) => sum + balance.usdValue,
        0,
      );

      // Calculate performance metrics if requested
      const performance: PerformanceDto = includePerformance
        ? this.calculatePerformance(balances, marketData)
        : {
            change24h: 0,
            change24hPercent: 0,
            change7d: 0,
            change7dPercent: 0,
            change30d: 0,
            change30dPercent: 0,
          };

      this.logger.debug(
        `Portfolio calculation complete. Total value: $${totalValueUSD.toFixed(2)}`,
      );

      return {
        walletAddress: walletAddress.toLowerCase(),
        totalValueUSD,
        balances: balances.filter((b) => parseFloat(b.balanceFormatted) > 0),
        performance,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Error fetching portfolio for ${walletAddress}:`,
        error,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch portfolio data',
          error: 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Calculate historical performance metrics
   * Based on price changes from market data
   *
   * @param balances Current token balances
   * @param marketData Market data with price change percentages
   * @returns Performance metrics
   */
  private calculatePerformance(
    balances: TokenBalanceDto[],
    marketData: MarketDataDto[],
  ): PerformanceDto {
    const currentValue = balances.reduce(
      (sum, balance) => sum + balance.usdValue,
      0,
    );

    if (currentValue === 0) {
      return {
        change24h: 0,
        change24hPercent: 0,
        change7d: 0,
        change7dPercent: 0,
        change30d: 0,
        change30dPercent: 0,
      };
    }

    // Calculate weighted average price changes
    let weightedChange24hPercent = 0;
    let weightedChange7dPercent = 0;
    let weightedChange30dPercent = 0;

    balances.forEach((balance) => {
      const tokenMarketData = marketData.find(
        (m) =>
          ALL_RWA_TOKENS.find((t) => t.symbol === balance.symbol)
            ?.coingeckoId === m.id,
      );

      if (tokenMarketData && balance.usdValue > 0) {
        const weight = balance.usdValue / currentValue;
        weightedChange24hPercent +=
          (tokenMarketData.priceChangePercentage24h ?? 0) * weight;
        weightedChange7dPercent +=
          (tokenMarketData.priceChangePercentage7d ?? 0) * weight;
        weightedChange30dPercent +=
          (tokenMarketData.priceChangePercentage30d ?? 0) * weight;
      }
    });

    // Calculate absolute changes
    const change24h = (currentValue * weightedChange24hPercent) / 100;
    const change7d = (currentValue * weightedChange7dPercent) / 100;
    const change30d = (currentValue * weightedChange30dPercent) / 100;

    return {
      change24h: parseFloat(change24h.toFixed(2)),
      change24hPercent: parseFloat(weightedChange24hPercent.toFixed(2)),
      change7d: parseFloat(change7d.toFixed(2)),
      change7dPercent: parseFloat(weightedChange7dPercent.toFixed(2)),
      change30d: parseFloat(change30d.toFixed(2)),
      change30dPercent: parseFloat(weightedChange30dPercent.toFixed(2)),
    };
  }

  /**
   * Enrich blockchain balances with market data (prices, images)
   *
   * @param blockchainBalances Balances fetched from blockchain
   * @param marketData Market data from CoinGecko
   * @returns Enriched token balances with USD values
   */
  private enrichBalancesWithMarketData(
    blockchainBalances: Array<{
      symbol: string;
      name: string;
      decimals: number;
      chainId: number;
      contractAddress: string;
      balance: bigint;
      balanceFormatted: string;
    }>,
    marketData: MarketDataDto[],
  ): TokenBalanceDto[] {
    return blockchainBalances
      .map((blockchainBalance) => {
        const token = ALL_RWA_TOKENS.find(
          (t) => t.symbol === blockchainBalance.symbol,
        );
        const market = marketData.find((m) => m.id === token?.coingeckoId);

        if (!token || !market) {
          this.logger.warn(
            `Token ${blockchainBalance.symbol} not found in market data`,
          );
          return null;
        }

        const price = market.currentPrice ?? 0;
        const balanceNum = parseFloat(blockchainBalance.balanceFormatted);
        const usdValue = balanceNum * price;

        return {
          symbol: blockchainBalance.symbol,
          name: blockchainBalance.name,
          balance: blockchainBalance.balance.toString(),
          balanceFormatted: blockchainBalance.balanceFormatted,
          decimals: blockchainBalance.decimals,
          chainId: blockchainBalance.chainId,
          chainName: this.getChainName(blockchainBalance.chainId),
          contractAddress: blockchainBalance.contractAddress,
          usdValue,
          price,
          image: market.image,
        } as TokenBalanceDto;
      })
      .filter((balance): balance is TokenBalanceDto => balance !== null);
  }

  /**
   * Get chain name from chain ID
   *
   * @param chainId Chain ID
   * @returns Chain name
   */
  private getChainName(chainId: number): string {
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      56: 'BSC',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      43114: 'Avalanche',
    };
    return chainNames[chainId] || 'Unknown';
  }
}
