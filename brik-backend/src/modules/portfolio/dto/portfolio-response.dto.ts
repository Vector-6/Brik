export class TokenBalanceDto {
  symbol: string;
  name: string;
  balance: string;
  balanceFormatted: string;
  decimals: number;
  chainId: number;
  chainName: string;
  contractAddress: string;
  usdValue: number;
  price: number;
  image: string;
}

export class PerformanceDto {
  change24h: number;
  change24hPercent: number;
  change7d: number;
  change7dPercent: number;
  change30d: number;
  change30dPercent: number;
}

export class PortfolioResponseDto {
  walletAddress: string;
  totalValueUSD: number;
  balances: TokenBalanceDto[];
  performance: PerformanceDto;
  lastUpdated: string;
}
