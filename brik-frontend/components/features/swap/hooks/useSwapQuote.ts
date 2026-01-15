'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { convertQuoteToRoute } from '@lifi/sdk';
import type { QuoteRequest } from '@lifi/types';

import type {
  RouteExtended,
  QuoteComparison,
  QuoteFreshness,
} from '@/lib/types/lifi.types';
import type { Token } from '@/lib/types/token.types';
import { defaultRouteOptions } from '@/lib/config/lifi';
import { ZERO_ADDRESS, getTokenAddress } from '@/lib/utils/lifiTokenMapping';
import { fromSmallestUnit, toSmallestUnit } from '@/lib/utils/amountConversion';
import { getLiFiQuote } from '@/lib/api/endpoints/lifi';
import {
  isRateLimitError,
  parseHTTPErrorCode,
  parseRetryAfter,
  getSwapErrorMessage,
  SwapErrorType,
} from '@/lib/utils/lifiErrorHandling';
import { useDebouncedValue } from './useDebouncedValue';

// ==========================================================================
// Constants
// ==========================================================================

const QUOTE_DEBOUNCE_MS = 400;
const QUOTE_TTL_MS = 30_000;
const QUOTE_STALE_THRESHOLD_MS = 45_000;
const SIGNIFICANT_CHANGE_THRESHOLD_PERCENT = 0.5;

const DEFAULT_SLIPPAGE_PERCENT =
  defaultRouteOptions.slippage !== undefined
    ? defaultRouteOptions.slippage * 100
    : 0.5;

// ==========================================================================
// Types
// ==========================================================================

export type SwapQuoteErrorType = 'validation' | 'network' | 'rate_limit' | 'unknown';

export interface SwapQuoteError {
  type: SwapQuoteErrorType;
  message: string;
  cause?: unknown;
  retryAfter?: number; // in seconds - for rate limit errors
}

export interface ToolPreferences {
  allowedBridges?: string[];
  allowedExchanges?: string[];
  preferredBridges?: string[];
  preferredExchanges?: string[];
  denyBridges?: string[];
  denyExchanges?: string[];
}

export interface UseSwapQuoteParams {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  slippage?: number;
  walletAddress?: string | null;
  toAddress?: string | null;
  enabled?: boolean;
  toolPreferences?: ToolPreferences;
  feePercentage?: number;
}

export interface SwapQuoteDerivedValues {
  toAmount: string | null;
  toAmountMin: string | null;
  fromAmountUSD: string | null;
  toAmountUSD: string | null;
  gasCostUSD: string | null;
  conversionRate: number;
}

export interface UseSwapQuoteReturn {
  quote: RouteExtended | null;
  fromAmountWei: string | null;
  isDebouncing: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  error: SwapQuoteError | null;
  refetch: UseQueryResult<RouteExtended | null>['refetch'];
  debouncedAmount: string;
  derived: SwapQuoteDerivedValues;
  freshness: QuoteFreshness | null;
  comparison: QuoteComparison | null;
  updatedAt: number | null;
}

// ==========================================================================
// Main Hook
// ==========================================================================

