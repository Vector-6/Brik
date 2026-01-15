/**
 * Axios Client Configuration
 * Handles API requests with interceptors, error handling, and retry logic
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorResponse } from './types/api.types';

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
// Debug logs for both server and client
console.log('🔍 API BASE_URL:', BASE_URL, 'ENV VAR:', process.env.NEXT_PUBLIC_API_URL);
console.log('🔍 Running on:', typeof window !== 'undefined' ? 'CLIENT' : 'SERVER');
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Status codes that should trigger a retry
const RETRYABLE_STATUS_CODES = [429, 502, 503];

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your inputs.',
  404: 'Token not found. Please select a different token.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong. Please try again later.',
  502: 'Service temporarily unavailable. Please try again.',
  503: 'Network unavailable. Please check your connection.',
};

// ============================================================================
// Axios Instance
// ============================================================================

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Request Interceptor
// ============================================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// Response Interceptor
// ============================================================================

apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number };

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        url: originalRequest?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }

    // Handle retry logic
    if (originalRequest && error.response?.status) {
      const status = error.response.status;
      const retryCount = originalRequest._retryCount || 0;

      // Check if should retry
      if (RETRYABLE_STATUS_CODES.includes(status) && retryCount < MAX_RETRIES) {
        originalRequest._retry = true;
        originalRequest._retryCount = retryCount + 1;

        // Calculate delay with exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, retryCount);

        console.log(`[API Retry] Attempt ${retryCount + 1}/${MAX_RETRIES} after ${delay}ms`);

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));

        return apiClient(originalRequest);
      }
    }

    // Transform error for better handling
    const transformedError = transformApiError(error);

    return Promise.reject(transformedError);
  }
);

// ============================================================================
// Error Transformer
// ============================================================================

/**
 * Transform Axios error to a consistent error format
 */
export function transformApiError(error: AxiosError<ApiErrorResponse>): ApiErrorResponse {
  // Network error (no response)
  if (!error.response) {
    return {
      error: 'Network Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
    };
  }

  // Server returned an error response
  const { status, data } = error.response;

  // If server provided a structured error, use it
  if (data && data.error && data.message) {
    return data;
  }

  // Fallback to generic error message
  return {
    error: `HTTP ${status}`,
    message: ERROR_MESSAGES[status] || 'An unexpected error occurred. Please try again.',
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if an error is an API error response
 */
export function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    'message' in error
  );
}

/**
 * Get user-friendly error message from error object
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

// ============================================================================
// Export
// ============================================================================

export default apiClient;
