/**
 * Similar Tokens Query DTO
 *
 * Single Responsibility: Validate query parameters for similar tokens endpoint
 * - Limit validation (optional, default: 10, max: 50)
 * - Include market data flag (optional, default: false)
 */

import { IsOptional, IsString } from 'class-validator';

export class SimilarTokensQueryDto {
  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  includeMarketData?: string;
}
