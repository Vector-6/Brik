/**
 * User Schema
 * Stores user information linked to wallet addresses
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  walletAddress: string;

  @Prop({ default: 0 })
  totalPoints: number;

  @Prop({ default: 0 })
  totalSwaps: number;

  @Prop({ default: 0 })
  totalCashbackEarned: number;

  @Prop({ default: 0 })
  totalReferralEarnings: number;

  @Prop({ default: 0 })
  currentStreak: number; // Days of consecutive swaps

  @Prop({ type: Date })
  lastSwapDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, ref: 'ReferralCode' })
  referralCodeId: string; // Their own referral code

  @Prop({ type: String, ref: 'ReferralCode' })
  referredByCodeId: string; // Code that referred them

  @Prop({ type: Date })
  referralLockedAt: Date; // Timestamp when referral was locked

  @Prop({ default: false })
  isReferralLocked: boolean; // Whether referral is currently locked

  @Prop({ default: 0 })
  swapsSinceLastCashback: number; // Counter for 3-swap cashback

  @Prop({ type: Date })
  lastMysteryBoxDate: Date; // For daily limit enforcement
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes (walletAddress already has unique index from @Prop)
UserSchema.index({ totalPoints: -1 });
UserSchema.index({ totalSwaps: -1 });
UserSchema.index({ referredByCodeId: 1 });