export function useSwapQuote(params: UseSwapQuoteParams): UseSwapQuoteReturn {
  const {
    fromToken,
    toToken,
    fromAmount,
    slippage = DEFAULT_SLIPPAGE_PERCENT,
    walletAddress,
    toAddress,
    enabled = true,
    toolPreferences,
    feePercentage,
  } = params;

  const debouncedAmount = useDebouncedValue(fromAmount, QUOTE_DEBOUNCE_MS);
  const isDebouncing = debouncedAmount !== fromAmount;

  const slippageDecimal = useMemo(() => slippage / 100, [slippage]);

  const amountConversion = useAmountConversion(fromToken, debouncedAmount);

  const walletAddressOrZero = walletAddress ?? ZERO_ADDRESS;
  const destinationAddress = (toAddress ?? walletAddress ?? ZERO_ADDRESS) as string;

  const canRequestQuote = Boolean(
    enabled &&
      fromToken &&
      toToken &&
      amountConversion.amountWei &&
      amountConversion.hasPositiveAmount &&
      !amountConversion.error &&
      !areSameToken(fromToken, toToken),
  );

  const pairKey = useMemo(() => {
    if (!fromToken || !toToken) {
      return null;
    }
    return getPairKey(fromToken, toToken);
  }, [fromToken, toToken]);

  const queryKey = useMemo(
    () =>
      buildQuoteQueryKey({
        enabled: canRequestQuote,
        fromToken,
        toToken,
        amountWei: amountConversion.amountWei,
        slippageDecimal,
        walletAddress: walletAddressOrZero,
        toAddress: destinationAddress,
        toolPreferences,
        feePercentage,
      }),
    [
      canRequestQuote,
      fromToken,
      toToken,
      amountConversion.amountWei,
      slippageDecimal,
      walletAddressOrZero,
      destinationAddress,
      toolPreferences,
      feePercentage,
    ],
  );

  const quoteQuery = useQuery<RouteExtended | null>({
    queryKey,
    enabled: canRequestQuote,
    staleTime: QUOTE_TTL_MS,
    gcTime: QUOTE_TTL_MS * 2,
    retry: 2,
    queryFn: async () => {
      if (!fromToken || !toToken || !amountConversion.amountWei) {
        return null;
      }

      return requestSwapQuote({
        fromToken,
        toToken,
        amountWei: amountConversion.amountWei,
        walletAddress: walletAddressOrZero,
        toAddress: destinationAddress,
        slippageDecimal,
        toolPreferences,
        feePercentage,
      });
    },
  });

  const quote = quoteQuery.data ?? null;

  const derived = useDerivedQuoteValues({
    quote,
    toToken,
    fromAmount: debouncedAmount,
  });

  const comparison = useQuoteComparisonTracker(pairKey, quote);

  const freshness = useQuoteFreshnessTracker(
    quote,
    quoteQuery.dataUpdatedAt,
    QUOTE_TTL_MS,
    QUOTE_STALE_THRESHOLD_MS,
  );

  const error = useCombinedQuoteError(amountConversion.error, quoteQuery.error);

  return {
    quote,
    fromAmountWei: amountConversion.amountWei,
    isDebouncing,
    isLoading: quoteQuery.isLoading,
    isFetching: quoteQuery.isFetching,
    isRefetching: quoteQuery.isRefetching,
    error,
    refetch: quoteQuery.refetch,
    debouncedAmount,
    derived,
    freshness,
    comparison,
    updatedAt: quoteQuery.dataUpdatedAt || null,
  };
}

// ==========================================================================
// Hook-Level Helpers
// ==========================================================================

interface AmountConversionResult {
  amountWei: string | null;
  error: SwapQuoteError | null;
  hasPositiveAmount: boolean;
}

interface QuoteQueryKeyOptions {
  enabled: boolean;
  fromToken: Token | null;
  toToken: Token | null;
  amountWei: string | null;
  slippageDecimal: number;
  walletAddress: string;
  toAddress: string;
  toolPreferences?: ToolPreferences;
  feePercentage?: number;
}

interface RequestSwapQuoteOptions {
  fromToken: Token;
  toToken: Token;
  amountWei: string;
  walletAddress: string;
  toAddress: string;
  slippageDecimal: number;
  toolPreferences?: ToolPreferences;
  feePercentage?: number;
}

interface DerivedQuoteValuesParams {
  quote: RouteExtended | null;
  toToken: Token | null;
  fromAmount: string;
}

function useAmountConversion(
  token: Token | null,
  amount: string,
): AmountConversionResult {
  return useMemo(() => {
    const hasPositiveAmount = isPositiveNumber(amount);

    if (!token || !hasPositiveAmount) {
      return {
        amountWei: null,
        error: null,
        hasPositiveAmount,
      };
    }

    try {
      const amountWei = toSmallestUnit(amount, token.decimals);
      return {
        amountWei,
        error: null,
        hasPositiveAmount,
      };
    } catch (error) {
      return {
        amountWei: null,
        error: createSwapQuoteError(
          'validation',
          error instanceof Error
            ? error.message
            : 'Invalid amount. Check token decimals.',
          error,
        ),
        hasPositiveAmount,
      };
    }
  }, [token, amount]);
}

