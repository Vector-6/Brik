/**
 * Wallet Address Path Parameter DTO
 *
 * Single Responsibility: Validate wallet address path parameter
 */

import { IsEthereumAddress } from 'class-validator';

export class WalletAddressParamDto {
  @IsEthereumAddress()
  walletAddress!: string;
}
