/**
 * CoinGecko Service
 *
 * Single Responsibility: Handle all HTTP communication with CoinGecko API
 * This service is focused solely on API integration, no business logic.
 *
 * Follows Dependency Inversion Principle:
 * - Depends on HttpService abstraction (from @nestjs/axios)
 * - Depends on ConfigService abstraction
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  CoinGeckoMarketData,
  CoinGeckoMarketParams,
  CoinGeckoTokenDetails,
  CoinGeckoMarketChart,
} from './interfaces/coingecko-response.interface';
import { MarketDataDto } from './dto/market-data.dto';

@Injectable()
export class CoingeckoService {
  private readonly logger = new Logger(CoingeckoService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'coingecko.baseUrl',
      'https://api.coingecko.com/api/v3',
    );
    this.apiKey = this.configService.get<string>('coingecko.apiKey', '');
    this.timeout = this.configService.get<number>('coingecko.timeout', 30000);
  }

  /**
   * Get market data for multiple coins from CoinGecko
   *
   * @param params Query parameters for the CoinGecko API
   * @returns Array of market data DTOs
   * @throws HttpException on API errors
   */
  async getMarketsData(
    params: CoinGeckoMarketParams,
  ): Promise<MarketDataDto[]> {
    try {
      this.logger.debug(
        `Fetching market data with params: ${JSON.stringify(params)}`,
      );

      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['x-cg-demo-api-key'] = this.apiKey;
      }

      // Build query parameters for the API call
      const queryParams: Record<string, string | number | boolean> = {
        vs_currency: params.vs_currency,
      };

      if (params.ids) queryParams.ids = params.ids;
      if (params.category) queryParams.category = params.category;
      if (params.order) queryParams.order = params.order;
      if (params.per_page) queryParams.per_page = params.per_page;
      if (params.page) queryParams.page = params.page;
      if (params.sparkline !== undefined)
        queryParams.sparkline = params.sparkline;
      if (params.price_change_percentage)
        queryParams.price_change_percentage = params.price_change_percentage;
      if (params.locale) queryParams.locale = params.locale;
      if (params.precision !== undefined)
        queryParams.precision = params.precision;

      const response = await firstValueFrom(
        this.httpService.get<CoinGeckoMarketData[]>(
          `${this.baseUrl}/coins/markets`,
          {
            params: queryParams,
            headers,
            timeout: this.timeout,
          },
        ),
      );

      this.logger.debug(`Received ${response.data.length} market data entries`);

      // Transform CoinGecko response to application DTOs
      return response.data.map((item) => this.transformMarketData(item));
    } catch (error) {
      this.handleApiError(error);
      throw error; // TypeScript requires this for type safety
    }
  }

  /**
   * Transform CoinGecko API response to application DTO
   * Converts snake_case to camelCase
   *
   * @param data Raw CoinGecko market data
   * @returns Transformed MarketDataDto
   */
  private transformMarketData(data: CoinGeckoMarketData): MarketDataDto {
    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      image: data.image,
      currentPrice: data.current_price,
      marketCap: data.market_cap,
      marketCapRank: data.market_cap_rank,
      fullyDilutedValuation: data.fully_diluted_valuation,
      totalVolume: data.total_volume,
      high24h: data.high_24h,
      low24h: data.low_24h,
      priceChange24h: data.price_change_24h,
      priceChangePercentage24h: data.price_change_percentage_24h,
      priceChangePercentage7d: data.price_change_percentage_7d_in_currency,
      priceChangePercentage14d: data.price_change_percentage_14d_in_currency,
      priceChangePercentage30d: data.price_change_percentage_30d_in_currency,
      priceChangePercentage200d: data.price_change_percentage_200d_in_currency,
      priceChangePercentage1y: data.price_change_percentage_1y_in_currency,
      marketCapChange24h: data.market_cap_change_24h,
      marketCapChangePercentage24h: data.market_cap_change_percentage_24h,
      circulatingSupply: data.circulating_supply,
      totalSupply: data.total_supply,
      maxSupply: data.max_supply,
      ath: data.ath,
      athChangePercentage: data.ath_change_percentage,
      athDate: data.ath_date,
      atl: data.atl,
      atlChangePercentage: data.atl_change_percentage,
      atlDate: data.atl_date,
      lastUpdated: data.last_updated,
    };
  }

  /**
   * Handle API errors with proper logging and user-friendly messages
   *
   * @param error Error from axios or other sources
   * @throws HttpException with appropriate status code and message
   */
  private handleApiError(error: unknown): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status || HttpStatus.BAD_GATEWAY;
      const message =
        (error.response?.data as { message?: string })?.message ||
        error.message ||
        'CoinGecko API error';

      this.logger.error(`CoinGecko API Error: ${message}`, error.stack);
      this.logger.error(
        `Response data: ${JSON.stringify(error.response?.data)}`,
      );

      throw new HttpException(
        {
          statusCode: status,
          message: 'Failed to fetch market data from CoinGecko',
          error: String(message),
        },
        status,
      );
    }

    this.logger.error('Unexpected error in CoinGecko service', error);
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
        error: 'Internal server error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Get detailed information for a specific token from CoinGecko
   *
   * @param tokenId CoinGecko token ID (e.g., 'tether-gold')
   * @returns Detailed token information
   * @throws HttpException on API errors
   */
  async getTokenDetails(tokenId: string): Promise<CoinGeckoTokenDetails> {
    try {
      this.logger.debug(`Fetching token details for: ${tokenId}`);

      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['x-cg-demo-api-key'] = this.apiKey;
      }

      const response = await firstValueFrom(
        this.httpService.get<CoinGeckoTokenDetails>(
          `${this.baseUrl}/coins/${tokenId}`,
          {
            params: {
              localization: false,
              tickers: false,
              market_data: true,
              community_data: true,
              developer_data: false,
              sparkline: false,
            },
            headers,
            timeout: this.timeout,
          },
        ),
      );

      this.logger.debug(`Successfully fetched details for token: ${tokenId}`);

      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  /**
   * Get market chart (prices, market_caps, total_volumes) for a token over days
   */
  async getMarketChart(
    tokenId: string,
    vs_currency: string,
    days: string,
    interval?: string,
  ): Promise<CoinGeckoMarketChart> {
    try {
      this.logger.debug(
        `Fetching market_chart for ${tokenId} vs ${vs_currency} days=${days} interval=${interval}`,
      );

      const headers: Record<string, string> = {};
      if (this.apiKey) headers['x-cg-demo-api-key'] = this.apiKey;

      const params: Record<string, string | number | boolean> = {
        vs_currency,
        days,
      };

      if (interval) params.interval = interval;

      // Simple retry loop for transient errors
      const maxAttempts = 3;
      let attempt = 0;
      while (true) {
        attempt++;
        try {
          const response = await firstValueFrom(
            this.httpService.get<CoinGeckoMarketChart>(
              `${this.baseUrl}/coins/${tokenId}/market_chart`,
              {
                params,
                headers,
                timeout: this.timeout,
              },
            ),
          );
          return response.data;
        } catch (error) {
          if (attempt >= maxAttempts) {
            this.handleApiError(error);
          }
          // simple backoff
          const delayMs = 200 * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  /**
   * Get market chart range (from,to as unix seconds)
   */
  async getMarketChartRange(
    tokenId: string,
    vs_currency: string,
    from: number,
    to: number,
  ): Promise<CoinGeckoMarketChart> {
    try {
      this.logger.debug(
        `Fetching market_chart_range for ${tokenId} vs ${vs_currency} from=${from} to=${to}`,
      );

      const headers: Record<string, string> = {};
      if (this.apiKey) headers['x-cg-demo-api-key'] = this.apiKey;

      const params = {
        vs_currency,
        from,
        to,
      };

      const response = await firstValueFrom(
        this.httpService.get<CoinGeckoMarketChart>(
          `${this.baseUrl}/coins/${tokenId}/market_chart/range`,
          {
            params,
            headers,
            timeout: this.timeout,
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
}
