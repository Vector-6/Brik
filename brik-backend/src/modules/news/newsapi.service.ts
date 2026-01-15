import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { NewsArticleDto } from './dto/news-response.dto';

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

class TokenBucketRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number;

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  tryConsume(): boolean {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }

    return false;
  }

  getWaitTime(): number {
    this.refill();

    if (this.tokens >= 1) {
      return 0;
    }

    const tokensNeeded = 1 - this.tokens;
    return (tokensNeeded / this.refillRate) * 1000;
  }
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly halfOpenMaxAttempts: number = 1;
  private halfOpenAttempts: number = 0;

  constructor(failureThreshold: number = 5, resetTimeout: number = 60000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
  }

  canExecute(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure >= this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenAttempts = 0;
        return true;
      }
      return false;
    }

    return this.halfOpenAttempts < this.halfOpenMaxAttempts;
  }

  recordSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
    }
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.halfOpenAttempts = 0;
    } else if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

interface NewsAPIResponse {
  status: string;
  totalResults?: number;
  articles?: Array<{
    source: { id: string | null; name: string };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
  }>;
  code?: string;
  message?: string;
}

@Injectable()
export class NewsAPIService {
  private readonly logger = new Logger(NewsAPIService.name);
  private readonly rateLimiter: TokenBucketRateLimiter;
  private readonly circuitBreaker: CircuitBreaker;
  private readonly apiKey: string;
  private readonly baseURL = 'https://newsapi.org/v2';
  private readonly timeout = 30000;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  private readonly RWA_KEYWORDS = {
    high: [
      'real world assets',
      'rwa tokenization',
      'asset tokenization',
      'tokenized real estate',
      'tokenized gold',
    ],
    medium: [
      'security token',
      'stablecoin',
      'defi lending',
      'commodity token',
      'real estate token',
    ],
    low: ['rwa', 'tokenization', 'blockchain assets', 'digital assets'],
  };

  constructor(private readonly httpService: HttpService) {
    this.apiKey = process.env.NEWSAPI_KEY || '';
    this.rateLimiter = new TokenBucketRateLimiter(10, 0.001);
    this.circuitBreaker = new CircuitBreaker(5, 60000);

    if (!this.apiKey) {
      this.logger.warn('NewsAPI key is not configured');
    }
  }

  private buildRWAQuery(): string {
    const highPriorityTerms = this.RWA_KEYWORDS.high
      .map((term) => `"${term}"`)
      .join(' OR ');

    const mediumPriorityTerms = this.RWA_KEYWORDS.medium
      .map((term) => (term.includes(' ') ? `"${term}"` : term))
      .join(' OR ');

    return `(${highPriorityTerms}) OR (${mediumPriorityTerms})`;
  }

  private calculateRelevanceScore(title: string, description: string): number {
    if (!title && !description) return 0;

    const text = `${title} ${description}`.toLowerCase();
    let score = 0;

    this.RWA_KEYWORDS.high.forEach((keyword) => {
      if (text.includes(keyword.toLowerCase())) {
        if (title?.toLowerCase().includes(keyword.toLowerCase())) {
          score += 0.5;
        } else {
          score += 0.4;
        }
      }
    });

    this.RWA_KEYWORDS.medium.forEach((keyword) => {
      if (text.includes(keyword.toLowerCase())) {
        if (title?.toLowerCase().includes(keyword.toLowerCase())) {
          score += 0.3;
        } else {
          score += 0.25;
        }
      }
    });

    this.RWA_KEYWORDS.low.forEach((keyword) => {
      if (text.includes(keyword.toLowerCase())) {
        score += 0.1;
      }
    });

    return Math.min(1, score);
  }

  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    retries: number = this.maxRetries,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;

        if (error.response?.status === 401 || error.response?.status === 400) {
          throw error;
        }

        if (error.response?.status === 429) {
          this.logger.warn('NewsAPI rate limit hit, backing off');
          throw error;
        }

        if (attempt < retries) {
          const baseDelay = this.retryDelay * Math.pow(2, attempt);
          const jitter = Math.random() * 1000;
          const delay = baseDelay + jitter;

          this.logger.log(
            `NewsAPI request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  async fetchNews(
    page: number = 1,
    pageSize: number = 20,
    daysBack: number = 7,
  ): Promise<NewsArticleDto[]> {
    if (!this.circuitBreaker.canExecute()) {
      this.logger.warn(
        `NewsAPI circuit breaker is ${this.circuitBreaker.getState()}, request blocked`,
      );
      throw new Error('NewsAPI service is temporarily unavailable');
    }

    if (!this.rateLimiter.tryConsume()) {
      const waitTime = this.rateLimiter.getWaitTime();
      this.logger.warn(
        `NewsAPI rate limit reached, need to wait ${waitTime}ms`,
      );
      throw new Error(
        `Rate limit exceeded, try again in ${Math.ceil(waitTime / 1000)} seconds`,
      );
    }

    try {
      const response = await this.executeWithRetry<NewsAPIResponse>(
        async () => {
          const fromDate = new Date();
          fromDate.setDate(fromDate.getDate() - daysBack);

          const result = await firstValueFrom(
            this.httpService.get<NewsAPIResponse>(
              `${this.baseURL}/everything`,
              {
                params: {
                  q: this.buildRWAQuery(),
                  language: 'en',
                  sortBy: 'publishedAt',
                  pageSize: Math.min(pageSize, 100),
                  page,
                  from: fromDate.toISOString().split('T')[0],
                  searchIn: 'title,description',
                },
                headers: {
                  'X-Api-Key': this.apiKey,
                },
                timeout: this.timeout,
              },
            ),
          );

          return result.data;
        },
      );

      this.circuitBreaker.recordSuccess();

      if (response.status === 'error') {
        throw new Error(
          `NewsAPI error: ${response.message || 'Unknown error'}`,
        );
      }

      if (!response.articles || response.articles.length === 0) {
        return [];
      }

      const articles: NewsArticleDto[] = response.articles.map(
        (article, index) => {
          const relevanceScore = this.calculateRelevanceScore(
            article.title,
            article.description || '',
          );

          return {
            id: `newsapi-${article.url}-${index}`,
            title: article.title || '',
            description: article.description || article.content || '',
            url: article.url,
            imageUrl: article.urlToImage || '',
            source: article.source.name || 'Unknown',
            publishedAt: article.publishedAt,
            category: ['rwa', 'crypto'],
            relevanceScore,
          };
        },
      );

      const filteredArticles = articles.filter(
        (article) => (article.relevanceScore || 0) >= 0.1,
      );

      return filteredArticles;
    } catch (error) {
      this.circuitBreaker.recordFailure();
      this.logger.error('NewsAPI fetch error:', error);
      throw error;
    }
  }

  getCircuitBreakerState(): CircuitState {
    return this.circuitBreaker.getState();
  }

  isHealthy(): boolean {
    return (
      this.circuitBreaker.getState() !== CircuitState.OPEN && this.apiKey !== ''
    );
  }
}
