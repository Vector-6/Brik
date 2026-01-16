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
  @Min(2) // TEST ENVIRONMENT: Minimum swap size $2 (was 25)
  swapValueUsd: number;

  @IsNumber()
  @Min(0.01) // TEST ENVIRONMENT: Minimum Brik fee $0.01 (was 0.05)
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
