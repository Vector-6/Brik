import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class WalletAddressParam {
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Invalid Ethereum wallet address format',
  })
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  walletAddress: string;
}
