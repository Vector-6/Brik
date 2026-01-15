/**
 * Rewards API Endpoints
 * Functions for interacting with the /api/rewards endpoints
 */

import apiClient from '../client';

// ============================================================================
// Types
// ============================================================================

export interface RewardsOverview {
  walletAddress: string;
  totalPoints: number;
  swapsUntilCashback: number;
  claimableCashbackUsd: number;
  claimableReferralEarningsUsd: number;
  totalSwaps: number;
  currentStreak: number;
  canOpenMysteryBox: boolean;
  mysteryBoxCountdownHours?: number;
  lastMysteryBoxDate?: string;
}

export interface CashbackProgress {
  swapsCompleted: number;
  swapsRemaining: number;
  totalFeesUsd: number;
  estimatedCashbackUsd: number;
  message: string;
}

export interface ClaimableRewards {
  cashbackUsd: number;
  referralUsd: number;
  totalUsd: number;
}

export interface MysteryBoxInfo {
  canOpen: boolean;
  pointsRequired: number;
  userPoints: number;
  poolBalanceUsd: number;
  hoursUntilNextBox?: number;
  lastOpenedDate?: string;
}

export interface ReferralStats {
  code: string;
  totalReferees: number;
  totalEarningsUsd: number;
  claimableEarningsUsd: number;
  activeReferees: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get rewards overview for a wallet
 */
export async function fetchRewardsOverview(
  walletAddress: string,
): Promise<RewardsOverview> {
  const { data } = await apiClient.get<RewardsOverview>(
    `/rewards/overview/${walletAddress.toLowerCase()}`,
  );
  return data;
}

/**
 * Get cashback progress
 */
export async function fetchCashbackProgress(
  walletAddress: string,
): Promise<CashbackProgress> {
  const { data } = await apiClient.get<CashbackProgress>(
    `/rewards/cashback/progress/${walletAddress.toLowerCase()}`,
  );
  return data;
}

/**
 * Get claimable rewards summary
 */
export async function fetchClaimableRewards(
  walletAddress: string,
): Promise<ClaimableRewards> {
  const { data } = await apiClient.get<ClaimableRewards>(
    `/rewards/claimable/${walletAddress.toLowerCase()}`,
  );
  return data;
}

/**
 * Get mystery box info
 */
export async function fetchMysteryBoxInfo(
  walletAddress: string,
): Promise<MysteryBoxInfo> {
  const { data } = await apiClient.get<MysteryBoxInfo>(
    `/rewards/mystery-box/info/${walletAddress.toLowerCase()}`,
  );
  return data;
}

/**
 * Get referral stats
 */
export async function fetchReferralStats(
  walletAddress: string,
): Promise<ReferralStats | null> {
  try {
    const { data } = await apiClient.get<ReferralStats>(
      `/rewards/referral/stats/${walletAddress.toLowerCase()}`,
    );
    return data;
  } catch (error) {
    // Return null if no referral code exists
    return null;
  }
}

/**
 * Create referral code
 */
export async function createReferralCode(
  walletAddress: string,
): Promise<{ success: boolean; code: string; message: string }> {
  const { data } = await apiClient.post<{
    success: boolean;
    code: string;
    message: string;
  }>('/rewards/referral/create', { walletAddress: walletAddress.toLowerCase() });
  return data;
}

/**
 * Claim rewards
 */
export async function claimRewards(params: {
  type: 'cashback' | 'referral' | 'mystery_box';
  walletAddress: string;
  cashbackBatchId?: string;
  referralEarningIds?: string;
  mysteryBoxId?: string;
}): Promise<{
  success: boolean;
  payoutId: string;
  amountUsd: number;
  chainId: number;
  status: string;
  message: string;
}> {
  const { data } = await apiClient.post('/rewards/claim', {
    ...params,
    walletAddress: params.walletAddress.toLowerCase(),
  });
  return data;
}

/**
 * Open mystery box
 */
export async function openMysteryBox(params: {
  walletAddress: string;
  pointsToSpend: number;
  chainId?: number;
}): Promise<{
  success: boolean;
  mysteryBoxId: string;
  rarity: string;
  payoutAmountUsd: number;
  pointsSpent: number;
  pointsRemaining: number;
  message: string;
}> {
  const { data } = await apiClient.post('/rewards/mystery-box/open', {
    ...params,
    walletAddress: params.walletAddress.toLowerCase(),
  });
  return data;
}
