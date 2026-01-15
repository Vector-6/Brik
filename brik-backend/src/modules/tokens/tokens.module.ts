import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';
import { TokensCacheInterceptor } from './interceptors/tokens-cache.interceptor';
import { CoinHistoryCacheInterceptor } from './interceptors/coin-history-cache.interceptor';
import { CoingeckoModule } from '../coingecko/coingecko.module';
import { CloudinaryService } from './services/cloudinary.service';
import { Token, TokenSchema } from './schemas/token.schema';

@Module({
  imports: [
    CoingeckoModule,
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
  ],
  controllers: [TokensController],
  providers: [
    TokensService,
    CloudinaryService,
    TokensCacheInterceptor,
    CoinHistoryCacheInterceptor,
  ],
  exports: [TokensService],
})
export class TokensModule {}
