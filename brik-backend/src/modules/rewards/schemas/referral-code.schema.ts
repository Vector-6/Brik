/**
 * Referral Code Schema
 * Each user can generate one referral code
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReferralCodeDocument = ReferralCode & Document;

@Schema({ timestamps: true })
export class ReferralCode {
  @Prop({ required: true, unique: true, uppercase: true })
  code: string; // Unique referral code

  @Prop({ required: true, lowercase: true })
  creatorWalletAddress: string; // User who created this code

  @Prop({ default: 0 })
  totalReferees: number; // Number of users who used this code

  @Prop({ default: 0 })
  totalEarningsUsd: number; // Total referral earnings

  @Prop({ default: 0 })
  claimableEarningsUsd: number; // Currently claimable amount

  @Prop({ default: true })
  isActive: boolean;
}

export const ReferralCodeSchema = SchemaFactory.createForClass(ReferralCode);

// Indexes (code already has unique index from @Prop)
ReferralCodeSchema.index({ creatorWalletAddress: 1 }, { unique: true });
ReferralCodeSchema.index({ isActive: 1 });
