/**
 * Referral Service
 * Handles referral codes and earnings
 * Referrer earns 5% of Brik fee, activates after referee completes 2 swaps
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import {
  ReferralCode,
  ReferralCodeDocument,
} from '../schemas/referral-code.schema';
import {
  ReferralEarning,
  ReferralEarningDocument,
  ReferralEarningStatus,
} from '../schemas/referral-earning.schema';
import { Swap, SwapDocument } from '../schemas/swap.schema';
import { RewardEvent, RewardEventDocument } from '../schemas/reward-event.schema';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);
  private readonly REFERRAL_PERCENTAGE = 5; // 5%
  private readonly REQUIRED_REFEREE_SWAPS = 2; // Referee must complete 2 swaps

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(ReferralCode.name)
    private referralCodeModel: Model<ReferralCodeDocument>,
    @InjectModel(ReferralEarning.name)
    public referralEarningModel: Model<ReferralEarningDocument>, // Public for access from RewardsService
    @InjectModel(RewardEvent.name)
    private rewardEventModel: Model<RewardEventDocument>,
  ) {}

  /**
   * Generate a unique referral code for user
   */
  async createReferralCode(
    walletAddress: string,
  ): Promise<ReferralCodeDocument> {
    // Check if user already has a code
    const existingCode = await this.referralCodeModel
      .findOne({ creatorWalletAddress: walletAddress.toLowerCase() })
      .exec();

    if (existingCode) {
      return existingCode;
    }

    // Generate unique code (6-12 alphanumeric characters)
    let code: string;
    let attempts = 0;
    do {
      code = this.generateCode();
      attempts++;
      if (attempts > 10) {
        throw new BadRequestException(
          'Failed to generate unique referral code',
        );
      }
    } while (await this.referralCodeModel.findOne({ code }).exec());

    const referralCode = await this.referralCodeModel.create({
      code,
      creatorWalletAddress: walletAddress.toLowerCase(),
      totalReferees: 0,
      totalEarningsUsd: 0,
      claimableEarningsUsd: 0,
      isActive: true,
    });

    // Update user with referral code ID
    let user = await this.userModel
      .findOne({ walletAddress: walletAddress.toLowerCase() })
      .exec();

    if (!user) {
      user = new this.userModel({
        walletAddress: walletAddress.toLowerCase(),
      });
    }

    user.referralCodeId = referralCode._id.toString();
    await user.save();

    this.logger.log(`Created referral code ${code} for ${walletAddress}`);

    return referralCode;
  }

  /**
   * Use a referral code (when new user signs up)
   */
  async useReferralCode(
    walletAddress: string,
    code: string,
  ): Promise<ReferralCodeDocument> {
    const referralCode = await this.referralCodeModel
      .findOne({ code: code.toUpperCase(), isActive: true })
      .exec();

    if (!referralCode) {
      throw new BadRequestException('Invalid referral code');
    }

    // Check if user already has a referrer
    let user = await this.userModel
      .findOne({ walletAddress: walletAddress.toLowerCase() })
      .exec();

    if (user && user.referredByCodeId) {
      throw new BadRequestException('User already has a referrer');
    }

    // Prevent self-referral
    if (
      referralCode.creatorWalletAddress.toLowerCase() ===
      walletAddress.toLowerCase()
    ) {
      throw new BadRequestException('Cannot use your own referral code');
    }

    // Create or update user
    if (!user) {
      user = new this.userModel({
        walletAddress: walletAddress.toLowerCase(),
      });
    }

    user.referredByCodeId = referralCode._id.toString();
    await user.save();

    // Update referral code stats
    referralCode.totalReferees += 1;
    await referralCode.save();

    this.logger.log(
      `User ${walletAddress} used referral code ${code} from ${referralCode.creatorWalletAddress}`,
    );

    return referralCode;
  }

  /**
   * Process swap for referral earnings
   * Creates locked earnings that activate after referee completes 2 swaps
   */
  async processSwapForReferral(
    walletAddress: string,
    swap: SwapDocument,
  ): Promise<void> {
    // Get user to check if they have a referrer
    const user = await this.userModel
      .findOne({ walletAddress: walletAddress.toLowerCase() })
      .exec();

    if (!user || !user.referredByCodeId) {
      return; // No referrer, no referral earnings
    }

    // Get referral code
    const referralCode = await this.referralCodeModel
      .findById(user.referredByCodeId)
      .exec();

    if (!referralCode || !referralCode.isActive) {
      return;
    }

    // Calculate referral earning
    const earningAmountUsd =
      (swap.brikFeeUsd * this.REFERRAL_PERCENTAGE) / 100;

    // Check if referee has completed 2 swaps
    const refereeSwapCount = await this.userModel
      .findOne({ walletAddress: walletAddress.toLowerCase() })
      .exec()
      .then((u) => u?.totalSwaps || 0);

    const status =
      refereeSwapCount >= this.REQUIRED_REFEREE_SWAPS
        ? ReferralEarningStatus.CLAIMABLE
        : ReferralEarningStatus.LOCKED;

    // Create referral earning
    const earning = await this.referralEarningModel.create({
      referrerWalletAddress: referralCode.creatorWalletAddress.toLowerCase(),
      refereeWalletAddress: walletAddress.toLowerCase(),
      referralCodeId: referralCode._id.toString(),
      swapId: swap._id.toString(),
      brikFeeUsd: swap.brikFeeUsd,
      referralPercentage: this.REFERRAL_PERCENTAGE,
      earningAmountUsd,
      chainId: swap.chainId,
      status,
    });

    // Update referral code totals
    referralCode.totalEarningsUsd += earningAmountUsd;
    if (status === ReferralEarningStatus.CLAIMABLE) {
      referralCode.claimableEarningsUsd += earningAmountUsd;
    }
    await referralCode.save();

    // Record reward event
    await this.rewardEventModel.create({
      walletAddress: referralCode.creatorWalletAddress.toLowerCase(),
      type:
        status === ReferralEarningStatus.CLAIMABLE
          ? 'referral_activated'
          : 'referral_earned',
      amount: earningAmountUsd,
      referralEarningId: earning._id.toString(),
      balanceAfter: referralCode.claimableEarningsUsd,
      description: `Referral earning: $${earningAmountUsd.toFixed(2)}`,
      metadata: {
        refereeWalletAddress: walletAddress,
        swapId: swap._id.toString(),
        status,
      },
    });

    // If this was the 2nd swap, unlock all locked earnings for this referee
    if (refereeSwapCount === this.REQUIRED_REFEREE_SWAPS) {
      await this.unlockReferralEarnings(
        referralCode.creatorWalletAddress,
        walletAddress,
      );
    }

    this.logger.log(
      `Referral earning created: $${earningAmountUsd.toFixed(2)} for ${referralCode.creatorWalletAddress} from ${walletAddress}`,
    );
  }

  /**
   * Unlock referral earnings when referee completes 2 swaps
   */
  private async unlockReferralEarnings(
    referrerWallet: string,
    refereeWallet: string,
  ): Promise<void> {
    const lockedEarnings = await this.referralEarningModel
      .find({
        referrerWalletAddress: referrerWallet.toLowerCase(),
        refereeWalletAddress: refereeWallet.toLowerCase(),
        status: ReferralEarningStatus.LOCKED,
      })
      .exec();

    if (lockedEarnings.length === 0) {
      return;
    }

    const totalUnlocked = lockedEarnings.reduce(
      (sum, e) => sum + e.earningAmountUsd,
      0,
    );

    // Update earnings to claimable
    await this.referralEarningModel.updateMany(
      {
        referrerWalletAddress: referrerWallet.toLowerCase(),
        refereeWalletAddress: refereeWallet.toLowerCase(),
        status: ReferralEarningStatus.LOCKED,
      },
      { status: ReferralEarningStatus.CLAIMABLE },
    );

    // Update referral code
    const referralCode = await this.referralCodeModel
      .findOne({ creatorWalletAddress: referrerWallet.toLowerCase() })
      .exec();

    if (referralCode) {
      referralCode.claimableEarningsUsd += totalUnlocked;
      await referralCode.save();
    }

    // Record reward event
    await this.rewardEventModel.create({
      walletAddress: referrerWallet.toLowerCase(),
      type: 'referral_activated',
      amount: totalUnlocked,
      balanceAfter: referralCode?.claimableEarningsUsd || 0,
      description: `Referral earnings unlocked: $${totalUnlocked.toFixed(2)}`,
      metadata: {
        refereeWalletAddress: refereeWallet,
        unlockedCount: lockedEarnings.length,
      },
    });

    this.logger.log(
      `Unlocked $${totalUnlocked.toFixed(2)} in referral earnings for ${referrerWallet}`,
    );
  }

  /**
   * Get referral stats for a user
   */
  async getReferralStats(
    walletAddress: string,
  ): Promise<ReferralCodeDocument | null> {
    return this.referralCodeModel
      .findOne({ creatorWalletAddress: walletAddress.toLowerCase() })
      .exec();
  }

  /**
   * Get claimable referral earnings
   */
  async getClaimableReferralEarnings(
    walletAddress: string,
  ): Promise<ReferralEarningDocument[]> {
    return this.referralEarningModel
      .find({
        referrerWalletAddress: walletAddress.toLowerCase(),
        status: ReferralEarningStatus.CLAIMABLE,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get total claimable referral earnings
   */
  async getTotalClaimableReferralEarnings(
    walletAddress: string,
  ): Promise<number> {
    const earnings = await this.getClaimableReferralEarnings(walletAddress);
    return earnings.reduce((sum, e) => sum + e.earningAmountUsd, 0);
  }

  /**
   * Generate random referral code
   */
  private generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 8; // 8 characters
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
