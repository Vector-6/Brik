import { Body, Controller, Post, HttpCode, HttpStatus, ConflictException } from '@nestjs/common';
import { MailService } from './mail.service';
import { NewsletterDto, NewsletterResponseDto } from './dto/newsletter.dto';
import { ContactUsDto, ContactUsResponseDto } from './dto/contact-us.dto';
import { RwaListingSuggestionDto, RwaListingSuggestionResponseDto } from './dto/rwa-listing-suggestion.dto';

@Controller('api/mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('newsletter')
  @HttpCode(HttpStatus.OK)
  async subscribeNewsletter(@Body() newsletterDto: NewsletterDto): Promise<NewsletterResponseDto> {
    try {
      await this.mailService.sendNewsletterSubscription(newsletterDto);
      return {
        success: true,
        message: 'Newsletter subscription successful. Thank you for subscribing!'
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        return {
          success: false,
          message: 'Already Subscribed to Newsletter!'
        };
      }
      return {
        success: false,
        message: 'Failed to process newsletter subscription. Please try again later.'
      };
    }
  }

  @Post('contact-us')
  @HttpCode(HttpStatus.OK)
  async contactUs(@Body() contactUsDto: ContactUsDto): Promise<ContactUsResponseDto> {
    try {
      await this.mailService.sendContactUsMessage(contactUsDto);
      return {
        success: true,
        message: 'Your message has been sent successfully. We will get back to you soon!'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send your message. Please try again later.'
      };
    }
  }

  @Post('rwa-listing-suggestion')
  @HttpCode(HttpStatus.OK)
  async suggestRwaListing(@Body() rwaDto: RwaListingSuggestionDto): Promise<RwaListingSuggestionResponseDto> {
    try {
      await this.mailService.sendRwaListingSuggestion(rwaDto);
      return {
        success: true,
        message: 'Thank you for your RWA listing suggestion! We will review it and get back to you.'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to submit your RWA listing suggestion. Please try again later.'
      };
    }
  }
}
