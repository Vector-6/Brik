/**
 * Similar Tokens Module
 *
 * Single Responsibility: Provide the Similar Tokens feature
 * - Finds tokens similar to a requested token based on shared categories
 * - Provides category-based similarity algorithm
 * - Supports optional market data enrichment
 *
 * Demonstrates proper module composition:
 * - Imports CoingeckoModule for API access
 * - Provides SimilarTokensService for business logic
 * - Exposes SimilarTokensController for HTTP endpoints
 */

import { Module } from '@nestjs/common';
import { CoingeckoModule } from '../coingecko/coingecko.module';
import { SimilarTokensController } from './similar-tokens.controller';
import { SimilarTokensService } from './similar-tokens.service';

@Module({
  imports: [CoingeckoModule], // Import for CoinGecko API access
  controllers: [SimilarTokensController],
  providers: [SimilarTokensService],
  exports: [SimilarTokensService], // Export in case other modules need it
})
export class SimilarTokensModule {}
