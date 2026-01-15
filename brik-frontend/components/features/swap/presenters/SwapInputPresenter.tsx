'use client';

/**
 * SwapInputPresenter
 * Pure UI component combining amount input and asset selector
 */

import { Token, hasMarketData } from '@/lib/types/token.types';
import { formatUsdValue } from '../utils/swapCalculations';
import AssetSelectorPresenter from './AssetSelectorPresenter';

// ============================================================================
// Props Interface
// ============================================================================

export interface SwapInputPresenterProps {
  label: string;
  amount: string;
  token: Token | null;
  availableTokens: Token[];
  isDropdownOpen: boolean;
  readOnly?: boolean;
  showBalance?: boolean;
  balance?: string;
  usdValue?: string; // USD value from quote (overrides calculated value)
  isLoadingTokens?: boolean;
  onAmountChange: (value: string) => void;
  onTokenSelect: (token: Token) => void;
  onToggleDropdown: () => void;
  onCloseDropdown: () => void;
}

// ============================================================================
// Component
// ============================================================================

export default function SwapInputPresenter({
  label,
  amount,
  token,
  availableTokens,
  isDropdownOpen,
  readOnly = false,
  showBalance = false,
  balance,
  usdValue: usdValueProp,
  isLoadingTokens = false,
  onAmountChange,
  onTokenSelect,
  onToggleDropdown,
  onCloseDropdown,
}: SwapInputPresenterProps) {
  // ============================================================================
  // Computed Values
  // ============================================================================

  // Use provided USD value from quote, or calculate from token market data
  const calculatedUsdValue =
    token && hasMarketData(token) && amount
      ? parseFloat(amount) * token.marketData.price
      : null;

  const usdValue = usdValueProp !== undefined ? parseFloat(usdValueProp) : calculatedUsdValue;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="relative bg-[rgba(31,31,31,0.88)] border border-[#2a2a2a] rounded-xl p-4 transition-all duration-300 hover:border-[#3a3a3a]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <label htmlFor={`swap-${label.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-gray-300 font-medium">
          {label}
        </label>
        {showBalance && balance && (
          <span className="text-xs text-gray-500 font-medium">
            Balance: {balance}
          </span>
        )}
      </div>

      {/* Input Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Amount Input */}
        <div className="flex-1 min-w-0">
          <input
            id={`swap-${label.toLowerCase().replace(/\s+/g, '-')}`}
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.0"
            readOnly={readOnly}
            aria-label={`${label} amount`}
            aria-describedby={usdValue ? `${label.toLowerCase().replace(/\s+/g, '-')}-usd-value` : undefined}
            className={`w-full text-2xl font-mono bg-transparent text-white focus:outline-none placeholder-gray-600 ${
              readOnly ? 'cursor-default' : ''
            }`}
          />
          {/* USD Value - Inline below amount */}
          {usdValue !== null && (
            <div id={`${label.toLowerCase().replace(/\s+/g, '-')}-usd-value`} className="mt-1 text-sm text-gray-400 font-medium" aria-live="polite">
              ≈ {formatUsdValue(usdValue)}
            </div>
          )}
        </div>

        {/* Asset Selector */}
        <AssetSelectorPresenter
          tokens={availableTokens}
          selectedToken={token}
          onSelect={onTokenSelect}
          isOpen={isDropdownOpen}
          onToggle={onToggleDropdown}
          onClose={onCloseDropdown}
          isLoadingTokens={isLoadingTokens}
          showSearch={availableTokens.length > 5}
          showMarketData={true}
        />
      </div>
    </div>
  );
}
