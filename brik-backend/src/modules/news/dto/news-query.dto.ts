import { IsOptional } from 'class-validator';

export class NewsQueryDto {
  @IsOptional()
  page?: string;

  @IsOptional()
  limit?: string;
}
