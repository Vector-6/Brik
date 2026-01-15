export class MarketDataDto {
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  totalVolume: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  priceChangePercentage7d: number;
  priceChangePercentage30d: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  ath: number;
  athDate: string;
  atl: number;
  atlDate: string;
  lastUpdated: string;
}

export class TokenLinksDto {
  homepage: string[];
  blockchain_site: string[];
  official_forum_url: string[];
  twitter_screen_name?: string;
  telegram_channel_identifier?: string;
}

export class ChainAvailabilityDto {
  chainId: number;
  chainName: string;
  contractAddress: string;
}

export class TokenDetailsResponseDto {
  symbol: string;
  name: string;
  description: string;
  image: string;
  marketData: MarketDataDto;
  links: TokenLinksDto;
  chainsAvailable: ChainAvailabilityDto[];
  categories: string[];
}
