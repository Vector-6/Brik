import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Body,
  UseInterceptors,
  Logger,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TokensService } from './tokens.service';
import { TokensQueryDto } from './dto/tokens-query.dto';
import { TokensResponseDto } from './dto/tokens-response.dto';
import { TokensCacheInterceptor } from './interceptors/tokens-cache.interceptor';
import { TokenHistoryQueryDto } from './dto/token-history-query.dto';
import { TokenHistoryResponseDto } from './dto/token-history-response.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import { CoinHistoryCacheInterceptor } from './interceptors/coin-history-cache.interceptor';
import { AddTokenDto, AddTokenResponseDto } from './dto/add-token.dto';
import {
  UpdateTokenDto,
  UpdateTokenResponseDto,
} from './dto/update-token.dto';
import {
  GetDbTokensQueryDto,
  GetDbTokensResponseDto,
} from './dto/get-db-tokens.dto';
import { DeleteTokenResponseDto } from './dto/delete-token.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api')
// Only cache the tokens list — don't cache other endpoints at the class-level
export class TokensController {
  private readonly logger = new Logger(TokensController.name);

  constructor(private readonly tokensService: TokensService) {}

  @Get('tokens')
  @UseInterceptors(TokensCacheInterceptor)
  async getTokensList(
    @Query() query: TokensQueryDto,
  ): Promise<TokensResponseDto> {
    const includeMarketData = query.includeMarketData === 'true';
    const cacheTTL = includeMarketData ? 120000 : 300000;

    this.logger.log(
      `GET /api/tokens - chainId: ${query.chainId || 'all'}, ` +
        `includeMarketData: ${includeMarketData}, ` +
        `symbol: ${query.symbol || 'all'}, ` +
        `type: ${query.type || 'all'}, ` +
        `cacheTTL: ${cacheTTL}ms`,
    );

    return this.tokensService.getTokensList(query);
  }

  @Post('tokens')
  @UseInterceptors(FileInterceptor('image'))
  async addToken(
    @Body() addTokenDto: AddTokenDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    image: Express.Multer.File,
  ): Promise<AddTokenResponseDto> {
    this.logger.log(
      `POST /api/tokens - Adding new token: ${addTokenDto.symbol}`,
    );

    return this.tokensService.addToken(addTokenDto, image);
  }

  @Put('tokens/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateToken(
    @Param('id') id: string,
    @Body() updateTokenDto: UpdateTokenDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ): Promise<UpdateTokenResponseDto> {
    this.logger.log(
      `PUT /api/tokens/${id} - Updating token with data: ${JSON.stringify(updateTokenDto)}`,
    );

    return this.tokensService.updateToken(id, updateTokenDto, image);
  }

  @Get('tokens/database/all')
  async getAllDbTokens(
    @Query() query: GetDbTokensQueryDto,
  ): Promise<GetDbTokensResponseDto> {
    this.logger.log(
      `GET /api/tokens/database/all - Fetching database tokens with filters: ${JSON.stringify(query)}`,
    );

    return this.tokensService.getDbTokens(query);
  }

  @Get('coin/:symbol/history')
  @UseInterceptors(CoinHistoryCacheInterceptor)
  @CacheTTL(600000)
  async getCoinHistory(
    @Param('symbol') symbol: string,
    @Query() query: TokenHistoryQueryDto,
  ): Promise<TokenHistoryResponseDto> {
    return this.tokensService.getCoinHistory(symbol, query);
  }

  @Delete('tokens/:id')
  @UseGuards(JwtAuthGuard)
  async deleteToken(@Param('id') id: string): Promise<DeleteTokenResponseDto> {
    this.logger.log(`DELETE /api/tokens/${id} - Deleting token`);
    return this.tokensService.deleteToken(id);
  }
}
