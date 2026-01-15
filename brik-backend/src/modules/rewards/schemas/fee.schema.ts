/**
 * Fee Schema
 * Tracks individual fees from swaps for cashback calculation
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FeeDocument = Fee & Document;

@Schema({ timestamps: true })
export class Fee {
  @Prop({ required: true, lowercase: true })
  walletAddress: string;

  @Prop({ required: true, type: String, ref: 'Swap' })
  swapId: string;

  @Prop({ required: true })
  brikFeeUsd: number;

  @Prop({ required: true })
  chainId: number;

  @Prop({ default: false })
  usedForCashback: boolean; // Whether this fee was used in a cashback batch

  @Prop({ type: String, ref: 'CashbackBatch' })
  cashbackBatchId: string;
}

export const FeeSchema = SchemaFactory.createForClass(Fee);

// Indexes
FeeSchema.index({ walletAddress: 1, usedForCashback: 1, createdAt: -1 });
FeeSchema.index({ swapId: 1 });
FeeSchema.index({ cashbackBatchId: 1 });
