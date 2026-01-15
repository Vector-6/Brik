'use client';

import Link from 'next/link';
import { GradientText } from '@/components/ui/common';

// Compact split hero focused on clarity and fast scanning per 2025 hero-pattern research
export default function Mission() {
  return (
    <section
  className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16 pb-16 md:px-8 md:pt-24 md:pb-24 lg:px-12 lg:pt-28"
      aria-labelledby="mission-heading"
    >

      <div
        className="absolute inset-y-0 right-0 w-full max-w-[520px] -translate-y-[25%] translate-x-[25%] rounded-full bg-[#6d28d9]/20 blur-[160px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-14 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full max-w-2xl flex-col gap-8 text-white">
          <header className="flex flex-col gap-5" aria-describedby="mission-description">
            <span className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase nothingclass[0.35em] text-[#cabffd]">
              <span aria-hidden="true">✦</span>
              Our Unifying Mission
            </span>
            <div className="space-y-4">
              <h2 id="mission-heading" className="text-4xl font-bold leading-tight sm:text-5xl lg:text-[3.25rem]">
                <GradientText preset="purple" animate="flow">
                  To Build the Liquid Marketplace Global Finance Deserves
                </GradientText>
              </h2>
              <p id="mission-description" className="text-base text-gray-300 sm:text-lg">
                We believe your wealth should move at the speed of the internet, not the pace of legacy banking. Brik&apos;s mission is to unify tokenized assets—from U.S. Treasuries to fractional real estate—providing instant, 24/7 liquidity, security, and global scale for every investor.
              </p>
            </div>
          </header>

          <ul className="flex flex-col gap-4 text-sm text-gray-200 sm:text-base" aria-label="Key mission outcomes">
            {[
              'Built-in compliance and security that proactively handles the Legitimacy and Security Objections',
              'Aggregating all top RWAs across multiple chains for seamless, 24/7 swapping and instant settlement',
              'Fractional ownership and low entry barriers that provide retail investors access to assets previously exclusive to institutions',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  className="mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#22d3ee]"
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Link
              href="/swap"
              className="inline-flex items-center justify-center rounded-full bg-[#7c3aed] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(124,58,237,0.35)] transition-colors hover:bg-[#6d28d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4b5fd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#13131a] font-burbank"
            >
              Swap Volatility for Stability
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#13131a] font-burbank"
            >
              Explore All Tokenized Assets
            </Link>
          </div>
        </div>

        <aside className="w-full max-w-[420px]">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm shadow-[0_24px_60px_rgba(76,29,149,0.35)]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase nothingclass[0.2em] text-white/70">
              <span>Our Impact: Driving the $16.3T Tokenized Future</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] text-white/60">Verified</span>
            </div>
            <div className="mt-6 flex items-baseline gap-3">
              <p className="text-4xl font-bold text-white sm:text-5xl">$16.3T</p>
              <span className="text-sm font-medium text-emerald-300">tokenized market by 2030</span>
            </div>
            <p className="mt-4 text-sm text-gray-200">
              Leading analysts at Boston Consulting Group project the tokenized asset market to hit $16.3T by 2030. Brik is building the foundational technology that makes this value instantly tradable, programmable, and radically transparent across borders
            </p>
            <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-black/40 p-5">
              <div className="flex items-center justify-between text-sm text-gray-200">
                <span>Median settlement latency</span>
                <span className="font-semibold text-white">3m 12s</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-200">
                <span>Custodied asset verification</span>
                <span className="font-semibold text-emerald-300">Live attestation</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-200">
                <span>Cross-chain coverage</span>
                <span className="font-semibold text-white">8 networks</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
