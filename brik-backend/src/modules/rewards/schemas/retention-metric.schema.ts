/**
 * Retention Metric Schema
 * Tracks user retention cohorts for analytics
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RetentionMetricDocument = RetentionMetric & Document;

@Schema({ timestamps: true })
export class RetentionMetric {
  @Prop({ required: true, lowercase: true })
  walletAddress: string;

  @Prop({ required: true, type: Date })
  firstSwapDate: Date;

  @Prop({ required: true, type: Date })
  lastSwapDate: Date;

  @Prop({ required: true, default: 1 })
  totalSwaps: number;

  // Retention flags
  @Prop({ type: Boolean, default: false })
  isRetained7Days: boolean;

  @Prop({ type: Boolean, default: false })
  isRetained14Days: boolean;

  @Prop({ type: Boolean, default: false })
  isRetained30Days: boolean;

  // Last check dates
  @Prop({ type: Date })
  lastChecked7Days: Date;

  @Prop({ type: Date })
  lastChecked14Days: Date;

  @Prop({ type: Date })
  lastChecked30Days: Date;
}

export const RetentionMetricSchema = SchemaFactory.createForClass(RetentionMetric);

// Indexes
RetentionMetricSchema.index({ walletAddress: 1 }, { unique: true });
RetentionMetricSchema.index({ firstSwapDate: 1 });
RetentionMetricSchema.index({ isRetained7Days: 1, isRetained14Days: 1, isRetained30Days: 1 });
