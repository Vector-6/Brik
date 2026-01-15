/**
 * Admin Payout Controller
 * Admin-only endpoints for managing payouts
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PayoutExecutionService } from '../services/payout-execution.service';
import { PayoutStatus } from '../schemas/payout.schema';

@Controller('admin/payouts')
@UseGuards(JwtAuthGuard) // All routes require admin JWT
export class AdminPayoutController {
  constructor(private readonly payoutExecutionService: PayoutExecutionService) {}

  /**
   * Get all pending payouts
   * GET /admin/payouts/pending
   */
  @Get('pending')
  async getPendingPayouts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.payoutExecutionService.getPendingPayouts(limitNum);
  }

  /**
   * Get all payouts with filters
   * GET /admin/payouts
   */
  @Get()
  async getAllPayouts(
    @Query('status') status?: PayoutStatus,
    @Query('chainId') chainId?: string,
    @Query('limit') limit?: string,
  ) {
    const chainIdNum = chainId ? parseInt(chainId, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.payoutExecutionService.getAllPayouts(
      status,
      chainIdNum,
      limitNum,
    );
  }

  /**
   * Execute a single payout
   * POST /admin/payouts/:id/execute
   */
  @Post(':id/execute')
  @HttpCode(HttpStatus.OK)
  async executePayout(@Param('id') payoutId: string) {
    const payout = await this.payoutExecutionService.executePayout(payoutId);
    return {
      success: true,
      payout,
      message: `Payout executed successfully. Tx: ${payout.txHash}`,
    };
  }

  /**
   * Execute multiple payouts in batch
   * POST /admin/payouts/execute-batch
   */
  @Post('execute-batch')
  @HttpCode(HttpStatus.OK)
  async executePayoutBatch(@Body() body: { payoutIds: string[] }) {
    const result = await this.payoutExecutionService.executePayoutBatch(
      body.payoutIds,
    );
    return {
      success: true,
      ...result,
      message: `Executed ${result.successful.length} payouts. Failed: ${result.failed.length}`,
    };
  }

  /**
   * Approve a payout
   * POST /admin/payouts/:id/approve
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approvePayout(@Param('id') payoutId: string) {
    const payout = await this.payoutExecutionService.approvePayout(payoutId);
    return {
      success: true,
      payout,
      message: 'Payout approved',
    };
  }

  /**
   * Reject a payout
   * POST /admin/payouts/:id/reject
   */
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectPayout(
    @Param('id') payoutId: string,
    @Body() body: { reason: string },
  ) {
    const payout = await this.payoutExecutionService.rejectPayout(
      payoutId,
      body.reason,
    );
    return {
      success: true,
      payout,
      message: 'Payout rejected',
    };
  }

  /**
   * Get payout wallet balance for a chain
   * GET /admin/payouts/balance/:chainId
   */
  @Get('balance/:chainId')
  async getPayoutWalletBalance(@Param('chainId') chainId: string) {
    const chainIdNum = parseInt(chainId, 10);
    return this.payoutExecutionService.getPayoutWalletBalance(chainIdNum);
  }

  /**
   * Get payout wallet balances for all chains
   * GET /admin/payouts/balances
   */
  @Get('balances/all')
  async getAllPayoutWalletBalances() {
    const chainIds = [1, 56, 137, 42161, 10, 43114];
    const balances = await Promise.all(
      chainIds.map(async (chainId) => {
        try {
          const balance = await this.payoutExecutionService.getPayoutWalletBalance(
            chainId,
          );
          return {
            chainId,
            ...balance,
          };
        } catch (error) {
          return {
            chainId,
            balance: '0',
            balanceUsd: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }),
    );

    return {
      balances,
      totalUsd: balances.reduce((sum, b) => sum + (b.balanceUsd || 0), 0),
    };
  }
}
