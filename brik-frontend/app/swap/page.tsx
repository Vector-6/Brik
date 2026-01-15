"use client";

import { Suspense } from "react";
import SwapCardContainer from "../../components/features/swap/containers/SwapCardContainer";
import RecentTransactions from "../../components/features/transactions/RecentTransactions";
import { GradientText } from "@/components/ui/common";

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

export default function SwapPage() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Swap Tokenized Assets",
    description:
      "Exchange tokenized real-world assets seamlessly across multiple blockchains with instant execution and competitive rates.",
    url: "https://brik.gg/swap",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://brik.gg",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Swap",
          item: "https://brik.gg/swap",
        },
      ],
    },
    mainEntity: {
      "@type": "FinancialProduct",
      name: "Asset Swap Platform",
      description: "Cross-chain swap platform for tokenized real-world assets",
      provider: {
        "@type": "Organization",
        name: "Brik",
        url: "https://brik.gg",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br mt-24 from-[#1c1c1c] via-[#1b1b1b] to-[#161616]">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Main Content */}
      <main className="relative" id="maincontent">
        {/* Hero Section */}
        <section
          className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
          aria-labelledby="swap-heading"
        >
          {/* Background Effects - Subtle */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[rgba(97,7,224,0.12)] rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[rgba(255,215,0,0.08)] rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto">
            {/* Heading */}
            <div className="text-center mb-12">
                 <h1 
            className="font-burbank mb-6 animate-gradient"
            style={{ 
              fontWeight: 700,
              fontSize: '74px',
              background: 'linear-gradient(90deg, #870BDD 0%, #FF0CE7 50%, #870BDD 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: '64px',
              letterSpacing: '0.02em',
              animation: 'gradient-flow 3s ease infinite'
            }}
          >
                Swap Your Assets
              </h1>
              <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
                Exchange tokenized real-world assets seamlessly across multiple
                blockchains. Get the best rates with instant execution.
              </p>
            </div>

            {/* Swap Interface */}
            <div className="mt-8">
              <Suspense fallback={<SwapCardSkeleton />}>
                <SwapCardContainer />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Recent Transactions Section */}
        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-7xl mx-auto">
            <RecentTransactions />
          </div>
        </section>
      </main>
    </div>
  );
}
