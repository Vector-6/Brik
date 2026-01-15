/**
 * Swap Schema
 * Records all verified swaps for reward calculation
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SwapDocument = Swap & Document;

@Schema({ timestamps: true })
export class Swap {
  @Prop({ required: true, lowercase: true })
  walletAddress: string;

  @Prop({ required: true })
  txHash: string;

  @Prop({ required: true })
  chainId: number;

  @Prop({ required: true })
  fromToken: string;

  @Prop({ required: true })
  toToken: string;

  @Prop({ required: true })
  fromAmount: string; // BigNumber string

  @Prop({ required: true })
  toAmount: string; // BigNumber string

  @Prop({ required: true })
  swapValueUsd: number; // USD value of swap

  @Prop({ required: true })
  brikFeeUsd: number; // Brik fee in USD

  @Prop({ required: true })
  pointsEarned: number; // Points from this swap

  @Prop({ default: false })
  isVerified: boolean; // Verified on-chain

  @Prop({ type: Date })
  verifiedAt: Date;

  @Prop({ default: false })
  isWashTrade: boolean; // Flagged by anti-abuse

  @Prop({ type: Object })
  quoteData: Record<string, any>; // Original quote data from frontend

  @Prop({ type: Number })
  blockNumber: number;

  @Prop({ type: Number })
  blockTimestamp: number;
}

export const SwapSchema = SchemaFactory.createForClass(Swap);

// Indexes
SwapSchema.index({ walletAddress: 1, createdAt: -1 });
SwapSchema.index({ txHash: 1 }, { unique: true });
SwapSchema.index({ chainId: 1, createdAt: -1 });
SwapSchema.index({ isVerified: 1 });
SwapSchema.index({ createdAt: -1 });
