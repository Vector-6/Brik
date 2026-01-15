'use client';

/**
 * useSwapModals Hook
 *
 * Single Responsibility: Manage modal state
 *
 * This hook is responsible ONLY for:
 * - Managing which modal is currently open
 * - Storing modal data/payload
 * - Opening modals with data
 * - Closing modals
 * - Type-safe modal state checks
 *
 * It does NOT:
 * - Render modals
 * - Handle business logic
 * - Execute swaps
 * - Validate data
 */

import { useCallback, useMemo, useState } from 'react';
import { SwapModalType, type SwapModalState } from '@/lib/types/lifi.types';

// =============================================================================
// Types
// =============================================================================

export interface UseSwapModalsReturn {
  modal: SwapModalState;
  openModal: (type: SwapModalType, data?: unknown) => void;
  closeModal: () => void;
  isModalType: (type: SwapModalType) => boolean;
  isModalOpen: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const INITIAL_MODAL_STATE: SwapModalState = {
  type: SwapModalType.NONE,
  data: undefined,
};

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook for managing modal state
 *
 * Provides a simple interface for opening/closing modals with data.
 * Does not contain rendering logic or business logic.
 *
 * @returns Modal state and controls
 */
export function useSwapModals(): UseSwapModalsReturn {
  // ===========================================================================
  // State
  // ===========================================================================

  const [modal, setModal] = useState<SwapModalState>(INITIAL_MODAL_STATE);

  // ===========================================================================
  // Actions
  // ===========================================================================

  const openModal = useCallback((type: SwapModalType, data?: unknown) => {
    setModal({ type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModal(INITIAL_MODAL_STATE);
  }, []);

  // ===========================================================================
  // Derived State
  // ===========================================================================

  const isModalType = useCallback(
    (type: SwapModalType) => {
      return modal.type === type;
    },
    [modal.type],
  );

  const isModalOpen = useMemo(() => {
    return modal.type !== SwapModalType.NONE;
  }, [modal.type]);

  // ===========================================================================
  // Return Values
  // ===========================================================================

  return {
    modal,
    openModal,
    closeModal,
    isModalType,
    isModalOpen,
  };
}

export default useSwapModals;
