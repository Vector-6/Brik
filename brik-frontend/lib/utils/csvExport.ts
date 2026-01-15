/**
 * CSV Export Utilities
 * Functions for exporting transaction data to CSV format
 */

import { ParsedTransaction } from '@/lib/api/types/transaction.types';
import { formatAbsoluteTime } from './transaction';

// ============================================================================
// CSV Export Functions
// ============================================================================

/**
 * Convert transactions to CSV format
 */
export function transactionsToCsv(transactions: ParsedTransaction[]): string {
  // CSV Headers
  const headers = [
    'Transaction ID',
    'Timestamp',
    'Status',
    'From Token',
    'From Amount',
    'From Chain',
    'To Token',
    'To Amount',
    'To Chain',
    'USD Value',
    'Wallet Address',
    'Transaction Hash',
  ];

  // CSV Rows
  const rows = transactions.map((tx) => [
    tx.id,
    formatAbsoluteTime(tx.timestamp),
    tx.status,
    tx.fromToken,
    tx.fromAmount,
    tx.fromChainName,
    tx.toToken,
    tx.toAmount,
    tx.toChainName,
    tx.usdValue.toString(),
    tx.walletAddress,
    tx.txHash,
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCsv(csvContent: string, filename: string = 'transactions.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    // Create download link
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Export transactions to CSV file
 */
export function exportTransactionsToCSV(
  transactions: ParsedTransaction[],
  filename?: string
): void {
  if (transactions.length === 0) {
    throw new Error('No transactions to export');
  }

  const csvContent = transactionsToCsv(transactions);
  const defaultFilename = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCsv(csvContent, filename || defaultFilename);
}
