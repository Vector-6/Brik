import { IsEmail, IsNotEmpty } from 'class-validator';

export class NewsletterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class NewsletterResponseDto {
  success: boolean;
  message: string;
}
