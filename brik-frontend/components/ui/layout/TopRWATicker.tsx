/**
 * TopRWATicker Component
 * Horizontal scrolling ticker showing top RWAs by volume
 */

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTopRWAs } from '@/lib/hooks/useTopRWAs';

// ============================================================================
// Component
// ============================================================================

interface TopRWATickerProps {
  onTickerClick?: () => void;
}

export default function TopRWATicker({ onTickerClick }: TopRWATickerProps) {
  const { items, isLoading } = useTopRWAs(8);

  // Always render the ticker container, show loading or empty state if needed
  return (
    <div className="bg-gradient-to-r from-purple-600/20 via-purple-500/20 to-pink-500/20 border-t border-white/10">
      <div className="overflow-hidden py-2 md:py-2.5">
        {isLoading || items.length === 0 ? (
          // Loading or empty state - show placeholder items
          <div className="flex gap-4 md:gap-6 px-4 animate-pulse">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`loading-${index}`}
                className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 bg-white/5 rounded-full whitespace-nowrap"
              >
                <div className="w-4 h-4 md:w-5 md:h-5 bg-white/10 rounded-full" />
                <div className="h-3 w-12 bg-white/10 rounded" />
                <div className="h-3 w-16 bg-white/10 rounded" />
                <div className="h-3 w-10 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="flex gap-4 md:gap-6 px-4"
            animate={{
              x: [0, -1000],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 30,
                ease: 'linear',
              },
            }}
            whileHover={{ animationPlayState: 'paused' }}
          >
            {[...items, ...items, ...items].map((tickerItem, index) => (
              <TickerItem key={`${tickerItem.symbol}-${index}`} item={tickerItem} onClick={onTickerClick} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TickerItem Component
// ============================================================================

interface TickerItemProps {
  item: {
    symbol: string;
    name: string;
    price: number;
    priceChangePercentage24h: number;
    image: string;
  };
  onClick?: () => void;
}

function TickerItem({ item, onClick }: TickerItemProps) {
  const isPositive = item.priceChangePercentage24h >= 0;

  return (
    <Link
      href={`/asset/${item.symbol.toLowerCase()}`}
      onClick={onClick}
      className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 bg-white/5 backdrop-blur-sm rounded-full hover:bg-white/10 transition-colors whitespace-nowrap group"
    >
      <Image
        src={item.image}
        alt={item.name}
        width={16}
        height={16}
        className="rounded-full md:w-5 md:h-5"
      />
      <span className="text-xs md:text-sm font-semibold text-yellow-200 group-hover:text-yellow-100">
        {item.symbol}
      </span>
      <span className="text-xs md:text-sm text-white font-medium">
        ${item.price >= 1000 ? item.price.toFixed(0) : item.price.toFixed(2)}
      </span>
      <span
        className={`text-[10px] md:text-xs font-medium flex items-center gap-0.5 ${
          isPositive ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {isPositive ? (
          <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3" />
        ) : (
          <TrendingDown className="w-2.5 h-2.5 md:w-3 md:h-3" />
        )}
        {isPositive ? '+' : ''}
        {item.priceChangePercentage24h.toFixed(2)}%
      </span>
    </Link>
  );
}
