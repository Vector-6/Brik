'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, RefreshCw } from 'lucide-react';

import { useExploreData } from '@/components/features/explore/hooks/useExploreData';
import RWACardPresenter from '@/components/features/explore/presenters/RWACardPresenter';
import { formatCompact, formatUSDValue } from '@/lib/utils/numberFormatting';
import { GradientText } from '@/components/ui/common';

const SKELETON_CARD_COUNT = 6;

const skeletonCards = Array.from({ length: SKELETON_CARD_COUNT });

function MetricSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#2a2a2a] bg-[#232323] p-6 shadow-[0_0_40px_-20px_rgba(97,7,224,0.6)]">
      <div className="flex flex-col gap-3">
        <span className="inline-flex h-3 w-24 rounded-full bg-[#323232]" />
        <span className="inline-flex h-7 w-32 rounded-full bg-[#323232]" />
        <span className="inline-flex h-3 w-20 rounded-full bg-[#323232]" />
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#2a2a2a] bg-[#232323] p-6 shadow-[0_0_30px_-18px_rgba(97,7,224,0.5)]">
      <div className="flex h-full flex-col gap-6">
        <div className="flex items-center gap-4">
          <span className="h-12 w-12 rounded-full bg-[#323232]" />
          <div className="flex-1 space-y-3">
            <span className="block h-3 w-32 rounded-full bg-[#323232]" />
            <span className="block h-3 w-20 rounded-full bg-[#323232]" />
          </div>
        </div>
        <span className="h-8 w-24 rounded-full bg-[#323232]" />
        <div className="mt-auto flex items-center justify-between">
          <span className="h-4 w-20 rounded-full bg-[#323232]" />
          <span className="h-4 w-12 rounded-full bg-[#323232]" />
        </div>
      </div>
    </div>
  );
}

