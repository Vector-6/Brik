/**
 * Portfolio Module
 *
 * Encapsulates all portfolio-related functionality
 * - Controller for HTTP endpoints
 * - Service for business logic
 * - Integration with CoingeckoModule for market data
 *
 * Follows Single Responsibility and Separation of Concerns
 */

import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { CoingeckoModule } from '../coingecko/coingecko.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [CoingeckoModule, BlockchainModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
