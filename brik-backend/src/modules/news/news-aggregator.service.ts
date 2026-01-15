import { Injectable, Logger } from '@nestjs/common';
import { NewsAPIService } from './newsapi.service';
import { NewsArticleDto } from './dto/news-response.dto';

@Injectable()
export class NewsAggregatorService {
  private readonly logger = new Logger(NewsAggregatorService.name);

  constructor(private readonly newsAPIService: NewsAPIService) {}

  private getMockRWANews(): NewsArticleDto[] {
    const now = new Date();
    return [
      {
        id: 'mock-1',
        title: 'The Rise of Real World Asset Tokenization in DeFi',
        description:
          'Exploring how traditional assets are being brought on-chain through tokenization, creating new opportunities for investors.',
        url: 'https://example.com/rwa-defi',
        imageUrl: 'https://via.placeholder.com/600x400?text=RWA+Tokenization',
        source: 'Crypto Insights',
        publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        category: ['rwa', 'defi'],
        relevanceScore: 0.95,
      },
      {
        id: 'mock-2',
        title: 'Tokenized Gold Sees Increased Adoption Among Investors',
        description:
          'PAXG and XAUT continue to gain traction as investors seek stable alternatives in volatile markets.',
        url: 'https://example.com/tokenized-gold',
        imageUrl: 'https://via.placeholder.com/600x400?text=Gold+Tokens',
        source: 'Financial Times Crypto',
        publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        category: ['rwa', 'gold'],
        relevanceScore: 0.92,
      },
      {
        id: 'mock-3',
        title: 'Real Estate Tokenization Platform Raises $50M',
        description:
          'A new platform enabling fractional real estate ownership through blockchain technology secures major funding.',
        url: 'https://example.com/real-estate-token',
        imageUrl: 'https://via.placeholder.com/600x400?text=Real+Estate',
        source: 'BlockWorks',
        publishedAt: new Date(
          now.getTime() - 12 * 60 * 60 * 1000,
        ).toISOString(),
        category: ['rwa', 'real-estate'],
        relevanceScore: 0.88,
      },
      {
        id: 'mock-4',
        title: 'Centrifuge Partners with Major Banks for Asset Tokenization',
        description:
          'The DeFi protocol announces strategic partnerships to bring traditional finance assets on-chain.',
        url: 'https://example.com/centrifuge-banks',
        imageUrl: 'https://via.placeholder.com/600x400?text=Centrifuge',
        source: 'DeFi Daily',
        publishedAt: new Date(
          now.getTime() - 24 * 60 * 60 * 1000,
        ).toISOString(),
        category: ['rwa', 'defi'],
        relevanceScore: 0.85,
      },
    ];
  }

  private deduplicateArticles(articles: NewsArticleDto[]): NewsArticleDto[] {
    const seen = new Set<string>();
    return articles.filter((article) => {
      if (seen.has(article.url)) {
        return false;
      }
      seen.add(article.url);
      return true;
    });
  }

  async aggregateNews(
    page: number = 1,
    pageSize: number = 20,
  ): Promise<NewsArticleDto[]> {
    const startTime = Date.now();

    try {
      this.logger.log(
        `📰 Aggregating news: page=${page}, pageSize=${pageSize}`,
      );

      const newsApiArticles = await this.newsAPIService
        .fetchNews(page, pageSize, 7)
        .catch((err) => {
          this.logger.error('NewsAPI fetch failed:', err.message);
          return [];
        });

      let allArticles = [...newsApiArticles];

      this.logger.log(`📊 Fetched articles: NewsAPI=${newsApiArticles.length}`);

      if (allArticles.length === 0) {
        this.logger.log('⚠️  No articles from APIs, using mock RWA news data');
        allArticles = this.getMockRWANews();
      }

      const uniqueArticles = this.deduplicateArticles(allArticles);
      this.logger.log(
        `🔄 Deduplicated: ${allArticles.length} -> ${uniqueArticles.length} articles`,
      );

      const sortedArticles = uniqueArticles.sort((a, b) => {
        const scoreDiff = (b.relevanceScore || 0) - (a.relevanceScore || 0);
        if (Math.abs(scoreDiff) > 0.1) return scoreDiff;

        return (
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      });

      const result = sortedArticles.slice(0, pageSize);

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ News aggregation completed: ${result.length} articles in ${duration}ms`,
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `❌ News aggregation failed after ${duration}ms:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      return this.getMockRWANews();
    }
  }
}
