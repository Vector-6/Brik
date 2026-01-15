import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum AssetCategory {
  COMMODITIES = 'Commodities (Gold, Silver, etc.)',
  REAL_ESTATE = 'Real Estate',
  TREASURY_BONDS = 'Treasury Bonds',
  CARBON_CREDITS = 'Carbon Credits',
  RENEWABLE_ENERGY = 'Renewable Energy',
  ART_COLLECTIBLES = 'Art & Collectibles',
  OTHER = 'Other'
}

export class RwaListingSuggestionDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Your email is required' })
  email: string;

  @IsString({ message: 'Asset name must be a string' })
  @IsNotEmpty({ message: 'Asset name is required' })
  assetName: string;

  @IsEnum(AssetCategory, { message: 'Please select a valid category' })
  @IsNotEmpty({ message: 'Category is required' })
  category: AssetCategory;

  @IsString({ message: 'Asset description must be a string' })
  @IsNotEmpty({ message: 'Asset description is required' })
  assetDescription: string;

  @IsOptional()
  @IsString({ message: 'Market size must be a string' })
  marketSize?: string;

  @IsString({ message: 'Reason must be a string' })
  @IsNotEmpty({ message: 'Why this asset reason is required' })
  whyThisAsset: string;
}

export class RwaListingSuggestionResponseDto {
  success: boolean;
  message: string;
}
