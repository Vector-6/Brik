/**
 * LiFi Service
 *
 * Single Responsibility: Handle all HTTP communication with LI.FI Analytics API
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
  LiFiPaginatedResponse,
  LiFiTransfersParams,
} from './interfaces/lifi-response.interface';

@Injectable()
export class LifiService {
  private readonly logger = new Logger(LifiService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'lifi.baseUrl',
      'https://li.quest',
    );
    this.apiKey = this.configService.get<string>('lifi.apiKey', '');
    this.timeout = this.configService.get<number>('lifi.timeout', 30000);
  }

  /**
   * Get transfers from LI.FI Analytics API v2
   *
   * @param params Query parameters for transfers endpoint
   * @returns Paginated transfers response
   * @throws HttpException on API errors
   */
  async getTransfers(
    params: LiFiTransfersParams,
  ): Promise<LiFiPaginatedResponse> {
    try {
      this.logger.debug(
        `Fetching transfers with params: ${JSON.stringify(params)}`,
      );

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['x-lifi-api-key'] = this.apiKey;
      }

      const queryParams: Record<string, string | number> = {
        integrator: params.integrator,
      };

      if (params.wallet) queryParams.wallet = params.wallet;
      if (params.limit) queryParams.limit = params.limit;
      if (params.next) queryParams.next = params.next;
      if (params.previous) queryParams.previous = params.previous;
      if (params.status) queryParams.status = params.status;
      if (params.fromTimestamp)
        queryParams.fromTimestamp = params.fromTimestamp;
      if (params.toTimestamp) queryParams.toTimestamp = params.toTimestamp;
      if (params.fromChain) queryParams.fromChain = params.fromChain;
      if (params.toChain) queryParams.toChain = params.toChain;
      if (params.fromToken) queryParams.fromToken = params.fromToken;
      if (params.toToken) queryParams.toToken = params.toToken;

      const response = await firstValueFrom(
        this.httpService.get<LiFiPaginatedResponse>(
          `${this.baseUrl}/v2/analytics/transfers`,
          {
            params: queryParams,
            headers,
            timeout: this.timeout,
          },
        ),
      );

      this.logger.debug(
        `Successfully fetched ${response.data.data?.length || 0} transfers`,
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch transfers from LI.FI', error);

      if (error instanceof AxiosError) {
        const status = error.response?.status || HttpStatus.BAD_GATEWAY;
        const message =
          (error.response?.data as { message?: string })?.message ||
          error.message ||
          'Failed to fetch transfers from LI.FI';

        throw new HttpException(
          {
            error: 'LI.FI API Error',
            message: message,
          },
          status,
        );
      }

      throw new HttpException(
        {
          error: 'Internal Server Error',
          message: 'An unexpected error occurred while fetching transfers',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
