import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resend } from 'resend';
import { NewsletterDto } from './dto/newsletter.dto';
import { ContactUsDto } from './dto/contact-us.dto';
import { RwaListingSuggestionDto } from './dto/rwa-listing-suggestion.dto';
import { NewsletterSubscription } from './schemas/newsletter-subscription.schema';
import { ContactMessage } from './schemas/contact-message.schema';
import { RwaListingSuggestion } from './schemas/rwa-listing-suggestion.schema';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly adminEmail: string;
  private readonly fromEmail: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(NewsletterSubscription.name)
    private newsletterModel: Model<NewsletterSubscription>,
    @InjectModel(ContactMessage.name)
    private contactMessageModel: Model<ContactMessage>,
    @InjectModel(RwaListingSuggestion.name)
    private rwaListingSuggestionModel: Model<RwaListingSuggestion>,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not configured – mail features are disabled');
      this.resend = null;
    } else {
      this.resend = new Resend(apiKey);
    }
    
    this.adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@brik.io';
    // Use Resend's onboarding email as default (no verification needed)
    this.fromEmail = this.configService.get<string>('FROM_EMAIL') || 'onboarding@resend.dev';
  }

  async sendNewsletterSubscription(newsletterDto: NewsletterDto): Promise<void> {
    try {
      const { email } = newsletterDto;
      
      // Check if email already exists in database
      const existingSubscription = await this.newsletterModel.findOne({ 
        email: email.toLowerCase() 
      });
      
      if (existingSubscription) {
        this.logger.warn(`Newsletter subscription attempt with existing email: ${email}`);
        throw new ConflictException('Already Subscribed to Newsletter');
      }
      
      // Save to database first
      const subscription = new this.newsletterModel({
        email: email.toLowerCase(),
        subscribedAt: new Date(),
      });
      await subscription.save();
      
      this.logger.log(`Newsletter subscription saved to database for: ${email}`);
      
      // Send email notification to admin (if Resend is configured)
      if (this.resend) {
        this.logger.log(`Attempting to send newsletter email:`);
        this.logger.log(`From: ${this.fromEmail}`);
        this.logger.log(`To: ${this.adminEmail}`);
        this.logger.log(`User email: ${email}`);
        
        const result = await this.resend.emails.send({
          from: this.fromEmail,
          to: this.adminEmail,
          subject: 'New Newsletter Subscription',
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #2c3e50;">New Newsletter Subscription</h2>
              <p>A new user has subscribed to the newsletter.</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <strong>Email:</strong> ${email}
              </div>
              <p style="font-size: 12px; color: #666;">
                This email was sent from Brik Newsletter Subscription form.
              </p>
            </div>
          `,
        });

        this.logger.log(`Resend response:`, JSON.stringify(result));
        this.logger.log(`Newsletter subscription email sent for: ${email}`);
      } else {
        this.logger.warn('Resend is not configured - skipping email notification');
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to process newsletter subscription: ${error.message}`);
      this.logger.error(`Error details:`, error);
      throw new Error('Failed to process newsletter subscription');
    }
  }

  async sendContactUsMessage(contactUsDto: ContactUsDto): Promise<void> {
    try {
      const { name, email, subject, message } = contactUsDto;
      
      // Save to database first
      const contactMessage = new this.contactMessageModel({
        name,
        email: email.toLowerCase(),
        subject,
        message,
        status: 'pending',
        submittedAt: new Date(),
      });
      await contactMessage.save();
      
      this.logger.log(`Contact message saved to database from: ${email}`);
      
      // Send email notification to admin (if Resend is configured)
      if (this.resend) {
        await this.resend.emails.send({
          from: this.fromEmail,
          to: this.adminEmail,
          subject: `Contact Us: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #2c3e50;">New Contact Us Message</h2>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
              </div>
              <div style="background-color: #fff; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #2c3e50;">Message:</h3>
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>
              <p style="font-size: 12px; color: #666;">
                This email was sent from Brik Contact Us form.
              </p>
            </div>
          `,
        });

        this.logger.log(`Contact us email sent from: ${email}`);
      } else {
        this.logger.warn('Resend is not configured - skipping email notification');
      }
    } catch (error) {
      this.logger.error(`Failed to process contact us message: ${error.message}`);
      throw new Error('Failed to process contact us message');
    }
  }

  async sendRwaListingSuggestion(rwaDto: RwaListingSuggestionDto): Promise<void> {
    try {
      const { email, assetName, category, assetDescription, marketSize, whyThisAsset } = rwaDto;
      
      // Save to database first
      const rwaSuggestion = new this.rwaListingSuggestionModel({
        email: email.toLowerCase(),
        assetName,
        category,
        assetDescription,
        marketSize,
        whyThisAsset,
        status: 'pending',
        submittedAt: new Date(),
      });
      await rwaSuggestion.save();
      
      this.logger.log(`RWA listing suggestion saved to database from: ${email} for asset: ${assetName}`);
      
      // Send email notification to admin (if Resend is configured)
      if (this.resend) {
        await this.resend.emails.send({
          from: this.fromEmail,
          to: this.adminEmail,
          subject: `RWA Listing Suggestion: ${assetName}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #2c3e50;">New RWA Listing Suggestion</h2>
              <p>A user has submitted a suggestion for a new Real World Asset (RWA) listing.</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #2c3e50;">Submitter Information</h3>
                <p><strong>Email:</strong> ${email}</p>
              </div>

              <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #27ae60;">Asset Details</h3>
                <p><strong>Asset Name:</strong> ${assetName}</p>
                <p><strong>Category:</strong> ${category}</p>
                ${marketSize ? `<p><strong>Market Size:</strong> ${marketSize}</p>` : ''}
              </div>

              <div style="background-color: #fff; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #2c3e50;">Asset Description</h3>
                <p>${assetDescription.replace(/\n/g, '<br>')}</p>
              </div>

              <div style="background-color: #fff; padding: 15px; border-left: 4px solid #f39c12; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #2c3e50;">Why This Asset?</h3>
                <p>${whyThisAsset.replace(/\n/g, '<br>')}</p>
              </div>

              <p style="font-size: 12px; color: #666;">
                This email was sent from Brik RWA Listing Suggestion form.
              </p>
            </div>
          `,
        });

        this.logger.log(`RWA listing suggestion email sent from: ${email} for asset: ${assetName}`);
      } else {
        this.logger.warn('Resend is not configured - skipping email notification');
      }
    } catch (error) {
      this.logger.error(`Failed to process RWA listing suggestion: ${error.message}`);
      throw new Error('Failed to process RWA listing suggestion');
    }
  }
}
