/**
 * Newsletter Subscription Schema
 *
 * Stores newsletter subscription data
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ 
  timestamps: true,
  collection: 'newsletter_subscriptions'
})
export class NewsletterSubscription extends Document {
  @Prop({ 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    index: true
  })
  email: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  subscribedAt: Date;
}

export const NewsletterSubscriptionSchema = SchemaFactory.createForClass(NewsletterSubscription);
