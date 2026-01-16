/**
 * Anti-Abuse Service
 * Implements anti-abuse measures: daily caps, wash-trade detection, rate limiting
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Swap, SwapDocument } from '../schemas/swap.schema';
import { User, UserDocument } from '../schemas/user.schema';
import {
  CashbackBatch,
  CashbackBatchDocument,
} from '../schemas/cashback-batch.schema';
import {
  ReferralEarning,
  ReferralEarningDocument,
} from '../schemas/referral-earning.schema';
import { ClaimHistory, ClaimHistoryDocument } from '../schemas/claim-history.schema';

@Injectable()
export class AntiAbuseService {
  private readonly logger = new Logger(AntiAbuseService.name);

  // Daily limits
  private readonly DAILY_CASHBACK_CAP_USD = 50; // Max $50 cashback per day
  private readonly DAILY_REFERRAL_CAP_USD = 50; // Max $50 referral earnings per day
  private readonly MIN_SWAP_SIZE_USD = 2; // TEST ENVIRONMENT: Minimum swap size $2 (was 25)
  private readonly MIN_BRIK_FEE_USD = 0.01; // TEST ENVIRONMENT: Minimum Brik fee $0.01 (was 0.05)
  private readonly CLAIM_RATE_LIMIT_MINUTES = 1; // Min 1 minute between claims
  private readonly MAX_CLAIMS_PER_HOUR = 10; // Max 10 claims per hour

  constructor(
    @InjectModel(Swap.name) private swapModel: Model<SwapDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(CashbackBatch.name)
    private cashbackBatchModel: Model<CashbackBatchDocument>,
    @InjectModel(ReferralEarning.name)
    private referralEarningModel: Model<ReferralEarningDocument>,
    @InjectModel(ClaimHistory.name)
    private claimHistoryModel: Model<ClaimHistoryDocument>,
  ) {}

  /**
   * Check if swap meets minimum requirements
   */
  validateSwapSize(swapValueUsd: number, brikFeeUsd: number): void {
    if (swapValueUsd < this.MIN_SWAP_SIZE_USD) {
      throw new Error(
        `Swap value $${swapValueUsd} is below minimum of $${this.MIN_SWAP_SIZE_USD}`,
      );
    }

    if (brikFeeUsd < this.MIN_BRIK_FEE_USD) {
      throw new Error(
        `Brik fee $${brikFeeUsd} is below minimum of $${this.MIN_BRIK_FEE_USD}`,
      );
    }
  }

  /**
   * Check for potential wash trading
   * Simple heuristic: same wallet swapping same tokens back and forth quickly
   */
  async detectWashTrade(
    walletAddress: string,
    fromToken: string,
    toToken: string,
    chainId: number,
  ): Promise<boolean> {
    // Check for recent reverse swaps (toToken -> fromToken) within 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const reverseSwaps = await this.swapModel
      .find({
        walletAddress: walletAddress.toLowerCase(),
        fromToken: toToken.toLowerCase(),
        toToken: fromToken.toLowerCase(),
        chainId,
        createdAt: { $gte: oneHourAgo },
        isVerified: true,
      })
      .exec();

    // If 2+ reverse swaps in last hour, likely wash trading
    if (reverseSwaps.length >= 2) {
      this.logger.warn(
        `Potential wash trade detected for ${walletAddress}: ${reverseSwaps.length} reverse swaps in last hour`,
      );
      return true;
    }

    return false;
  }

  /**
   * Check daily cashback cap
   */
  async checkDailyCashbackCap(
    walletAddress: string,
    newCashbackAmountUsd: number,
  ): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCashback = await this.cashbackBatchModel
      .find({
        walletAddress: walletAddress.toLowerCase(),
        createdAt: { $gte: today },
        status: { $in: ['claimable', 'claimed', 'paid'] },
      })
      .exec();

    const totalToday = todayCashback.reduce(
      (sum, b) => sum + b.cashbackAmountUsd,
      0,
    );

    const wouldExceed = totalToday + newCashbackAmountUsd > this.DAILY_CASHBACK_CAP_USD;

    if (wouldExceed) {
      this.logger.warn(
        `Daily cashback cap would be exceeded for ${walletAddress}. Current: $${totalToday}, Attempted: $${newCashbackAmountUsd}`,
      );
    }

    return !wouldExceed;
  }

  /**
   * Check daily referral cap
   */
  async checkDailyReferralCap(
    walletAddress: string,
    newEarningAmountUsd: number,
  ): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEarnings = await this.referralEarningModel
      .find({
        referrerWalletAddress: walletAddress.toLowerCase(),
        createdAt: { $gte: today },
        status: { $in: ['claimable', 'claimed', 'paid'] },
      })
      .exec();

    const totalToday = todayEarnings.reduce(
      (sum, e) => sum + e.earningAmountUsd,
      0,
    );

    const wouldExceed = totalToday + newEarningAmountUsd > this.DAILY_REFERRAL_CAP_USD;

    if (wouldExceed) {
      this.logger.warn(
        `Daily referral cap would be exceeded for ${walletAddress}. Current: $${totalToday}, Attempted: $${newEarningAmountUsd}`,
      );
    }

    return !wouldExceed;
  }

  /**
   * Mark swap as wash trade
   */
  async markWashTrade(swapId: string): Promise<void> {
    await this.swapModel.findByIdAndUpdate(swapId, {
      isWashTrade: true,
    });
  }
}
