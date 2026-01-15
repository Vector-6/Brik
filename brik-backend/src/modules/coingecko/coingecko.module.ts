/**
 * CoinGecko Module
 *
 * Single Responsibility: Provide CoinGecko API integration
 * Exports CoingeckoService for use in other modules
 *
 * This module demonstrates the Dependency Injection pattern:
 * - Registers CoingeckoService as a provider
 * - Configures HttpModule with appropriate settings
 * - Exports service for use in other modules (loose coupling)
 */

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoingeckoService } from './coingecko.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        timeout: configService.get<number>('coingecko.timeout', 30000),
        maxRedirects: 5,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CoingeckoService],
  exports: [CoingeckoService], // Export for use in other modules
})
export class CoingeckoModule {}
