/**
 * Explore Service
 *
 * Single Responsibility: Handle business logic for the Explore feature
 * - Aggregates market data from CoinGecko
 * - Applies sorting and filtering logic
 * - Calculates totals and statistics
 *
 * Follows Dependency Inversion Principle:
 * - Depends on CoingeckoService abstraction (injected via DI)
 * - Not tightly coupled to external API implementation
 */

import { Injectable, Logger } from '@nestjs/common';
import { CoingeckoService } from '../coingecko/coingecko.service';
import {
  ExploreResponseDto,
  TokenMarketDataDto,
} from './dto/explore-response.dto';
import { ExploreQueryDto } from './dto/explore-query.dto';
import {
  ALL_RWA_TOKENS,
  getChainById,
} from '../../config/constants/tokens.constant';

@Injectable()
export class ExploreService {
  private readonly logger = new Logger(ExploreService.name);

  constructor(private readonly coingeckoService: CoingeckoService) {}

  /**
   * Get comprehensive market data for all supported RWA tokens
   *
   * @param query Query parameters for sorting and filtering
   * @returns Explore response with tokens and aggregated stats
   */
  async getExploreData(query: ExploreQueryDto): Promise<ExploreResponseDto> {
    this.logger.debug(
      `Getting explore data with query: ${JSON.stringify(query)}`,
    );

    // Get RWA token CoinGecko IDs
    const rwaTokenIds = ALL_RWA_TOKENS.map((t) => t.coingeckoId);

    // Fetch market data for all RWA tokens
    const marketData = await this.coingeckoService.getMarketsData({
      vs_currency: 'usd',
      ids: rwaTokenIds.join(','),
      order: 'market_cap_desc', // Default order from CoinGecko
      per_page: 250, // Maximum to get all tokens
      price_change_percentage: '7d,30d', // Include 7-day and 30-day changes
      sparkline: false,
    });

    this.logger.debug(`Fetched ${marketData.length} RWA tokens from CoinGecko`);

    // Transform and enrich market data with token metadata
    const enrichedTokens = marketData
      .map((data) => {
        // Find token in our configuration using coingeckoId
        const token = ALL_RWA_TOKENS.find((t) => t.coingeckoId === data.id);
        if (!token) {
          this.logger.warn(`Token ${data.id} not found in configuration`);
          return null;
        }

        // Get chain names from the token's addresses
        const chainsAvailable = Object.keys(token.addresses).map((chainId) => {
          const chain = getChainById(parseInt(chainId, 10));
          return chain?.name || 'Unknown';
        });

        return {
          symbol: token.symbol,
          name: token.name,
          image: data.image,
          price: data.currentPrice ?? 0,
          marketCap: data.marketCap ?? 0,
          volume24h: data.totalVolume ?? 0,
          priceChange24h: data.priceChange24h ?? 0,
          priceChangePercentage24h: data.priceChangePercentage24h ?? 0,
          chainsAvailable,
          description: `${token.name} is a Real World Asset token available on ${chainsAvailable.length} chains.`,
          category: ['rwa', 'real-world-assets'],
        } as TokenMarketDataDto;
      })
      .filter((token): token is TokenMarketDataDto => token !== null);

    // Apply sorting
    const sortedTokens = this.sortTokens(enrichedTokens, query);

    this.logger.debug(`Returning ${sortedTokens.length} RWA tokens`);

    return {
      tokens: sortedTokens,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Sort tokens based on query parameters
   *
   * @param tokens Array of tokens to sort
   * @param query Sort parameters
   * @returns Sorted array of tokens
   */
  private sortTokens(
    tokens: TokenMarketDataDto[],
    query: ExploreQueryDto,
  ): TokenMarketDataDto[] {
    const { sortBy = 'market_cap', order = 'desc' } = query;

    return tokens.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'market_cap':
          comparison = a.marketCap - b.marketCap;
          break;
        case 'volume':
          comparison = a.volume24h - b.volume24h;
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'change_24h':
          comparison = a.priceChangePercentage24h - b.priceChangePercentage24h;
          break;
        default:
          comparison = a.marketCap - b.marketCap;
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }
}
