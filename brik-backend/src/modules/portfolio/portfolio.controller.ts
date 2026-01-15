/**
 * Portfolio Controller
 *
 * Single Responsibility: Handle HTTP layer for Portfolio endpoints
 * - Route definition
 * - Request validation
 * - Response transformation
 * - Cache configuration
 *
 * Follows Interface Segregation Principle:
 * - Only exposes portfolio-related endpoints
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
import { PortfolioService } from './portfolio.service';
import { PortfolioQueryDto } from './dto/portfolio-query.dto';
import { WalletAddressParam } from './dto/wallet-address.param';
import { PortfolioResponseDto } from './dto/portfolio-response.dto';

@Controller('api')
@UseInterceptors(CacheInterceptor)
export class PortfolioController {
  private readonly logger = new Logger(PortfolioController.name);

  constructor(private readonly portfolioService: PortfolioService) {}

  /**
   * GET /api/portfolio/:walletAddress
   *
   * Get user portfolio with balances, values, and performance metrics
   *
   * @param params Path parameters with wallet address
   * @param query Optional query parameters (includePerformance)
   * @returns Portfolio response with balances and performance
   *
   * Cache TTL: 60 seconds (60000ms)
   */
  @Get('portfolio/:walletAddress')
  @CacheTTL(60000) // 60 seconds
  async getPortfolio(
    @Param() params: WalletAddressParam,
    @Query() query: PortfolioQueryDto,
  ): Promise<PortfolioResponseDto> {
    const { walletAddress } = params;
    const includePerformance = query.includePerformance !== 'false'; // Default true

    this.logger.log(
      `GET /api/portfolio/${walletAddress} - includePerformance: ${includePerformance}`,
    );

    return this.portfolioService.getPortfolio(
      walletAddress,
      includePerformance,
    );
  }
}
