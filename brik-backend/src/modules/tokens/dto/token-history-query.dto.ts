import { IsOptional, IsString } from 'class-validator';

export class TokenHistoryQueryDto {
  @IsOptional()
  @IsString()
  days?: string = '30';

  @IsOptional()
  @IsString()
  currency?: string = 'usd';

  @IsOptional()
  @IsString()
  interval?: string;

  @IsOptional()
  @IsString()
  precision?: string; // '0'..'18' or 'full'

  // Optionally accept `from` and `to` for range queries (unix seconds)
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}
