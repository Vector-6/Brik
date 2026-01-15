'use client';

import { Layers, Building2, Link2, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GradientText } from '@/components/ui/common';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  delay: string;
}

const features: Feature[] = [
  {
    icon: Layers,
    title: 'Unified RWA Hub',
    description: "Stop juggling wallets and protocols. Brik aggregates all top RWA issuers (Ondo, RealT, etc.) into the world's most liquid secondary marketplace",
    color: '#8F5BFF',
    delay: '0s'
  },
  {
    icon: Building2,
    title: 'Institutional-Grade Assets',
    description: 'Access high-quality assets previously reserved for institutions—from tokenized U.S. Treasuries to private credit—with low minimums and full liquidity',
    color: '#ffd700',
    delay: '0.1s'
  },
  {
    icon: Link2,
    title: '24/7 Global Liquidity',
    description: 'Connect directly to 6 major networks. Your assets are instantly tradable, globally accessible, and verifiable 24 hours a day',
    color: '#23D6A0',
    delay: '0.2s'
  },
  {
    icon: Shield,
    title: 'Non-Custodial Control',
    description: 'Brik is non-custodial. You retain full control over your private keys, ensuring permanent property losses are eliminated and your funds are protected',
    color: '#6107E0',
    delay: '0.3s'
  }
];

export default function WhyBrik() {
  return (
    <section
      className="relative isolate overflow-hidden py-24 px-6 sm:py-28 sm:px-10"
      aria-labelledby="why-brik-heading"
      style={{ backgroundColor: '#1c1c1c' }}
    >
      {/* Background gradients and grid */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-x-0 top-0 h-60"
          style={{
            background:
              'linear-gradient(180deg, #1c1c1c 0%, rgba(28,28,28,0.9) 40%, rgba(28,28,28,0) 100%)'
          }}
        />
        <div
          className="absolute inset-x-[-40%] top-[-20%] h-[480px] rounded-full opacity-70 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at center, rgba(97, 7, 224, 0.35), rgba(97, 7, 224, 0))'
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-56"
          style={{
            background:
              'linear-gradient(180deg, rgba(28,28,28,0) 0%, rgba(28,28,28,0.9) 75%, #1c1c1c 100%)'
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16">
        <header className="mx-auto max-w-3xl text-center md:mx-0 md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: '#6107E0' }}
            />
            The Liquid Marketplace Advantage
          </span>
          <h2
            id="why-brik-heading"
            className="mt-6 text-4xl font-bold nothingclasstight sm:text-5xl md:text-6xl"
          >
            <GradientText preset="purple" animate="flow">
              Built to Eliminate Fragmentation and Unlock Real Liquidity.
            </GradientText>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-200 md:max-w-2xl">
            Your capital should never be trapped. Brik is the unified engine that aggregates every major RWA issuer, institutional-grade infrastructure, and multi-chain connectivity. Coordinate your swaps, analytics, and self-custody—all from your single, secure dashboard.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            {['All-RWA Aggregation', 'Verifiable Security', 'Instant, Global Swaps', 'Data-Driven Portfolio'].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </header>

        <ul className="grid gap-6 sm:gap-8 md:grid-cols-2" role="list">
          {features.map((feature) => (
            <li key={feature.title} className="relative">
              <article
                className="group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1c] p-8 transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_30px_80px_rgba(16,12,42,0.45)]"
                style={{ animationDelay: feature.delay }}
              >
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 20% 20%, ${feature.color}33, transparent 75%)`
                  }}
                  aria-hidden="true"
                />
                <div className="relative flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white transition-transform duration-300 motion-safe:group-hover:scale-105"
                    style={{ boxShadow: `0 20px 40px -20px ${feature.color}80` }}
                    aria-hidden="true"
                  >
                    <feature.icon className="h-7 w-7" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="relative mt-5 flex-1 text-base leading-relaxed text-gray-200">
                  {feature.description}
                </p>
                <div
                  className="relative mt-8 h-px w-full overflow-hidden rounded-full bg-white/10"
                  aria-hidden="true"
                >
                  <div
                    className="h-full w-0 origin-left transition-all duration-500 group-hover:w-full"
                    style={{ background: feature.color }}
                  />
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
