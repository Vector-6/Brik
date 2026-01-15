/**
 * DTO for getting database tokens
 */

import { IsOptional, IsIn, IsString, IsNumberString } from 'class-validator';

export class GetDbTokensQueryDto {
  @IsOptional()
  @IsIn(['rwa', 'crypto', 'custom'])
  type?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  isActive?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  chainId?: string;
}

export class DbTokenDto {
  _id: string;
  symbol: string;
  name: string;
  decimals: number;
  coingeckoId: string;
  addresses: { [chainId: number]: string };
  image: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class GetDbTokensResponseDto {
  tokens: DbTokenDto[];
  total: number;
  lastUpdated: string;
}
