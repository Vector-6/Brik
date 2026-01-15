/**
 * Explore Module
 *
 * Single Responsibility: Provide the Explore feature
 * - Aggregates market data for all RWA tokens
 * - Provides sorting and filtering capabilities
 *
 * Demonstrates proper module composition:
 * - Imports CoingeckoModule for API access
 * - Provides ExploreService for business logic
 * - Exposes ExploreController for HTTP endpoints
 */

import { Module } from '@nestjs/common';
import { CoingeckoModule } from '../coingecko/coingecko.module';
import { ExploreController } from './explore.controller';
import { ExploreService } from './explore.service';

@Module({
  imports: [CoingeckoModule], // Import for CoinGecko API access
  controllers: [ExploreController],
  providers: [ExploreService],
  exports: [ExploreService], // Export in case other modules need it
})
export class ExploreModule {}