function useDerivedQuoteValues(
  params: DerivedQuoteValuesParams,
): SwapQuoteDerivedValues {
  const { quote, toToken, fromAmount } = params;

  return useMemo(
    () => deriveQuoteValues(quote, toToken, fromAmount),
    [quote, toToken, fromAmount],
  );
}

function useQuoteComparisonTracker(
  pairKey: string | null,
  quote: RouteExtended | null,
): QuoteComparison | null {
  const previousRouteRef = useRef<RouteExtended | null>(null);
  const lastPairKeyRef = useRef<string | null>(null);
  const [comparison, setComparison] = useState<QuoteComparison | null>(null);

  useEffect(() => {
    if (pairKey !== lastPairKeyRef.current) {
      previousRouteRef.current = null;
      setComparison(null);
      lastPairKeyRef.current = pairKey;
    }
  }, [pairKey]);

  useEffect(() => {
    if (!quote) {
      setComparison(null);
      previousRouteRef.current = null;
      return;
    }

    const result = computeQuoteComparison(previousRouteRef.current, quote);

    if (result) {
      setComparison(result);
    } else if (previousRouteRef.current) {
      setComparison({
        hasSignificantChange: false,
        percentageChange: 0,
        oldAmount: previousRouteRef.current.toAmountUSD ?? '0',
        newAmount: quote.toAmountUSD ?? '0',
        isImprovement: false,
      });
    }

    previousRouteRef.current = quote;
  }, [quote]);

  return comparison;
}

function useQuoteFreshnessTracker(
  quote: RouteExtended | null,
  dataUpdatedAt: number | undefined,
  ttlMs: number,
  staleThresholdMs: number,
): QuoteFreshness | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!quote || !dataUpdatedAt) {
      return undefined;
    }

    setNow(Date.now());

    const interval = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(interval);
  }, [quote, dataUpdatedAt]);

  return useMemo(
    () => computeQuoteFreshness(quote, dataUpdatedAt, now, ttlMs, staleThresholdMs),
    [quote, dataUpdatedAt, now, ttlMs, staleThresholdMs],
  );
}

function useCombinedQuoteError(
  amountError: SwapQuoteError | null,
  queryError: unknown,
): SwapQuoteError | null {
  return useMemo(() => {
    if (amountError) {
      return amountError;
    }

    if (queryError) {
      return normaliseSwapQuoteError(queryError);
    }

    return null;
  }, [amountError, queryError]);
}

// ==========================================================================
// Pure Utilities
// ==========================================================================

function buildQuoteQueryKey(options: QuoteQueryKeyOptions): readonly unknown[] {
  const {
    enabled,
    fromToken,
    toToken,
    amountWei,
    slippageDecimal,
    walletAddress,
    toAddress,
    toolPreferences,
    feePercentage,
  } = options;

  if (!enabled || !amountWei) {
    return ['swap-quote', 'disabled'] as const;
  }

  return [
    'swap-quote',
    fromToken?.currentChainId ?? null,
    fromToken ? getTokenAddress(fromToken) : null,
    toToken?.currentChainId ?? null,
    toToken ? getTokenAddress(toToken) : null,
    amountWei,
    slippageDecimal,
    walletAddress,
    toAddress,
    toolPreferences ? JSON.stringify(toolPreferences) : null,
    feePercentage ?? defaultRouteOptions.fee ?? null,
  ] as const;
}

async function requestSwapQuote(
  options: RequestSwapQuoteOptions,
): Promise<RouteExtended> {
  const request = buildQuoteRequest(options);

  // Use server-side API route with API key for better rate limits
  const response = await getLiFiQuote(request);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to get quote');
  }

  const quoteStep = response.data;
  const baseRoute = convertQuoteToRoute(quoteStep);

  return {
    ...baseRoute,
    steps: baseRoute.steps.map((step) => ({ ...step })),
  } as RouteExtended;
}

