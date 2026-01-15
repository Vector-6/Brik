/**
 * Token Schema
 *
 * MongoDB schema for storing dynamically added tokens.
 * Hardcoded tokens remain in tokens.constant.ts
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenDocument = Token & Document;

@Schema({ timestamps: true })
export class Token extends Document {
  @Prop({ required: true, unique: true, uppercase: true })
  symbol: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0, max: 18 })
  decimals: number;

  @Prop({ required: true, unique: true })
  coingeckoId: string;

  @Prop({ type: Object, required: true })
  addresses: { [chainId: number]: string };

  @Prop({ required: true })
  image: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'custom' })
  type: string; // 'rwa', 'crypto', or 'custom'
}

export const TokenSchema = SchemaFactory.createForClass(Token);

// Indexes for faster queries (symbol and coingeckoId already have unique indexes from @Prop)
TokenSchema.index({ isActive: 1 });
