import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { NewsService } from './news.service';
import { NewsQueryDto } from './dto/news-query.dto';
import { NewsResponseDto } from './dto/news-response.dto';

@Controller('api')
@UseInterceptors(CacheInterceptor)
export class NewsController {
  private readonly logger = new Logger(NewsController.name);

  constructor(private readonly newsService: NewsService) {}

  @Get('news')
  @CacheTTL(7200000)
  async getNews(@Query() query: NewsQueryDto): Promise<NewsResponseDto> {
    this.logger.log(
      `GET /api/news - page: ${query.page || '1'}, limit: ${query.limit || '20'}`,
    );
    return this.newsService.getNews(query);
  }
}
