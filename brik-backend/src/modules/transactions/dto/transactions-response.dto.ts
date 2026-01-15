/**
 * Transactions Response DTOs
 *
 * Single Responsibility: Define response structure for transactions endpoints
 * Simplified flat structure to match frontend expectations
 */

export class TransactionDto {
  id!: string;
  walletAddress!: string;
  fromChain!: number;
  toChain!: number;
  fromToken!: string;
  toToken!: string;
  fromAmount!: string;
  toAmount!: string;
  txHash!: string;
  status!: 'completed' | 'pending' | 'failed';
  timestamp!: string; // ISO 8601 format
  usdValue!: number;
}

export class PaginationDto {
  next!: string | null;
  previous!: string | null;
  hasMore!: boolean;
}

export class TransactionsResponseDto {
  transactions!: TransactionDto[];
  pagination!: PaginationDto;
  count!: number;
}