export default function SupportedRWAs() {
  const { data, isLoading, error, refetch, isRefetching } = useExploreData();

  const topTokens = useMemo(() => data?.tokens.slice(0, SKELETON_CARD_COUNT) ?? [], [data]);

  const insights = useMemo(() => {
    if (!data?.tokens?.length) {
      return {
        totalAssets: 0,
        totalVolume: 0,
        activeChains: 0,
      };
    }

    const totalVolume = data.tokens.reduce((acc, token) => acc + (token.volume24h ?? 0), 0);
    const activeChains = new Set(
      data.tokens.flatMap((token) => token.chainsAvailable ?? [])
    ).size;

    return {
      totalAssets: data.tokens.length,
      totalVolume,
      activeChains,
    };
  }, [data]);

  const isEmpty = !isLoading && !error && topTokens.length === 0;

  return (
    <section
      className="relative flex min-h-screen  w-full items-center overflow-hidden"
      style={{ backgroundColor: '#1c1c1c' }}
      aria-labelledby="supported-rwas-heading"
    >
      {/* Enhanced background layers */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Top fade gradient */}
        {/* <div
          className="absolute inset-x-0 top-0 h-60"
          style={{
            background:
              'linear-gradient(180deg, #1c1c1c 0%, rgba(28,28,28,0.9) 40%, rgba(28,28,28,0) 100%)'
          }}
        /> */}
        {/* Purple radial gradient - right side */}
        <div
          className="absolute right-0 top-1/4 w-[700px] h-[700px] rounded-full opacity-35 blur-[150px]"
          style={{
            background:
              'radial-gradient(circle at center, rgba(97, 7, 224, 0.35), rgba(97, 7, 224, 0))'
          }}
        />
        {/* Teal accent - left side */}
        <div
          className="absolute left-0 bottom-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
          style={{
            background:
              'radial-gradient(circle at center, rgba(35, 214, 160, 0.25), rgba(35, 214, 160, 0))'
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}
        />
        {/* Bottom fade gradient */}
        <div
          className="absolute inset-x-0 bottom-0 h-56"
          style={{
            background:
              'linear-gradient(180deg, rgba(28,28,28,0) 0%, rgba(28,28,28,0.9) 75%, #1c1c1c 100%)'
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center text-center gap-6"
        >
          {/* <span className="rounded-full border border-[#322042] bg-[#271338] px-4 py-1 text-sm font-medium uppercase nothingclass[0.3em] text-[#a78bfa]">
            Live Market Coverage
          </span> */}
          <h2
            className="max-w-3xl font-burbank text-4xl font-extrabold  md:text-5xl"
            style={{
              background: 'linear-gradient(90deg, #870BDD 0%, #FF0CE7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Supported Real-World Assets
          </h2>
          <p className="max-w-2xl text-lg text-gray-300 md:text-xl">
            Explore the most actively traded tokenized commodities, treasury funds, and institutional-grade assets available on Brik right now.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3" role="list">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`metric-skeleton-${index}`} role="listitem">
                <MetricSkeleton />
              </div>
            ))
          ) : (
            <>
              <div
                role="listitem"
                className="rounded-2xl border border-[#2a2a2a] bg-gradient-to-br from-[#232323] via-[#1f1f1f] to-[#242424] p-6 shadow-[0_0_40px_-25px_rgba(97,7,224,0.7)]"
              >
                <p className="text-sm font-semibold text-[#ffd700]">Total assets</p>
                <p className="mt-2 text-3xl font-bold text-white">{insights.totalAssets}</p>
                <p className="mt-3 text-sm text-gray-400">Tokenized instruments vetted for liquidity and transparency.</p>
              </div>
              <div
                role="listitem"
                className="rounded-2xl border border-[#2a2a2a] bg-gradient-to-br from-[#232323] via-[#1f1f1f] to-[#242424] p-6 shadow-[0_0_40px_-25px_rgba(97,7,224,0.7)]"
              >
                <p className="text-sm font-semibold text-[#ffd700]">24h on-chain volume</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {insights.totalVolume === 0
                    ? '$0.00'
                    : formatUSDValue(insights.totalVolume)}
                </p>
                <p className="mt-3 text-sm text-gray-400">
                  24h global trading volume for these assets across all platforms.
                </p>
              </div>
              <div
                role="listitem"
                className="rounded-2xl border border-[#2a2a2a] bg-gradient-to-br from-[#232323] via-[#1f1f1f] to-[#242424] p-6 shadow-[0_0_40px_-25px_rgba(97,7,224,0.7)]"
              >
                <p className="text-sm font-semibold text-[#ffd700]">Active chains</p>
                <p className="mt-2 text-3xl font-bold text-white">{insights.activeChains}</p>
                <p className="mt-3 text-sm text-gray-400">Multi-chain connectivity ensures instant settlement.</p>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-10">
          {error && (
            <div
              role="alert"
              className="flex flex-col gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-left text-red-100"
            >
              <p className="text-lg font-semibold">We couldn&apos;t refresh asset data.</p>
              <p className="text-sm text-red-200">
                Please check your connection or try again in a moment.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isRefetching}
                className={`inline-flex w-fit items-center gap-2 rounded-full border border-red-400/40 bg-transparent px-4 py-2 text-sm font-semibold text-red-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#6107E0] focus-visible:ring-offset-[#1c1c1c] ${
                  isRefetching
                    ? 'cursor-wait opacity-75'
                    : 'hover:border-red-300 hover:bg-red-500/10'
                }`}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                Retry
              </button>
            </div>
          )}

          {isEmpty && (
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#232323] p-10 text-center text-gray-300">
              <p className="text-xl font-semibold text-white">Assets are coming soon.</p>
              <p className="mt-3 text-sm">
                We&apos;re curating institutional-quality RWAs. Check back shortly for the latest listings.
              </p>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? skeletonCards.map((_, index) => (
                  <CardSkeleton key={`card-skeleton-${index}`} />
                ))
              : topTokens.map((token, index) => (
                  <RWACardPresenter key={token.symbol} token={token} index={index} />
                ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#2a2a2a] pt-8 text-center md:flex-row md:text-left">
          <div>
            <p className="text-base font-semibold uppercase  text-[#a78bfa]">Roll over into discovery</p>
            <p className="mt-1 text-sm text-gray-300">
              Browse the full catalog of tokenized real-world assets, research listings, and monitor live market depth.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center bg-[#ffd700] text-[#1c1c1c] justify-center gap-2 rounded-xl border border-[#412f6b]  px-6 py-3 text-sm font-semibold uppercase nothingclasswide text-xl  transition hover:bg-[#4f0ec0] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c] font-burbank"
          >
            See all RWAs
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
