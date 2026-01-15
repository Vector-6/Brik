/**
 * DTOs for points ledger
 */

export class PointsLedgerEntryDto {
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export class PointsLedgerResponseDto {
  entries: PointsLedgerEntryDto[];
  total: number;
  currentBalance: number;
}
