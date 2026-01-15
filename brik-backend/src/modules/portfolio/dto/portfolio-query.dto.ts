import { IsOptional, IsString } from 'class-validator';

export class PortfolioQueryDto {
  @IsOptional()
  @IsString()
  includePerformance?: string = 'true';
}
