/**
 * Mystery Box Schema
 * Records mystery box opens and payouts
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MysteryBoxDocument = MysteryBox & Document;

export enum MysteryBoxRarity {
  COMMON = 'common', // $1-$3
  RARE = 'rare', // $5-$10
  ULTRA_RARE = 'ultra_rare', // $25+
}

export enum MysteryBoxStatus {
  OPENED = 'opened', // Box opened, payout pending
  PAID = 'paid', // Payout sent
}

@Schema({ timestamps: true })
export class MysteryBox {
  @Prop({ required: true, lowercase: true })
  walletAddress: string;

  @Prop({ required: true })
  pointsSpent: number; // Points used to open box

  @Prop({ required: true, enum: MysteryBoxRarity })
  rarity: MysteryBoxRarity;

  @Prop({ required: true })
  payoutAmountUsd: number; // Amount won

  @Prop({ required: true, enum: MysteryBoxStatus, default: MysteryBoxStatus.OPENED })
  status: MysteryBoxStatus;

  @Prop({ type: String, ref: 'Payout' })
  payoutId: string; // If paid

  @Prop({ type: Date })
  paidAt: Date;

  @Prop({ type: String })
  payoutTxHash: string; // On-chain payout transaction

  @Prop({ required: true })
  chainId: number; // Chain for payout
}

export const MysteryBoxSchema = SchemaFactory.createForClass(MysteryBox);

// Indexes
MysteryBoxSchema.index({ walletAddress: 1, createdAt: -1 });
MysteryBoxSchema.index({ status: 1 });
MysteryBoxSchema.index({ rarity: 1 });
