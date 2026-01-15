"use client";

/**
 * Application Providers
 * Wraps the app with necessary context providers
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { useState, useEffect, type ReactNode, Suspense, lazy } from "react";
import { config } from "@/lib/config/wagmi";
import { Toaster } from "react-hot-toast";
import { Z_INDEX_VALUES } from "@/lib/constants/zIndex";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { LiFiSDKProviders } from "@/components/providers/LiFiSDKProviders";

// Import RainbowKit styles
import "@rainbow-me/rainbowkit/styles.css";

// Lazy load React Query Devtools - only in development
const ReactQueryDevtools = lazy(() =>
  import("@tanstack/react-query-devtools").then((mod) => ({
    default: mod.ReactQueryDevtools,
  }))
);

// ============================================================================
// Query Client Configuration
// ============================================================================

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: 5 minutes (matches backend cache)
        staleTime: 5 * 60 * 1000,

        // Cache time: 10 minutes
        gcTime: 10 * 60 * 1000,

        // Refetch on window focus
        refetchOnWindowFocus: true,

        // Refetch on reconnect
        refetchOnReconnect: true,

        // Retry logic
        retry: (failureCount, error: unknown) => {
          // Don't retry on 400 or 404
          if (error && typeof error === "object" && "response" in error) {
            const status = (error as { response?: { status?: number } })
              .response?.status;
            if (status === 400 || status === 404) {
              return false;
            }
          }

          // Retry up to 3 times for other errors
          return failureCount < 3;
        },

        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
}

// Browser-side query client
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// ============================================================================
// Providers Component
// ============================================================================

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // useState to ensure the query client is only created once per browser session
  const [queryClient] = useState(() => getQueryClient());
  const [isClient, setIsClient] = useState(false);

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "var(--primary)",
            accentColorForeground: "white",
            borderRadius: "medium",
            fontStack: "system",
          })}
        >
          {/* Configure LiFi SDK Providers (EVM) for swap execution */}
          <LiFiSDKProviders />
          {children}
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(13, 13, 13, 0.95)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(97, 7, 224, 0.2)',
                padding: '16px',
                zIndex: Z_INDEX_VALUES.TOAST,
              },
              success: {
                duration: 5000,
                style: {
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(13, 13, 13, 0.95) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                },
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 6000,
                style: {
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(13, 13, 13, 0.95) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                },
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
              loading: {
                style: {
                  background: 'linear-gradient(135deg, rgba(97, 7, 224, 0.1) 0%, rgba(13, 13, 13, 0.95) 100%)',
                  border: '1px solid rgba(97, 7, 224, 0.3)',
                },
                iconTheme: {
                  primary: '#6107e0',
                  secondary: '#fff',
                },
              },
            }}
          />
          {/* React Query Devtools - only in development, lazy loaded */}
          {process.env.NODE_ENV === "development" && isClient && (
            <Suspense fallback={null}>
              <ReactQueryDevtools initialIsOpen={false} />
            </Suspense>
          )}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
