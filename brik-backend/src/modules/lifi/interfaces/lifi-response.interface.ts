/**
 * LiFi API Response Interfaces
 *
 * Type definitions matching the LI.FI Analytics API v2 response structure
 */

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

export interface LiFiTransactionSide {
  txHash: string;
  txLink: string;
  amount: string;
  token: LiFiToken;
  chainId: number;
  gasToken?: LiFiToken;
  gasPrice?: string;
  gasUsed?: string;
  gasAmount?: string;
  gasAmountUSD?: string;
  amountUSD?: string;
  timestamp: number;
  value?: string;
}

export interface LiFiGasCost {
  amount: string;
  amountUSD: string;
  token: {
    symbol: string;
    address: string;
  };
}

export interface LiFiFeeCost {
  name: string;
  amount: string;
  amountUSD: string;
  token: {
    symbol: string;
    address: string;
  };
}

export interface LiFiTransfer {
  transactionId: string;
  sending: LiFiTransactionSide;
  receiving: LiFiTransactionSide;
  lifiExplorerLink: string;
  fromAddress: string;
  toAddress: string;
  tool: string;
  status: 'NOT_FOUND' | 'INVALID' | 'PENDING' | 'DONE' | 'FAILED';
  substatus: string;
  substatusMessage: string;
  metadata?: {
    integrator?: string;
  };
  gasCosts?: LiFiGasCost[];
  feeCosts?: LiFiFeeCost[];
}

export interface LiFiPaginatedResponse {
  hasNext: boolean;
  hasPrevious: boolean;
  next: string | null;
  previous: string | null;
  data: LiFiTransfer[];
}

export interface LiFiTransfersParams {
  integrator: string;
  wallet?: string;
  limit?: number;
  next?: string;
  previous?: string;
  status?: 'ALL' | 'DONE' | 'PENDING' | 'FAILED';
  fromTimestamp?: number;
  toTimestamp?: number;
  fromChain?: number;
  toChain?: number;
  fromToken?: string;
  toToken?: string;
}
