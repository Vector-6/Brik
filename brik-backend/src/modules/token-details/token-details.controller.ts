import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { TokenDetailsService } from './token-details.service';
import { TokenDetailsResponseDto } from './dto/token-details-response.dto';
import { TokenSymbolParam } from './dto/token-symbol.param';

@Controller('api')
@UseInterceptors(CacheInterceptor)
export class TokenDetailsController {
  private readonly logger = new Logger(TokenDetailsController.name);

  constructor(private readonly tokenDetailsService: TokenDetailsService) {}

  @Get('token/:symbol')
  @CacheTTL(900000)
  async getTokenDetails(
    @Param() params: TokenSymbolParam,
  ): Promise<TokenDetailsResponseDto> {
    this.logger.log(`GET /api/tokens/${params.symbol}`);
    return this.tokenDetailsService.getTokenDetails(params.symbol);
  }
}
