/**
 * Explore Query DTO
 *
 * Validation for query parameters on the /api/explore endpoint
 */

import { IsOptional, IsIn } from 'class-validator';

export class ExploreQueryDto {
  @IsOptional()
  @IsIn(['market_cap', 'volume', 'price', 'change_24h'])
  sortBy?: 'market_cap' | 'volume' | 'price' | 'change_24h' = 'market_cap';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
