/**
 * Explore Controller
 *
 * Single Responsibility: Handle HTTP layer for the Explore feature
 * - Route definition
 * - Request validation
 * - Response transformation
 * - Cache configuration
 *
 * Follows Interface Segregation Principle:
 * - Only exposes the /api/explore endpoint
 * - Focused on Explore-specific routes
 */

import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ExploreService } from './explore.service';
import { ExploreQueryDto } from './dto/explore-query.dto';
import { ExploreResponseDto } from './dto/explore-response.dto';

@Controller('api')
@UseInterceptors(CacheInterceptor)
export class ExploreController {
  private readonly logger = new Logger(ExploreController.name);

  constructor(private readonly exploreService: ExploreService) {}

  /**
   * GET /api/explore
   *
   * Get comprehensive market data for all supported RWA tokens
   *
   * @param query Optional query parameters (sortBy, order)
   * @returns Explore response with tokens and aggregated statistics
   *
   * Cache TTL: 15 minutes (900000ms)
   */
  @Get('explore')
  @CacheTTL(900000) // 15 minutes in milliseconds
  async getExploreData(
    @Query() query: ExploreQueryDto,
  ): Promise<ExploreResponseDto> {
    this.logger.log(
      `GET /api/explore - sortBy: ${query.sortBy}, order: ${query.order}`,
    );
    return this.exploreService.getExploreData(query);
  }
}
