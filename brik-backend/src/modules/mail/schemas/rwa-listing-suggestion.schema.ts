/**
 * RWA Listing Suggestion Schema
 *
 * Stores RWA listing suggestions from users
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AssetCategory } from '../dto/rwa-listing-suggestion.dto';

@Schema({ 
  timestamps: true,
  collection: 'rwa_listing_suggestions'
})
export class RwaListingSuggestion extends Document {
  @Prop({ 
    required: true, 
    lowercase: true,
    trim: true,
    index: true
  })
  email: string;

  @Prop({ required: true, trim: true })
  assetName: string;

  @Prop({ 
    required: true, 
    enum: Object.values(AssetCategory)
  })
  category: AssetCategory;

  @Prop({ required: true })
  assetDescription: string;

  @Prop({ trim: true })
  marketSize?: string;

  @Prop({ required: true })
  whyThisAsset: string;

  @Prop({ default: 'pending', enum: ['pending', 'under_review', 'approved', 'rejected'] })
  status: string;

  @Prop({ default: Date.now })
  submittedAt: Date;
}

export const RwaListingSuggestionSchema = SchemaFactory.createForClass(RwaListingSuggestion);
