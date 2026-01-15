'use client';

import { ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';

export default function ExploreCTA() {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#1c1c1c] py-28 sm:py-32 px-6"
      aria-labelledby="team-cta-heading"
    >
      {/* Ambient background: purple spotlights + subtle grid for depth */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Spotlights */}
        <div
          className="absolute -top-24 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full blur-3xl opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(closest-side, rgba(97,7,224,0.35), rgba(97,7,224,0.15) 40%, transparent 70%)'
          }}
        />
        <div
          className="absolute bottom-0 right-0 h-[28rem] w-[28rem] translate-x-1/4 translate-y-1/4 rounded-full blur-3xl opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(closest-side, rgba(97,7,224,0.25), rgba(97,7,224,0.1) 40%, transparent 70%)'
          }}
        />

        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: 'center'
          }}
        />
      </div>

      {/* Content card */}
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-8 sm:p-12 shadow-[0_0_0_1px_rgba(97,7,224,0.15),0_30px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-md">
          {/* Decorative conic glow */}
          <div
            className="pointer-events-none absolute -inset-px -z-10 rounded-3xl opacity-30 blur-2xl"
            style={{
              background:
                'conic-gradient(from 140deg at 50% 50%, rgba(97,7,224,0.35), transparent 40%, transparent 60%, rgba(97,7,224,0.35))'
            }}
            aria-hidden="true"
          />

          <div className="mx-auto max-w-4xl text-center">
            {/* Icon chip */}
            <div
              className="mx-auto mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ring-white/10"
              style={{
                background:
                  'linear-gradient(135deg, rgba(97,7,224,0.18) 0%, rgba(97,7,224,0.04) 100%)'
              }}
              aria-hidden="true"
            >
              <Users className="h-8 w-8 text-[#8F5BFF]" />
            </div>

            {/* Heading */}
            <h2
              id="team-cta-heading"
              className="mb-5 text-4xl font-bold nothingclasstight text-white sm:text-5xl md:text-6xl"
            >
              <span className="bg-gradient-to-r from-white via-white to-[#CBB6FF] bg-clip-text text-transparent">
                Ready to End Financial Fragmentation?
              </span>
            </h2>

            {/* Supporting text */}
            <p className="mx-auto mb-10 max-w-3xl text-lg sm:text-xl leading-relaxed text-gray-300">
              You&apos;ve seen the future of liquid, institutional-grade assets. Stop letting slow, fragmented markets hold your capital captive. Start your journey by claiming the 24/7 liquidity and real yield you deserve.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/explore"
                className="group inline-flex items-center gap-3 rounded-xl px-7 py-4 text-lg font-semibold text-white transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6107E0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c]"
                style={{
                  background:
                    'linear-gradient(135deg, #8B5CF6 0%, #6107E0 60%)',
                  boxShadow: '0 10px 40px rgba(97, 7, 224, 0.35)'
                }}
              >
                Explore All Tokenized Assets
                <ArrowRight
                  className="h-5 w-5 translate-x-0 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-7 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c]"
              >
                Connect with Our Dedicated RWA Liquidity Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
