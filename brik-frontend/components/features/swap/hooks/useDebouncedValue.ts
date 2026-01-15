'use client';

/**
 * useDebouncedValue Hook
 * Debounces a value to prevent excessive updates
 */

import { useState, useEffect } from 'react';

/**
 * Debounce a value
 * Returns the debounced value after the specified delay
 *
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 *
 * @example
 * const [amount, setAmount] = useState('');
 * const debouncedAmount = useDebouncedValue(amount, 500);
 *
 * // Only fetch quote when debouncedAmount changes (500ms after last keystroke)
 * useEffect(() => {
 *   if (debouncedAmount) {
 *     fetchQuote(debouncedAmount);
 *   }
 * }, [debouncedAmount]);
 */
export function useDebouncedValue<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timeout to update debounced value
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout on value change or unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebouncedValue;
