import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ContactUsDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Subject must be a string' })
  @IsNotEmpty({ message: 'Subject is required' })
  subject: string;

  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message is required' })
  message: string;
}

export class ContactUsResponseDto {
  success: boolean;
  message: string;
}
