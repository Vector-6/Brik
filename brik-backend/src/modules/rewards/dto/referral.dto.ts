/**
 * DTOs for referral system
 */

import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateReferralCodeDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}

export class CreateReferralCodeResponseDto {
  success: boolean;
  code: string;
  message: string;
}

export class UseReferralCodeDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]{6,12}$/, {
    message: 'Referral code must be 6-12 uppercase alphanumeric characters',
  })
  code: string;
}

export class UseReferralCodeResponseDto {
  success: boolean;
  message: string;
}

export class ReferralStatsDto {
  code: string;
  totalReferees: number;
  totalEarningsUsd: number;
  claimableEarningsUsd: number;
  activeReferees: number; // Referees who completed 2+ swaps
}
