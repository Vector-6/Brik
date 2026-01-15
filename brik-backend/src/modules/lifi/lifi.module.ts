/**
 * LiFi Module
 *
 * Single Responsibility: Provide LI.FI API integration
 * Exports LiFiService for use in other modules (Transactions)
 */

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LifiService } from './lifi.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        timeout: configService.get<number>('lifi.timeout', 30000),
        maxRedirects: 5,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [LifiService],
  exports: [LifiService],
})
export class LifiModule {}
