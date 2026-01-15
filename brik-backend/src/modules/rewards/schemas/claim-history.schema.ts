/**
 * Claim History Schema
 * Tracks claim attempts for rate limiting
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClaimHistoryDocument = ClaimHistory & Document;

@Schema({ timestamps: true })
export class ClaimHistory {
  @Prop({ required: true, lowercase: true })
  walletAddress: string;

  @Prop({ required: true })
  claimType: string; // 'cashback', 'referral', 'mystery_box'

  @Prop({ required: true })
  success: boolean;

  @Prop({ type: String })
  payoutId: string; // If successful

  @Prop({ type: String })
  errorReason: string; // If failed
}

export const ClaimHistorySchema = SchemaFactory.createForClass(ClaimHistory);

// Indexes for rate limiting queries
ClaimHistorySchema.index({ walletAddress: 1, createdAt: -1 });
ClaimHistorySchema.index({ walletAddress: 1, claimType: 1, createdAt: -1 });
