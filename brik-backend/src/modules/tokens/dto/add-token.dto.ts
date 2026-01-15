import {
  IsString,
  IsNumber,
  IsObject,
  IsUrl,
  IsOptional,
  Min,
  Max,
  Matches,
  IsEnum,
  IsNotEmpty,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

class AddressMapDto {
  @IsInt()
  @Min(1)
  chainId: number;

  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Invalid Ethereum address format',
  })
  address: string;
}

export class AddTokenDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Symbol must be uppercase alphanumeric characters only',
  })
  symbol: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(18)
  decimals: number;

  @IsString()
  @IsNotEmpty()
  coingeckoId: string;

  @ValidateNested({ each: true })
  @Type(() => AddressMapDto)
  addresses: AddressMapDto[];

  @IsOptional()
  @IsEnum(['rwa', 'crypto', 'custom'])
  type?: string;
}

export class AddTokenResponseDto {
  @IsString()
  symbol: string;

  @IsString()
  name: string;

  @IsNumber()
  decimals: number;

  @IsString()
  coingeckoId: string;

  @IsObject()
  addresses: { [chainId: number]: string };

  @IsString()
  image: string;

  @IsString()
  type: string;

  @IsString()
  _id: string;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;
}
