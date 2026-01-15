/**
 * Wallet Transactions Response DTOs
 *
 * Single Responsibility: Define response structure for wallet-specific transactions
 * Uses the same simplified flat structure as general transactions
 */

import { TransactionDto, PaginationDto } from './transactions-response.dto';

export class SummaryDto {
  totalSent!: number;
  totalReceived!: number;
  totalGasPaid!: number;
  totalFeesPaid!: number;
}

export class WalletTransactionsResponseDto {
  walletAddress!: string;
  transactions!: TransactionDto[];
  pagination!: PaginationDto;
  count!: number;
  summary!: SummaryDto;
}

export { TransactionDto };
