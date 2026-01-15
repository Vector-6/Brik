'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, RefreshCw } from 'lucide-react';

import { useNewsPagination } from '@/components/features/news/hooks/useNewsPagination';
import { NewsGrid } from '@/components/features/news/presenters/NewsGrid';
import { GradientText } from '@/components/ui/common';

const SECTION_BACKGROUND = '#1c1c1c';
const MAX_CARDS = 6;

export default function NewsInsights() {
  const shouldReduceMotion = useReducedMotion();
  const {
    articles,
    isLoading,
    error,
    refetch,
    isRefreshing,
  } = useNewsPagination({ pageSize: 20, sort: 'date' });

  const topArticles = useMemo(() => articles.slice(0, MAX_CARDS), [articles]);

  return (
    <section
      className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: SECTION_BACKGROUND }}
      aria-labelledby="news-insights-heading"
    >
      {/* Enhanced background layers */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Top fade gradient */}
        <div
          className="absolute inset-x-0 top-0 h-60"
          style={{
            background:
              'linear-gradient(180deg, #1c1c1c 0%, rgba(28,28,28,0.9) 40%, rgba(28,28,28,0) 100%)'
          }}
        />
        {/* Purple radial gradient - center */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-35 blur-[150px]"
          style={{
            background:
              'radial-gradient(circle at center, rgba(97, 7, 224, 0.4), rgba(97, 7, 224, 0))'
          }}
        />
        {/* Gold accent - top right */}
        <div
          className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full opacity-22 blur-[120px]"
          style={{
            background:
              'radial-gradient(circle at center, rgba(255, 215, 0, 0.28), rgba(255, 215, 0, 0))'
          }}
        />
        {/* Teal accent - bottom left */}
        <div
          className="absolute left-0 bottom-0 w-[450px] h-[450px] rounded-full opacity-18 blur-[110px]"
          style={{
            background:
              'radial-gradient(circle at center, rgba(35, 214, 160, 0.22), rgba(35, 214, 160, 0))'
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
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center gap-6 text-center"
        >
          {/* <span className="rounded-full border border-[#322042] bg-[#271338] px-5 py-2 text-xs font-semibold uppercase nothingclass[0.4em] text-[#c4afff]">
            Real-Time Desk
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
            News &amp; Insights for Institutional RWA Strategy
          </h2>
          <p className="max-w-2xl text-base text-gray-300 md:text-lg">
            Surface the narratives moving tokenized commodities, treasuries, and multi-chain liquidity—curated by our editorial desk to keep your portfolio decisions ahead of the market.
          </p>
        </motion.div>

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 rounded-3xl border border-red-500/30 bg-red-500/10 p-10 text-center text-red-50"
            role="alert"
          >
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">We couldn&apos;t refresh newsroom data</h3>
              <p className="text-sm text-red-200">Check your connection and try again in a moment.</p>
            </div>
            <button
              type="button"
              onClick={refetch}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-full border border-red-200/50 px-5 py-3 text-sm font-semibold text-red-50 transition hover:border-red-200 disabled:cursor-wait disabled:opacity-70"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
              {isRefreshing ? 'Retrying…' : 'Retry fetch'}
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: 'easeOut', delay: shouldReduceMotion ? 0 : 0.1 }}
            className="space-y-8"
          >
            <NewsGrid
              articles={topArticles}
              isLoading={isLoading}
              viewMode="grid"
              skeletonCount={MAX_CARDS}
              className="[&>div]:transition-shadow [&>div]:duration-300"
            />

          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: 'easeOut' }}
          className="flex justify-center"
        >
          <Link
            href="/news"
            className="group inline-flex items-center gap-2 bg-[#ffd700] text-[#1c1c1c] rounded-xl border border-[#412f6b]  px-8 py-4  font-semibold uppercase nothingclass[0.3em]  transition hover:bg-[#4d06b3] text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c] font-burbank"
          >
            Read more articles
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
