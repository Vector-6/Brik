/**
 * Mystery Box Service
 * Handles mystery box opening and pool management
 * 10% of platform fees go to mystery box pool
 */

import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import {
  MysteryBox,
  MysteryBoxDocument,
  MysteryBoxRarity,
  MysteryBoxStatus,
} from '../schemas/mystery-box.schema';
import {
  RewardPool,
  RewardPoolDocument,
} from '../schemas/reward-pool.schema';
import { PointsService } from './points.service';
import { RewardEvent, RewardEventDocument } from '../schemas/reward-event.schema';
import { Swap, SwapDocument } from '../schemas/swap.schema';

@Injectable()
export class MysteryBoxService {
  private readonly logger = new Logger(MysteryBoxService.name);
  private readonly MYSTERY_BOX_POOL_PERCENTAGE = 10; // 10% of fees
  private readonly POINTS_COST = 50; // TEST ENVIRONMENT: Points required to open a box (was 1000)

  // Payout ranges (USD)
  private readonly PAYOUT_RANGES = {
    [MysteryBoxRarity.COMMON]: { min: 1, max: 3 },
    [MysteryBoxRarity.RARE]: { min: 5, max: 10 },
    [MysteryBoxRarity.ULTRA_RARE]: { min: 25, max: 100 },
  };

