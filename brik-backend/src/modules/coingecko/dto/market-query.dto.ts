/**
 * Market Query DTO
 *
 * Data Transfer Object for querying market data from CoinGecko
 * Includes validation rules using class-validator
 */

import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MarketQueryDto {
  @IsOptional()
  @IsString()
  vsCurrency?: string = 'usd';

  @IsOptional()
  @IsString()
  ids?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  order?:
    | 'market_cap_asc'
    | 'market_cap_desc'
    | 'volume_asc'
    | 'volume_desc'
    | 'id_asc'
    | 'id_desc';

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(250)
  perPage?: number = 100;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  sparkline?: boolean = false;

  @IsOptional()
  @IsString()
  priceChangePercentage?: string;

  @IsOptional()
  @IsString()
  locale?: string = 'en';

  @IsOptional()
  precision?: string | number;
}
