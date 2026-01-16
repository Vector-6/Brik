/**
 * Cashback Service
 * Handles 3-swap cashback logic
 * Cashback = (sum of last 3 swap fees) × 5-10%
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Fee, FeeDocument } from '../schemas/fee.schema';
import {
  CashbackBatch,
  CashbackBatchDocument,
  CashbackStatus,
} from '../schemas/cashback-batch.schema';
import { Swap, SwapDocument } from '../schemas/swap.schema';
import { RewardEvent, RewardEventDocument } from '../schemas/reward-event.schema';

@Injectable()
export class CashbackService {
  private readonly logger = new Logger(CashbackService.name);
  // TEST ENVIRONMENT: Fixed 5% cashback (was random 5-10%)
  private readonly CASHBACK_PERCENTAGE_MIN = 5; // 5%
  private readonly CASHBACK_PERCENTAGE_MAX = 5; // TEST: Fixed 5% (was 10%)

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Fee.name) private feeModel: Model<FeeDocument>,
    @InjectModel(CashbackBatch.name)
    public cashbackBatchModel: Model<CashbackBatchDocument>, // Public for access from RewardsService
    @InjectModel(RewardEvent.name)
    private rewardEventModel: Model<RewardEventDocument>,
  ) {}

  /**
   * Process swap for cashback eligibility
   * Returns true if cashback was triggered (every 3 swaps)
   */
  async processSwapForCashback(
    walletAddress: string,
    swap: SwapDocument,
  ): Promise<{ triggered: boolean; batchId?: string }> {
    // Create fee record
    const fee = await this.feeModel.create({
      walletAddress: walletAddress.toLowerCase(),
      swapId: swap._id.toString(),
      brikFeeUsd: swap.brikFeeUsd,
      chainId: swap.chainId,
      usedForCashback: false,
    });

    // Get or create user
    let user = await this.userModel
      .findOne({ walletAddress: walletAddress.toLowerCase() })
      .exec();

    if (!user) {
      user = new this.userModel({
        walletAddress: walletAddress.toLowerCase(),
        swapsSinceLastCashback: 0,
      });
    }

    // Increment swap counter
    user.swapsSinceLastCashback += 1;
    user.totalSwaps = (user.totalSwaps || 0) + 1;

    // Check if we've reached 3 swaps
    if (user.swapsSinceLastCashback >= 3) {
      // Get last 3 fees (including current)
      const last3Fees = await this.feeModel
        .find({
          walletAddress: walletAddress.toLowerCase(),
          usedForCashback: false,
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .exec();

      if (last3Fees.length === 3) {
        // Calculate cashback
        const totalFeesUsd = last3Fees.reduce(
          (sum, f) => sum + f.brikFeeUsd,
          0,
        );

        // Random percentage between 5-10%
        const cashbackPercentage =
          this.CASHBACK_PERCENTAGE_MIN +
          Math.random() *
            (this.CASHBACK_PERCENTAGE_MAX - this.CASHBACK_PERCENTAGE_MIN);

        const cashbackAmountUsd = (totalFeesUsd * cashbackPercentage) / 100;

        // Create cashback batch
        const batch = await this.cashbackBatchModel.create({
          walletAddress: walletAddress.toLowerCase(),
          feeIds: last3Fees.map((f) => f._id.toString()),
          totalFeesUsd,
          cashbackPercentage,
          cashbackAmountUsd,
          chainId: swap.chainId, // Use chain from last swap
          status: CashbackStatus.CLAIMABLE,
        });

        // Mark fees as used
        await this.feeModel.updateMany(
          { _id: { $in: last3Fees.map((f) => f._id) } },
          {
            usedForCashback: true,
            cashbackBatchId: batch._id.toString(),
          },
        );

        // Reset counter
        user.swapsSinceLastCashback = 0;
        await user.save();

        // Record reward event
        await this.rewardEventModel.create({
          walletAddress: walletAddress.toLowerCase(),
          type: 'cashback_triggered',
          amount: cashbackAmountUsd,
          cashbackBatchId: batch._id.toString(),
          balanceAfter: cashbackAmountUsd, // Claimable amount
          description: `Cashback unlocked: $${cashbackAmountUsd.toFixed(2)}`,
          metadata: {
            totalFeesUsd,
            cashbackPercentage,
            swapsCount: 3,
          },
        });

        this.logger.log(
          `Cashback triggered for ${walletAddress}: $${cashbackAmountUsd.toFixed(2)}`,
        );

        return { triggered: true, batchId: batch._id.toString() };
      }
    }

    await user.save();
    return { triggered: false };
  }

  /**
   * Get cashback progress for user
   */
  async getCashbackProgress(
    walletAddress: string,
  ): Promise<{
    swapsCompleted: number;
    swapsRemaining: number;
    totalFeesUsd: number;
    estimatedCashbackUsd: number;
    message: string;
  }> {
    const user = await this.userModel
      .findOne({ walletAddress: walletAddress.toLowerCase() })
      .exec();

    if (!user) {
      return {
        swapsCompleted: 0,
        swapsRemaining: 3,
        totalFeesUsd: 0,
        estimatedCashbackUsd: 0,
        message: '0 / 3 swaps completed — cashback loading...',
      };
    }

    const swapsCompleted = user.swapsSinceLastCashback || 0;
    const swapsRemaining = 3 - swapsCompleted;

    // Get fees from current cycle
    const currentFees = await this.feeModel
      .find({
        walletAddress: walletAddress.toLowerCase(),
        usedForCashback: false,
      })
      .sort({ createdAt: -1 })
      .limit(swapsCompleted)
      .exec();

    const totalFeesUsd = currentFees.reduce(
      (sum, f) => sum + f.brikFeeUsd,
      0,
    );

    // Estimate cashback (using average 7.5%)
    const estimatedCashbackUsd = (totalFeesUsd * 7.5) / 100;

    const message =
      swapsCompleted === 0
        ? '0 / 3 swaps completed — cashback loading...'
        : swapsCompleted === 1
          ? '1 / 3 swaps completed — cashback loading...'
          : '2 / 3 swaps completed — cashback loading...';

    return {
      swapsCompleted,
      swapsRemaining,
      totalFeesUsd,
      estimatedCashbackUsd,
      message,
    };
  }

  /**
   * Get claimable cashback batches
   */
  async getClaimableCashback(
    walletAddress: string,
  ): Promise<CashbackBatchDocument[]> {
    return this.cashbackBatchModel
      .find({
        walletAddress: walletAddress.toLowerCase(),
        status: CashbackStatus.CLAIMABLE,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get total claimable cashback amount
   */
  async getTotalClaimableCashback(walletAddress: string): Promise<number> {
    const batches = await this.getClaimableCashback(walletAddress);
    return batches.reduce((sum, b) => sum + b.cashbackAmountUsd, 0);
  }
}
