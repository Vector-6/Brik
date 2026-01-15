/**
 * API Type Definitions
 * Matches the /api/tokens endpoint response structure
 */

// ============================================================================
// Token API Types
// ============================================================================

export interface TokensResponse {
  tokens: SupportedToken[];
  total: number;
  lastUpdated: string;
}

export interface SupportedToken {
  symbol: string;
  name: string;
  decimals: number;
  logoUri:string
  coingeckoId: string;
  chainsAvailable: ChainAvailability[];
  marketData?: TokenMarketData;
}

export interface ChainAvailability {
  chainId: number;
  chainName: string;
  contractAddress: string;
}

export interface TokenMarketData {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
}

// ============================================================================
// Request Query Parameters
// ============================================================================

export interface TokensQueryParams {
  chainId?: string;
  includeMarketData?: boolean; // Will be converted to string "true"/"false" in API call
  symbol?: string;
}

// ============================================================================
// Error Response Types
// ============================================================================

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: Array<{
    path: string;
    message: string;
  }>;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    'message' in error
  );
}

// ============================================================================
// Mail API Types (exported from mail.types.ts for convenience)
// ============================================================================

export type {
  NewsletterDto,
  ContactUsDto,
  RwaListingSuggestionDto,
  RwaCategory,
  MailSuccessResponse,
  MailErrorResponse,
  FormSubmissionStatus,
  NewsletterFormState,
  ContactFormState,
  RwaFormState,
  NewsletterApiResponse,
  ContactUsApiResponse,
  RwaListingSuggestionApiResponse
} from './mail.types';

export {
  isMailErrorResponse,
  isMailSuccessResponse,
  isValidRwaCategory
} from './mail.types';
