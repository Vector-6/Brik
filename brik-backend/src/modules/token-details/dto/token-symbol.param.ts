import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class TokenSymbolParam {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9]+$/, {
    message: 'Symbol must contain only alphanumeric characters',
  })
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  symbol: string;
}
