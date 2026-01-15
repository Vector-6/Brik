/**
 * DTOs for swap verification
 */

import { IsString, IsNumber, IsObject, IsNotEmpty, Min } from 'class-validator';

export class VerifySwapDto {
  @IsString()
  @IsNotEmpty()
  txHash: string;

  @IsNumber()
  @IsNotEmpty()
  chainId: number;

  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsObject()
  @IsNotEmpty()
  quoteData: Record<string, any>; // Original quote from LiFi

  @IsNumber()
  @Min(25) // Minimum swap size: $25
  swapValueUsd: number;

  @IsNumber()
  @Min(0.05) // Minimum Brik fee: $0.05
  brikFeeUsd: number;
}

export class VerifySwapResponseDto {
  success: boolean;
  swapId: string;
  pointsEarned: number;
  swapsUntilCashback: number; // 0, 1, or 2
  cashbackTriggered: boolean;
  cashbackBatchId?: string;
  referralEarningsUnlocked?: boolean;
  message: string;
}
