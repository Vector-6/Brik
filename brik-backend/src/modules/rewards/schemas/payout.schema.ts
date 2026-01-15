/**
 * Payout Schema
 * Tracks all cash payouts (cashback, referrals, mystery boxes)
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PayoutDocument = Payout & Document;

export enum PayoutType {
  CASHBACK = 'cashback',
  REFERRAL = 'referral',
  MYSTERY_BOX = 'mystery_box',
}

export enum PayoutStatus {
  PENDING = 'pending', // User claimed, waiting for admin payment
  PROCESSING = 'processing', // Payment being sent
  COMPLETED = 'completed', // Payment sent successfully
  FAILED = 'failed', // Payment failed
}

@Schema({ timestamps: true })
export class Payout {
  @Prop({ required: true, lowercase: true })
  walletAddress: string;

  @Prop({ required: true, enum: PayoutType })
  type: PayoutType;

  @Prop({ required: true })
  amountUsd: number;

  @Prop({ required: true })
  chainId: number; // Chain for payout

  @Prop({ required: true })
  tokenAddress: string; // USDC address on chain

  @Prop({ required: true, enum: PayoutStatus, default: PayoutStatus.PENDING })
  status: PayoutStatus;

  @Prop({ type: String })
  txHash: string; // On-chain transaction hash

  @Prop({ type: Date })
  paidAt: Date;

  @Prop({ type: String })
  failureReason: string; // If failed

  @Prop({ type: Object })
  metadata: Record<string, any>; // Related IDs (cashbackBatchId, referralEarningId, etc.)
}

export const PayoutSchema = SchemaFactory.createForClass(Payout);

// Indexes
PayoutSchema.index({ walletAddress: 1, status: 1, createdAt: -1 });
PayoutSchema.index({ type: 1, status: 1 });
PayoutSchema.index({ txHash: 1 });
PayoutSchema.index({ chainId: 1 });
