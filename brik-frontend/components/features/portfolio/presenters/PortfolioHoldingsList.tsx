/**
 * Portfolio Holdings List Component
 * Displays grid of user's RWA token holdings with enhanced chart cards
 */

'use client';

import { motion } from 'framer-motion';
import { PortfolioBalance } from '@/lib/types/portfolio.types';
import HoldingCardWithChart from './HoldingCardWithChart';

// ============================================================================
// Props
// ============================================================================

interface PortfolioHoldingsListProps {
  balances: PortfolioBalance[];
}

// ============================================================================
// Props
// ============================================================================

interface PortfolioHoldingsListProps {
  balances: PortfolioBalance[];
}

// ============================================================================
// Main Component
// ============================================================================

export default function PortfolioHoldingsList({ balances }: PortfolioHoldingsListProps) {
  if (balances.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No holdings match your filters.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-gray-400">
          Showing <span className="font-semibold text-white">{balances.length}</span>{' '}
          {balances.length === 1 ? 'holding' : 'holdings'}
        </p>
      </div>

      {/* Holdings Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        role="list"
        aria-label="Portfolio holdings"
      >
        {balances.map((balance, index) => (
          <div key={`${balance.contractAddress}-${balance.chainId}`} role="listitem">
            <HoldingCardWithChart balance={balance} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
}
