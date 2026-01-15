/**
 * DTOs for claiming rewards
 */

import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum ClaimType {
  CASHBACK = 'cashback',
  REFERRAL = 'referral',
  MYSTERY_BOX = 'mystery_box',
}

export class ClaimRewardsDto {
  @IsEnum(ClaimType)
  @IsNotEmpty()
  type: ClaimType;

  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsString()
  cashbackBatchId?: string; // For cashback claims

  @IsString()
  referralEarningIds?: string; // Comma-separated IDs for referral claims

  @IsString()
  mysteryBoxId?: string; // For mystery box payouts
}

export class ClaimRewardsResponseDto {
  success: boolean;
  payoutId: string;
  amountUsd: number;
  chainId: number;
  status: string; // 'pending' - waiting for admin payment
  message: string;
}
