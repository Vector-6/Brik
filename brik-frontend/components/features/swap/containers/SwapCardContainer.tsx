"use client";

/**
 * SwapCardContainer
 * Smart container component that orchestrates swap logic
 */

import { useCallback, useMemo, useState } from "react";

import { CustomConnectButton } from "@/components/features/auth/ConnectButton";
import { getErrorMessage } from "@/lib/api/client";
import { isSupportedChain } from "@/lib/constants/chains";
import {
  SwapExecutionStatus,
  SwapModalType,
  type RouteExtended,
  type SwapExecutionError,
} from "@/lib/types/lifi.types";
import type { Token } from "@/lib/types/token.types";

import CollapsibleQuoteDetails from "../presenters/CollapsibleQuoteDetails";
import { QuoteRefreshIndicator } from "../presenters/QuoteRefreshIndicator";
import SwapCardPresenter from "../presenters/SwapCardPresenter";
import { SwapErrorModal } from "../presenters/SwapErrorModal";
import { SwapExecutionModal } from "../presenters/SwapExecutionModal";
import { SwapReviewModal } from "../presenters/SwapReviewModal";
import { SwapSettingsPanel } from "../presenters/SwapSettingsPanel";
import { SwapSuccessModal } from "../presenters/SwapSuccessModal";
import { useSwapSettings } from "../hooks/useSwapSettings";
import { useSwapState } from "../hooks/useSwapState";
import { useTokens } from "../hooks/useTokens";
import { useWallet } from "../hooks/useWallet";
import { useInitialToTokenFromUrl } from "../hooks/useInitialToTokenFromUrl";

// ============================================================================
// Loading States
// ============================================================================

function SwapCardSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#1f1f1f] backdrop-blur-md border border-[#2a2a2a] rounded-2xl p-6 animate-pulse shadow-[0_24px_40px_rgba(0,0,0,0.35)]">
        <div className="space-y-6">
          <div className="h-6 w-20 bg-[rgba(44,44,44,0.8)] rounded-lg"></div>
          <div className="h-24 bg-[rgba(44,44,44,0.8)] rounded-xl"></div>
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-[rgba(44,44,44,0.8)] rounded-full"></div>
          </div>
          <div className="h-24 bg-[rgba(44,44,44,0.8)] rounded-xl"></div>
          <div className="h-12 bg-[rgba(44,44,44,0.8)] rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

function WalletNotConnected() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#1f1f1f] backdrop-blur-md border border-[#2a2a2a] rounded-2xl p-10 shadow-[0_24px_40px_rgba(0,0,0,0.35)]">
        <div className="text-center space-y-6">
          <div
            className="mx-auto w-16 h-16 bg-[rgba(97,7,224,0.2)] rounded-full flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              className="w-8 h-8 text-[#ffd700]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        
              <div className="flex justify-center pt-4">
            <CustomConnectButton />
          </div>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
            To start swapping your assets, please connect your wallet first.
          </p>
      
        </div>
      </div>
    </div>
  );
}

function UnsupportedChain({ chainId }: { chainId: number }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#1f1f1f] backdrop-blur-md border border-[rgba(244,114,182,0.35)] rounded-2xl p-10 shadow-[0_24px_40px_rgba(0,0,0,0.35)]">
        <div className="text-center space-y-6">
          <div
            className="mx-auto w-16 h-16 bg-[rgba(244,114,182,0.18)] rounded-full flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              className="w-8 h-8 text-[#fda4af]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-[#fda4af] text-2xl font-bold">Unsupported Network</h2>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
            You are connected to an unsupported network (Chain ID: {chainId}). Please switch to one of our supported networks using the chain selector in the navbar.
          </p>
          <p className="text-gray-500 text-sm">
            Supported networks: Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche
          </p>
        </div>
      </div>
    </div>
  );
}

