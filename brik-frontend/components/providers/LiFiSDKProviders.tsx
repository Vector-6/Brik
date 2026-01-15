"use client";

/**
 * LiFi SDK Providers Configuration
 *
 * Dynamically configures LiFi SDK providers (EVM) with wagmi integration.
 * This component must be used within WagmiProvider context to access wallet client.
 *
 * The EVM provider is required for executing routes and swaps through the SDK.
 * Without it, you'll get "SDK Execution Provider not found" error.
 */

import { useEffect } from "react";
import { EVM, config } from "@lifi/sdk";
import { getWalletClient, switchChain } from "@wagmi/core";
import { config as wagmiConfig } from "@/lib/config/wagmi";
import { useAccount } from "wagmi";

/**
 * LiFiSDKProviders Component
 *
 * Configures the EVM provider for LiFi SDK using wagmi wallet client.
 * This enables route execution functionality in the swap feature.
 *
 * Must be placed inside WagmiProvider in the component tree.
 */
export function LiFiSDKProviders() {
  const { isConnected } = useAccount();

  useEffect(() => {
    // Configure EVM provider with wagmi integration
    // This provides the wallet client needed for signing transactions during swap execution
    //
    // CRITICAL FIX: According to LiFi SDK documentation, getWalletClient must return
    // the Promise directly (not be async) so the SDK can properly handle wallet prompts
    const evmProvider = EVM({
      /**
       * Get the current wallet client from wagmi
       *
       * IMPORTANT: This function is called by LiFi SDK EVERY TIME it needs to interact
       * with the wallet (for approvals, signing transactions, etc.). By returning the
       * Promise directly from getWalletClient(), we ensure MetaMask prompts appear
       * at the correct time and are not bypassed.
       */
      getWalletClient: () => {
        console.log("[LiFi SDK Provider] getWalletClient called by SDK");

        // Return the Promise directly - DO NOT use async/await here
        // This is critical for proper wallet prompt behavior
        return getWalletClient(wagmiConfig).then((client) => {
          if (!client) {
            console.error("[LiFi SDK Provider] No wallet client available");
            throw new Error("Wallet client not available. Please connect your wallet.");
          }

          // Log wallet client details for debugging
          console.log("[LiFi SDK Provider] Wallet client obtained:", {
            hasAccount: !!client.account,
            accountAddress: client.account?.address,
            chainId: client.chain?.id,
            transport: client.transport?.type,
            hasSendTransaction: typeof client.sendTransaction === 'function',
            hasSignMessage: typeof client.signMessage === 'function',
            hasSignTypedData: typeof client.signTypedData === 'function',
          });

          return client;
        });
      },

      /**
       * Switch to a different chain
       * Required for cross-chain swaps where the user needs to be on a specific chain
       * Returns the wallet client after switching chains
       */
      switchChain: async (chainId: number) => {
        console.log("[LiFi SDK Provider] switchChain called for chainId:", chainId);

        // Switch the chain using wagmi
        // Cast chainId to the expected type to satisfy TypeScript
        const chain = await switchChain(wagmiConfig, {
          chainId: chainId as 1 | 10 | 56 | 137 | 42161 | 43114
        });

        console.log("[LiFi SDK Provider] Chain switched to:", chain.name);

        // Get the wallet client for the new chain
        const client = await getWalletClient(wagmiConfig, { chainId: chain.id });

        if (!client) {
          throw new Error(`Failed to get wallet client for chain ${chainId}`);
        }

        return client;
      },
    });

    // Set the provider in the global LiFi SDK config
    // This makes the provider available for all SDK operations
    config.setProviders([evmProvider]);

    // Log configuration in development
    console.log("[LiFi SDK] EVM provider configured", {
      isConnected,
      timestamp: new Date().toISOString(),
    });
  }, [isConnected]);

  // This component doesn't render anything - it only configures the SDK
  return null;
}
