/**
 * Explore Response DTO
 *
 * Response format for the /api/explore endpoint
 * Matches the specification from the original backend
 */

export class TokenMarketDataDto {
  symbol: string;
  name: string;
  image: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  chainsAvailable: string[];
  description: string;
  category: string[];
}

export class ExploreResponseDto {
  tokens: TokenMarketDataDto[];
  lastUpdated: string;
}
