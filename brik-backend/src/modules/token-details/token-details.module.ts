import { Module } from '@nestjs/common';
import { TokenDetailsController } from './token-details.controller';
import { TokenDetailsService } from './token-details.service';
import { CoingeckoModule } from '../coingecko/coingecko.module';

@Module({
  imports: [CoingeckoModule],
  controllers: [TokenDetailsController],
  providers: [TokenDetailsService],
  exports: [TokenDetailsService],
})
export class TokenDetailsModule {}
