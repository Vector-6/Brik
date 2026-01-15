'use client';

import Image from "next/image";
import { GradientText } from '@/components/ui/common';

// Redesigned vision section: combines layered gradient storytelling with tactile cards for 2025 trend alignment.
// Focus areas: clear hierarchy, high-contrast typography, reduced-motion safety, and responsive flow.
export default function Vision() {
  return (
    <section
      className="relative overflow-hidden px-4 py-28 sm:px-8 lg:px-12"
      aria-labelledby="vision-heading"
    >
      {/* Gradient foundation with gentle parallax-style glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[#1c1c1c]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-24 right-[-10%] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-[#09b3f0]/30 via-transparent to-transparent blur-3xl opacity-80"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[-30%] left-[-10%] h-[480px] w-[480px] rounded-full bg-gradient-to-tr from-[#7c3aed]/40 via-transparent to-transparent blur-3xl opacity-70"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 lg:grid lg:max-w-7xl lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-20">
        <div className="flex flex-col gap-10 text-white">
          <div className="flex items-start gap-4">

            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase nothingclass[0.4em] text-[#c8c6ff]">
                <span aria-hidden="true">∞</span>
                The Era of Instant, Unified Value
              </span>

              <h2
                id="vision-heading"
                className="text-4xl font-bold leading-tight sm:text-5xl lg:text-[3.1rem]"
              >
                <GradientText preset="purple" animate="flow">
                  Unlocking the $16.3 Trillion Liquid Asset Universe
                </GradientText>
              </h2>

              <p className="text-base text-gray-300 sm:text-lg">
                <strong>We are building the unified ecosystem where every valuable asset is instantly liquid, globally accessible, and verifiable on-chain</strong>. This future eliminates the inefficiency of legacy finance, allowing people and institutions everywhere to move value at the speed of the internet.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="absolute inset-px rounded-[1.25rem] bg-gradient-to-br from-white/8 via-transparent to-transparent" aria-hidden="true" />
              <div className="relative z-10 flex flex-col gap-4">
                <h3 className="text-sm font-semibold uppercase nothingclass[0.28em] text-[#9b8dfc]">
                  Trust as a Programmable Layer
                </h3>
                <p className="text-[17px] font-semibold leading-tight text-white">
                  Compliance is not a hurdle; it&apos;s the foundation for liquidity. Automated verification and regulatory fidelity ensure market integrity and keep global trading flowing 24/7.
                </p>
                <ul className="space-y-3 text-sm text-gray-300" aria-label="Trust commitments">
                  {[
                    "Global Regulatory Reach: Onboarding processes compliant across 5+ major financial regulatory zones.",
                    "Immutable, Audit-Ready Records: Every transaction is instantly verifiable, providing the necessary data for institutional audit and reporting."
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 h-2.5 w-2.5 flex-none rounded-full bg-gradient-to-br from-[#22d3ee] to-[#a855f7]" aria-hidden="true" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#6107E0] p-6 shadow-[0_28px_60px_rgba(16,18,32,0.45)]">
              <div className="absolute right-[-20%] top-[-30%] h-40 w-40 rounded-full bg-gradient-to-br from-[#38bdf8]/80 via-transparent to-transparent blur-2xl" aria-hidden="true" />
              <div className="absolute bottom-[-15%] left-[-18%] h-32 w-32 rounded-full bg-gradient-to-tr from-[#a855f7]/70 via-transparent to-transparent blur-2xl" aria-hidden="true" />
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase nothingclass[0.28em] text-[#7dd3fc]">
                    The True Liquidity Mesh
                  </h3>
                  <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80">
                    INSTANT
                  </span>
                </div>
                <p className="text-[17px] font-semibold leading-tight text-white">
                  Capital moves without limits. A seamless, programmable mesh connects fractional RWAs directly with DeFi venues, allowing instant portfolio rebalancing between stability and yield.
                </p>
                <dl className="grid gap-4 text-sm text-gray-200" aria-label="Vision metrics">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-medium text-white">Cross-market latency</dt>
                    <dd className="text-[#7dd3fc]">&lt; 90s</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-medium text-white">Custody attestations</dt>
                    <dd className="text-emerald-300">Live feeds</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-medium text-white">Network reach</dt>
                    <dd className="text-[#c4b5fd]">12 chains</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center">
          <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-lg" aria-hidden="true" />
          <div className="relative flex w-full flex-col gap-8 rounded-[2.25rem] p-8 sm:p-10 lg:p-12">
            <div className="flex flex-col gap-6 text-center lg:text-left">
              <p className="text-xs font-semibold uppercase nothingclass[0.38em] text-[#94a3ff]">Visualizing the Bridge</p>
              <h3 className="text-3xl font-bold text-white sm:text-4xl">
                Where Institutional Trust Meets Web3 Openness
              </h3>
              <p className="mx-auto max-w-xl text-sm text-gray-300 sm:text-base lg:mx-0">
                <strong>Our aesthetic is deliberate.</strong> The blend of institutional reliability and neon clarity represents our core value: compliant capital can meet permissionless rails without ever compromising user trust or security.
              </p>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40" aria-hidden="true" />
              <Image
                src="/images/vault.png"
                alt="Vault-like bridge representing safeguarded yet open asset flow"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 540px, (min-width: 640px) 90vw, 95vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
