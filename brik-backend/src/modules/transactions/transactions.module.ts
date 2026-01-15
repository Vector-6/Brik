/**
 * Transactions Module
 *
 * Encapsulates all transaction-related functionality
 * - Controller for HTTP endpoints
 * - Service for business logic
 * - Integration with LiFiModule for API communication
 *
 * Follows Single Responsibility and Separation of Concerns
 */

import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { LifiModule } from '../lifi/lifi.module';

@Module({
  imports: [LifiModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
