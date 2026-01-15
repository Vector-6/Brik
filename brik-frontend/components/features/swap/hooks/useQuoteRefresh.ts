'use client';

/**
 * useQuoteRefresh Hook
 * Manages automatic quote refresh with countdown timer
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_REFRESH_INTERVAL = 30000; // 30 seconds
const STALE_THRESHOLD = 45000; // 45 seconds - quote is considered stale

// ============================================================================
// Types
// ============================================================================

export interface UseQuoteRefreshOptions {
  /** Whether auto-refresh is enabled */
  enabled?: boolean;
  /** Refresh interval in milliseconds */
  interval?: number;
  /** Callback when refresh is needed */
  onRefresh?: () => void | Promise<void>;
  /** Callback when quote becomes stale */
  onStale?: () => void;
}

export interface UseQuoteRefreshReturn {
  /** Seconds until next refresh */
  secondsUntilRefresh: number;
  /** Whether quote is stale */
  isStale: boolean;
  /** Whether auto-refresh is active */
  isAutoRefreshActive: boolean;
  /** Manually trigger refresh */
  refresh: () => Promise<void>;
  /** Reset the refresh timer */
  resetTimer: () => void;
  /** Pause auto-refresh */
  pause: () => void;
  /** Resume auto-refresh */
  resume: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing quote refresh with countdown
 *
 * @example
 * const { secondsUntilRefresh, refresh, isStale } = useQuoteRefresh({
 *   enabled: true,
 *   onRefresh: fetchNewQuote,
 *   onStale: () => console.log('Quote is stale'),
 * });
 */
export function useQuoteRefresh({
  enabled = true,
  interval = DEFAULT_REFRESH_INTERVAL,
  onRefresh,
  onStale,
}: UseQuoteRefreshOptions = {}): UseQuoteRefreshReturn {
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(
    Math.floor(interval / 1000)
  );
  const [isStale, setIsStale] = useState(false);
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const lastRefreshTime = useRef<number>(Date.now());
  const onRefreshRef = useRef(onRefresh);
  const onStaleRef = useRef(onStale);
  const countdownIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const staleTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Use ref for tracking refresh state in auto-refresh to avoid effect re-runs
  const isAutoRefreshingRef = useRef(false);

  // Keep refs in sync with latest callbacks
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    onStaleRef.current = onStale;
  }, [onStale]);

  // ============================================================================
  // Manual Refresh
  // ============================================================================

  const refresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setIsStale(false);

    try {
      if (onRefresh) {
        await onRefresh();
      }
      lastRefreshTime.current = Date.now();
      setSecondsUntilRefresh(Math.floor(interval / 1000));
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, onRefresh, interval]);

  // ============================================================================
  // Reset Timer
  // ============================================================================

  const resetTimer = useCallback(() => {
    lastRefreshTime.current = Date.now();
    setSecondsUntilRefresh(Math.floor(interval / 1000));
    setIsStale(false);
  }, [interval]);

  // ============================================================================
  // Pause/Resume Controls
  // ============================================================================

  const pause = useCallback(() => {
    setIsAutoRefreshActive(false);
  }, []);

  const resume = useCallback(() => {
    setIsAutoRefreshActive(true);
    // Don't reset timer - continue from where we paused
  }, []);

  // ============================================================================
  // Auto-Refresh Effect
  // ============================================================================

  useEffect(() => {
    if (!enabled) {
      // Clear intervals when disabled
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (staleTimeoutRef.current) {
        clearTimeout(staleTimeoutRef.current);
      }
      return;
    }

    // Don't reset countdown - it should continue from current value when resuming
    setIsStale(false);

    // Unified countdown timer (updates every second and triggers refresh at 0)
    countdownIntervalRef.current = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        const next = prev - 1;

        // When countdown hits 0
        if (next <= 0) {
          // Only trigger refresh if auto-refresh is active (not paused)
          if (isAutoRefreshActive) {
            // Call refresh asynchronously to avoid blocking
            (async () => {
              // Use ref to prevent overlapping refreshes without causing effect re-runs
              if (isAutoRefreshingRef.current) return;

              isAutoRefreshingRef.current = true;
              setIsStale(false);

              try {
                if (onRefreshRef.current) {
                  await onRefreshRef.current();
                }
                lastRefreshTime.current = Date.now();
              } finally {
                isAutoRefreshingRef.current = false;
              }
            })();
          }

          // Reset countdown regardless of whether we refreshed
          return Math.floor(interval / 1000);
        }

        return next;
      });
    }, 1000);

    // Stale detection timeout
    staleTimeoutRef.current = setTimeout(() => {
      setIsStale(true);
      if (onStaleRef.current) {
        onStaleRef.current();
      }
    }, STALE_THRESHOLD);

    // Cleanup
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (staleTimeoutRef.current) {
        clearTimeout(staleTimeoutRef.current);
      }
    };
  }, [enabled, interval, isAutoRefreshActive]);

  // ============================================================================
  // Return Values
  // ============================================================================

  return {
    secondsUntilRefresh,
    isStale,
    isAutoRefreshActive,
    refresh,
    resetTimer,
    pause,
    resume,
  };
}
