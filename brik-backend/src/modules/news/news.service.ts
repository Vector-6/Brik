import { Injectable, Logger } from '@nestjs/common';
import { NewsAggregatorService } from './news-aggregator.service';
import { NewsResponseDto } from './dto/news-response.dto';
import { NewsQueryDto } from './dto/news-query.dto';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(private readonly newsAggregatorService: NewsAggregatorService) {}

  async getNews(query: NewsQueryDto): Promise<NewsResponseDto> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);

    this.logger.debug(`Fetching news with page=${page}, limit=${limit}`);

    const articles = await this.newsAggregatorService.aggregateNews(
      page,
      limit,
    );

    const response: NewsResponseDto = {
      articles,
      total: articles.length,
      page,
      pageSize: limit,
      hasMore: articles.length === limit,
    };

    this.logger.debug(
      `Returning ${response.articles.length} articles for page ${page}`,
    );

    return response;
  }
}
