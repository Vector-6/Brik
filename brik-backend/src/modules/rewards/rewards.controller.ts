/**
 * Rewards Controller
 * API endpoints for rewards system
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RewardsService } from './services/rewards.service';
import { ReferralService } from './services/referral.service';
import { MysteryBoxService } from './services/mystery-box.service';
import { PointsService } from './services/points.service';
import { CashbackService } from './services/cashback.service';
import { VerifySwapDto, VerifySwapResponseDto } from './dto/verify-swap.dto';
import { RewardsOverviewDto } from './dto/rewards-overview.dto';
import {
  ClaimRewardsDto,
  ClaimRewardsResponseDto,
} from './dto/claim-rewards.dto';
import {
  CreateReferralCodeDto,
  CreateReferralCodeResponseDto,
  UseReferralCodeDto,
  UseReferralCodeResponseDto,
} from './dto/referral.dto';
import {
  OpenMysteryBoxDto,
  OpenMysteryBoxResponseDto,
} from './dto/mystery-box.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rewards')
export class RewardsController {
  constructor(
    private readonly rewardsService: RewardsService,
    private readonly referralService: ReferralService,
    private readonly mysteryBoxService: MysteryBoxService,
    private readonly pointsService: PointsService,
    private readonly cashbackService: CashbackService,
  ) {}

  /**
   * Verify swap and calculate rewards
   * POST /rewards/verify-swap
   */
  @Post('verify-swap')
  @HttpCode(HttpStatus.OK)
  async verifySwap(
    @Body() dto: VerifySwapDto,
  ): Promise<VerifySwapResponseDto> {
    return this.rewardsService.verifySwapAndCalculateRewards(dto);
  }

  /**
   * Get rewards overview for wallet
   * GET /rewards/overview/:walletAddress
   */
  @Get('overview/:walletAddress')
  async getRewardsOverview(
    @Param('walletAddress') walletAddress: string,
  ): Promise<RewardsOverviewDto> {
    return this.rewardsService.getRewardsOverview(walletAddress);
  }

  /**
   * Claim rewards (cashback, referral, or mystery box)
   * POST /rewards/claim
   */
  @Post('claim')
  @HttpCode(HttpStatus.OK)
  async claimRewards(
    @Body() dto: ClaimRewardsDto,
  ): Promise<ClaimRewardsResponseDto> {
    return this.rewardsService.claimRewards(dto);
  }

  /**
   * Create referral code
   * POST /rewards/referral/create
   */
  @Post('referral/create')
  @HttpCode(HttpStatus.OK)
  async createReferralCode(
    @Body() dto: CreateReferralCodeDto,
  ): Promise<CreateReferralCodeResponseDto> {
    const code = await this.referralService.createReferralCode(
      dto.walletAddress,
    );
    return {
      success: true,
      code: code.code,
      message: `Referral code ${code.code} created successfully`,
    };
  }

  /**
   * Use referral code
   * POST /rewards/referral/use
   */
  @Post('referral/use')
  @HttpCode(HttpStatus.OK)
  async useReferralCode(
    @Body() dto: UseReferralCodeDto,
  ): Promise<UseReferralCodeResponseDto> {
    await this.referralService.useReferralCode(
      dto.walletAddress,
      dto.code,
    );
    return {
      success: true,
      message: 'Referral code applied successfully',
    };
  }

  /**
   * Get referral stats
   * GET /rewards/referral/stats/:walletAddress
   */
  @Get('referral/stats/:walletAddress')
  async getReferralStats(@Param('walletAddress') walletAddress: string) {
    return this.referralService.getReferralStats(walletAddress);
  }

  /**
   * Open mystery box
   * POST /rewards/mystery-box/open
   */
  @Post('mystery-box/open')
  @HttpCode(HttpStatus.OK)
  async openMysteryBox(
    @Body() dto: OpenMysteryBoxDto,
  ): Promise<OpenMysteryBoxResponseDto> {
    // Get chainId from request or default to Ethereum
    const chainId = (dto as any).chainId || 1;

    const mysteryBox = await this.mysteryBoxService.openMysteryBox(
      dto.walletAddress,
      chainId,
    );

    const userPoints = await this.pointsService.getBalance(dto.walletAddress);

    return {
      success: true,
      mysteryBoxId: mysteryBox._id.toString(),
      rarity: mysteryBox.rarity,
      payoutAmountUsd: mysteryBox.payoutAmountUsd,
      pointsSpent: mysteryBox.pointsSpent,
      pointsRemaining: userPoints,
      message: `Mystery box opened! You won $${mysteryBox.payoutAmountUsd.toFixed(2)} (${mysteryBox.rarity})`,
    };
  }

  /**
   * Get mystery box info
   * GET /rewards/mystery-box/info/:walletAddress
   */
  @Get('mystery-box/info/:walletAddress')
  async getMysteryBoxInfo(@Param('walletAddress') walletAddress: string) {
    return this.mysteryBoxService.getMysteryBoxInfo(walletAddress);
  }

  /**
   * Get cashback progress
   * GET /rewards/cashback/progress/:walletAddress
   */
  @Get('cashback/progress/:walletAddress')
  async getCashbackProgress(@Param('walletAddress') walletAddress: string) {
    return this.cashbackService.getCashbackProgress(walletAddress);
  }

  /**
   * Get points ledger
   * GET /rewards/points/ledger/:walletAddress
   */
  @Get('points/ledger/:walletAddress')
  async getPointsLedger(@Param('walletAddress') walletAddress: string) {
    const entries = await this.pointsService.getLedger(walletAddress);
    const balance = await this.pointsService.getBalance(walletAddress);

    return {
      entries: entries.map((e) => ({
        type: e.type,
        amount: e.amount,
        balanceAfter: e.balanceAfter,
        description: e.description,
        createdAt: (e as any).createdAt || new Date(),
        metadata: e.metadata,
      })),
      currentBalance: balance,
    };
  }

  /**
   * Get claimable rewards summary
   * GET /rewards/claimable/:walletAddress
   */
  @Get('claimable/:walletAddress')
  async getClaimableRewards(@Param('walletAddress') walletAddress: string) {
    const cashback = await this.cashbackService.getTotalClaimableCashback(
      walletAddress,
    );
    const referral = await this.referralService.getTotalClaimableReferralEarnings(
      walletAddress,
    );

    return {
      cashbackUsd: cashback,
      referralUsd: referral,
      totalUsd: cashback + referral,
    };
  }
}