function SwapCardError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const errorMessage = getErrorMessage(error);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#1f1f1f] backdrop-blur-md border border-[rgba(244,114,182,0.35)] rounded-2xl p-10 shadow-[0_24px_40px_rgba(0,0,0,0.35)]">
        <div className="text-center space-y-6">
          <div
            className="mx-auto w-16 h-16 bg-[rgba(244,114,182,0.18)] rounded-full flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              className="w-8 h-8 text-[#fda4af]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-[#fda4af] text-xl font-bold">Failed to Load Tokens</h2>
          <p className="text-gray-400 text-sm">{errorMessage}</p>
          <button
            onClick={onRetry}
            className="px-8 py-3 bg-[#ffd700] text-[#1c1c1c] hover:bg-primary-light rounded-xl  font-semibold transition-all shadow-[0_20px_40px_rgba(97,7,224,0.24)] focus:outline-none focus:ring-2 focus:ring-[#6107e0] focus:ring-offset-2 focus:ring-offset-[#0f0f0f] font-burbank"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

function NoTokensAvailable() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#1f1f1f] backdrop-blur-md border border-[#2a2a2a] rounded-2xl p-10 shadow-[0_24px_40px_rgba(0,0,0,0.35)]">
        <div className="text-center space-y-6">
          <div
            className="mx-auto w-16 h-16 bg-[rgba(44,44,44,0.8)] rounded-full flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              className="w-8 h-8 text-[#ffd700]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold">No Tokens Available</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            There are no tokens available for swapping at the moment. Please check back later.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Container Component
// ============================================================================

export default function SwapCardContainer() {
  const { wallet } = useWallet();

  const {
    tokens,
    isLoading: isLoadingTokens,
    isError,
    error,
    refetch,
  } = useTokens({
    includeMarketData: true,
  });

  // Get initial toToken from URL parameter (e.g., /swap?token=USDC)
  const { initialToken: initialToToken, markAsUserModified } = useInitialToTokenFromUrl(
    tokens,
    isLoadingTokens,
  );

  const { settings, updateSlippage, updateDeadline } = useSwapSettings();

  const swap = useSwapState({
    tokens,
    slippage: settings.slippage,
    walletAddress: wallet.address ?? null,
    toAddress: wallet.address ?? null,
    autoRefreshEnabled: true,
    initialToToken, // Pass the initial token from URL
  });

  const {
    form,
    setFromToken,
    setToToken,
    setFromAmount,
    switchTokens,
    tokens: swapTokens,
    validation,
    quote,
    status,
    approval,
    execution,
    refresh,
    actions,
    closeModal,
    resetForm,
    lastError,
    clearError,
    conversionRate,
    activeRoute,
    modal,
  } = swap;

  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);

  const fromToken = form.fromToken;
  const toToken = form.toToken;
  const fromAmount = form.fromAmount;
  const toAmount = form.toAmount;

  const availableFromTokens = swapTokens.availableFrom;
  const availableToTokens = swapTokens.availableTo;

  const isQuoteLoading = quote.isLoading || quote.isFetching;
  const isQuoteDebouncing = quote.isDebouncing;
  const hasQuote = Boolean(quote.route);

  const isProcessing = useMemo(
    () =>
      approval.state.isApproving ||
      execution.isExecuting ||
      [
        SwapExecutionStatus.APPROVING,
        SwapExecutionStatus.SIGNING,
        SwapExecutionStatus.EXECUTING,
        SwapExecutionStatus.CONFIRMING,
      ].includes(status),
    [approval.state.isApproving, execution.isExecuting, status],
  );

  const isSwapDisabled =
    !validation.canExecute ||
    !hasQuote ||
    isQuoteLoading ||
    isQuoteDebouncing ||
    isProcessing;

  const cardIsBusy =
    execution.isExecuting ||
    [
      SwapExecutionStatus.APPROVING,
      SwapExecutionStatus.SIGNING,
      SwapExecutionStatus.EXECUTING,
      SwapExecutionStatus.CONFIRMING,
    ].includes(execution.state.status);

  const modalRoute: RouteExtended | null = useMemo(() => {
    if (
      modal.type === SwapModalType.REVIEW ||
      modal.type === SwapModalType.EXECUTION ||
      modal.type === SwapModalType.SUCCESS
    ) {
      return (modal.data as RouteExtended) ?? null;
    }
    return null;
  }, [modal.data, modal.type]);

  const routeForResume = execution.state.route ?? activeRoute ?? modalRoute;

  const latestConfirmedTx = useMemo(() => {
    const txs = execution.state.progress?.transactions ?? [];
    for (let index = txs.length - 1; index >= 0; index -= 1) {
      const tx = txs[index];
      if (tx.status === "confirmed") {
        return tx;
      }
    }
    return txs[txs.length - 1];
  }, [execution.state.progress?.transactions]);

  const handleFromTokenSelect = useCallback(
    (token: Token | null) => {
      if (!token) {
        return;
      }
      setFromToken(token);
      setIsFromDropdownOpen(false);
    },
    [setFromToken],
  );

  const handleToTokenSelect = useCallback(
    (token: Token | null) => {
      if (!token) {
        return;
      }
      setToToken(token);
      setIsToDropdownOpen(false);
      // Mark that user has manually changed the token (prevents URL param override)
      markAsUserModified();
    },
    [setToToken, markAsUserModified],
  );

  const handleFromAmountChange = useCallback(
    (value: string) => {
      setFromAmount(value);
    },
    [setFromAmount],
  );

  const handleSwitchTokens = useCallback(() => {
    switchTokens();
    setIsFromDropdownOpen(false);
    setIsToDropdownOpen(false);
    // Mark as modified since switching changes the toToken
    markAsUserModified();
  }, [switchTokens, markAsUserModified]);

  const handleBeginSwap = useCallback(() => {
    if (!quote.route) {
      return;
    }
    actions.beginReview();
  }, [actions, quote.route]);

  const handleConfirmSwap = useCallback(async () => {
    try {
      await actions.confirmSwap();
    } catch (error) {
      console.error("Swap execution failed", error);
    }
  }, [actions]);

  const handleCancelReview = useCallback(() => {
    actions.cancelReview();
  }, [actions]);

  const handleApprove = useCallback(async () => {
    console.debug("Approval flow will be handled during route execution.");
  }, []);

  const handleCloseSuccess = useCallback(() => {
    execution.reset();
    resetForm();
    closeModal();
    refresh.resetTimer();
  }, [closeModal, execution, refresh, resetForm]);

  const handleCloseError = useCallback(() => {
    clearError();
    execution.reset();
    closeModal();
  }, [clearError, closeModal, execution]);

  const handleRetryAfterError = useCallback(async () => {
    if (!routeForResume) {
      return;
    }
    try {
      await execution.resume(routeForResume);
      clearError();
      closeModal();
    } catch (error) {
      console.error("Failed to resume route", error);
    }
  }, [clearError, closeModal, execution, routeForResume]);

  const handleOpenSettings = () => {
    setShowSettingsPanel(true);
  };

  const handleCloseSettings = () => {
    setShowSettingsPanel(false);
  };

  const handleSlippageChange = (value: number) => {
    updateSlippage(value);
  };

  // Show unsupported chain warning only if wallet is connected
  if (wallet.isConnected && wallet.chainId && !isSupportedChain(wallet.chainId)) {
    return <UnsupportedChain chainId={wallet.chainId} />;
  }

  // Show loading skeleton only if wallet is connected
  if (wallet.isConnected && isLoadingTokens && tokens.length === 0) {
    return <SwapCardSkeleton />;
  }

  // Show error only if wallet is connected
  if (wallet.isConnected && isError && error) {
    return <SwapCardError error={error} onRetry={() => refetch()} />;
  }

  // Show no tokens only if wallet is connected
  if (wallet.isConnected && !isLoadingTokens && !isError && tokens.length === 0) {
    return <NoTokensAvailable />;
  }

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <SwapCardPresenter
          fromAmount={fromAmount}
          fromToken={fromToken}
          availableFromTokens={availableFromTokens}
          isFromDropdownOpen={isFromDropdownOpen}
          fromAmountUSD={quote.derived.fromAmountUSD ?? undefined}
          onFromAmountChange={handleFromAmountChange}
          onFromTokenSelect={handleFromTokenSelect}
          onToggleFromDropdown={() => setIsFromDropdownOpen(!isFromDropdownOpen)}
          onCloseFromDropdown={() => setIsFromDropdownOpen(false)}
          toAmount={toAmount}
          toToken={toToken}
          availableToTokens={availableToTokens}
          isToDropdownOpen={isToDropdownOpen}
          toAmountUSD={quote.derived.toAmountUSD ?? undefined}
          onToTokenSelect={handleToTokenSelect}
          onToggleToDropdown={() => setIsToDropdownOpen(!isToDropdownOpen)}
          onCloseToDropdown={() => setIsToDropdownOpen(false)}
          onSwitchTokens={handleSwitchTokens}
          onSwap={handleBeginSwap}
          onOpenSettings={handleOpenSettings}
          isSwapDisabled={isSwapDisabled}
          conversionRate={conversionRate}
          isLoading={cardIsBusy}
          isLoadingTokens={isLoadingTokens}
          tokenFetchError={isError ? error : null}
          onRetryTokens={() => refetch()}
          quote={quote.route}
          isLoadingQuote={isQuoteLoading}
          quoteError={quote.error}
          approvalState={approval.state}
          onApprove={handleApprove}
          isWalletConnected={wallet.isConnected}
          quoteDetailsComponent={
            hasQuote && toToken ? (
              <CollapsibleQuoteDetails
                quote={quote.route}
                toToken={toToken}
                isLoadingQuote={isQuoteLoading}
                autoExpand
              />
            ) : null
          }
          quoteRefreshComponent={
            hasQuote ? (
              <QuoteRefreshIndicator
                secondsUntilRefresh={refresh.secondsUntilRefresh}
                isStale={refresh.isStale}
                isRefreshing={quote.isRefetching}
                isLoading={quote.isLoading}
                isFetching={quote.isFetching}
                onRefresh={refresh.refresh}
              />
            ) : null
          }
        />
      </div>

      {modal.type === SwapModalType.REVIEW &&
        modalRoute &&
        fromToken &&
        toToken && (
          <SwapReviewModal
            isOpen
            onClose={handleCancelReview}
            onConfirm={handleConfirmSwap}
            fromToken={fromToken}
            toToken={toToken}
            fromAmount={fromAmount}
            quote={modalRoute}
            isConfirming={execution.isExecuting}
          />
        )}

      {modal.type === SwapModalType.EXECUTION &&
        modalRoute &&
        fromToken &&
        toToken && (
          <SwapExecutionModal
            isOpen
            fromToken={fromToken}
            toToken={toToken}
            fromAmount={fromAmount}
            progress={execution.state.progress}
            approvalState={approval.state}
          />
        )}

      {modal.type === SwapModalType.SUCCESS &&
        modalRoute &&
        fromToken &&
        toToken && (
          <SwapSuccessModal
            isOpen
            onClose={handleCloseSuccess}
            fromToken={fromToken}
            toToken={toToken}
            fromAmount={fromAmount}
            toAmount={toAmount}
            txHash={latestConfirmedTx?.hash}
            chainId={latestConfirmedTx?.chainId ?? fromToken.currentChainId}
          />
        )}

      {modal.type === SwapModalType.ERROR && (
        <SwapErrorModal
          isOpen
          error={(modal.data as SwapExecutionError) ?? (lastError as SwapExecutionError)}
          onClose={handleCloseError}
          onRetry={lastError?.recoverable ? handleRetryAfterError : undefined}
        />
      )}

      <SwapSettingsPanel
        isOpen={showSettingsPanel}
        onClose={handleCloseSettings}
        slippage={settings.slippage}
        onSlippageChange={handleSlippageChange}
        deadline={settings.deadline}
        onDeadlineChange={updateDeadline}
      />
    </>
  );
}
