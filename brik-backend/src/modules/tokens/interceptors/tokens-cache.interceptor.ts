import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class TokensCacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const includeMarketData =
      (request.query.includeMarketData as string) === 'true';

    const cacheKey = this.generateCacheKey(request.query);
    const ttl = includeMarketData ? 120000 : 300000;

    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      return of(cachedData);
    }

    return next.handle().pipe(
      tap((data) => {
        void this.cacheManager.set(cacheKey, data, ttl);
      }),
    );
  }

  private generateCacheKey(query: Record<string, any>): string {
    const chainId = (query.chainId as string) || 'all';
    const includeMarketData = (query.includeMarketData as string) === 'true';
    const symbol = (query.symbol as string) || 'all';
    const type = (query.type as string) || 'all';
    return `tokens:${chainId}:${includeMarketData}:${symbol}:${type}`;
  }
}
