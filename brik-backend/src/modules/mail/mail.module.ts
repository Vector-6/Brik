import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { NewsletterSubscription, NewsletterSubscriptionSchema } from './schemas/newsletter-subscription.schema';
import { ContactMessage, ContactMessageSchema } from './schemas/contact-message.schema';
import { RwaListingSuggestion, RwaListingSuggestionSchema } from './schemas/rwa-listing-suggestion.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: NewsletterSubscription.name, schema: NewsletterSubscriptionSchema },
      { name: ContactMessage.name, schema: ContactMessageSchema },
      { name: RwaListingSuggestion.name, schema: RwaListingSuggestionSchema },
    ]),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
