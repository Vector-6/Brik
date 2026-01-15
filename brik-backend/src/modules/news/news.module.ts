import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsAggregatorService } from './news-aggregator.service';
import { NewsAPIService } from './newsapi.service';

@Module({
  imports: [HttpModule],
  controllers: [NewsController],
  providers: [NewsService, NewsAggregatorService, NewsAPIService],
  exports: [NewsService],
})
export class NewsModule {}
