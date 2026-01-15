'use client';

/**
 * useSwapSettings Hook
 * Manages swap settings with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface SwapSettings {
  slippage: number; // Percentage (e.g., 0.5 for 0.5%)
  deadline: number; // Minutes
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_SETTINGS: SwapSettings = {
  slippage: 0.5, // 0.5%
  deadline: 20, // 20 minutes
};

const STORAGE_KEY = 'brik_swap_settings';

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UseSwapSettingsReturn {
  settings: SwapSettings;
  updateSlippage: (value: number) => void;
  updateDeadline: (value: number) => void;
  resetSettings: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing swap settings
 * Automatically persists to localStorage
 *
 * @returns Settings and update methods
 *
 * @example
 * const { settings, updateSlippage, updateDeadline } = useSwapSettings();
 *
 * // Update slippage
 * updateSlippage(1.0);
 *
 * // Update deadline
 * updateDeadline(30);
 *
 * // Access current settings
 * console.log(settings.slippage); // 1.0
 */
export function useSwapSettings(): UseSwapSettingsReturn {
  // ============================================================================
  // State
  // ============================================================================

  const [settings, setSettings] = useState<SwapSettings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================================================
  // Load from localStorage on mount
  // ============================================================================

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SwapSettings;
        setSettings({
          slippage: parsed.slippage ?? DEFAULT_SETTINGS.slippage,
          deadline: parsed.deadline ?? DEFAULT_SETTINGS.deadline,
        });
      }
    } catch (error) {
      console.error('Failed to load swap settings from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // ============================================================================
  // Save to localStorage when settings change
  // ============================================================================

  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save swap settings to localStorage:', error);
    }
  }, [settings, isInitialized]);

  // ============================================================================
  // Update Methods
  // ============================================================================

  const updateSlippage = useCallback((value: number) => {
    setSettings((prev) => ({
      ...prev,
      slippage: value,
    }));
  }, []);

  const updateDeadline = useCallback((value: number) => {
    setSettings((prev) => ({
      ...prev,
      deadline: value,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    settings,
    updateSlippage,
    updateDeadline,
    resetSettings,
  };
}
