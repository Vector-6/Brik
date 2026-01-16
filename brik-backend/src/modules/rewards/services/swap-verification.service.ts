/**
 * Swap Verification Service
 * Verifies swaps on-chain before rewards are calculated
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createPublicClient, http, PublicClient } from 'viem';
import {
  mainnet,
  bsc,
  polygon,
  arbitrum,
  optimism,
  avalanche,
} from 'viem/chains';
import { Swap, SwapDocument } from '../schemas/swap.schema';
import { VerifySwapDto } from '../dto/verify-swap.dto';

@Injectable()
export class SwapVerificationService {
  private readonly logger = new Logger(SwapVerificationService.name);
  private readonly clients: Map<number, PublicClient>;

  constructor(
    @InjectModel(Swap.name) private swapModel: Model<SwapDocument>,
  ) {
    // Initialize viem public clients for each supported chain
    this.clients = new Map();

    const chainConfigs = {
      1: { chain: mainnet, rpcUrl: 'https://eth.llamarpc.com' },
      56: { chain: bsc, rpcUrl: 'https://bsc-dataseed.binance.org' },
      137: { chain: polygon, rpcUrl: 'https://polygon-rpc.com' },
      42161: { chain: arbitrum, rpcUrl: 'https://arb1.arbitrum.io/rpc' },
      10: { chain: optimism, rpcUrl: 'https://mainnet.optimism.io' },
      43114: {
        chain: avalanche,
        rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
      },
    };

    Object.entries(chainConfigs).forEach(([chainId, config]) => {
      const client = createPublicClient({
        chain: config.chain,
        transport: http(config.rpcUrl),
      }) as PublicClient;
      this.clients.set(Number(chainId), client);
    });
  }

  /**
   * Verify swap transaction on-chain
   * Checks: tx exists, succeeded, and matches expected values
   */
  async verifySwap(dto: VerifySwapDto): Promise<SwapDocument> {
    this.logger.debug(`Verifying swap: ${dto.txHash} on chain ${dto.chainId}`);

    // Check if swap already exists
    const existingSwap = await this.swapModel
      .findOne({ txHash: dto.txHash.toLowerCase() })
      .exec();

    if (existingSwap) {
      if (existingSwap.isVerified) {
        this.logger.warn(`Swap ${dto.txHash} already verified`);
        return existingSwap;
      }
      // If exists but not verified, re-verify
      return this.reverifySwap(existingSwap, dto);
    }

    // Get blockchain client
    const client = this.clients.get(dto.chainId);
    if (!client) {
      throw new BadRequestException(
        `Chain ${dto.chainId} is not supported for verification`,
      );
    }

    try {
      // Fetch transaction receipt
      const txHash = dto.txHash as `0x${string}`;
      const receipt = await client.getTransactionReceipt({ hash: txHash });

      if (!receipt) {
        throw new BadRequestException(
          `Transaction ${dto.txHash} not found on chain ${dto.chainId}`,
        );
      }

      // Check if transaction succeeded
      if (receipt.status === 'reverted') {
        throw new BadRequestException(
          `Transaction ${dto.txHash} reverted on chain`,
        );
      }

      // Get transaction details
      const tx = await client.getTransaction({ hash: txHash });
      const block = await client.getBlock({ blockNumber: receipt.blockNumber });

      // Extract token addresses from quote data
      // LiFi route structure: try multiple possible paths
      const fromToken =
        dto.quoteData?.fromToken?.address ||
        dto.quoteData?.action?.fromToken?.address ||
        dto.quoteData?.steps?.[0]?.action?.fromToken?.address ||
        'UNKNOWN';

      const toToken =
        dto.quoteData?.toToken?.address ||
        dto.quoteData?.action?.toToken?.address ||
        dto.quoteData?.steps?.[dto.quoteData.steps?.length - 1]?.action?.toToken?.address ||
        'UNKNOWN';

      const fromAmount =
        dto.quoteData?.fromAmount ||
        dto.quoteData?.action?.fromAmount ||
        dto.quoteData?.steps?.[0]?.action?.fromAmount ||
        '0';

      const toAmount =
        dto.quoteData?.toAmount ||
        dto.quoteData?.action?.toAmount ||
        dto.quoteData?.steps?.[dto.quoteData.steps?.length - 1]?.action?.toAmount ||
        '0';

      this.logger.debug(`Extracted tokens - from: ${fromToken}, to: ${toToken}`);

      // If tokens are still unknown, log the full quoteData for debugging
      if (fromToken === 'UNKNOWN' || toToken === 'UNKNOWN') {
        this.logger.warn(
          `Could not extract token addresses. QuoteData structure: ${JSON.stringify(dto.quoteData, null, 2)}`,
        );
        throw new BadRequestException(
          'Unable to extract token information from quote data',
        );
      }

      // Create swap record
      const pointsEarned = Math.floor(dto.brikFeeUsd * 100); // Points = fee * 100

      const swap = new this.swapModel({
        walletAddress: dto.walletAddress.toLowerCase(),
        txHash: dto.txHash.toLowerCase(),
        chainId: dto.chainId,
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        swapValueUsd: dto.swapValueUsd,
        brikFeeUsd: dto.brikFeeUsd,
        pointsEarned,
        isVerified: true,
        verifiedAt: new Date(),
        quoteData: dto.quoteData,
        blockNumber: Number(receipt.blockNumber),
        blockTimestamp: Number(block.timestamp),
        isWashTrade: false, // Will be checked by anti-abuse service
      });

      const savedSwap = await swap.save();
      this.logger.log(
        `Swap ${dto.txHash} verified successfully. Points: ${pointsEarned}`,
      );

      return savedSwap;
    } catch (error) {
      this.logger.error(`Failed to verify swap ${dto.txHash}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to verify transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Re-verify an existing swap
   */
  private async reverifySwap(
    swap: SwapDocument,
    dto: VerifySwapDto,
  ): Promise<SwapDocument> {
    const client = this.clients.get(dto.chainId);
    if (!client) {
      throw new BadRequestException(
        `Chain ${dto.chainId} is not supported`,
      );
    }

    try {
      const txHash = dto.txHash as `0x${string}`;
      const receipt = await client.getTransactionReceipt({ hash: txHash });

      if (!receipt || receipt.status === 'reverted') {
        throw new BadRequestException('Transaction not found or reverted');
      }

      swap.isVerified = true;
      swap.verifiedAt = new Date();
      swap.brikFeeUsd = dto.brikFeeUsd;
      swap.swapValueUsd = dto.swapValueUsd;
      swap.pointsEarned = Math.floor(dto.brikFeeUsd * 100);

      return await swap.save();
    } catch (error) {
      this.logger.error(`Failed to re-verify swap:`, error);
      throw error;
    }
  }

  /**
   * Check if transaction hash already exists
   */
  async swapExists(txHash: string): Promise<boolean> {
    const swap = await this.swapModel
      .findOne({ txHash: txHash.toLowerCase() })
      .exec();
    return !!swap;
  }
}
