/**
 * DTOs for mystery box system
 */

import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class OpenMysteryBoxDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsNumber()
  @Min(1)
  pointsToSpend: number; // Points cost for opening box
}

export class OpenMysteryBoxResponseDto {
  success: boolean;
  mysteryBoxId: string;
  rarity: string; // 'common', 'rare', 'ultra_rare'
  payoutAmountUsd: number;
  pointsSpent: number;
  pointsRemaining: number;
  message: string;
}

export class MysteryBoxInfoDto {
  canOpen: boolean;
  pointsRequired: number;
  userPoints: number;
  poolBalanceUsd: number;
  hoursUntilNextBox?: number;
  lastOpenedDate?: Date;
}
