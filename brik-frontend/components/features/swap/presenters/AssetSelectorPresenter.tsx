"use client";

/**
 * AssetSelectorPresenter
 * Pure UI component for token dropdown selector with search
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Loader2 } from "lucide-react";
import { Token, hasMarketData } from "@/lib/types/token.types";
import { searchTokens } from "../utils/tokenFilters";
import { formatUsdValue, formatPercentage } from "../utils/swapCalculations";
import Image from "next/image";
import { Z_INDEX } from "@/lib/constants/zIndex";
import Portal from "@/components/ui/common/Portal";

// ============================================================================
// Props Interface
// ============================================================================

export interface AssetSelectorPresenterProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose?: () => void;
  label?: string;
  showSearch?: boolean;
  showMarketData?: boolean;
  disabled?: boolean;
  isLoadingTokens?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export default function AssetSelectorPresenter({
  tokens,
  selectedToken,
  onSelect,
  isOpen,
  onToggle,
  onClose,
  showSearch = true,
  showMarketData = true,
  disabled = false,
  isLoadingTokens = false,
}: AssetSelectorPresenterProps) {
  // ============================================================================
  // State
  // ============================================================================

  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // ============================================================================
  // Filtered Tokens
  // ============================================================================

  const filteredTokens = searchQuery
    ? searchTokens(tokens, searchQuery)
    : tokens;

  // ============================================================================
  // Position Calculation & Click Outside Handler
  // ============================================================================

  useEffect(() => {
    function updateDropdownPosition() {
      if (buttonRef.current && isOpen) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8, // mt-2 = 8px (fixed positioning, no scrollY needed)
          left: rect.right - 288, // w-72 = 288px, align right (fixed positioning, no scrollX needed)
          width: 288, // w-72
        });
      } else {
        setDropdownPosition(null);
      }
    }

    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);
    }

    return () => {
      window.removeEventListener("scroll", updateDropdownPosition, true);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSelect = (token: Token) => {
    onSelect(token);
    setSearchQuery(""); // Reset search on selection
    onClose?.();
  };

  const handleToggle = () => {
    if (!disabled && !isLoadingTokens) {
      onToggle();
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="relative shrink-0">
      {/* Selector Button */}
      <motion.button
        ref={buttonRef}
        whileHover={disabled || isLoadingTokens ? {} : { scale: 1.02 }}
        whileTap={disabled || isLoadingTokens ? {} : { scale: 0.98 }}
        onClick={handleToggle}
        disabled={disabled || isLoadingTokens}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[rgba(31,31,31,0.9)] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all ${
          disabled || isLoadingTokens ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {isLoadingTokens ? (
          <>
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />
            <span className="text-gray-400 text-xs">Loading...</span>
          </>
        ) : selectedToken ? (
          <>
            <div className="relative size-6 rounded-full overflow-hidden bg-[rgba(42,42,42,0.5)] flex-shrink-0 flex items-center justify-center">
              <Image
                src={selectedToken.logoUrl}
                alt={`${selectedToken.name} logo`}
                aria-hidden
                fill
                className="object-contain p-0.5"
                sizes="24px"
              />
            </div>
            <div className="flex flex-col items-start min-w-0">
              <span className="font-semibold text-white text-xs leading-tight">
                {selectedToken.symbol}
              </span>
              <span className="text-[10px] text-gray-400 leading-tight truncate max-w-[80px]">
                {selectedToken.currentChainName}
              </span>
            </div>
          </>
        ) : (
          <span className="text-gray-400 text-xs">Select</span>
        )}
        {!isLoadingTokens && (
          <ChevronDown
            className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        )}
      </motion.button>

      {/* Dropdown - Portaled to escape clipping contexts */}
      <AnimatePresence>
        {isOpen && dropdownPosition && !isLoadingTokens && (
          <Portal>
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed",
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
              }}
              className={`bg-[rgba(28,28,28,0.98)] rounded-lg border border-[#2a2a2a] shadow-[0_24px_40px_rgba(0,0,0,0.45)] ${Z_INDEX.DROPDOWN}`}
            >
              {/* Search Input */}
              {showSearch && (
                <div className="p-3 border-b border-[#2a2a2a]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tokens..."
                      className="w-full pl-10 pr-3 py-2 bg-[rgba(31,31,31,0.88)] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[rgba(97,7,224,0.45)]"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Token List */}
              <div className="max-h-64 overflow-y-auto">
                {filteredTokens.length > 0 ? (
                  filteredTokens.map((token) => (
                    <button
                      key={`${token.symbol}-${token.currentChainId}`}
                      onClick={() => handleSelect(token)}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[rgba(42,42,42,0.65)] transition-all ${
                        selectedToken?.symbol === token.symbol &&
                        selectedToken?.currentChainId === token.currentChainId
                          ? "bg-[rgba(97,7,224,0.2)]"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Token Icon */}
                        <div className="size-8 flex items-center justify-center flex-shrink-0">
                          <div className="relative size-8 rounded-full overflow-hidden bg-[rgba(42,42,42,0.5)] flex items-center justify-center">
                            <Image
                              src={token.logoUrl}
                              alt={`${token.name} logo`}
                              aria-hidden
                              fill
                              className="object-contain p-1"
                              sizes="32px"
                            />
                          </div>
                        </div>

                        {/* Token Info */}
                        <div className="text-left">
                          <div className="font-semibold text-white text-sm">
                            {token.symbol}
                          </div>
                          <div className="text-xs text-gray-400">
                            {token.name} • {token.currentChainName}
                          </div>
                        </div>
                      </div>

                      {/* Market Data */}
                      {showMarketData && hasMarketData(token) && (
                        <div className="text-right">
                          <div className="text-sm text-white">
                            {formatUsdValue(token.marketData.price)}
                          </div>
                          <div
                            className={`text-xs ${
                              token.marketData.priceChangePercentage24h >= 0
                                ? "text-[#6ee7b7]"
                                : "text-[#fda4af]"
                            }`}
                          >
                            {token.marketData.priceChangePercentage24h >= 0
                              ? "↑"
                              : "↓"}{" "}
                            {formatPercentage(
                              Math.abs(
                                token.marketData.priceChangePercentage24h
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    No tokens found
                  </div>
                )}
              </div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}
