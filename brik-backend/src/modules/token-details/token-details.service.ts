import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CoingeckoService } from '../coingecko/coingecko.service';
import { TokenDetailsResponseDto } from './dto/token-details-response.dto';
import {
  getTokenBySymbol,
  getChainById,
} from '../../config/constants/tokens.constant';

@Injectable()
export class TokenDetailsService {
  private readonly logger = new Logger(TokenDetailsService.name);

  constructor(private readonly coingeckoService: CoingeckoService) {}

  async getTokenDetails(symbol: string): Promise<TokenDetailsResponseDto> {
    const symbolUpper = symbol.toUpperCase();

    this.logger.log(`Fetching token details for symbol: ${symbolUpper}`);

    const tokenConfig = getTokenBySymbol(symbolUpper);
    if (!tokenConfig) {
      this.logger.warn(`Token not found: ${symbolUpper}`);
      throw new NotFoundException({
        error: 'Token not found',
        message: `Token ${symbolUpper} is not supported`,
      });
    }

    const [details, marketDataArray] = await Promise.all([
      this.coingeckoService.getTokenDetails(tokenConfig.coingeckoId),
      this.coingeckoService.getMarketsData({
        vs_currency: 'usd',
        ids: tokenConfig.coingeckoId,
        price_change_percentage: '7d,30d',
        sparkline: false,
      }),
    ]);

    const marketData = marketDataArray[0];

    const chainsAvailable = Object.entries(tokenConfig.addresses).map(
      ([chainIdStr, address]) => {
        const chainId = parseInt(chainIdStr, 10);
        const chain = getChainById(chainId);
        return {
          chainId,
          chainName: chain?.name || 'Unknown',
          contractAddress: address,
        };
      },
    );

    const response: TokenDetailsResponseDto = {
      symbol: tokenConfig.symbol,
      name: tokenConfig.name,
      description:
        details.description?.en ||
        `${tokenConfig.name} is a Real World Asset token.`,
      image: details.image?.large || details.image?.small || '',
      marketData: {
        currentPrice: marketData?.currentPrice ?? 0,
        marketCap: marketData?.marketCap ?? 0,
        marketCapRank: marketData?.marketCapRank ?? 0,
        totalVolume: marketData?.totalVolume ?? 0,
        priceChange24h: marketData?.priceChange24h ?? 0,
        priceChangePercentage24h: marketData?.priceChangePercentage24h ?? 0,
        priceChangePercentage7d: marketData?.priceChangePercentage7d ?? 0,
        priceChangePercentage30d: marketData?.priceChangePercentage30d ?? 0,
        circulatingSupply: marketData?.circulatingSupply ?? 0,
        totalSupply: marketData?.totalSupply ?? 0,
        maxSupply: marketData?.maxSupply ?? null,
        ath: marketData?.ath ?? 0,
        athDate: marketData?.athDate ?? '',
        atl: marketData?.atl ?? 0,
        atlDate: marketData?.atlDate ?? '',
        lastUpdated: marketData?.lastUpdated ?? new Date().toISOString(),
      },
      links: {
        homepage: details.links?.homepage?.filter((h) => h) || [],
        blockchain_site: details.links?.blockchain_site?.filter((s) => s) || [],
        official_forum_url:
          details.links?.official_forum_url?.filter((f) => f) || [],
        twitter_screen_name: details.links?.twitter_screen_name || undefined,
        telegram_channel_identifier:
          details.links?.telegram_channel_identifier || undefined,
      },
      chainsAvailable,
      categories: details.categories || ['real-world-assets', 'rwa'],
    };

    this.logger.log(
      `Successfully fetched token details for ${symbolUpper}, price: ${response.marketData.currentPrice}`,
    );

    return response;
  }
}
