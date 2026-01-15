'use client';

/**
 * Loading Skeleton Components
 * Reusable loading states for better UX
 */

import { motion } from 'framer-motion';
import { Z_INDEX } from '@/lib/constants/zIndex';

// ============================================================================
// Skeleton Base Component
// ============================================================================

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className = '', animate = true }: SkeletonProps) {
  const baseClasses = 'bg-gray-800/50 rounded';
  const animationClasses = animate ? 'animate-pulse' : '';

  return (
    <div className={`${baseClasses} ${animationClasses} ${className}`} />
  );
}

// ============================================================================
// Swap Card Skeleton
// ============================================================================

export function SwapCardLoadingSkeleton() {
  return (
    <div className="w-full bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-2xl shadow-purple-900/20">
      <div className="space-y-4">
        {/* From Section */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>

        {/* Switch Button */}
        <div className="flex justify-center -my-2">
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>

        {/* To Section */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>

        {/* Swap Button */}
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================================
// Quote Details Skeleton
// ============================================================================

export function QuoteDetailsLoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-3 bg-gray-900/50 border border-gray-700 rounded-lg space-y-2"
    >
      <Skeleton className="h-3 w-24 mb-2" />

      {/* Route */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Min Received */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* Gas Cost */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>

      {/* Time */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-10" />
      </div>
    </motion.div>
  );
}

// ============================================================================
// Token List Skeleton
// ============================================================================

export function TokenListLoadingSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50"
        >
          {/* Token Icon */}
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />

          <div className="flex-1 space-y-2">
            {/* Token Symbol */}
            <Skeleton className="h-4 w-16" />
            {/* Token Name */}
            <Skeleton className="h-3 w-24" />
          </div>

          {/* Balance */}
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Modal Loading Skeleton
// ============================================================================

export function ModalLoadingSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>

      <Skeleton className="h-12 w-full rounded-lg mt-6" />
    </div>
  );
}

// ============================================================================
// Inline Loading Spinner
// ============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        className="animate-spin text-purple-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

// ============================================================================
// Loading Overlay
// ============================================================================

interface LoadingOverlayProps {
  message?: string;
  children?: React.ReactNode;
}

export function LoadingOverlay({ message, children }: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-2xl ${Z_INDEX.LOADING_OVERLAY}`}
    >
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" className="mx-auto" />
        {message && (
          <p className="text-white text-sm font-medium">{message}</p>
        )}
        {children}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Shimmer Effect
// ============================================================================

export function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
