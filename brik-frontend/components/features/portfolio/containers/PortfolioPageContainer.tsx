/**
 * Portfolio Page Container
 * Main orchestrator for the portfolio page
 * Handles data fetching, filtering, and component composition
 */

'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useAccount } from 'wagmi';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePortfolioFilters } from '../hooks/usePortfolioFilters';
import PortfolioHeader from '../presenters/PortfolioHeader';
import PortfolioMetricsGrid from '../presenters/PortfolioMetricsGrid';
import PortfolioEmptyState from '../presenters/PortfolioEmptyState';
import PortfolioChainFilter from '../presenters/PortfolioChainFilter';
import PortfolioHoldingsList from '../presenters/PortfolioHoldingsList';
import PortfolioExportButton from '../presenters/PortfolioExportButton';
import { PortfolioPageSkeleton } from '../skeletons/PortfolioSkeletons';
import { Wallet, AlertCircle } from 'lucide-react';
import { CustomConnectButton } from '@/components/features/auth/ConnectButton';

// ============================================================================
// Error Component
// ============================================================================

interface PortfolioErrorProps {
  error: { message?: string } | null;
  onRetry: () => void;
}

function PortfolioError({ error, onRetry }: PortfolioErrorProps) {
  return (
    <div className="flex flex-col mt-24 items-center justify-center min-h-[500px] px-4">
      <div className="glass rounded-full p-8 mb-6">
        <AlertCircle className="w-16 h-16 text-red-400" aria-hidden="true" />
      </div>

      <h2 className="text-3xl font-bold mb-4 text-center" style={{
        background: 'linear-gradient(90deg, #870BDD 0%, #FF0CE7 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Failed to Load Portfolio
      </h2>

      <p className="text-gray-400 max-w-md text-center mb-8">
        {error?.message || 'An error occurred while loading your portfolio. Please try again.'}
      </p>

      <button
        onClick={onRetry}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-purple-900/30 transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
      >
        Retry
      </button>
    </div>
  );
}

// ============================================================================
// Connect Wallet Prompt Component
// ============================================================================

function ConnectWalletPrompt() {
  return (
    <div className="flex flex-col mt-24 items-center justify-center min-h-[500px] px-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="relative glass rounded-full p-8">
          <Wallet className="w-16 h-16 text-purple-400" aria-hidden="true" />
        </div>
      </div>
      <CustomConnectButton />


      <p className="text-lg mt-8 text-gray-400 max-w-md text-center mb-8">
        Connect your wallet to view your RWA token portfolio and track your holdings across multiple chains.
      </p>


      <div className="mt-12 p-6 glass rounded-xl max-w-2xl">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Secure & Private
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          Your wallet connection is secure and private. We never ask for your private keys or seed phrase. Portfolio data is fetched directly from the blockchain.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Main Container Component
// ============================================================================

export default function PortfolioPageContainer() {
  // Get wallet connection state
  const {address,  isConnected } = useAccount();

  // Fetch portfolio data (auto-enabled when wallet connected)
  const { data: portfolio, isLoading, error, refetch } = usePortfolio({walletAddress: address});

  // Apply filters and sorting
  const {
    filteredBalances,
    chainStats,
    filters,
    toggleChain,
    clearFilters,
  } = usePortfolioFilters(portfolio?.balances || []);

  // ============================================================================
  // Render States
  // ============================================================================

  // Not connected
  if (!isConnected || !address) {
    return (
      <div className="min-h-screen mt-24 bg-gradient-to-br from-[#1c1c1c] via-[#1b1b1b] to-[#161616]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[rgba(97,7,224,0.12)] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[rgba(255,215,0,0.08)] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ConnectWalletPrompt />
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return <PortfolioPageSkeleton />;
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen mt-24 bg-gradient-to-br from-[#1c1c1c] via-[#1b1b1b] to-[#161616]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[rgba(97,7,224,0.12)] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[rgba(255,215,0,0.08)] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PortfolioError error={error} onRetry={refetch} />
        </div>
      </div>
    );
  }

  // Empty portfolio
  if (!portfolio || portfolio.balances.length === 0) {
    return (
      <div className="min-h-screen mt-24 bg-gradient-to-br from-[#1c1c1c] via-[#1b1b1b] to-[#161616]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[rgba(97,7,224,0.12)] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[rgba(255,215,0,0.08)] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PortfolioEmptyState />
        </div>
      </div>
    );
  }

  // ============================================================================
  // Success State - Portfolio with Holdings
  // ============================================================================

  return (
    <div className="min-h-screen mt-24 bg-gradient-to-br from-[#1c1c1c] via-[#1b1b1b] to-[#161616]">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[rgba(97,7,224,0.12)] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[rgba(255,215,0,0.08)] rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <main id="maincontent" className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors duration-200"
                >
                  <Home className="w-4 h-4" aria-hidden="true" />
                  <span>Home</span>
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </li>
              <li>
                <span className="text-white font-semibold" aria-current="page">
                  Portfolio
                </span>
              </li>
            </ol>
          </nav>

          {/* Portfolio Header with Total Value */}
          <PortfolioHeader portfolio={portfolio} />

          {/* Portfolio Performance Metrics Grid */}
          <PortfolioMetricsGrid performance={portfolio.performance} />

          {/* Filters & Export Section */}
          <div className="mb-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:w-auto">
              {chainStats.length > 0 && (
                <PortfolioChainFilter
                  chainStats={chainStats}
                  selectedChains={filters.selectedChains}
                  onToggleChain={toggleChain}
                  onClearFilters={clearFilters}
                />
              )}
            </div>

            {/* Export Button */}
            <div className="flex-shrink-0">
              <PortfolioExportButton
                balances={portfolio.balances}
                walletAddress={portfolio.walletAddress}
              />
            </div>
          </div>

          {/* Holdings List */}
          <section aria-labelledby="holdings-heading">
            <h2 id="holdings-heading" className="sr-only">
              Portfolio Holdings
            </h2>
            <PortfolioHoldingsList balances={filteredBalances} />
          </section>
        </div>
      </main>
    </div>
  );
}
