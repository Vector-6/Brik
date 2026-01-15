import { DataPointDto } from './data-point.dto';

export class TokenHistoryResponseDto {
  symbol: string;
  name?: string;
  currency: string;
  days: string;
  interval: string;
  prices: DataPointDto[];
  marketCaps: DataPointDto[];
  totalVolumes: DataPointDto[];
}
