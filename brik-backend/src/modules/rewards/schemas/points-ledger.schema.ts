/**
 * Points Ledger Schema
 * Single source of truth for all points transactions
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PointsLedgerDocument = PointsLedger & Document;

export enum PointsTransactionType {
  SWAP_EARNED = 'swap_earned',
  MYSTERY_BOX_SPENT = 'mystery_box_spent',
  TIER_BONUS = 'tier_bonus', // Future
  ADJUSTMENT = 'adjustment', // Admin adjustment
}

@Schema({ timestamps: true })
export class PointsLedger {
  @Prop({ required: true, lowercase: true })
  walletAddress: string;

  @Prop({ required: true, enum: PointsTransactionType })
  type: PointsTransactionType;

  @Prop({ required: true })
  amount: number; // Positive for earned, negative for spent

  @Prop({ required: true })
  balanceAfter: number; // Points balance after this transaction

  @Prop({ type: String, ref: 'Swap' })
  swapId: string; // If related to a swap

  @Prop({ type: String, ref: 'MysteryBox' })
  mysteryBoxId: string; // If related to mystery box

  @Prop({ type: String })
  description: string; // Human-readable description

  @Prop({ type: Object })
  metadata: Record<string, any>; // Additional context
}

export const PointsLedgerSchema = SchemaFactory.createForClass(PointsLedger);

// Indexes
PointsLedgerSchema.index({ walletAddress: 1, createdAt: -1 });
PointsLedgerSchema.index({ type: 1, createdAt: -1 });
PointsLedgerSchema.index({ swapId: 1 });
PointsLedgerSchema.index({ mysteryBoxId: 1 });
