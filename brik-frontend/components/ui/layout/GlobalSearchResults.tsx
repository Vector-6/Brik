/**
 * GlobalSearchResults Component
 * Dropdown panel showing search results
 */

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { SearchResult } from '@/lib/types/search.types';
import { TrendingUp, TrendingDown, ExternalLink, Wallet } from 'lucide-react';

interface Props {
  results: SearchResult[];
  isLoading: boolean;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  onClose: () => void;
}

// ============================================================================
// Component
// ============================================================================

export default function GlobalSearchResults({
  results,
  isLoading,
  selectedIndex,
  setSelectedIndex,
  onClose,
}: Props) {
  if (isLoading) {
    return (
      <motion.div
        id="search-results"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full mt-2 left-0 right-0 bg-[rgba(28,28,28,0.98)] backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl p-4 z-50"
      >
        <p className="text-sm text-gray-400 text-center">Searching...</p>
      </motion.div>
    );
  }

  if (results.length === 0) {
    return (
      <motion.div
        id="search-results"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full mt-2 left-0 right-0 bg-[rgba(28,28,28,0.98)] backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl p-4 z-50"
      >
        <p className="text-sm text-gray-400 text-center">No results found</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      id="search-results"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full mt-2 left-0 right-0 bg-[rgba(28,28,28,0.98)] backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
    >
      <div className="divide-y divide-white/5">
        {results.map((result, index) => (
          <SearchResultItem
            key={result.id}
            result={result}
            isSelected={index === selectedIndex}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={onClose}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================================
// SearchResultItem Component
// ============================================================================

interface ItemProps {
  result: SearchResult;
  isSelected: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}

function SearchResultItem({ result, isSelected, onMouseEnter, onClick }: ItemProps) {
  const baseClasses = `flex items-center gap-3 px-4 py-3 transition-colors ${
    isSelected ? 'bg-purple-500/20' : 'hover:bg-white/5'
  }`;

  if (result.type === 'token') {
    const { token } = result;
    const isPositive = token.priceChangePercentage24h >= 0;

    return (
      <Link
        href={`/asset/${token.symbol.toLowerCase()}`}
        className={baseClasses}
        onMouseEnter={onMouseEnter}
        onClick={onClick}
      >
        <Image
          src={token.image}
          alt={token.name}
          width={32}
          height={32}
          className="rounded-full"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{token.symbol}</span>
            <span className="text-xs text-gray-400 truncate">{token.name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-300">${token.price.toFixed(2)}</span>
            <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
              {isPositive ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
              {' '}{isPositive ? '+' : ''}{token.priceChangePercentage24h.toFixed(2)}%
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (result.type === 'page') {
    return (
      <Link
        href={result.href}
        className={baseClasses}
        onMouseEnter={onMouseEnter}
        onClick={onClick}
      >
        <ExternalLink className="w-5 h-5 text-purple-400" />
        <div className="flex-1">
          <div className="text-sm font-medium text-white">{result.title}</div>
          <div className="text-xs text-gray-400">{result.subtitle}</div>
        </div>
      </Link>
    );
  }

  // Wallet result
  return (
    <a
      href={`https://etherscan.io/address/${result.address}`}
      target="_blank"
      rel="noopener noreferrer"
      className={baseClasses}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <Wallet className="w-5 h-5 text-yellow-400" />
      <div className="flex-1">
        <div className="text-sm font-medium text-white">{result.title}</div>
        <div className="text-xs text-gray-400 truncate">{result.subtitle}</div>
      </div>
    </a>
  );
}
