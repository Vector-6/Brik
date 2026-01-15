/**
 * Portfolio Export Button Component
 * Exports portfolio holdings to CSV file
 */

'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { PortfolioBalance } from '@/lib/types/portfolio.types';
import toast from 'react-hot-toast';

// ============================================================================
// Props
// ============================================================================

interface PortfolioExportButtonProps {
  balances: PortfolioBalance[];
  walletAddress: string;
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Convert portfolio balances to CSV format
 */
function portfolioToCsv(balances: PortfolioBalance[]): string {
  // CSV Headers
  const headers = [
    'Symbol',
    'Name',
    'Chain',
    'Balance',
    'Price (USD)',
    'Total Value (USD)',
    'Contract Address',
  ];

  // CSV Rows
  const rows = balances.map((balance): string[] => [
    balance.symbol,
    balance.name,
    balance.chainName,
    balance.balanceFormatted,
    balance.price.toFixed(2),
    balance.usdValue.toFixed(2),
    balance.contractAddress,
  ]);

  // Combine headers and rows (escape fields with commas/quotes)
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
function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
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

// ============================================================================
// Component
// ============================================================================

export default function PortfolioExportButton({
  balances,
  walletAddress,
}: PortfolioExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (balances.length === 0) {
      toast.error('No holdings to export');
      return;
    }

    setIsExporting(true);

    try {
      // Generate CSV content
      const csvContent = portfolioToCsv(balances);

      // Generate filename with date and wallet address (shortened)
      const date = new Date().toISOString().split('T')[0];
      const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
      const filename = `portfolio-${shortAddress}-${date}.csv`;

      // Trigger download
      downloadCsv(csvContent, filename);

      // Show success message
      toast.success(`Exported ${balances.length} holdings to CSV`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export portfolio. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || balances.length === 0}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6107e0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]
        ${
          balances.length === 0
            ? 'bg-[#2a2a2a] text-gray-500 cursor-not-allowed'
            : 'glass hover:bg-[rgba(44,44,44,0.9)] text-white hover:scale-105'
        }
      `}
      aria-label="Export portfolio to CSV"
    >
      <Download
        className={`w-5 h-5 ${isExporting ? 'animate-bounce' : ''}`}
        aria-hidden="true"
      />
      <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
    </button>
  );
}
