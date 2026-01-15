import { IsOptional, IsString, IsIn } from 'class-validator';

export class TokensQueryDto {
  @IsOptional()
  @IsString()
  chainId?: string;

  @IsOptional()
  @IsString()
  includeMarketData?: string;

  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsString()
  @IsIn(['rwa', 'crypto'])
  type?: 'rwa' | 'crypto';
}
