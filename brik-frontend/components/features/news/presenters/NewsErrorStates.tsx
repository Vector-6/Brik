/**
 * NewsErrorStates Component
 * Error state components for various news-related failures
 */

'use client';

import { motion } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

interface ErrorStateProps {
  /** Error type */
  type?: 'rate_limit' | 'service_unavailable' | 'network_error' | 'unknown';
  /** Custom error message */
  message?: string;
  /** Retry function */
  onRetry?: () => void;
  /** Whether retry is loading */
  isRetrying?: boolean;
  /** Retry countdown in seconds */
  retryCountdown?: number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Error Icons
// ============================================================================

function ClockIcon() {
  return (
    <svg className="w-16 h-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CloudErrorIcon() {
  return (
    <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 13l4 4m0-4l-4 4" />
    </svg>
  );
}

function NetworkErrorIcon() {
  return (
    <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function GenericErrorIcon() {
  return (
    <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function SearchErrorIcon() {
  return (
    <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

// ============================================================================
// Retry Button Component
// ============================================================================

interface RetryButtonProps {
  onRetry: () => void;
  isRetrying: boolean;
  countdown?: number;
  text?: string;
}

function RetryButton({ onRetry, isRetrying, countdown, text = 'Try Again' }: RetryButtonProps) {
  if (countdown && countdown > 0) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-gray-400 font-medium rounded-lg cursor-not-allowed"
      >
        <ClockIcon />
        Try again in {countdown}s
      </button>
    );
  }

  return (
    <button
      onClick={onRetry}
      disabled={isRetrying}
      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
    >
      {isRetrying ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
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
          Retrying...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {text}
        </>
      )}
    </button>
  );
}

// ============================================================================
// Error State Configurations
// ============================================================================

const ERROR_CONFIGS = {
  rate_limit: {
    icon: <ClockIcon />,
    title: 'Rate Limit Reached',
    message: "We've reached our news limit for now. Check back in a few minutes!",
    retryText: 'Try Again',
  },
  service_unavailable: {
    icon: <CloudErrorIcon />,
    title: 'Service Temporarily Down',
    message: 'News service is taking a quick break. Try again shortly.',
    retryText: 'Retry',
  },
  network_error: {
    icon: <NetworkErrorIcon />,
    title: 'Connection Issue',
    message: 'Unable to connect to the news service. Please check your internet connection.',
    retryText: 'Retry',
  },
  unknown: {
    icon: <GenericErrorIcon />,
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred while loading news articles.',
    retryText: 'Try Again',
  },
};

// ============================================================================
// Main Error State Component
// ============================================================================

export function NewsErrorState({
  type = 'unknown',
  message,
  onRetry,
  isRetrying = false,
  retryCountdown,
  className = '',
}: ErrorStateProps) {
  const config = ERROR_CONFIGS[type];
  const displayMessage = message || config.message;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-center py-16 space-y-6 ${className}`}
    >
      {/* Icon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center"
      >
        {config.icon}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 max-w-md mx-auto"
      >
        <h3 className="text-xl font-semibold text-white">
          {config.title}
        </h3>
        <p className="text-gray-400 leading-relaxed">
          {displayMessage}
        </p>
      </motion.div>

      {/* Retry Button */}
      {onRetry && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <RetryButton
            onRetry={onRetry}
            isRetrying={isRetrying}
            countdown={retryCountdown}
            text={config.retryText}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================================================
// Empty State Component
// ============================================================================

export function NewsEmptyState({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-center py-16 space-y-6 ${className}`}
    >
      {/* Icon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center"
      >
        <SearchErrorIcon />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 max-w-md mx-auto"
      >
        <h3 className="text-xl font-semibold text-white">
          No Articles Found
        </h3>
        <p className="text-gray-400 leading-relaxed">
          We couldn&apos;t find any RWA news articles at the moment. Check back later for fresh content.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Inline Error Component (for small errors)
// ============================================================================

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function InlineNewsError({ message, onRetry, className = '' }: InlineErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg ${className}`}
    >
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-red-300 text-sm">{message}</span>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 text-xs font-medium text-red-300 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors duration-200"
        >
          Retry
        </button>
      )}
    </motion.div>
  );
}

// ============================================================================
// Export
// ============================================================================

export default NewsErrorState;
