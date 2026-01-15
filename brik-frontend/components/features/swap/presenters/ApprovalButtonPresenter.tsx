'use client';

/**
 * ApprovalButtonPresenter Component
 * Displays token approval button with status
 */

import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// ============================================================================
// Stub Types (Functionality Removed)
// ============================================================================

interface ApprovalState {
  isRequired: boolean;
  isApproving: boolean;
  isApproved: boolean;
  error?: {
    message: string;
    suggestedAction?: string;
  };
}

// ============================================================================
// Props
// ============================================================================

export interface ApprovalButtonPresenterProps {
  approvalState: ApprovalState;
  tokenSymbol: string;
  onApprove: () => void;
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Approval button presenter component
 * Shows approval status and handles approval action
 *
 * @example
 * <ApprovalButtonPresenter
 *   approvalState={approvalState}
 *   tokenSymbol="PAXG"
 *   onApprove={handleApprove}
 * />
 */
export function ApprovalButtonPresenter({
  approvalState,
  tokenSymbol,
  onApprove,
  disabled = false,
}: ApprovalButtonPresenterProps) {
  // ============================================================================
  // Render States
  // ============================================================================

  // Approved state
  if (approvalState.isApproved) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-gray-700/50 bg-gray-800/30 px-5 py-4 text-sm text-gray-300">
        <CheckCircle className="h-5 w-5 text-green-400" />
        <span className="font-medium">{tokenSymbol} approved</span>
      </div>
    );
  }

  // Error state
  if (approvalState.error) {
    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-200">Approval Failed</p>
              <p className="mt-1.5 text-sm text-gray-400">{approvalState.error.message}</p>
              {approvalState.error.suggestedAction && (
                <p className="mt-2 text-xs text-gray-500 italic">
                  {approvalState.error.suggestedAction}
                </p>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onApprove}
          disabled={disabled}
          className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 font-bold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          Retry Approval
        </button>
      </div>
    );
  }

  // Approving state
  if (approvalState.isApproving) {
    return (
      <button
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 font-bold text-white opacity-50"
      >
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Approving {tokenSymbol}...</span>
      </button>
    );
  }

  // Default: Needs approval
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 px-5 py-4 text-sm text-gray-300">
        <p className="font-semibold">Approval Required</p>
        <p className="mt-1.5 text-xs text-gray-400">
          You need to approve {tokenSymbol} before swapping. This is a one-time transaction.
        </p>
      </div>
      <button
        onClick={onApprove}
        disabled={disabled}
        className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 font-bold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
      >
        Approve {tokenSymbol}
      </button>
    </div>
  );
}
