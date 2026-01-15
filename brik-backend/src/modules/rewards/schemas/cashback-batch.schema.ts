/**
 * Cashback Batch Schema
 * Groups fees from 3 swaps for cashback calculation
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CashbackBatchDocument = CashbackBatch & Document;

export enum CashbackStatus {
  PENDING = 'pending', // Not yet claimable
  CLAIMABLE = 'claimable', // Ready to claim
  CLAIMED = 'claimed', // User has claimed
  PAID = 'paid', // Admin has sent payment
}

@Schema({ timestamps: true })
export class CashbackBatch {
  @Prop({ required: true, lowercase: true })
  walletAddress: string;

  @Prop({ required: true, type: [String], ref: 'Fee' })
  feeIds: string[]; // 3 fees from last 3 swaps

  @Prop({ required: true })
  totalFeesUsd: number; // Sum of 3 fees

  @Prop({ required: true })
  cashbackPercentage: number; // 5-10% (can vary)

  @Prop({ required: true })
  cashbackAmountUsd: number; // Calculated cashback

  @Prop({ required: true })
  chainId: number; // Chain where fees were collected

  @Prop({ required: true, enum: CashbackStatus, default: CashbackStatus.CLAIMABLE })
  status: CashbackStatus;

  @Prop({ type: String, ref: 'Payout' })
  payoutId: string; // If claimed/paid

  @Prop({ type: Date })
  claimedAt: Date;

  @Prop({ type: Date })
  paidAt: Date;

  @Prop({ type: String })
  payoutTxHash: string; // On-chain payout transaction
}

export const CashbackBatchSchema = SchemaFactory.createForClass(CashbackBatch);

// Indexes
CashbackBatchSchema.index({ walletAddress: 1, status: 1, createdAt: -1 });
CashbackBatchSchema.index({ status: 1 });
CashbackBatchSchema.index({ chainId: 1 });
