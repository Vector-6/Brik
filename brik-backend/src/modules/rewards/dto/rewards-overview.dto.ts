/**
 * DTOs for rewards overview
 */

export class RewardsOverviewDto {
  walletAddress: string;
  totalPoints: number;
  swapsUntilCashback: number; // 0, 1, or 2
  claimableCashbackUsd: number;
  claimableReferralEarningsUsd: number;
  totalSwaps: number;
  currentStreak: number;
  canOpenMysteryBox: boolean;
  mysteryBoxCountdownHours?: number; // Hours until next box available
  lastMysteryBoxDate?: Date;
}

export class CashbackProgressDto {
  swapsCompleted: number; // 0, 1, or 2
  swapsRemaining: number; // 3 - swapsCompleted
  totalFeesUsd: number; // Sum of fees from completed swaps
  estimatedCashbackUsd: number; // Estimated cashback if completed
  message: string; // e.g., "2 / 3 swaps completed — cashback loading..."
}
