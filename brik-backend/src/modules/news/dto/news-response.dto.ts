export class NewsArticleDto {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  source: string;
  publishedAt: string;
  category: string[];
  relevanceScore?: number;
}

export class NewsResponseDto {
  articles: NewsArticleDto[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
