/**
 * Explore Error Presenter
 * Error state UI with conditional retry logic
 */

'use client';

import { ExploreErrorProps } from '@/lib/types/explore.types';
import { getErrorMessage, isApiError } from '@/lib/api/client';
import { AlertCircle, RefreshCw, ServerCrash, WifiOff } from 'lucide-react';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determine if error allows retry
 */
function canRetry(error: unknown): boolean {
  if (!isApiError(error)) return true;

  // Don't allow retry for rate limit errors (429)
  const errorMessage = getErrorMessage(error);
  return !errorMessage.toLowerCase().includes('rate limit');
}

/**
 * Get error icon based on error type
 */
function getErrorIcon(error: unknown) {
  if (!isApiError(error)) return WifiOff;

  const message = getErrorMessage(error).toLowerCase();
  if (message.includes('rate limit')) return AlertCircle;
  if (message.includes('service')) return ServerCrash;
  return WifiOff;
}

// ============================================================================
// Component
// ============================================================================

export default function ExploreErrorPresenter({ error, onRetry }: ExploreErrorProps) {
  const errorMessage = getErrorMessage(error);
  const allowRetry = canRetry(error);
  const ErrorIcon = getErrorIcon(error);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] max-w-2xl mx-auto px-6 animate-fade-in-scale">
      {/* Error Icon */}
      <div className="mb-8 animate-scale-spring">
        <div className="relative">
          {/* Animated Background Circle */}
          <div className="absolute inset-0 bg-[rgba(97,7,224,0.18)] rounded-full blur-2xl animate-pulse-scale" />

          {/* Icon Container */}
          <div className="relative bg-[rgba(97,7,224,0.22)] border-2 border-[rgba(97,7,224,0.4)] rounded-full p-8">
            <ErrorIcon className="w-16 h-16 text-[#ffd700]" />
          </div>
        </div>
      </div>

      {/* Error Title */}
      <h2 className="text-3xl font-bold text-white mb-4 text-center animate-fade-in-up animate-stagger-1" style={{ opacity: 0 }}>
        {allowRetry ? 'Oops! Something went wrong' : 'Please wait a moment'}
      </h2>

      {/* Error Message */}
      <p className="text-gray-400 text-center text-lg mb-8 max-w-md animate-fade-in-up animate-stagger-2" style={{ opacity: 0 }}>
        {errorMessage}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animate-stagger-3" style={{ opacity: 0 }}>
        {allowRetry && (
          <button
            onClick={onRetry}
            className="px-8 py-4 bg-gradient-to-r from-[#6107e0] via-[#7a3df2] to-[#ffd700] hover:from-[#6107e0] hover:via-[#8455f6] hover:to-[#ffe066] text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_20px_40px_rgba(97,7,224,0.24)] flex items-center gap-3 hover:scale-105 active:scale-95"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </button>
        )}

        <button
          onClick={() => window.location.href = '/'}
          className="px-8 py-4 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white font-semibold rounded-xl transition-all duration-300 border border-[#323232] hover:scale-105 active:scale-95"
        >
          Go Home
        </button>
      </div>

      {/* Additional Help Text */}
      {!allowRetry && (
        <p className="mt-8 text-sm text-gray-500 text-center animate-fade-in animate-stagger-4" style={{ opacity: 0 }}>
          We&apos;re experiencing high traffic. The page will automatically refresh when ready.
        </p>
      )}
    </div>
  );
}
