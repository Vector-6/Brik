/**
 * App Module
 *
 * Root module that wires up all feature modules
 * Configures global settings:
 * - Configuration (via ConfigModule)
 * - Caching (via Upstash Redis for serverless compatibility)
 * - Feature modules (Explore, etc.)
 */

import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ExploreModule } from './modules/explore/explore.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { TokenDetailsModule } from './modules/token-details/token-details.module';
import { SimilarTokensModule } from './modules/similar-tokens/similar-tokens.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { NewsModule } from './modules/news/news.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { createUpstashStore } from './config/upstash-cache.store';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    // Global configuration module
    ConfigModule,

    // MongoDB connection (global)
    MongooseModule.forRootAsync({
      imports: [NestConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // Global caching module with Upstash Redis (serverless-ready)
    // Upstash Redis is HTTP-based and works perfectly with Vercel
    // Falls back to in-memory cache for local development if Upstash is not configured
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [NestConfigModule],
      useFactory: (configService: ConfigService): any => {
        const upstashUrl = configService.get<string>('UPSTASH_REDIS_REST_URL');
        const upstashToken = configService.get<string>(
          'UPSTASH_REDIS_REST_TOKEN',
        );

        // Use Upstash if configured, otherwise fall back to in-memory
        if (upstashUrl && upstashToken) {
          return {
            store: createUpstashStore({
              url: upstashUrl,
              token: upstashToken,
            }),
            ttl: 60 * 1000, // Default TTL: 60 seconds
          };
        }

        // Fallback to in-memory cache for local development
        console.warn(
          '⚠️  Upstash Redis not configured. Using in-memory cache (not suitable for production/Vercel)',
        );
        return {
          ttl: 60 * 1000,
          max: 100,
        };
      },
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    ExploreModule,
    TokensModule,
    TokenDetailsModule,
    SimilarTokensModule,
    PortfolioModule,
    NewsModule,
    TransactionsModule,
    MailModule,
    RewardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
