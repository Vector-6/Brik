"use client";

/**
 * ConnectButton Component
 * Custom wallet connection button with Brik branding
 */

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown, Wallet } from "lucide-react";
import Image from "next/image";

// ============================================================================
// Component
// ============================================================================

/**
 * Custom wallet connect button
 * Uses RainbowKit's ConnectButton.Custom for full control over appearance
 *
 * @example
 * <CustomConnectButton />
 */
export function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              // ============================================================================
              // Not Connected State
              // ============================================================================~
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg bg-[rgb(255,214,0)] font-light text-sm text-[#1c1c1c] px-3 py-2  font-burbank  shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                    aria-label="Connect your crypto wallet"
                  >
                    <Wallet className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Connect</span>
                    <span className="sm:hidden">Connect</span>
                  </button>
                );
              }

              // ============================================================================
              // Wrong Network State
              // ============================================================================
              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-burbank text-[#e6ee0a] shadow-lg transition-all hover:bg-red-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                    aria-label="Switch to a supported network"
                  >
                    <span
                      className="h-2 w-2 rounded-full bg-white animate-pulse"
                      aria-hidden="true"
                    />
                    Wrong Network
                  </button>
                );
              }

              // ============================================================================
              // Connected State
              // ============================================================================
              return (
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[rgb(255,214,0)] border border-white/10">
                  {/* Chain Selector Button */}
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center gap-1 rounded-lg bg-[rgb(255,214,0)] font-light text-sm px-2 py-1.5 font-burbank text-[#1c1c1c] backdrop-blur-sm transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                    aria-label={`Switch network. Currently on ${chain.name}`}
                  >
                    {chain.hasIcon && (
                      <div
                        className="overflow-hidden rounded-full"
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                        }}
                        aria-hidden="true"
                      >
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            width={16}
                            height={16}
                            unoptimized
                          />
                        )}
                      </div>
                    )}
                    <span className="hidden lg:inline text-xs">{chain.name}</span>
                    <ChevronDown className="h-3 w-3" aria-hidden="true" />
                  </button>

                  {/* Visual Separator - Principle 6: Proximity */}
                  <div className="h-5 w-px bg-black/20" aria-hidden="true" />

                  {/* Account Button */}
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center gap-1 rounded-lg bg-[rgb(255,214,0)] font-light text-sm text-[#1c1c1c] px-2 py-1.5 font-burbank backdrop-blur-sm transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                    aria-label={`Account: ${account.displayName}${
                      account.displayBalance
                        ? `. Balance: ${account.displayBalance}`
                        : ""
                    }`}
                  >
                    <span className="font-mono text-xs">{account.displayName}</span>
                    {account.displayBalance && (
                      <span className="hidden 2xl:inline text-[#1c1c1c] text-xs">
                        ({account.displayBalance})
                      </span>
                    )}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
