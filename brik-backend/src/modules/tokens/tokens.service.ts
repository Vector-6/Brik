import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoingeckoService } from '../coingecko/coingecko.service';
import { MarketDataDto } from '../coingecko/dto/market-data.dto';
import { TokensQueryDto } from './dto/tokens-query.dto';
import { TokenHistoryQueryDto } from './dto/token-history-query.dto';
import { TokenHistoryResponseDto } from './dto/token-history-response.dto';
import {
  normalizeCoinGeckoMarketChart,
  downsamplePoints,
  roundValue,
} from './helpers/history.helper';
import {
  TokensResponseDto,
  TokenInfoDto,
  ChainInfoDto,
  TokenMarketInfoDto,
} from './dto/tokens-response.dto';
import {
  ALL_RWA_TOKENS,
  ALL_CRYPTO_TOKENS,
  ALL_TOKENS,
  getChainById,
  getTokenBySymbol,
  CHAIN_BY_ID,
  TOKENS_BY_CHAIN,
} from '../../config/constants/tokens.constant';
import type { TokenConfig } from '../../config/interfaces/token.interface';
import { Token, TokenDocument } from './schemas/token.schema';
import { AddTokenDto, AddTokenResponseDto } from './dto/add-token.dto';
import {
  UpdateTokenDto,
  UpdateTokenResponseDto,
} from './dto/update-token.dto';
import { DeleteTokenResponseDto } from './dto/delete-token.dto';
import { CloudinaryService } from './services/cloudinary.service';
import {
  GetDbTokensQueryDto,
  GetDbTokensResponseDto,
  DbTokenDto,
} from './dto/get-db-tokens.dto';

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);

  constructor(
    private readonly coingeckoService: CoingeckoService,
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getCoinHistory(
    symbol: string,
    query: TokenHistoryQueryDto,
  ): Promise<TokenHistoryResponseDto> {
    const token = getTokenBySymbol(symbol.toUpperCase());
    if (!token) {
      throw new NotFoundException(`Token ${symbol} is not supported`);
    }

    const coingeckoId = token.coingeckoId;
    const currency = query.currency ?? 'usd';
    const days = query.days ?? '30';

    // Choose endpoint: market_chart or range
    let raw: {
      prices?: [number, number][];
      market_caps?: [number, number][];
      total_volumes?: [number, number][];
    };

    if (query.from && query.to) {
      const fromSec = Number(query.from);
      const toSec = Number(query.to);
      raw = await this.coingeckoService.getMarketChartRange(
        coingeckoId,
        currency,
        fromSec,
        toSec,
      );
    } else {
      raw = await this.coingeckoService.getMarketChart(
        coingeckoId,
        currency,
        days,
        query.interval,
      );
    }

    const normalized = normalizeCoinGeckoMarketChart(raw);

    // pick granularity
    let gran: '5m' | '1h' | '1d' = '1h';
    const daysNum = days === 'max' ? 9999 : Number(days);
    if (daysNum === 1) gran = '5m';
    else if (daysNum > 1 && daysNum <= 90) gran = '1h';
    else gran = '1d';

    const resPrices = downsamplePoints(normalized.prices, gran).map((p) => ({
      timestamp: p.timestamp,
      value: roundValue(
        p.value,
        query.precision === 'full' ? 'full' : token.decimals,
      ),
    }));

    const resMarketCaps = downsamplePoints(normalized.marketCaps, gran).map(
      (p) => ({ timestamp: p.timestamp, value: roundValue(p.value, 0) }),
    );

    const resTotalVolumes = downsamplePoints(normalized.totalVolumes, gran).map(
      (p) => ({ timestamp: p.timestamp, value: roundValue(p.value, 0) }),
    );

    return {
      symbol: token.symbol,
      name: token.name,
      currency,
      days,
      interval: query.interval || gran,
      prices: resPrices,
      marketCaps: resMarketCaps,
      totalVolumes: resTotalVolumes,
    } as TokenHistoryResponseDto;
  }

  async getTokensList(query: TokensQueryDto): Promise<TokensResponseDto> {
    this.logger.debug(
      `Getting tokens list with query: ${JSON.stringify(query)}`,
    );

    const chainId = query.chainId ? parseInt(query.chainId, 10) : undefined;
    const includeMarketData = query.includeMarketData === 'true';
    const symbolFilter = query.symbol?.toUpperCase();
    const typeFilter = query.type?.toLowerCase();

    this.validateQueryParameters(chainId, typeFilter, symbolFilter);

    let tokensToProcess = this.getTokensByType(typeFilter);

    if (symbolFilter) {
      tokensToProcess = this.filterBySymbol(tokensToProcess, symbolFilter);
    }

    if (chainId !== undefined) {
      tokensToProcess = this.filterByChain(tokensToProcess, chainId);
    }

    const marketDataMap = includeMarketData
      ? await this.fetchMarketData(tokensToProcess)
      : {};

    const tokens = this.transformTokens(
      tokensToProcess,
      chainId,
      marketDataMap,
      includeMarketData,
    );

    const sortedTokens = this.sortTokens(tokens, includeMarketData);

    this.logger.log(
      `Returning ${sortedTokens.length} tokens (includeMarketData: ${includeMarketData})`,
    );

    return {
      tokens: sortedTokens,
      total: sortedTokens.length,
      lastUpdated: new Date().toISOString(),
    };
  }

  private validateQueryParameters(
    chainId: number | undefined,
    typeFilter: string | undefined,
    symbolFilter: string | undefined,
  ): void {
    if (chainId !== undefined) {
      const chain = CHAIN_BY_ID[chainId];
      if (!chain) {
        const validChainIds = Object.keys(CHAIN_BY_ID).join(', ');
        throw new BadRequestException(
          `Chain ID ${chainId} is not supported. Supported chains: ${validChainIds}`,
        );
      }
    }

    if (typeFilter && typeFilter !== 'rwa' && typeFilter !== 'crypto') {
      throw new BadRequestException(
        `Type must be either 'rwa' or 'crypto'. Received: ${typeFilter}`,
      );
    }

    if (symbolFilter) {
      const token = getTokenBySymbol(symbolFilter);
      if (!token) {
        throw new NotFoundException(`Token ${symbolFilter} is not supported`);
      }
    }
  }

  private getTokensByType(typeFilter: string | undefined): TokenConfig[] {
    if (typeFilter === 'rwa') {
      return ALL_RWA_TOKENS;
    } else if (typeFilter === 'crypto') {
      return ALL_CRYPTO_TOKENS;
    }
    return ALL_TOKENS;
  }

  private filterBySymbol(
    tokens: TokenConfig[],
    symbolFilter: string,
  ): TokenConfig[] {
    return tokens.filter((token) => token.symbol === symbolFilter);
  }

  private filterByChain(tokens: TokenConfig[], chainId: number): TokenConfig[] {
    const tokensOnChain = TOKENS_BY_CHAIN[chainId] || [];
    const tokensOnChainSet = new Set(tokensOnChain);
    return tokens.filter((token) => tokensOnChainSet.has(token));
  }

  private async fetchMarketData(
    tokens: TokenConfig[],
  ): Promise<Record<string, MarketDataDto>> {
    if (tokens.length === 0) {
      return {};
    }

    try {
      const coingeckoIds = tokens
        .map((token) => token.coingeckoId)
        .filter((id) => id !== 'unknown');

      if (coingeckoIds.length === 0) {
        return {};
      }

      this.logger.debug(
        `Fetching market data for ${coingeckoIds.length} tokens`,
      );

      const marketData = await this.coingeckoService.getMarketsData({
        vs_currency: 'usd',
        ids: coingeckoIds.join(','),
        order: 'market_cap_desc',
        per_page: 250,
        sparkline: false,
      });

      const marketDataMap = marketData.reduce(
        (acc, data) => {
          acc[data.id] = data;
          return acc;
        },
        {} as Record<string, MarketDataDto>,
      );

      this.logger.debug(
        `Fetched market data for ${Object.keys(marketDataMap).length} tokens`,
      );

      return marketDataMap;
    } catch (error) {
      this.logger.error(
        `Failed to fetch market data: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {};
    }
  }

  private transformTokens(
    tokens: TokenConfig[],
    chainId: number | undefined,
    marketDataMap: Record<string, MarketDataDto>,
    includeMarketData: boolean,
  ): TokenInfoDto[] {
    return tokens.map((tokenConfig) => {
      const chainsAvailable = this.buildChainInfo(tokenConfig, chainId);
      const token: TokenInfoDto = {
        symbol: tokenConfig.symbol,
        name: tokenConfig.name,
        decimals: tokenConfig.decimals,
        coingeckoId: tokenConfig.coingeckoId,
        logoUri: tokenConfig.image,
        chainsAvailable,
      };

      if (includeMarketData && marketDataMap[tokenConfig.coingeckoId]) {
        token.marketData = this.buildMarketData(
          marketDataMap[tokenConfig.coingeckoId],
        );
      }

      return token;
    });
  }

  private buildChainInfo(
    tokenConfig: TokenConfig,
    chainId: number | undefined,
  ): ChainInfoDto[] {
    return Object.entries(tokenConfig.addresses)
      .filter(([chainIdStr]) => {
        if (chainId !== undefined) {
          return parseInt(chainIdStr, 10) === chainId;
        }
        return true;
      })
      .map(([chainIdStr, address]) => {
        const tokenChainId = parseInt(chainIdStr, 10);
        const chain = getChainById(tokenChainId);
        return {
          chainId: tokenChainId,
          chainName: chain?.name || 'Unknown',
          contractAddress: address,
        };
      });
  }

  private buildMarketData(data: MarketDataDto): TokenMarketInfoDto {
    return {
      price: data.currentPrice ?? 0,
      marketCap: data.marketCap ?? 0,
      volume24h: data.totalVolume ?? 0,
      priceChange24h: data.priceChange24h ?? 0,
      priceChangePercentage24h: data.priceChangePercentage24h ?? 0,
    };
  }

  /**
   * Add a new token to the database
   * This does not modify hardcoded tokens in tokens.constant.ts
   */
  async addToken(
    addTokenDto: AddTokenDto,
    imageFile: Express.Multer.File,
  ): Promise<AddTokenResponseDto> {
    this.logger.log(`Adding new token: ${addTokenDto.symbol}`);

    // Check if token with same symbol already exists in hardcoded tokens
    const hardcodedToken = getTokenBySymbol(addTokenDto.symbol.toUpperCase());
    if (hardcodedToken) {
      throw new ConflictException(
        `Token with symbol ${addTokenDto.symbol} already exists in the system`,
      );
    }

    // Check if token with same symbol exists in database
    const existingToken = await this.tokenModel
      .findOne({ symbol: addTokenDto.symbol.toUpperCase() })
      .exec();
    if (existingToken) {
      throw new ConflictException(
        `Token with symbol ${addTokenDto.symbol} already exists in database`,
      );
    }

    // Check if token with same coingeckoId exists
    const existingCoingeckoToken = await this.tokenModel
      .findOne({ coingeckoId: addTokenDto.coingeckoId })
      .exec();
    if (existingCoingeckoToken) {
      throw new ConflictException(
        `Token with CoinGecko ID ${addTokenDto.coingeckoId} already exists`,
      );
    }

    // Upload image to Cloudinary
    let imageUrl: string;
    try {
      imageUrl = await this.cloudinaryService.uploadImage(imageFile, 'tokens');
      this.logger.log(`Image uploaded successfully: ${imageUrl}`);
    } catch (error) {
      this.logger.error(
        `Failed to upload image: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException('Failed to upload token image');
    }

    // Convert addresses array to object
    const addressesObj: { [chainId: number]: string } = {};
    addTokenDto.addresses.forEach((addr) => {
      addressesObj[addr.chainId] = addr.address.toLowerCase();
    });

    // Create new token
    const newToken = new this.tokenModel({
      symbol: addTokenDto.symbol.toUpperCase(),
      name: addTokenDto.name,
      decimals: addTokenDto.decimals,
      coingeckoId: addTokenDto.coingeckoId,
      addresses: addressesObj,
      image: imageUrl,
      type: addTokenDto.type || 'custom',
      isActive: true,
    });

    try {
      const savedToken = await newToken.save();
      this.logger.log(
        `Token ${savedToken.symbol} added successfully with ID: ${savedToken._id}`,
      );

      return {
        symbol: savedToken.symbol,
        name: savedToken.name,
        decimals: savedToken.decimals,
        coingeckoId: savedToken.coingeckoId,
        addresses: savedToken.addresses,
        image: savedToken.image,
        type: savedToken.type,
        _id: savedToken._id.toString(),
        createdAt: (savedToken as any).createdAt.toISOString(),
        updatedAt: (savedToken as any).updatedAt.toISOString(),
      };
    } catch (error) {
      // If save fails, delete the uploaded image
      this.logger.error(
        `Failed to save token to database: ${error instanceof Error ? error.message : String(error)}`,
      );
      
      // Extract public_id from imageUrl to delete
      const publicIdMatch = imageUrl.match(/tokens\/([^.]+)/);
      if (publicIdMatch) {
        await this.cloudinaryService.deleteImage(`tokens/${publicIdMatch[1]}`);
      }

      throw new BadRequestException('Failed to save token to database');
    }
  }

  /**
   * Update an existing token in the database
   * Only database tokens can be updated, not hardcoded tokens
   */
  async updateToken(
    id: string,
    updateTokenDto: UpdateTokenDto,
    imageFile?: Express.Multer.File,
  ): Promise<UpdateTokenResponseDto> {
    this.logger.log(`Updating token with ID: ${id}`);

    // Find the token by ID
    const existingToken = await this.tokenModel.findById(id).exec();
    if (!existingToken) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }

    // If symbol is being updated, check for conflicts
    if (updateTokenDto.symbol && updateTokenDto.symbol !== existingToken.symbol) {
      // Check hardcoded tokens
      const hardcodedToken = getTokenBySymbol(updateTokenDto.symbol.toUpperCase());
      if (hardcodedToken) {
        throw new ConflictException(
          `Token with symbol ${updateTokenDto.symbol} already exists in the system`,
        );
      }

      // Check database tokens
      const duplicateSymbol = await this.tokenModel
        .findOne({ 
          symbol: updateTokenDto.symbol.toUpperCase(),
          _id: { $ne: id }
        })
        .exec();
      if (duplicateSymbol) {
        throw new ConflictException(
          `Token with symbol ${updateTokenDto.symbol} already exists in database`,
        );
      }
    }

    // If coingeckoId is being updated, check for conflicts
    if (updateTokenDto.coingeckoId && updateTokenDto.coingeckoId !== existingToken.coingeckoId) {
      const duplicateCoingecko = await this.tokenModel
        .findOne({ 
          coingeckoId: updateTokenDto.coingeckoId,
          _id: { $ne: id }
        })
        .exec();
      if (duplicateCoingecko) {
        throw new ConflictException(
          `Token with CoinGecko ID ${updateTokenDto.coingeckoId} already exists`,
        );
      }
    }

    // Handle image upload if provided
    let imageUrl = existingToken.image;
    if (imageFile) {
      try {
        // Upload new image
        const newImageUrl = await this.cloudinaryService.uploadImage(imageFile, 'tokens');
        this.logger.log(`New image uploaded successfully: ${newImageUrl}`);
        
        // Delete old image from Cloudinary
        const oldPublicIdMatch = existingToken.image.match(/tokens\/([^.]+)/);
        if (oldPublicIdMatch) {
          await this.cloudinaryService.deleteImage(`tokens/${oldPublicIdMatch[1]}`);
          this.logger.log(`Old image deleted: ${oldPublicIdMatch[1]}`);
        }
        
        imageUrl = newImageUrl;
      } catch (error) {
        this.logger.error(
          `Failed to upload new image: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw new BadRequestException('Failed to upload token image');
      }
    }

    // Convert addresses array to object if provided
    let addressesObj = existingToken.addresses;
    if (updateTokenDto.addresses) {
      addressesObj = {};
      updateTokenDto.addresses.forEach((addr) => {
        addressesObj[addr.chainId] = addr.address.toLowerCase();
      });
    }

    // Update token fields
    if (updateTokenDto.symbol) {
      existingToken.symbol = updateTokenDto.symbol.toUpperCase();
    }
    if (updateTokenDto.name) {
      existingToken.name = updateTokenDto.name;
    }
    if (updateTokenDto.decimals !== undefined) {
      existingToken.decimals = updateTokenDto.decimals;
    }
    if (updateTokenDto.coingeckoId) {
      existingToken.coingeckoId = updateTokenDto.coingeckoId;
    }
    if (updateTokenDto.type) {
      existingToken.type = updateTokenDto.type;
    }
    existingToken.addresses = addressesObj;
    existingToken.image = imageUrl;

    try {
      const updatedToken = await existingToken.save();
      this.logger.log(
        `Token ${updatedToken.symbol} updated successfully with ID: ${updatedToken._id}`,
      );

      return {
        symbol: updatedToken.symbol,
        name: updatedToken.name,
        decimals: updatedToken.decimals,
        coingeckoId: updatedToken.coingeckoId,
        addresses: updatedToken.addresses,
        image: updatedToken.image,
        type: updatedToken.type,
        _id: updatedToken._id.toString(),
        createdAt: (updatedToken as any).createdAt.toISOString(),
        updatedAt: (updatedToken as any).updatedAt.toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to update token in database: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException('Failed to update token in database');
    }
  }

  private sortTokens(
    tokens: TokenInfoDto[],
    includeMarketData: boolean,
  ): TokenInfoDto[] {
    if (includeMarketData) {
      return tokens.sort(
        (a, b) =>
          (b.marketData?.marketCap ?? 0) - (a.marketData?.marketCap ?? 0),
      );
    }
    return tokens.sort((a, b) => a.symbol.localeCompare(b.symbol));
  }

  /**
   * Get all database tokens from MongoDB
   */
  async getDbTokens(
    query: GetDbTokensQueryDto,
  ): Promise<GetDbTokensResponseDto> {
    this.logger.debug(
      `Getting database tokens with query: ${JSON.stringify(query)}`,
    );

    const { search, chainId, type, isActive } = query;

    // Build the query object
    const queryObject: any = {};
    if (search) {
      queryObject.$or = [
        { symbol: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }
    if (chainId) {
      queryObject[`addresses.${chainId}`] = { $exists: true };
    }
    if (type) {
      queryObject.type = type;
    }
    if (isActive !== undefined) {
      queryObject.isActive = isActive === 'true';
    }

    try {
      const tokens = await this.tokenModel.find(queryObject).exec();

      const result: DbTokenDto[] = tokens.map((token) => ({
        _id: token._id.toString(),
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        coingeckoId: token.coingeckoId,
        addresses: token.addresses,
        image: token.image,
        type: token.type,
        isActive: token.isActive,
        createdAt: (token as any).createdAt.toISOString(),
        updatedAt: (token as any).updatedAt.toISOString(),
      }));

      this.logger.log(`Returning ${result.length} database tokens`);

      return {
        tokens: result,
        total: result.length,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get database tokens: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException('Failed to get database tokens');
    }
  }

  /**
   * Delete a token from the database
   * Only database tokens can be deleted, not hardcoded tokens
   */
  async deleteToken(id: string): Promise<DeleteTokenResponseDto> {
    this.logger.log(`Deleting token with ID: ${id}`);

    const existingToken = await this.tokenModel.findById(id).exec();
    if (!existingToken) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }

    const tokenInfo = {
      id: existingToken._id.toString(),
      symbol: existingToken.symbol,
      name: existingToken.name,
    };

    try {
      // Delete image from Cloudinary if it exists
      if (existingToken.image) {
        const publicIdMatch = existingToken.image.match(/tokens\/([^.]+)/);
        if (publicIdMatch) {
          try {
            await this.cloudinaryService.deleteImage(`tokens/${publicIdMatch[1]}`);
            this.logger.log(`Deleted image from Cloudinary: ${publicIdMatch[1]}`);
          } catch (error) {
            this.logger.warn(`Failed to delete image: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }

      await this.tokenModel.findByIdAndDelete(id).exec();
      this.logger.log(`Token ${tokenInfo.symbol} deleted successfully`);

      return {
        success: true,
        message: `Token ${tokenInfo.symbol} deleted successfully`,
        deletedToken: tokenInfo,
      };
    } catch (error) {
      this.logger.error(`Failed to delete token: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Failed to delete token from database');
    }
  }
}
