export class ChainInfoDto {
  chainId: number;
  chainName: string;
  contractAddress: string;
}

export class TokenMarketInfoDto {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
}

export class TokenInfoDto {
  symbol: string;
  name: string;
  decimals: number;
  coingeckoId: string;
  logoUri: string;
  chainsAvailable: ChainInfoDto[];
  marketData?: TokenMarketInfoDto;
}

export class TokensResponseDto {
  tokens: TokenInfoDto[];
  total: number;
  lastUpdated: string;
}
