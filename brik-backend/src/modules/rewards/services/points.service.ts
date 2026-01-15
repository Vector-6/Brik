/**
 * Points Service
 * Handles Brik Points calculation and ledger management
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import {
  PointsLedger,
  PointsLedgerDocument,
  PointsTransactionType,
} from '../schemas/points-ledger.schema';
import { Swap, SwapDocument } from '../schemas/swap.schema';
import { RewardEvent, RewardEventDocument } from '../schemas/reward-event.schema';

@Injectable()
export class PointsService {
  private readonly logger = new Logger(PointsService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(PointsLedger.name)
    private pointsLedgerModel: Model<PointsLedgerDocument>,
    @InjectModel(RewardEvent.name)
    private rewardEventModel: Model<RewardEventDocument>,
  ) {}

  /**
   * Add points from a verified swap
   * Formula: points = brik_fee_usd × 100
   */
  async addPointsFromSwap(
    walletAddress: string,
    swap: SwapDocument,
  ): Promise<number> {
    const points = swap.pointsEarned;

    // Get or create user
    let user = await this.userModel
      .findOne({ walletAddress: walletAddress.toLowerCase() })
      .exec();

    if (!user) {
      user = new this.userModel({
        walletAddress: walletAddress.toLowerCase(),
        totalPoints: 0,
        totalSwaps: 0,
      });
    }

    // Update user points
    const balanceAfter = user.totalPoints + points;
    user.totalPoints = balanceAfter;
    await user.save();

    // Record in points ledger
    await this.pointsLedgerModel.create({
      walletAddress: walletAddress.toLowerCase(),
      type: PointsTransactionType.SWAP_EARNED,
      amount: points,
      balanceAfter,
      swapId: swap._id.toString(),
      description: `Earned ${points} points from swap`,
      metadata: {
        swapValueUsd: swap.swapValueUsd,
        brikFeeUsd: swap.brikFeeUsd,
        txHash: swap.txHash,
      },
    });

    // Record reward event
    await this.rewardEventModel.create({
      walletAddress: walletAddress.toLowerCase(),
      type: 'points_earned',
      amount: points,
      swapId: swap._id.toString(),
      balanceAfter,
      description: `Earned ${points} Brik Points`,
      metadata: {
        brikFeeUsd: swap.brikFeeUsd,
        swapValueUsd: swap.swapValueUsd,
      },
    });

    this.logger.log(
      `Added ${points} points to ${walletAddress}. New balance: ${balanceAfter}`,
    );

    return points;
  }

  /**
   * Spend points (e.g., for mystery box)
   */
  async spendPoints(
    walletAddress: string,
    amount: number,
    type: PointsTransactionType,
    description: string,
    metadata?: Record<string, any>,
  ): Promise<number> {
    const user = await this.userModel
      .findOne({ walletAddress: walletAddress.toLowerCase() })
      .exec();

    if (!user) {
      throw new Error('User not found');
    }

    if (user.totalPoints < amount) {
      throw new Error('Insufficient points');
    }

    const balanceAfter = user.totalPoints - amount;
    user.totalPoints = balanceAfter;
    await user.save();

    // Record in ledger (negative amount for spending)
    await this.pointsLedgerModel.create({
      walletAddress: walletAddress.toLowerCase(),
      type,
      amount: -amount,
      balanceAfter,
      description,
      metadata,
    });

    // Record reward event
    await this.rewardEventModel.create({
      walletAddress: walletAddress.toLowerCase(),
      type: 'points_spent',
      amount: -amount,
      balanceAfter,
      description,
      metadata,
    });

    this.logger.log(
      `Spent ${amount} points from ${walletAddress}. New balance: ${balanceAfter}`,
    );

    return balanceAfter;
  }

  /**
   * Get current points balance
   */
  async getBalance(walletAddress: string): Promise<number> {
    const user = await this.userModel
      .findOne({ walletAddress: walletAddress.toLowerCase() })
      .exec();

    return user?.totalPoints || 0;
  }

  /**
   * Get points ledger entries
   */
  async getLedger(
    walletAddress: string,
    limit: number = 50,
  ): Promise<PointsLedgerDocument[]> {
    return this.pointsLedgerModel
      .find({ walletAddress: walletAddress.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