function buildQuoteRequest(options: RequestSwapQuoteOptions): QuoteRequest {
  const {
    fromToken,
    toToken,
    amountWei,
    walletAddress,
    toAddress,
    slippageDecimal,
    toolPreferences,
    feePercentage,
  } = options;

  const request: QuoteRequest = {
    fromChain: fromToken.currentChainId,
    fromToken: getTokenAddress(fromToken),
    fromAddress: walletAddress,
    fromAmount: amountWei,
    toChain: toToken.currentChainId,
    toToken: getTokenAddress(toToken),
    toAddress,
    slippage: slippageDecimal,
    integrator: defaultRouteOptions.integrator ?? 'Brik-Labs',
  };

  if (feePercentage !== undefined) {
    request.fee = feePercentage;
  } else if (defaultRouteOptions.fee !== undefined) {
    request.fee = defaultRouteOptions.fee;
  }

  if (toolPreferences?.allowedBridges?.length) {
    request.allowBridges = toolPreferences.allowedBridges;
  }
  if (toolPreferences?.preferredBridges?.length) {
    request.preferBridges = toolPreferences.preferredBridges;
  }
  if (toolPreferences?.denyBridges?.length) {
    request.denyBridges = toolPreferences.denyBridges;
  }
  if (toolPreferences?.allowedExchanges?.length) {
    request.allowExchanges = toolPreferences.allowedExchanges;
  }
  if (toolPreferences?.preferredExchanges?.length) {
    request.preferExchanges = toolPreferences.preferredExchanges;
  }
  if (toolPreferences?.denyExchanges?.length) {
    request.denyExchanges = toolPreferences.denyExchanges;
  }

  return request;
}

function deriveQuoteValues(
  quote: RouteExtended | null,
  toToken: Token | null,
  fromAmount: string,
): SwapQuoteDerivedValues {
  const base: SwapQuoteDerivedValues = {
    toAmount: null,
    toAmountMin: null,
    fromAmountUSD: quote?.fromAmountUSD ?? null,
    toAmountUSD: quote?.toAmountUSD ?? null,
    gasCostUSD:
      quote?.gasCostUSD ?? quote?.steps[0]?.estimate?.gasCosts?.[0]?.amountUSD ?? null,
    conversionRate: 0,
  };

  if (!quote || !toToken) {
    return base;
  }

  let toAmount: string | null = null;
  let toAmountMin: string | null = null;

  try {
    toAmount = fromSmallestUnit(
      quote.toAmount,
      toToken.decimals,
      Math.min(8, toToken.decimals),
    );
  } catch (error) {
    console.warn('Failed to convert toAmount to readable format', error);
    toAmount = null;
  }

  try {
    toAmountMin = fromSmallestUnit(
      quote.toAmountMin,
      toToken.decimals,
      Math.min(8, toToken.decimals),
    );
  } catch (error) {
    console.warn('Failed to convert toAmountMin to readable format', error);
    toAmountMin = null;
  }

  return {
    toAmount,
    toAmountMin,
    fromAmountUSD: quote.fromAmountUSD ?? null,
    toAmountUSD: quote.toAmountUSD ?? null,
    gasCostUSD:
      quote.gasCostUSD ?? quote.steps[0]?.estimate?.gasCosts?.[0]?.amountUSD ?? null,
    conversionRate: computeConversionRate(toAmount, fromAmount),
  };
}

function computeQuoteFreshness(
  quote: RouteExtended | null,
  dataUpdatedAt: number | undefined,
  now: number,
  ttlMs: number,
  staleThresholdMs: number,
): QuoteFreshness | null {
  if (!quote || !dataUpdatedAt) {
    return null;
  }

  const ageSeconds = Math.max(0, (now - dataUpdatedAt) / 1000);
  const ttlSeconds = ttlMs / 1000;
  const staleThresholdSeconds = staleThresholdMs / 1000;

  return {
    isFresh: ageSeconds < staleThresholdSeconds,
    age: ageSeconds,
    expiresIn: Math.max(ttlSeconds - ageSeconds, 0),
    shouldRefresh: ageSeconds >= ttlSeconds,
  };
}

