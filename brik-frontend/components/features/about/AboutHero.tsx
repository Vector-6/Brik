import { GradientText } from '@/components/ui/common';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

// Conversion-Optimized Hero Component
// Strategic Framework: Dual-audience (DeFi natives + TradFi investors)
// Psychological Triggers: Curiosity, Pain Agitation, Hope, Unity (common enemy)
// Accessibility: WCAG AAA contrast, semantic HTML, keyboard navigation
// Design Principles: Visual hierarchy, emotional impact, responsive layout
export default function AboutHero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-labelledby="about-hero-heading"
    >
      {/* Subtle gradient background with noise texture for depth */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#1C1C1C] via-[#1A1A24] to-[#1C1C1C]"
        aria-hidden="true"
      />

      {/* Ambient light effects for visual interest */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#6107E0] rounded-full blur-[150px] opacity-[0.08]"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00bf63] rounded-full blur-[140px] opacity-[0.06]"
        aria-hidden="true"
      />

      {/* 12-column grid container with generous spacing */}
      <div className="relative z-10 w-full container mx-auto px-6 lg:px-16 xl:px-20 py-20 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center">

          {/* Left column (6 columns) - Typography and CTAs */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-7 lg:space-y-9">

            {/* Main heading - Hierarchy: Primary visual priority */}
            <h1
              id="about-hero-heading"
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.15] nothingclasstight animate-gradient"
              style={{
                background: 'linear-gradient(90deg, #870BDD 0%, #FF0CE7 100%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Where Digital Meets Physical. Where Instant Meets Real.
            </h1>

            {/* Tagline - Hierarchy: Secondary level */}
            <h2 className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-200 leading-[1.5]">
              Real estate. U.S. Treasuries. Commodities. Trade them like tokens. 24/7.
            </h2>

            {/* Description - Comfortable reading contrast */}
            <p className="text-sm sm:text-base lg:text-lg text-gray-400 leading-[1.7] max-w-[540px] mx-auto lg:mx-0">
              Swap tokenized real assets as easily as you swap crypto. Instant settlement. Global access. Real-world yields without the traditional finance headaches.
            </p>

            {/* CTA buttons - Action-focused for conversion */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-6">
              <a
                href="/explore"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[#1C1C1C] bg-[#FFD600] font-semibold text-base whitespace-nowrap transition-all duration-300 hover:bg-[#f6d42c] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#FFD600]/50 font-burbank"
                aria-label="Explore available real-world assets on Brik"
              >
                Explore Real Assets
                <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
              </a>
              <a
                href="#mission"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold text-base whitespace-nowrap transition-all duration-300 hover:bg-white/10 hover:border-white/30 focus:outline-none focus:ring-4 focus:ring-white/20 font-burbank"
                aria-label="Learn how Brik works and our mission"
              >
                How Brik Works
              </a>
            </div>
          </div>

          {/* Right column (6 columns) - Enhanced card showcase */}
          <div className="lg:col-span-6 hidden lg:flex justify-end items-center relative h-[500px]">

         <Image src="/images/about-hero.svg" alt='About Section Hero' aria-hidden width={1080} height={1080}/>

          </div>
        </div>
      </div>
    </section>
  );
}
