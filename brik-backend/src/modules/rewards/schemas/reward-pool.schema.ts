/**
 * Reward Pool Schema
 * Tracks mystery box pool balance (10% of platform fees)
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RewardPoolDocument = RewardPool & Document;

@Schema({ timestamps: true })
export class RewardPool {
  @Prop({ required: true, default: 0 })
  balanceUsd: number; // Current pool balance

  @Prop({ required: true, default: 0 })
  totalContributedUsd: number; // Total fees contributed (10% of all fees)

  @Prop({ required: true, default: 0 })
  totalPaidOutUsd: number; // Total paid out in mystery boxes

  @Prop({ type: Date, default: Date.now })
  lastUpdated: Date;
}

export const RewardPoolSchema = SchemaFactory.createForClass(RewardPool);

// Note: Singleton pattern - only one pool document should exist
// MongoDB's default _id field is already unique, so no custom index needed