function computeQuoteComparison(
  previousRoute: RouteExtended | null,
  currentRoute: RouteExtended,
): QuoteComparison | null {
  if (!previousRoute) {
    return null;
  }

  const prevUSD = previousRoute.toAmountUSD
    ? Number.parseFloat(previousRoute.toAmountUSD)
    : Number.NaN;
  const nextUSD = currentRoute.toAmountUSD
    ? Number.parseFloat(currentRoute.toAmountUSD)
    : Number.NaN;

  if (!Number.isFinite(prevUSD) || !Number.isFinite(nextUSD) || prevUSD === 0) {
    return null;
  }

  const difference = nextUSD - prevUSD;
  const percentageChange = (difference / prevUSD) * 100;

  return {
    hasSignificantChange:
      Math.abs(percentageChange) >= SIGNIFICANT_CHANGE_THRESHOLD_PERCENT,
    percentageChange,
    oldAmount: previousRoute.toAmountUSD ?? '0',
    newAmount: currentRoute.toAmountUSD ?? '0',
    isImprovement: difference >= 0,
  };
}

function computeConversionRate(
  toAmount: string | null,
  fromAmount: string,
): number {
  if (!toAmount) {
    return 0;
  }

  const to = Number.parseFloat(toAmount);
  const from = Number.parseFloat(fromAmount);

  if (!Number.isFinite(to) || !Number.isFinite(from) || from === 0) {
    return 0;
  }

  return to / from;
}

function getPairKey(fromToken: Token, toToken: Token): string {
  return `${fromToken.currentChainId}:${getTokenAddress(fromToken)}->${toToken.currentChainId}:${getTokenAddress(toToken)}`;
}

function areSameToken(a: Token, b: Token): boolean {
  return (
    a.currentChainId === b.currentChainId &&
    getTokenAddress(a).toLowerCase() === getTokenAddress(b).toLowerCase()
  );
}

function isPositiveNumber(value: string): boolean {
  if (!value) {
    return false;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function createSwapQuoteError(
  type: SwapQuoteErrorType,
  message: string,
  cause?: unknown,
): SwapQuoteError {
  return { type, message, ...(cause ? { cause } : {}) };
}

function normaliseSwapQuoteError(error: unknown): SwapQuoteError {
  if (!error) {
    return createSwapQuoteError('unknown', 'Failed to fetch quote.');
  }

  // Check for rate limit errors first
  if (isRateLimitError(error)) {
    const retryAfter = parseRetryAfter(error);
    const message = getSwapErrorMessage(SwapErrorType.RATE_LIMIT_EXCEEDED, error);
    return {
      type: 'rate_limit',
      message,
      cause: error,
      ...(retryAfter !== null ? { retryAfter } : {}),
    };
  }

  // Check HTTP status codes
  const statusCode = parseHTTPErrorCode(error);
  if (statusCode !== null) {
    // 5xx errors are server/network errors
    if (statusCode >= 500) {
      return createSwapQuoteError(
        'network',
        'Server error occurred. Please try again in a moment.',
        error,
      );
    }
    // 4xx errors (except 429 which is handled above)
    if (statusCode >= 400) {
      const message = error instanceof Error ? error.message : 'Request failed.';
      return createSwapQuoteError('unknown', message, error);
    }
  }

  // Check for network-related errors
  if (typeof error === 'string') {
    const lowerError = error.toLowerCase();
    if (
      lowerError.includes('network') ||
      lowerError.includes('fetch failed') ||
      lowerError.includes('timeout')
    ) {
      return createSwapQuoteError('network', error, error);
    }
    return createSwapQuoteError('unknown', error);
  }

  // Handle Error objects
  if (error instanceof Error) {
    const lowerMessage = error.message.toLowerCase();

    // Check for network-related errors in message
    if (
      lowerMessage.includes('network') ||
      lowerMessage.includes('fetch failed') ||
      lowerMessage.includes('timeout') ||
      lowerMessage.includes('failed to fetch')
    ) {
      return createSwapQuoteError('network', error.message, error);
    }

    return createSwapQuoteError(
      'unknown',
      error.message || 'Failed to fetch quote.',
      error,
    );
  }

  // Handle objects with message property
  if (typeof error === 'object' && error !== null) {
    const maybeMessage =
      'message' in error && typeof error.message === 'string'
        ? error.message
        : 'Failed to fetch quote.';

    return createSwapQuoteError('unknown', maybeMessage, error);
  }

  return createSwapQuoteError('unknown', 'Failed to fetch quote.', error);
}

export default useSwapQuote;
