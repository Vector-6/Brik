/**
 * Configuration Module
 *
 * Single Responsibility: Manage application configuration
 * This module is marked as global to be accessible throughout the application
 * without needing to import it in every module.
 */

import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

/**
 * Configuration factory function
 * Returns configuration object based on environment variables
 */
export const configuration = () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // CoinGecko API Configuration
  coingecko: {
    baseUrl:
      process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3',
    apiKey: process.env.COINGECKO_API_KEY || '',
    timeout: parseInt(process.env.COINGECKO_TIMEOUT || '30000', 10),
  },

  // LI.FI API Configuration
  lifi: {
    baseUrl: process.env.LIFI_BASE_URL || 'https://li.quest',
    apiKey: process.env.LIFI_API_KEY || '',
    integrator: process.env.LIFI_INTEGRATOR || 'Brik-Labs',
    timeout: parseInt(process.env.LIFI_TIMEOUT || '30000', 10),
  },

  // Cache Configuration
  cache: {
    ttl: {
      quote: 30 * 1000, // 30 seconds
      portfolio: 60 * 1000, // 1 minute
      tokensList: 5 * 60 * 1000, // 5 minutes
      tokensListWithMarket: 2 * 60 * 1000, // 2 minutes
      tokenDetails: 10 * 60 * 1000, // 10 minutes
      similarTokens: 15 * 60 * 1000, // 15 minutes
      coinHistory: 10 * 60 * 1000, // 10 minutes
      transactions: 5 * 60 * 1000, // 5 minutes
      news: 2 * 60 * 60 * 1000, // 2 hours
      explore: 15 * 60 * 1000, // 15 minutes
    },
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
});

/**
 * Global Configuration Module
 * Exports configuration for use throughout the application
 */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true, // Cache configuration for performance
      expandVariables: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
