'use client';

/**
 * RecentTransactions Component
 * Displays recent transaction history with filtering, analytics, and export features
 */

import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useTransactionsInfinite } from './hooks/useTransactionsInfinite';
import { useTransactionFilters } from './hooks/useTransactionFilters';
import { useWallet } from '../swap/hooks/useWallet';
import { useTokens } from '../swap/hooks/useTokens';
import TransactionListPresenter from './presenters/TransactionListPresenter';
import TransactionFiltersPresenter from './presenters/TransactionFiltersPresenter';
import TransactionDetailsModal from './presenters/TransactionDetailsModal';
import { ParsedTransaction } from '@/lib/api/types/transaction.types';
import { exportTransactionsToCSV } from '@/lib/utils/csvExport';
import toast from 'react-hot-toast';
import { Z_INDEX } from '@/lib/constants/zIndex';

/**
 * Recent Transactions container component
 * Displays transactions with advanced filtering, analytics, and export capabilities
 */
export default function RecentTransactions() {
  // Wallet state
  const { wallet } = useWallet();

  // Fetch tokens to get decimals information
  const { tokens } = useTokens({ includeMarketData: false });

  // Create a map of token symbol to decimals for quick lookup
  const tokenDecimalsMap = useMemo(() => {
    const map = new Map<string, number>();
    tokens.forEach(token => {
      map.set(token.symbol, token.decimals);
    });
    return map;
  }, [tokens]);

  // Filter state
  const {
    filters,
    viewMode,
    setStatus,
    setChainId,
    setToken,
    setDateRange,
    setSearch,
    setViewMode,
    clearFilters,
    activeFilterCount,
  } = useTransactionFilters();

  // Modal states
  const [selectedTransaction, setSelectedTransaction] = useState<ParsedTransaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Determine wallet address based on view mode
  const walletAddress =
    wallet.isConnected && viewMode === 'user' ? wallet.address : undefined;

  // Fetch transactions with infinite scroll
  const {
    transactions,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    resetToFirstPage,
  } = useTransactionsInfinite({
    walletAddress,
    filters,
    limit: 5, // Show only 5 transactions at a time
    enabled: true,
  });

  // Handle transaction click - open details modal
  const handleTransactionClick = (transaction: ParsedTransaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  // Handle show less - reset to first page only
  const handleShowLess = () => {
    resetToFirstPage();
  };

  // Handle CSV export
  const handleExportCSV = () => {
    try {
      if (transactions.length === 0) {
        toast.error('No transactions to export');
        return;
      }

      exportTransactionsToCSV(transactions);
      toast.success(`Exported ${transactions.length} transactions to CSV`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export transactions');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`w-full ${Z_INDEX.BASE}`}
      >
        <section className="bg-[#1f1f1f] backdrop-blur-xl border border-[#2a2a2a] rounded-2xl p-8 shadow-[0_24px_40px_rgba(0,0,0,0.35)]" aria-labelledby="recent-transactions-heading">
          {/* Header */}
          <header className="flex items-center justify-between mb-6 pb-6 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-3">
              <h2 id="recent-transactions-heading" className="text-xl font-bold text-white">Recent Swaps</h2>
              {wallet.isConnected && viewMode === 'user' && (
                <span className="text-xs px-3 py-1 rounded-full bg-[rgba(97,7,224,0.2)] text-[#d6c1ff] border border-[rgba(97,7,224,0.45)] font-medium">
                  My Swaps
                </span>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => refetch()}
              disabled={isRefetching || isLoading}
              className="p-2.5 rounded-lg hover:bg-[rgba(44,44,44,0.8)] text-gray-400 hover:text-[#ffd700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[rgba(97,7,224,0.45)] focus:ring-offset-2 focus:ring-offset-[#0f0f0f]"
              aria-label="Refresh transaction list"
              title="Refresh transactions"
            >
              <RefreshCw
                className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
            </button>
          </header>

          {/* Filters */}
          <div className="mb-4">
            <TransactionFiltersPresenter
              filters={filters}
              viewMode={viewMode}
              isWalletConnected={wallet.isConnected}
              onStatusChange={setStatus}
              onChainChange={setChainId}
              onTokenChange={setToken}
              onDateRangeChange={setDateRange}
              onSearchChange={setSearch}
              onViewModeChange={setViewMode}
              onClearFilters={clearFilters}
              onExportCSV={handleExportCSV}
              activeFilterCount={activeFilterCount}
            />
          </div>

          {/* Transactions List */}
          <TransactionListPresenter
            transactions={transactions}
            isLoading={isLoading}
            isError={isError}
            error={error ? { error: 'Error', message: String(error) } : null}
            hasMore={hasNextPage ?? false}
            isRefreshing={isRefetching}
            onLoadMore={() => fetchNextPage()}
            onRefresh={() => refetch()}
            onShowLess={handleShowLess}
            isLoadingMore={isFetchingNextPage}
            onTransactionClick={handleTransactionClick}
            isWalletConnected={wallet.isConnected && viewMode === 'user'}
            initialPageSize={5}
            tokenDecimalsMap={tokenDecimalsMap}
          />
        </section>
      </motion.div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedTransaction(null);
        }}
        tokenDecimalsMap={tokenDecimalsMap}
      />
    </>
  );
}
