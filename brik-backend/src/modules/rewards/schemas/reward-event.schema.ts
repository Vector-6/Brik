/**
 * Reward Event Schema
 * Single source of truth for all reward events
 * Used for UI animations, progress replay, state recovery, desync prevention
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RewardEventDocument = RewardEvent & Document;

export enum RewardEventType {
  POINTS_EARNED = 'points_earned',
  POINTS_SPENT = 'points_spent',
  CASHBACK_TRIGGERED = 'cashback_triggered',
  CASHBACK_CLAIMED = 'cashback_claimed',
  REFERRAL_EARNED = 'referral_earned',
  REFERRAL_ACTIVATED = 'referral_activated',
  REFERRAL_CLAIMED = 'referral_claimed',
  MYSTERY_BOX_OPENED = 'mystery_box_opened',
  MYSTERY_BOX_PAID = 'mystery_box_paid',
  SWAP_VERIFIED = 'swap_verified',
  STREAK_UPDATED = 'streak_updated',
}

@Schema({ timestamps: true })
export class RewardEvent {
  @Prop({ required: true, lowercase: true })
  walletAddress: string;

  @Prop({ required: true, enum: RewardEventType })
  type: RewardEventType;

  @Prop({ required: true })
  amount: number; // Points, USD, etc. depending on type

  @Prop({ type: String })
  swapId: string; // If related to swap

  @Prop({ type: String })
  cashbackBatchId: string; // If related to cashback

  @Prop({ type: String })
  referralEarningId: string; // If related to referral

  @Prop({ type: String })
  mysteryBoxId: string; // If related to mystery box

  @Prop({ type: String })
  payoutId: string; // If related to payout

  @Prop({ type: Object })
  metadata: Record<string, any>; // Additional context for UI

  @Prop({ required: true })
  balanceAfter: number; // Balance after this event (points, USD, etc.)

  @Prop({ type: String })
  description: string; // Human-readable description
}

export const RewardEventSchema = SchemaFactory.createForClass(RewardEvent);

// Indexes - critical for performance
RewardEventSchema.index({ walletAddress: 1, createdAt: -1 });
RewardEventSchema.index({ type: 1, createdAt: -1 });
RewardEventSchema.index({ swapId: 1 });
RewardEventSchema.index({ createdAt: -1 }); // For replaying events in order
