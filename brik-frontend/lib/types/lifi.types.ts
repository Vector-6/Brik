/**
 * LI.FI SDK Type Definitions
 * Extended types and interfaces for LI.FI integration
 */

import type {
  Route,
  RouteExtended,
  Step,
  LiFiStep,
  QuoteRequest,
  RoutesRequest,
  ContractCallsQuoteRequest,
  ExecutionOptions,
  RouteOptions,
} from "@lifi/sdk";

// LI.FI Token type
export interface LiFiToken {
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
  name: string;
  coinKey?: string;
  priceUSD?: string;
  logoURI?: string;
}

// ============================================================================
// Re-export LI.FI SDK Types
// ============================================================================

export type {
  Route,
  RouteExtended,
  Step,
  LiFiStep,
  QuoteRequest,
  RoutesRequest,
  ContractCallsQuoteRequest,
  ExecutionOptions,
  RouteOptions,
};

// ============================================================================
// Swap Execution Status
// ============================================================================

/**
 * Status of the swap execution process
 */
export enum SwapExecutionStatus {
  IDLE = "idle",
  FETCHING_QUOTE = "fetching_quote",
  QUOTE_READY = "quote_ready",
  REVIEWING = "reviewing",
  APPROVING = "approving",
  SIGNING = "signing",
  EXECUTING = "executing",
  CONFIRMING = "confirming",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

/**
 * Current step in the execution process
 */
export enum ExecutionStep {
  APPROVAL = "approval",
  SWAP = "swap",
  BRIDGE = "bridge",
  RECEIVING = "receiving",
}

// ============================================================================
// Execution State Types
// ============================================================================

/**
 * Transaction information for a step
 */
export interface StepTransaction {
  hash?: string;
  explorerUrl?: string;
  chainId: number;
  status: "pending" | "confirmed" | "failed";
  confirmations?: number;
}

/**
 * Execution progress information
 */
export interface ExecutionProgress {
  currentStep: number;
  totalSteps: number;
  currentStepName: string;
  currentStepStatus: SwapExecutionStatus;
  transactions: StepTransaction[];
  estimatedTimeRemaining?: number; // in seconds
}

/**
 * Route execution state
 */
export interface RouteExecutionState {
  status: SwapExecutionStatus;
  route: RouteExtended | null;
  progress: ExecutionProgress | null;
  error: SwapExecutionError | null;
  startTime: number | null;
  endTime: number | null;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Swap execution error categories
 */
export enum SwapErrorType {
  USER_REJECTED = "user_rejected",
  INSUFFICIENT_BALANCE = "insufficient_balance",
  INSUFFICIENT_GAS = "insufficient_gas",
  SLIPPAGE_EXCEEDED = "slippage_exceeded",
  QUOTE_EXPIRED = "quote_expired",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  NETWORK_ERROR = "network_error",
  UNSUPPORTED_ROUTE = "unsupported_route",
  APPROVAL_FAILED = "approval_failed",
  EXECUTION_FAILED = "execution_failed",
  UNKNOWN = "unknown",
}

/**
 * Structured error for swap execution
 */
export interface SwapExecutionError {
  type: SwapErrorType;
  message: string;
  originalError?: Error;
  recoverable: boolean;
  suggestedAction?: string;
  retryAfter?: number; // in seconds - for rate limit errors
}

// ============================================================================
// Quote Types
// ============================================================================

/**
 * Quote freshness status
 */
export interface QuoteFreshness {
  isFresh: boolean;
  age: number; // in seconds
  expiresIn: number; // in seconds
  shouldRefresh: boolean;
}

/**
 * Quote comparison result
 */
export interface QuoteComparison {
  hasSignificantChange: boolean;
  percentageChange: number;
  oldAmount: string;
  newAmount: string;
  isImprovement: boolean;
}

// ============================================================================
// Platform Fee Configuration
// ============================================================================

/**
 * Platform fee settings
 */
export interface PlatformFeeConfig {
  feePercentage: number; // e.g., 0.0025 for 0.25%
  integrator: string; // "Brik-Labs"
  feeCollectorAddress?: string; // Optional fee collector address
}

// ============================================================================
// Swap Settings
// ============================================================================

/**
 * User swap preferences
 */
export interface SwapSettings {
  slippage: number; // e.g., 0.005 for 0.5%
  deadline?: number; // in minutes
  infiniteApproval: boolean;
  allowedBridges?: string[];
  allowedExchanges?: string[];
  preferredBridges?: string[];
  preferredExchanges?: string[];
}

/**
 * Default swap settings
 */
export const DEFAULT_SWAP_SETTINGS: SwapSettings = {
  slippage: 0.005, // 0.5%
  infiniteApproval: false,
};

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Modal types for swap flow
 */
export enum SwapModalType {
  NONE = "none",
  REVIEW = "review",
  EXECUTION = "execution",
  SUCCESS = "success",
  ERROR = "error",
  EXCHANGE_RATE_CHANGE = "exchange_rate_change",
  SETTINGS = "settings",
}

/**
 * Modal state
 */
export interface SwapModalState {
  type: SwapModalType;
  data?: unknown;
}

// ============================================================================
// Exchange Rate Change
// ============================================================================

/**
 * Exchange rate change details
 */
export interface ExchangeRateChange {
  token: LiFiToken;
  oldAmount: string;
  newAmount: string;
  percentageChange: number;
  timestamp: number;
}

// ============================================================================
// Execution Hooks Configuration
// ============================================================================

/**
 * Callbacks for route execution
 */
export interface ExecutionCallbacks {
  onRouteUpdate?: (route: RouteExtended) => void;
  onStatusChange?: (status: SwapExecutionStatus) => void;
  onTransactionHash?: (hash: string, chainId: number) => void;
  onError?: (error: SwapExecutionError) => void;
  onSuccess?: (route: RouteExtended) => void;
  onExchangeRateChange?: (change: ExchangeRateChange) => Promise<boolean>;
}

// ============================================================================
// Persistence Types
// ============================================================================

/**
 * Persisted execution state for recovery after page reload
 */
export interface PersistedExecutionState {
  route: RouteExtended;
  status: SwapExecutionStatus;
  startTime: number;
  lastUpdate: number;
}

// ============================================================================
// Gas Estimation
// ============================================================================

/**
 * Gas cost breakdown
 */
export interface GasCostBreakdown {
  estimatedGas: string;
  gasPrice: string;
  totalCostNative: string;
  totalCostUSD: string;
  chainId: number;
}

// ============================================================================
// Fee Breakdown
// ============================================================================

/**
 * Complete fee breakdown for transparency
 */
export interface FeeBreakdown {
  gasCosts: GasCostBreakdown[];
  platformFee: {
    percentage: number;
    amountUSD: string;
  };
  liFiFee?: {
    amountUSD: string;
  };
  totalFeesUSD: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if error is a swap execution error
 */
export function isSwapExecutionError(
  error: unknown
): error is SwapExecutionError {
  return !!(
    error &&
    typeof error === "object" &&
    "type" in error &&
    "message" in error &&
    "recoverable" in error
  );
}

/**
 * Check if route is extended
 */
export function isRouteExtended(route: unknown): route is RouteExtended {
  return !!(route && typeof route === "object" && "steps" in route);
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Omit certain fields from a type
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make certain fields required
 */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
