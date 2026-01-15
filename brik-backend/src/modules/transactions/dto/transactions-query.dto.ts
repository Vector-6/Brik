/**
 * Transactions Query DTO
 *
 * Single Responsibility: Validate query parameters for GET /api/transactions
 *
 * Applies to both:
 * - GET /api/transactions
 * - GET /api/transactions/:walletAddress
 */

import { IsOptional, IsIn, IsString } from 'class-validator';

export class TransactionsQueryDto {
  @IsOptional()
  @IsIn(['ALL', 'DONE', 'PENDING', 'FAILED'])
  status?: 'ALL' | 'DONE' | 'PENDING' | 'FAILED';

  @IsOptional()
  @IsString()
  fromChain?: string;

  @IsOptional()
  @IsString()
  toChain?: string;

  @IsOptional()
  @IsString()
  fromToken?: string;

  @IsOptional()
  @IsString()
  toToken?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  next?: string;

  @IsOptional()
  @IsString()
  previous?: string;
}