  // Rarity probabilities (not published to users)
  private readonly RARITY_PROBABILITIES = {
    [MysteryBoxRarity.COMMON]: 0.85, // 85%
    [MysteryBoxRarity.RARE]: 0.13, // 13%
    [MysteryBoxRarity.ULTRA_RARE]: 0.02, // 2%
  };

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(MysteryBox.name)
    public mysteryBoxModel: Model<MysteryBoxDocument>, // Public for access from RewardsService
    @InjectModel(RewardPool.name)
    private rewardPoolModel: Model<RewardPoolDocument>,
    @InjectModel(RewardEvent.name)
    private rewardEventModel: Model<RewardEventDocument>,
    private pointsService: PointsService,
  ) {}

  /**
   * Contribute to mystery box pool (10% of swap fee)
   */
  async contributeToPool(swap: SwapDocument): Promise<void> {
    const contribution = (swap.brikFeeUsd * this.MYSTERY_BOX_POOL_PERCENTAGE) / 100;

    // Get or create pool
    let pool = await this.rewardPoolModel.findOne().exec();
    if (!pool) {
      pool = await this.rewardPoolModel.create({
        balanceUsd: 0,
        totalContributedUsd: 0,
        totalPaidOutUsd: 0,
      });
    }

    pool.balanceUsd += contribution;
    pool.totalContributedUsd += contribution;
    pool.lastUpdated = new Date();
    await pool.save();

    this.logger.debug(
      `Contributed $${contribution.toFixed(2)} to mystery box pool. New balance: $${pool.balanceUsd.toFixed(2)}`,
    );
  }

  /**
   * Open a mystery box
   */
  async openMysteryBox(
    walletAddress: string,
    chainId: number,
  ): Promise<MysteryBoxDocument> {
    // Check if user can open a box
    await this.validateCanOpenBox(walletAddress);

    // Check pool balance
    const pool = await this.getPool();
    if (pool.balanceUsd <= 0) {
      throw new BadRequestException(
        'Mystery box pool is empty. Try again later!',
      );
    }

    // Spend points
    await this.pointsService.spendPoints(
      walletAddress,
      this.POINTS_COST,
      'mystery_box_spent' as any,
      'Opened mystery box',
    );

    // Determine rarity
    const rarity = this.determineRarity();

    // Calculate payout
    const payoutRange = this.PAYOUT_RANGES[rarity];
    const payoutAmountUsd =
      payoutRange.min +
      Math.random() * (payoutRange.max - payoutRange.min);

    // Ensure pool has enough balance
    const actualPayout = Math.min(payoutAmountUsd, pool.balanceUsd);

    // Create mystery box record
    const mysteryBox = await this.mysteryBoxModel.create({
      walletAddress: walletAddress.toLowerCase(),
      pointsSpent: this.POINTS_COST,
      rarity,
      payoutAmountUsd: actualPayout,
      status: MysteryBoxStatus.OPENED,
      chainId,
    });

    // Update pool
    pool.balanceUsd -= actualPayout;
    pool.totalPaidOutUsd += actualPayout;
    pool.lastUpdated = new Date();
    await pool.save();

    // Update user's last mystery box date
    const user = await this.userModel
      .findOne({ walletAddress: walletAddress.toLowerCase() })
      .exec();

    if (user) {
      user.lastMysteryBoxDate = new Date();
      await user.save();
    }

    // Record reward event
    await this.rewardEventModel.create({
      walletAddress: walletAddress.toLowerCase(),
      type: 'mystery_box_opened',
      amount: actualPayout,
      mysteryBoxId: mysteryBox._id.toString(),
      balanceAfter: actualPayout, // Claimable amount
      description: `Mystery box opened: ${rarity} - $${actualPayout.toFixed(2)}`,
      metadata: {
        rarity,
        pointsSpent: this.POINTS_COST,
      },
    });

    this.logger.log(
      `Mystery box opened for ${walletAddress}: ${rarity} - $${actualPayout.toFixed(2)}`,
    );

    return mysteryBox;
  }

  /**
   * Validate if user can open a mystery box
   */
  private async validateCanOpenBox(walletAddress: string): Promise<void> {
    const user = await this.userModel
      .findOne({ walletAddress: walletAddress.toLowerCase() })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check points balance
    const pointsBalance = await this.pointsService.getBalance(walletAddress);
    if (pointsBalance < this.POINTS_COST) {
      throw new BadRequestException(
        `Insufficient points. Need ${this.POINTS_COST}, have ${pointsBalance}`,
      );
    }

    // Check daily limit (1 box per day)
    if (user.lastMysteryBoxDate) {
      const lastOpenDate = new Date(user.lastMysteryBoxDate);
      const now = new Date();
      const hoursSinceLastOpen =
        (now.getTime() - lastOpenDate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastOpen < 24) {
        const hoursRemaining = 24 - hoursSinceLastOpen;
        throw new BadRequestException(
          `You can open another mystery box in ${Math.ceil(hoursRemaining)} hours`,
        );
      }
    }
  }

  /**
   * Determine mystery box rarity based on probabilities
   * Uses cumulative probability distribution
   */
  private determineRarity(): MysteryBoxRarity {
    const random = Math.random(); // 0.0 to 1.0

    // Cumulative probabilities:
    // 0.00 - 0.02: Ultra Rare (2%)
    // 0.02 - 0.15: Rare (13%)
    // 0.15 - 1.00: Common (85%)

    const ultraRareThreshold = this.RARITY_PROBABILITIES[MysteryBoxRarity.ULTRA_RARE]; // 0.02
    const rareThreshold = ultraRareThreshold + this.RARITY_PROBABILITIES[MysteryBoxRarity.RARE]; // 0.15

    if (random < ultraRareThreshold) {
      return MysteryBoxRarity.ULTRA_RARE; // 2%
    } else if (random < rareThreshold) {
      return MysteryBoxRarity.RARE; // 13%
    } else {
      return MysteryBoxRarity.COMMON; // 85%
    }
  }

  /**
   * Get mystery box info for user
   */
  async getMysteryBoxInfo(walletAddress: string): Promise<{
    canOpen: boolean;
    pointsRequired: number;
    userPoints: number;
    poolBalanceUsd: number;
    hoursUntilNextBox?: number;
    lastOpenedDate?: Date;
  }> {
    const user = await this.userModel
      .findOne({ walletAddress: walletAddress.toLowerCase() })
      .exec();

    const userPoints = user
      ? await this.pointsService.getBalance(walletAddress)
      : 0;

    const pool = await this.getPool();

    let canOpen = true;
    let hoursUntilNextBox: number | undefined;

    if (userPoints < this.POINTS_COST) {
      canOpen = false;
    }

    if (pool.balanceUsd <= 0) {
      canOpen = false;
    }

    if (user?.lastMysteryBoxDate) {
      const lastOpenDate = new Date(user.lastMysteryBoxDate);
      const now = new Date();
      const hoursSinceLastOpen =
        (now.getTime() - lastOpenDate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastOpen < 24) {
        canOpen = false;
        hoursUntilNextBox = 24 - hoursSinceLastOpen;
      }
    }

    return {
      canOpen,
      pointsRequired: this.POINTS_COST,
      userPoints,
      poolBalanceUsd: pool.balanceUsd,
      hoursUntilNextBox,
      lastOpenedDate: user?.lastMysteryBoxDate,
    };
  }

  /**
   * Get pool balance
   */
  async getPool(): Promise<RewardPoolDocument> {
    let pool = await this.rewardPoolModel.findOne().exec();
    if (!pool) {
      pool = await this.rewardPoolModel.create({
        balanceUsd: 0,
        totalContributedUsd: 0,
        totalPaidOutUsd: 0,
      });
    }
    return pool;
  }
}
