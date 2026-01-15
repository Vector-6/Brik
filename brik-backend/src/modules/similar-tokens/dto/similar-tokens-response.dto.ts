/**
 * Similar Tokens Response DTOs
 *
 * Single Responsibility: Define response structure for similar tokens endpoint
 * - Matches original API response structure exactly for client compatibility
 */

export class ChainAvailabilityDto {
  chainId: number;
  chainName: string;
  contractAddress: string;
}

export class SimilarTokenMarketDataDto {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
}

export class SimilarTokenDto {
  symbol: string;
  name: string;
  image: string;
  coingeckoId: string;
  sharedCategories: string[];
  similarityScore: number;
  chainsAvailable: ChainAvailabilityDto[];
  marketData?: SimilarTokenMarketDataDto;
}

export class RequestedTokenInfoDto {
  symbol: string;
  name: string;
  categories: string[];
}

export class SimilarTokensResponseDto {
  requestedToken: RequestedTokenInfoDto;
  similarTokens: SimilarTokenDto[];
  total: number;
  lastUpdated: string;
}
