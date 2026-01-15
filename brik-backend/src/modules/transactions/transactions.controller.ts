/**
 * Transactions Controller
 *
 * Single Responsibility: Handle HTTP layer for Transactions endpoints
 * - Route definition
 * - Request validation
 * - Response transformation
 * - Cache configuration
 *
 * Follows Interface Segregation Principle:
 * - Only exposes transaction-related endpoints
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
import { TransactionsService } from './transactions.service';
import { TransactionsQueryDto } from './dto/transactions-query.dto';
import { WalletAddressParamDto } from './dto/wallet-address.param.dto';
import { TransactionsResponseDto } from './dto/transactions-response.dto';
import { WalletTransactionsResponseDto } from './dto/wallet-transactions-response.dto';

@Controller('api')
@UseInterceptors(CacheInterceptor)
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * GET /api/transactions
   *
   * Get all platform transactions executed via LI.FI with Brik-Labs integrator
   *
   * @param query Optional query parameters for filtering and pagination
   * @returns Transactions response with transfers and pagination
   *
   * Cache TTL: 5 minutes (300000ms)
   */
  @Get('transactions')
  @CacheTTL(300000) // 5 minutes
  async getAllTransactions(
    @Query() query: TransactionsQueryDto,
  ): Promise<TransactionsResponseDto> {
    this.logger.log(`GET /api/transactions - Query: ${JSON.stringify(query)}`);

    return this.transactionsService.getAllTransactions(query);
  }

  /**
   * GET /api/transactions/:walletAddress
   *
   * Get transactions for a specific wallet address (sent or received)
   *
   * @param params Path parameters with wallet address
   * @param query Optional query parameters for filtering and pagination
   * @returns Wallet transactions response with direction and summary
   *
   * Cache TTL: 5 minutes (300000ms)
   */
  @Get('transactions/:walletAddress')
  @CacheTTL(300000) // 5 minutes
  async getWalletTransactions(
    @Param() params: WalletAddressParamDto,
    @Query() query: TransactionsQueryDto,
  ): Promise<WalletTransactionsResponseDto> {
    const { walletAddress } = params;

    this.logger.log(
      `GET /api/transactions/${walletAddress} - Query: ${JSON.stringify(query)}`,
    );

    return this.transactionsService.getWalletTransactions(walletAddress, query);
  }
}
