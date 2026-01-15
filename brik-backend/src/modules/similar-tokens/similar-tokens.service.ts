/**
 * Similar Tokens Service
 *
 * Single Responsibility: Handle business logic for finding similar tokens
 * - Category-based similarity algorithm
 * - Fetches token categories from CoinGecko
 * - Calculates similarity scores
 * - Implements fallback strategy for tokens with no matches
 * - Conditionally fetches market data
 *
 * Follows Dependency Inversion Principle:
 * - Depends on CoingeckoService abstraction (injected via DI)
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CoingeckoService } from '../coingecko/coingecko.service';
import { MarketDataDto } from '../coingecko/dto/market-data.dto';
import { SimilarTokensQueryDto } from './dto/similar-tokens-query.dto';
import {
  SimilarTokensResponseDto,
  SimilarTokenDto,
  ChainAvailabilityDto,
} from './dto/similar-tokens-response.dto';
import {
  ALL_TOKENS,
  getTokenBySymbol,
  getChainById,
} from '../../config/constants/tokens.constant';
import type { TokenConfig } from '../../config/interfaces/token.interface';

interface TokenWithSimilarity {
  token: TokenConfig;
  sharedCategories: string[];
  similarityScore: number;
}

@Injectable()
export class SimilarTokensService {
  private readonly logger = new Logger(SimilarTokensService.name);

  constructor(private readonly coingeckoService: CoingeckoService) {}

  /**
   * Get tokens similar to the requested token based on shared categories
   *
   * @param symbol Token symbol to find similar tokens for
   * @param query Query parameters (limit, includeMarketData)
   * @returns Similar tokens response with similarity scores
   */
  async getSimilarTokens(
    symbol: string,
    query: SimilarTokensQueryDto,
  ): Promise<SimilarTokensResponseDto> {
    const symbolUpper = symbol.toUpperCase();
    this.logger.debug(
      `Finding similar tokens for ${symbolUpper} with query: ${JSON.stringify(query)}`,
    );

    const limit = this.parseLimit(query.limit);
    const includeMarketData = query.includeMarketData === 'true';

    const requestedToken = this.getRequestedToken(symbolUpper);
    const requestedCategories = await this.fetchTokenCategories(
      requestedToken.coingeckoId,
      symbolUpper,
    );

    this.logger.debug(
      `Requested token ${symbolUpper} has categories: ${requestedCategories.join(', ')}`,
    );

    const similarTokensWithScores = await this.findSimilarTokens(
      requestedToken,
      requestedCategories,
      symbolUpper,
    );

    const sortedTokens = this.sortBySimilarity(similarTokensWithScores);
    const limitedTokens = sortedTokens.slice(0, limit);

    const marketDataMap = includeMarketData
      ? await this.fetchMarketDataForTokens(limitedTokens)
      : {};

    const finalTokens = this.sortWithMarketData(
      limitedTokens,
      includeMarketData,
      marketDataMap,
    );

    const similarTokens = this.transformToResponse(
      finalTokens,
      includeMarketData,
      marketDataMap,
    );

    this.logger.log(
      `Returning ${similarTokens.length} similar tokens for ${symbolUpper}`,
    );

    return {
      requestedToken: {
        symbol: requestedToken.symbol,
        name: requestedToken.name,
        categories: requestedCategories,
      },
      similarTokens,
      total: similarTokens.length,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Parse and validate the limit parameter
   */
  private parseLimit(limitStr: string | undefined): number {
    const defaultLimit = 10;
    const maxLimit = 50;

    if (!limitStr) {
      return defaultLimit;
    }

    const limit = parseInt(limitStr, 10);
    if (isNaN(limit) || limit < 1) {
      return defaultLimit;
    }

    return Math.min(limit, maxLimit);
  }

  /**
   * Get the requested token from configuration
   */
  private getRequestedToken(symbol: string): TokenConfig {
    const token = getTokenBySymbol(symbol);
    if (!token) {
      throw new NotFoundException(
        `Token ${symbol} is not supported`,
        `Token ${symbol} is not supported`,
      );
    }
    return token;
  }

  /**
   * Fetch token categories from CoinGecko with error handling
   */
  private async fetchTokenCategories(
    coingeckoId: string,
    symbol: string,
  ): Promise<string[]> {
    try {
      const details = await this.coingeckoService.getTokenDetails(coingeckoId);
      return details.categories || [];
    } catch (error) {
      this.logger.warn(
        `Failed to fetch categories for ${symbol}, using empty array`,
        {
          error: error instanceof Error ? error.message : String(error),
        },
      );
      return [];
    }
  }

  /**
   * Find similar tokens based on shared categories
   * Implements fallback strategy if no matches found
   */
  private async findSimilarTokens(
    requestedToken: TokenConfig,
    requestedCategories: string[],
    requestedSymbol: string,
  ): Promise<TokenWithSimilarity[]> {
    const similarTokensMap = new Map<string, TokenWithSimilarity>();

    if (requestedCategories.length > 0) {
      await this.findCategoryBasedMatches(
        requestedToken,
        requestedCategories,
        requestedSymbol,
        similarTokensMap,
      );
    }

    if (similarTokensMap.size === 0) {
      this.logger.log(
        `No category-based matches found for ${requestedSymbol}, using fallback`,
      );
      this.applyFallbackStrategy(requestedSymbol, similarTokensMap);
    }

    return Array.from(similarTokensMap.values());
  }

  /**
   * Find tokens with shared categories
   */
  private async findCategoryBasedMatches(
    requestedToken: TokenConfig,
    requestedCategories: string[],
    requestedSymbol: string,
    similarTokensMap: Map<string, TokenWithSimilarity>,
  ): Promise<void> {
    for (const token of ALL_TOKENS) {
      if (token.symbol === requestedSymbol) {
        continue;
      }

      try {
        const tokenCategories = await this.fetchTokenCategories(
          token.coingeckoId,
          token.symbol,
        );

        const sharedCategories = requestedCategories.filter((cat) =>
          tokenCategories.includes(cat),
        );

        if (sharedCategories.length > 0) {
          const similarityScore = this.calculateSimilarityScore(
            sharedCategories.length,
            requestedCategories.length,
            tokenCategories.length,
          );

          similarTokensMap.set(token.symbol, {
            token,
            sharedCategories,
            similarityScore,
          });
        }
      } catch (error) {
        this.logger.warn(
          `Failed to process token ${token.symbol} for similarity check`,
          {
            error: error instanceof Error ? error.message : String(error),
          },
        );
      }
    }
  }

  /**
   * Calculate similarity score based on shared categories
   * Score = sharedCategories / max(requestedCategories, tokenCategories)
   */
  private calculateSimilarityScore(
    sharedCount: number,
    requestedCount: number,
    tokenCount: number,
  ): number {
    const maxCategories = Math.max(requestedCount, tokenCount);
    return sharedCount / maxCategories;
  }

  /**
   * Apply fallback strategy: return popular tokens with low similarity score
   */
  private applyFallbackStrategy(
    requestedSymbol: string,
    similarTokensMap: Map<string, TokenWithSimilarity>,
  ): void {
    const fallbackTokens = ALL_TOKENS.filter(
      (token) => token.symbol !== requestedSymbol,
    ).slice(0, 10);

    for (const token of fallbackTokens) {
      similarTokensMap.set(token.symbol, {
        token,
        sharedCategories: [],
        similarityScore: 0.1,
      });
    }
  }

  /**
   * Sort tokens by similarity score (descending)
   */
  private sortBySimilarity(
    tokens: TokenWithSimilarity[],
  ): TokenWithSimilarity[] {
    return tokens.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  /**
   * Fetch market data for tokens if requested
   */
  private async fetchMarketDataForTokens(
    tokens: TokenWithSimilarity[],
  ): Promise<Record<string, MarketDataDto>> {
    if (tokens.length === 0) {
      return {};
    }

    try {
      const coingeckoIds = tokens.map((item) => item.token.coingeckoId);

      this.logger.debug(
        `Fetching market data for ${coingeckoIds.length} similar tokens`,
      );

      const marketData = await this.coingeckoService.getMarketsData({
        vs_currency: 'usd',
        ids: coingeckoIds.join(','),
        order: 'market_cap_desc',
        per_page: 250,
        sparkline: false,
      });

      const marketDataMap = marketData.reduce(
        (acc, data) => {
          acc[data.id] = data;
          return acc;
        },
        {} as Record<string, MarketDataDto>,
      );

      this.logger.debug(
        `Fetched market data for ${Object.keys(marketDataMap).length} tokens`,
      );

      return marketDataMap;
    } catch (error) {
      this.logger.error('Failed to fetch market data, continuing without it', {
        error: error instanceof Error ? error.message : String(error),
      });
      return {};
    }
  }

  /**
   * Sort tokens with market data consideration
   * Primary: similarity score, Secondary: market cap
   */
  private sortWithMarketData(
    tokens: TokenWithSimilarity[],
    includeMarketData: boolean,
    marketDataMap: Record<string, MarketDataDto>,
  ): TokenWithSimilarity[] {
    if (!includeMarketData || Object.keys(marketDataMap).length === 0) {
      return tokens;
    }

    return tokens.sort((a, b) => {
      if (a.similarityScore !== b.similarityScore) {
        return b.similarityScore - a.similarityScore;
      }

      const aMarketCap = marketDataMap[a.token.coingeckoId]?.marketCap ?? 0;
      const bMarketCap = marketDataMap[b.token.coingeckoId]?.marketCap ?? 0;
      return bMarketCap - aMarketCap;
    });
  }

  /**
   * Transform tokens to response DTOs
   */
  private transformToResponse(
    tokens: TokenWithSimilarity[],
    includeMarketData: boolean,
    marketDataMap: Record<string, MarketDataDto>,
  ): SimilarTokenDto[] {
    return tokens.map((item) => {
      const chainsAvailable: ChainAvailabilityDto[] = Object.entries(
        item.token.addresses,
      ).map(([chainIdStr, address]) => {
        const chainId = parseInt(chainIdStr, 10);
        const chain = getChainById(chainId);
        return {
          chainId,
          chainName: chain?.name || 'Unknown',
          contractAddress: address,
        };
      });

      const similarToken: SimilarTokenDto = {
        symbol: item.token.symbol,
        name: item.token.name,
        image: item.token.image,
        coingeckoId: item.token.coingeckoId,
        sharedCategories: item.sharedCategories,
        similarityScore: Math.round(item.similarityScore * 100) / 100,
        chainsAvailable,
      };

      if (includeMarketData && marketDataMap[item.token.coingeckoId]) {
        const market = marketDataMap[item.token.coingeckoId];
        similarToken.marketData = {
          price: market.currentPrice ?? 0,
          marketCap: market.marketCap ?? 0,
          volume24h: market.totalVolume ?? 0,
          priceChange24h: market.priceChange24h ?? 0,
          priceChangePercentage24h: market.priceChangePercentage24h ?? 0,
        };
      }

      return similarToken;
    });
  }
}
