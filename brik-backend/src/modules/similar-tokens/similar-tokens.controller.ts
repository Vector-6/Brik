/**
 * Similar Tokens Controller
 *
 * Single Responsibility: Handle HTTP layer for similar tokens endpoint
 * - Route definition with path parameter
 * - Request validation
 * - Response transformation
 * - Cache configuration (15 minutes)
 *
 * Follows Interface Segregation Principle:
 * - Only exposes the /api/token/:symbol/similar endpoint
 * - Focused on similar tokens specific routes
 */

import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { SimilarTokensService } from './similar-tokens.service';
import { SimilarTokensQueryDto } from './dto/similar-tokens-query.dto';
import { SimilarTokensResponseDto } from './dto/similar-tokens-response.dto';

@Controller('api/token')
@UseInterceptors(CacheInterceptor)
export class SimilarTokensController {
  private readonly logger = new Logger(SimilarTokensController.name);

  constructor(private readonly similarTokensService: SimilarTokensService) {}

  /**
   * GET /api/tokens/:symbol/similar
   *
   * Get tokens similar to the requested token based on shared categories
   *
   * @param symbol Token symbol (path parameter)
   * @param query Optional query parameters (limit, includeMarketData)
   * @returns Similar tokens response with similarity scores
   *
   * Cache TTL: 15 minutes (900000ms)
   */
  @Get(':symbol/similar')
  @CacheTTL(900000) // 15 minutes in milliseconds
  async getSimilarTokens(
    @Param('symbol') symbol: string,
    @Query() query: SimilarTokensQueryDto,
  ): Promise<SimilarTokensResponseDto> {
    this.logger.log(
      `GET /api/token/${symbol}/similar - ` +
        `limit: ${query.limit || '10'}, ` +
        `includeMarketData: ${query.includeMarketData || 'false'}`,
    );

    return this.similarTokensService.getSimilarTokens(symbol, query);
  }
}
