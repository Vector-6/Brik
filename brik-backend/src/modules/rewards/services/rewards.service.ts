/**
 * Rewards Service
 * Main orchestrator for rewards system
 * Coordinates all reward services and handles swap lifecycle
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
import { Swap, SwapDocument } from '../schemas/swap.schema';
import { Payout, PayoutDocument, PayoutType, PayoutStatus } from '../schemas/payout.schema';
import { SwapVerificationService } from './swap-verification.service';
import { PointsService } from './points.service';
import { CashbackService } from './cashback.service';
import { ReferralService } from './referral.service';
import { MysteryBoxService } from './mystery-box.service';
import { AntiAbuseService } from './anti-abuse.service';
import { VerifySwapDto, VerifySwapResponseDto } from '../dto/verify-swap.dto';
import { RewardsOverviewDto } from '../dto/rewards-overview.dto';
import { ClaimRewardsDto, ClaimRewardsResponseDto } from '../dto/claim-rewards.dto';
import {
  CashbackBatch,
  CashbackBatchDocument,
  CashbackStatus,
} from '../schemas/cashback-batch.schema';
import {
  ReferralEarning,
  ReferralEarningDocument,
  ReferralEarningStatus,
} from '../schemas/referral-earning.schema';
import {
  MysteryBox,
  MysteryBoxDocument,
  MysteryBoxStatus,
} from '../schemas/mystery-box.schema';
import { getUsdcAddress } from '../constants/chain-config.constant';

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Swap.name) private swapModel: Model<SwapDocument>,
    @InjectModel(Payout.name) private payoutModel: Model<PayoutDocument>,
    private swapVerificationService: SwapVerificationService,
    private pointsService: PointsService,
    private cashbackService: CashbackService,
    private referralService: ReferralService,
    private mysteryBoxService: MysteryBoxService,
    private antiAbuseService: AntiAbuseService,
  ) {}

  /**
   * Verify swap and calculate rewards
   * This is the main entry point for swap processing
   */
  async verifySwapAndCalculateRewards(
    dto: VerifySwapDto,
  ): Promise<VerifySwapResponseDto> {
    this.logger.log(`Processing swap verification: ${dto.txHash}`);

    // Validate swap size
    this.antiAbuseService.validateSwapSize(
      dto.swapValueUsd,
      dto.brikFeeUsd,
    );

    // Check if swap already exists
    const exists = await this.swapVerificationService.swapExists(dto.txHash);
    if (exists) {
      const existingSwap = await this.swapModel
        .findOne({ txHash: dto.txHash.toLowerCase() })
        .exec();

      if (existingSwap?.isVerified) {
        throw new BadRequestException('Swap already verified');
      }
    }

    // Detect wash trading
    const isWashTrade = await this.antiAbuseService.detectWashTrade(
      dto.walletAddress,
      dto.quoteData?.action?.fromToken?.address || '',
      dto.quoteData?.action?.toToken?.address || '',
      dto.chainId,
    );

    if (isWashTrade) {
      // Still verify swap but mark as wash trade
      const swap = await this.swapVerificationService.verifySwap(dto);
      await this.antiAbuseService.markWashTrade(swap._id.toString());

      throw new BadRequestException(
        'Swap flagged as potential wash trade. No rewards will be issued.',
      );
    }

    // Verify swap on-chain
    const swap = await this.swapVerificationService.verifySwap(dto);

    // Update user streak
    await this.updateUserStreak(dto.walletAddress);

    // Add points
    const pointsEarned = await this.pointsService.addPointsFromSwap(
      dto.walletAddress,
      swap,
    );

    // Contribute to mystery box pool (10% of fee)
    await this.mysteryBoxService.contributeToPool(swap);

    // Process cashback (every 3 swaps)
    const cashbackResult = await this.cashbackService.processSwapForCashback(
      dto.walletAddress,
      swap,
    );

      // Check daily cashback cap if triggered
      if (cashbackResult.triggered && cashbackResult.batchId) {
        const batch = await this.cashbackService.cashbackBatchModel
          .findById(cashbackResult.batchId)
          .exec();

      if (batch) {
        const withinCap = await this.antiAbuseService.checkDailyCashbackCap(
          dto.walletAddress,
          batch.cashbackAmountUsd,
        );

        if (!withinCap) {
          // Cap exceeded - reduce cashback to cap limit
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayCashback = await this.cashbackService.cashbackBatchModel
            .find({ walletAddress: dto.walletAddress.toLowerCase(), createdAt: { $gte: today } })
            .exec();
          const totalToday = todayCashback.reduce((sum, b) => sum + b.cashbackAmountUsd, 0);
          const maxAllowed = 50 - totalToday;

          if (maxAllowed > 0) {
            batch.cashbackAmountUsd = maxAllowed;
            await batch.save();
          } else {
            // Remove cashback batch if cap already reached
            await batch.deleteOne();
            cashbackResult.triggered = false;
            cashbackResult.batchId = undefined;
          }
        }
      }
    }

    // Process referral earnings
    await this.referralService.processSwapForReferral(dto.walletAddress, swap);

    // Get cashback progress
    const cashbackProgress = await this.cashbackService.getCashbackProgress(
      dto.walletAddress,
    );

    return {
      success: true,
      swapId: swap._id.toString(),
      pointsEarned,
      swapsUntilCashback: cashbackProgress.swapsRemaining,
      cashbackTriggered: cashbackResult.triggered,
      cashbackBatchId: cashbackResult.batchId,
      referralEarningsUnlocked: false, // Will be checked separately
      message: `Swap verified! Earned ${pointsEarned} points. ${cashbackProgress.message}`,
    };
  }

  /**
   * Get rewards overview for user
   */
  async getRewardsOverview(
    walletAddress: string,
  ): Promise<RewardsOverviewDto> {
    const user = await this.userModel
      .findOne({ walletAddress: walletAddress.toLowerCase() })
      .exec();

    if (!user) {
      // Return default values for new user
      return {
        walletAddress: walletAddress.toLowerCase(),
        totalPoints: 0,
        swapsUntilCashback: 3,
        claimableCashbackUsd: 0,
        claimableReferralEarningsUsd: 0,
        totalSwaps: 0,
        currentStreak: 0,
        canOpenMysteryBox: false,
      };
    }

    const totalPoints = await this.pointsService.getBalance(walletAddress);
    const cashbackProgress = await this.cashbackService.getCashbackProgress(
      walletAddress,
    );
    const claimableCashback = await this.cashbackService.getTotalClaimableCashback(
      walletAddress,
    );
    const claimableReferral = await this.referralService.getTotalClaimableReferralEarnings(
      walletAddress,
    );
    const mysteryBoxInfo = await this.mysteryBoxService.getMysteryBoxInfo(
      walletAddress,
    );

    return {
      walletAddress: walletAddress.toLowerCase(),
      totalPoints,
      swapsUntilCashback: cashbackProgress.swapsRemaining,
      claimableCashbackUsd: claimableCashback,
      claimableReferralEarningsUsd: claimableReferral,
      totalSwaps: user.totalSwaps || 0,
      currentStreak: user.currentStreak || 0,
      canOpenMysteryBox: mysteryBoxInfo.canOpen,
      mysteryBoxCountdownHours: mysteryBoxInfo.hoursUntilNextBox,
      lastMysteryBoxDate: mysteryBoxInfo.lastOpenedDate,
    };
  }

  /**
   * Claim rewards (cashback or referral)
   */
  async claimRewards(dto: ClaimRewardsDto): Promise<ClaimRewardsResponseDto> {
    let payout: PayoutDocument;
    let amountUsd = 0;
    let chainId = 0;

    if (dto.type === 'cashback') {
      if (!dto.cashbackBatchId) {
        throw new BadRequestException('cashbackBatchId is required for cashback claims');
      }

      const batch = await this.cashbackService['cashbackBatchModel']
        .findById(dto.cashbackBatchId)
        .exec();

      if (!batch) {
        throw new NotFoundException('Cashback batch not found');
      }

      if (batch.walletAddress.toLowerCase() !== dto.walletAddress.toLowerCase()) {
        throw new BadRequestException('Cashback batch does not belong to this wallet');
      }

      if (batch.status !== CashbackStatus.CLAIMABLE) {
        throw new BadRequestException('Cashback batch is not claimable');
      }

      amountUsd = batch.cashbackAmountUsd;
      chainId = batch.chainId;

      // Create payout record
      payout = await this.payoutModel.create({
        walletAddress: dto.walletAddress.toLowerCase(),
        type: PayoutType.CASHBACK,
        amountUsd,
        chainId,
        tokenAddress: getUsdcAddress(chainId),
        status: PayoutStatus.PENDING,
        metadata: {
          cashbackBatchId: batch._id.toString(),
        },
      });

      // Update batch status
      batch.status = CashbackStatus.CLAIMED;
      batch.payoutId = payout._id.toString();
      batch.claimedAt = new Date();
      await batch.save();
    } else if (dto.type === 'referral') {
      if (!dto.referralEarningIds) {
        throw new BadRequestException('referralEarningIds is required for referral claims');
      }

      const earningIds = dto.referralEarningIds.split(',');
      const earnings = await this.referralService.referralEarningModel
        .find({
          _id: { $in: earningIds },
          referrerWalletAddress: dto.walletAddress.toLowerCase(),
          status: ReferralEarningStatus.CLAIMABLE,
        })
        .exec();

      if (earnings.length === 0) {
        throw new NotFoundException('No claimable referral earnings found');
      }

      // Group by chain (payouts must be per chain)
      const earningsByChain = earnings.reduce((acc, e) => {
        if (!acc[e.chainId]) {
          acc[e.chainId] = [];
        }
        acc[e.chainId].push(e);
        return acc;
      }, {} as Record<number, ReferralEarningDocument[]>);

      // For now, create one payout for the first chain (can be enhanced)
      const firstChain = Object.keys(earningsByChain)[0];
      const firstChainEarnings = earningsByChain[Number(firstChain)];

      amountUsd = firstChainEarnings.reduce((sum, e) => sum + e.earningAmountUsd, 0);
      chainId = Number(firstChain);

      // Create payout
      payout = await this.payoutModel.create({
        walletAddress: dto.walletAddress.toLowerCase(),
        type: PayoutType.REFERRAL,
        amountUsd,
        chainId,
        tokenAddress: getUsdcAddress(chainId),
        status: PayoutStatus.PENDING,
        metadata: {
          referralEarningIds: firstChainEarnings.map((e) => e._id.toString()),
        },
      });

      // Update earnings status
      await this.referralService.referralEarningModel.updateMany(
        { _id: { $in: firstChainEarnings.map((e) => e._id) } },
        {
          status: ReferralEarningStatus.CLAIMED,
          payoutId: payout._id.toString(),
          claimedAt: new Date(),
        },
      );
    } else if (dto.type === 'mystery_box') {
      if (!dto.mysteryBoxId) {
        throw new BadRequestException('mysteryBoxId is required for mystery box claims');
      }

      const mysteryBox = await this.mysteryBoxService.mysteryBoxModel
        .findById(dto.mysteryBoxId)
        .exec();

      if (!mysteryBox) {
        throw new NotFoundException('Mystery box not found');
      }

      if (mysteryBox.walletAddress.toLowerCase() !== dto.walletAddress.toLowerCase()) {
        throw new BadRequestException('Mystery box does not belong to this wallet');
      }

      if (mysteryBox.status !== MysteryBoxStatus.OPENED) {
        throw new BadRequestException('Mystery box is not ready for payout');
      }

      amountUsd = mysteryBox.payoutAmountUsd;
      chainId = mysteryBox.chainId;

      // Create payout
      payout = await this.payoutModel.create({
        walletAddress: dto.walletAddress.toLowerCase(),
        type: PayoutType.MYSTERY_BOX,
        amountUsd,
        chainId,
        tokenAddress: getUsdcAddress(chainId),
        status: PayoutStatus.PENDING,
        metadata: {
          mysteryBoxId: mysteryBox._id.toString(),
        },
      });

      // Update mystery box status
      mysteryBox.status = MysteryBoxStatus.PAID;
      mysteryBox.payoutId = payout._id.toString();
      await mysteryBox.save();
    } else {
      throw new BadRequestException('Invalid claim type');
    }

    return {
      success: true,
      payoutId: payout._id.toString(),
      amountUsd,
      chainId,
      status: 'pending',
      message: `Reward claim submitted. Amount: $${amountUsd.toFixed(2)} USDC. Waiting for admin payment.`,
    };
  }

  /**
   * Update user streak (consecutive days with swaps)
   */
  private async updateUserStreak(walletAddress: string): Promise<void> {
    const user = await this.userModel
      .findOne({ walletAddress: walletAddress.toLowerCase() })
      .exec();

    if (!user) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSwapDate = user.lastSwapDate
      ? new Date(user.lastSwapDate)
      : null;

    if (lastSwapDate) {
      lastSwapDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor(
        (today.getTime() - lastSwapDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 0) {
        // Same day, no streak change
        return;
      } else if (daysDiff === 1) {
        // Consecutive day
        user.currentStreak = (user.currentStreak || 0) + 1;
      } else {
        // Streak broken
        user.currentStreak = 1;
      }
    } else {
      // First swap
      user.currentStreak = 1;
    }

    user.lastSwapDate = new Date();
    await user.save();
  }
}
