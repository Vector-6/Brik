'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Zap, TrendingUp } from 'lucide-react';
import { GradientText } from '@/components/ui/common';

const trustIndicators = [
  {
    icon: Shield,
    label: 'Bank-grade security',
  },
  {
    icon: Zap,
    label: 'Instant settlement',
  },
  {
    icon: TrendingUp,
    label: 'Live market pricing',
  },
];

export default function CTASection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#1c1c1c' }}
      aria-labelledby="cta-section-heading"
    >
      {/* Enhanced background layers inspired by about page */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {/* Grid pattern with fade at top */}
        <div
          className="absolute inset-0 opacity-[1]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.05) 100%)',
            WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.05) 100%)'
          }}
        />
        {/* Top fade gradient */}
        <div
          className="absolute inset-x-0 top-0 h-60"
          style={{
            background:
              'linear-gradient(180deg, #1c1c1c 0%, rgba(28,28,28,0.9) 40%, rgba(28,28,28,0) 100%)'
          }}
        />
        {/* Center purple glow - larger and more vibrant */}
        <div
          className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45 blur-[150px]"
          style={{
            background: 'radial-gradient(circle, rgba(97, 7, 224, 0.5), rgba(97, 7, 224, 0) 70%)',
          }}
        />
        {/* Gold accent glow - bottom left */}
        <div
          className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full opacity-25 blur-[130px]"
          style={{
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0) 70%)',
          }}
        />
        {/* Teal accent glow - top right */}
        <div
          className="absolute right-0 top-0 h-[450px] w-[450px] rounded-full opacity-22 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(35, 214, 160, 0.28), rgba(35, 214, 160, 0) 70%)',
          }}
        />
        {/* Bottom purplish fade gradient */}
        <div
          className="absolute inset-x-0 bottom-0 h-72"
          style={{
            background:
              'linear-gradient(180deg, rgba(28,28,28,0) 0%, rgba(97,7,224,0.15) 40%, rgba(97,7,224,0.25) 70%, rgba(28,28,28,0.95) 98%, #1c1c1c 100%)'
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-12 px-6 py-24 text-center lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center gap-8"
        >
          {/* Badge */}
          {/* <div className="inline-flex items-center gap-2 rounded-full border border-[#322042] bg-[#271338] px-5 py-2">
            <Sparkles className="h-4 w-4 text-[#ffd700]" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase nothingclass[0.4em] text-[#c4afff]">
              Join thousands of traders
            </span>
          </div> */}

          {/* Main Heading with Gradient */}
          <h2
            className="max-w-3xl font-burbank text-4xl font-extrabold  md:text-5xl"
            style={{
              background: 'linear-gradient(90deg, #870BDD 0%, #FF0CE7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Ready to trade Real World Assets on-chain?
          </h2>

          {/* Supporting Text */}
          <p className="max-w-2xl text-lg text-gray-300 md:text-xl">
            Start swapping between crypto and tokenized commodities in seconds. No intermediaries, no hassle.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut', delay: shouldReduceMotion ? 0 : 0.2 }}
          className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/swap"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl  px-10 py-5  font-bold bg-[#ffd700] text-[#1c1c1c] shadow-[0_0_40px_-15px_rgba(97,7,224,0.6)] transition hover:scale-105 text-xl hover:bg-[#4d06b3] hover:shadow-[0_0_50px_-10px_rgba(97,7,224,0.8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c] active:scale-95 sm:w-auto font-burbank"
          >
            Start Swapping
            <ArrowRight
              className="h-5 w-5 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/explore"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-transparent px-10 py-5 font-bold text-white transition hover:scale-105 hover:border-white/60 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6107E0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c] active:scale-95 sm:w-auto text-xl font-burbank"
          >
            Explore RWAs
          </Link>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: 'easeOut', delay: shouldReduceMotion ? 0 : 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 md:gap-10"
        >
          {trustIndicators.map((indicator) => (
            <div
              key={indicator.label}
              className="flex items-center gap-2 text-sm text-gray-400"
            >
              <indicator.icon className="h-5 w-5 text-[#ffd700]" aria-hidden="true" />
              <span className="font-medium">{indicator.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
