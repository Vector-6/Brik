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
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CoinHistoryCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const params = request.params || {};
    const query = request.query || {};

    const symbol = params.symbol || 'unknown';
    const days = (query.days as string) || '30';
    const currency = (query.currency as string) || 'usd';
    const interval = (query.interval as string) || 'auto';
    const precision = (query.precision as string) || 'full';

    const key = `history:${symbol.toLowerCase()}:${days}:${currency}:${interval}:${precision}`;

    const ttl = this.configService.get<number>('cache.ttl.coinHistory', 600000);

    const cached = await this.cacheManager.get(key);
    if (cached) return of(cached);

    return next.handle().pipe(
      tap((data) => {
        void this.cacheManager.set(key, data, ttl);
      }),
    );
  }
}
