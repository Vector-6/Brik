/**
 * Market Data DTO
 *
 * Data Transfer Object for market data responses
 * Transforms CoinGecko API response into application-friendly format
 */

export class MarketDataDto {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number | null;
  marketCap: number | null;
  marketCapRank: number | null;
  fullyDilutedValuation: number | null;
  totalVolume: number | null;
  high24h: number | null;
  low24h: number | null;
  priceChange24h: number | null;
  priceChangePercentage24h: number | null;
  priceChangePercentage7d?: number | null;
  priceChangePercentage14d?: number | null;
  priceChangePercentage30d?: number | null;
  priceChangePercentage200d?: number | null;
  priceChangePercentage1y?: number | null;
  marketCapChange24h: number | null;
  marketCapChangePercentage24h: number | null;
  circulatingSupply: number | null;
  totalSupply: number | null;
  maxSupply: number | null;
  ath: number | null;
  athChangePercentage: number | null;
  athDate: string | null;
  atl: number | null;
  atlChangePercentage: number | null;
  atlDate: string | null;
  lastUpdated: string;
}
