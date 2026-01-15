/**
 * Transactions Service
 *
 * Single Responsibility: Handle business logic for transaction operations
 * - Fetch transactions from LI.FI
 * - Enrich wallet transactions with direction
 * - Calculate summary statistics
 *
 * Follows Dependency Inversion Principle:
 * - Depends on LifiService abstraction
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LifiService } from '../lifi/lifi.service';
import { TransactionsQueryDto } from './dto/transactions-query.dto';
import {
  TransactionsResponseDto,
  TransactionDto,
} from './dto/transactions-response.dto';
import {
  WalletTransactionsResponseDto,
  SummaryDto,
} from './dto/wallet-transactions-response.dto';
import { LiFiTransfer } from '../lifi/interfaces/lifi-response.interface';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private readonly integrator: string;

  constructor(
    private readonly lifiService: LifiService,
    private readonly configService: ConfigService,
  ) {
    this.integrator = this.configService.get<string>(
      'lifi.integrator',
      'Brik-Labs',
    );
  }

  /**
   * Get all platform transactions
   *
   * @param query Query parameters for filtering and pagination
   * @returns Transactions response with transfers and pagination
   */
  async getAllTransactions(
    query: TransactionsQueryDto,
  ): Promise<TransactionsResponseDto> {
    try {
      this.logger.debug(
        `Fetching all transactions with query: ${JSON.stringify(query)}`,
      );

      const limit = query.limit ? parseInt(query.limit, 10) : 20;
      const status = query.status || 'DONE';

      // Validate limit
      if (limit < 1 || limit > 100) {
        throw new HttpException(
          {
            error: 'Invalid pagination parameters',
            message: 'Limit must be between 1 and 100',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const lifiResponse = await this.lifiService.getTransfers({
        integrator: this.integrator,
        limit,
        status,
        fromChain: query.fromChain ? parseInt(query.fromChain, 10) : undefined,
        toChain: query.toChain ? parseInt(query.toChain, 10) : undefined,
        fromToken: query.fromToken,
        toToken: query.toToken,
        next: query.next,
        previous: query.previous,
      });

      const transfers = this.transformTransfers(lifiResponse.data || []);

      const response: TransactionsResponseDto = {
        transactions: transfers,
        pagination: {
          next: lifiResponse.next,
          previous: lifiResponse.previous,
          hasMore: lifiResponse.hasNext || false,
        },
        count: transfers.length,
      };

      this.logger.debug(`Successfully fetched ${response.count} transactions`);

      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Failed to fetch all transactions', error);
      throw new HttpException(
        {
          error: 'Internal Server Error',
          message: 'Failed to fetch transactions',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get transactions for a specific wallet
   *
   * @param walletAddress Ethereum wallet address
   * @param query Query parameters for filtering and pagination
   * @returns Wallet transactions response with direction and summary
   */
  async getWalletTransactions(
    walletAddress: string,
    query: TransactionsQueryDto,
  ): Promise<WalletTransactionsResponseDto> {
    try {
      this.logger.debug(
        `Fetching transactions for wallet ${walletAddress} with query: ${JSON.stringify(query)}`,
      );

      const limit = query.limit ? parseInt(query.limit, 10) : 20;
      const status = query.status || 'DONE';

      // Validate limit
      if (limit < 1 || limit > 100) {
        throw new HttpException(
          {
            error: 'Invalid pagination parameters',
            message: 'Limit must be between 1 and 100',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const lifiResponse = await this.lifiService.getTransfers({
        integrator: this.integrator,
        wallet: walletAddress,
        limit,
        status,
        fromChain: query.fromChain ? parseInt(query.fromChain, 10) : undefined,
        toChain: query.toChain ? parseInt(query.toChain, 10) : undefined,
        fromToken: query.fromToken,
        toToken: query.toToken,
        next: query.next,
        previous: query.previous,
      });

      const transfers = this.enrichWithDirection(
        lifiResponse.data || [],
        walletAddress,
      );

      const summary = this.calculateSummary(
        lifiResponse.data || [],
        walletAddress,
      );

      const response: WalletTransactionsResponseDto = {
        walletAddress: walletAddress.toLowerCase(),
        transactions: transfers,
        pagination: {
          next: lifiResponse.next,
          previous: lifiResponse.previous,
          hasMore: lifiResponse.hasNext || false,
        },
        count: transfers.length,
        summary,
      };

      this.logger.debug(
        `Successfully fetched ${response.count} transactions for wallet ${walletAddress}`,
      );

      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch transactions for wallet ${walletAddress}`,
        error,
      );
      throw new HttpException(
        {
          error: 'Internal Server Error',
          message: 'Failed to fetch wallet transactions',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Transform LI.FI transfers to our DTO format
   *
   * @param lifiTransfers Array of LI.FI transfer objects
   * @returns Array of TransactionDto objects
   */
  private transformTransfers(lifiTransfers: LiFiTransfer[]): TransactionDto[] {
    return lifiTransfers.map((transfer) => this.transformTransfer(transfer));
  }

  /**
   * Transform a single LI.FI transfer to simplified TransactionDto
   *
   * @param transfer LI.FI transfer object
   * @returns TransactionDto object
   */
  private transformTransfer(transfer: LiFiTransfer): TransactionDto {
    const fromAddress = transfer.fromAddress || '';

    // Use fromAddress as walletAddress for general transactions
    const walletAddress = fromAddress;

    const fromChain = transfer.sending?.chainId || 0;
    const toChain = transfer.receiving?.chainId || 0;

    const fromToken = transfer.sending?.token?.symbol || '';
    const toToken = transfer.receiving?.token?.symbol || '';

    const fromAmount = transfer.sending?.amount || '0';
    const toAmount = transfer.receiving?.amount || '0';

    const txHash = transfer.sending?.txHash || transfer.receiving?.txHash || '';

    // Map status to frontend format
    let status: 'completed' | 'pending' | 'failed' = 'pending';
    if (transfer.status === 'DONE') status = 'completed';
    else if (transfer.status === 'FAILED') status = 'failed';
    else status = 'pending';

    // Convert Unix timestamp to ISO 8601 string
    const timestamp = transfer.sending?.timestamp
      ? new Date(transfer.sending.timestamp * 1000).toISOString()
      : new Date().toISOString();

    // Calculate USD value (use receiving amount USD as the transaction value)
    const usdValue = parseFloat(transfer.receiving?.amountUSD || '0');

    return {
      id: transfer.transactionId || txHash || '',
      walletAddress,
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      txHash,
      status,
      timestamp,
      usdValue: Math.round(usdValue * 10000) / 10000, // Round to 4 decimal places
    };
  }

  /**
   * Map LI.FI status to our status enum
   *
   * @param status LI.FI status string
   * @returns Mapped status
   */
  private mapStatus(status: string): 'completed' | 'pending' | 'failed' {
    if (status === 'DONE') return 'completed';
    if (status === 'PENDING') return 'pending';
    if (status === 'FAILED') return 'failed';
    return 'pending'; // Default to pending for unknown statuses
  }

  /**
   * Enrich transfers with wallet address for wallet-specific queries
   * For wallet-specific transactions, we already have the wallet address from the query
   *
   * @param lifiTransfers Array of LI.FI transfer objects
   * @param walletAddress Wallet address to set
   * @returns Array of TransactionDto objects
   */
  private enrichWithDirection(
    lifiTransfers: LiFiTransfer[],
    walletAddress: string,
  ): TransactionDto[] {
    return lifiTransfers.map((transfer) => {
      const transaction = this.transformTransfer(transfer);
      // Override walletAddress with the queried wallet address
      return {
        ...transaction,
        walletAddress: walletAddress.toLowerCase(),
      };
    });
  }

  /**
   * Calculate summary statistics for wallet transactions
   *
   * @param lifiTransfers Array of original LI.FI transfer objects
   * @param walletAddress Wallet address for direction calculation
   * @returns Summary statistics
   */
  private calculateSummary(
    lifiTransfers: LiFiTransfer[],
    walletAddress: string,
  ): SummaryDto {
    const normalizedWallet = walletAddress.toLowerCase();
    let totalSent = 0;
    let totalReceived = 0;
    let totalGasPaid = 0;
    let totalFeesPaid = 0;

    for (const transfer of lifiTransfers) {
      const isSent = transfer.fromAddress?.toLowerCase() === normalizedWallet;

      // Calculate sent/received based on direction
      if (isSent) {
        totalSent += parseFloat(transfer.sending?.amountUSD || '0');

        // Calculate gas costs (only for sent transactions)
        if (transfer.gasCosts) {
          for (const gasCost of transfer.gasCosts) {
            totalGasPaid += parseFloat(gasCost.amountUSD || '0');
          }
        } else if (transfer.sending?.gasAmountUSD) {
          totalGasPaid += parseFloat(transfer.sending.gasAmountUSD);
        }
      } else {
        totalReceived += parseFloat(transfer.receiving?.amountUSD || '0');
      }

      // Calculate fee costs
      if (transfer.feeCosts) {
        for (const feeCost of transfer.feeCosts) {
          totalFeesPaid += parseFloat(feeCost.amountUSD || '0');
        }
      }
    }

    return {
      totalSent: Math.round(totalSent * 100) / 100,
      totalReceived: Math.round(totalReceived * 100) / 100,
      totalGasPaid: Math.round(totalGasPaid * 100) / 100,
      totalFeesPaid: Math.round(totalFeesPaid * 100) / 100,
    };
  }
}
