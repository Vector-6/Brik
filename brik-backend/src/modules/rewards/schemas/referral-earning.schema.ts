/**
 * Referral Earning Schema
 * Tracks individual referral earnings from referee swaps
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReferralEarningDocument = ReferralEarning & Document;

export enum ReferralEarningStatus {
  LOCKED = 'locked', // Referee hasn't completed 2 swaps yet
  CLAIMABLE = 'claimable', // Ready to claim
  CLAIMED = 'claimed', // User has claimed
  PAID = 'paid', // Admin has sent payment
}

@Schema({ timestamps: true })
export class ReferralEarning {
  @Prop({ required: true, lowercase: true })
  referrerWalletAddress: string; // Who earns the referral

  @Prop({ required: true, lowercase: true })
  refereeWalletAddress: string; // Who made the swap

  @Prop({ required: true, type: String, ref: 'ReferralCode' })
  referralCodeId: string;

  @Prop({ required: true, type: String, ref: 'Swap' })
  swapId: string; // Swap that generated this earning

  @Prop({ required: true })
  brikFeeUsd: number; // Fee from the swap

  @Prop({ required: true })
  referralPercentage: number; // 5%

  @Prop({ required: true })
  earningAmountUsd: number; // Calculated earning

  @Prop({ required: true })
  chainId: number; // Chain where swap occurred

  @Prop({ required: true, enum: ReferralEarningStatus, default: ReferralEarningStatus.LOCKED })
  status: ReferralEarningStatus;

  @Prop({ type: String, ref: 'Payout' })
  payoutId: string; // If claimed/paid

  @Prop({ type: Date })
  claimedAt: Date;

  @Prop({ type: Date })
  paidAt: Date;

  @Prop({ type: String })
  payoutTxHash: string; // On-chain payout transaction
}

export const ReferralEarningSchema = SchemaFactory.createForClass(ReferralEarning);

// Indexes
ReferralEarningSchema.index({ referrerWalletAddress: 1, status: 1, createdAt: -1 });
ReferralEarningSchema.index({ refereeWalletAddress: 1 });
ReferralEarningSchema.index({ referralCodeId: 1 });
ReferralEarningSchema.index({ swapId: 1 });
ReferralEarningSchema.index({ status: 1 });
