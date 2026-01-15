/**
 * Contact Us Schema
 *
 * Stores contact us messages
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ 
  timestamps: true,
  collection: 'contact_messages'
})
export class ContactMessage extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ 
    required: true, 
    lowercase: true,
    trim: true,
    index: true
  })
  email: string;

  @Prop({ required: true, trim: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: 'pending', enum: ['pending', 'responded', 'archived'] })
  status: string;

  @Prop({ default: Date.now })
  submittedAt: Date;
}

export const ContactMessageSchema = SchemaFactory.createForClass(ContactMessage);
