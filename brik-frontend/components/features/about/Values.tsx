'use client';

import { useRef, type ElementType } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowLeftRight, TrendingUp, Shield } from 'lucide-react';
import { GradientText } from '@/components/ui/common';

// Individual value card displayed in a compact grid
function ValueCard({
  icon: Icon,
  title,
  description,
  accentColor,
  index,
}: {
  icon: ElementType;
  title: string;
  description: string;
  accentColor: string;
  index: number;
}) {
  const baseDelay = index * 0.15;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: baseDelay, ease: [0.22, 1, 0.36, 1] }}
  className="group relative flex w-full flex-col gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-5 sm:p-6 shadow-[0_18px_48px_rgba(0,0,0,0.35)] transition-transform duration-400 hover:-translate-y-2"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120% 150% at 50% 0%, ${accentColor}22 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <div
        className="bg-black relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-xl"
        style={{
          boxShadow: `0 10px 25px ${accentColor}1f`,
          borderColor : `${accentColor}`,
        }}
      >
        <Icon className="h-6 w-6" style={{color:accentColor}} aria-hidden="true" />
      </div>

      <div className="relative z-10 space-y-2">
        <h3 className="text-xl font-semibold nothingclasstight text-white sm:text-2xl">
          {title}
        </h3>
        <p className="text-sm leading-6 text-white/70">
          {description}
        </p>
      </div>
    </motion.article>
  );
}

export default function Values() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-120px' });

  const values = [
    {
      icon: ArrowLeftRight,
      title: 'Liquidity',
      description: 'We commit to providing the most liquid secondary market for all RWAs, enabling 24/7, zero-friction swaps and instant portfolio rebalancing.',
      accentColor: '#6107E0',
    },
    {
      icon: TrendingUp,
      title: 'Verifiable Truth',
      description: "Every asset's backing and every transaction is verifiable on-chain using live attestation. We provide the truth; you provide the trust.",
      accentColor: '#3B82F6',
    },
    {
      icon: Shield,
      title: 'Non-Custodial Control',
      description: 'Our infrastructure is non-custodial. You retain full control of your assets and keys at all times, eliminating the risk of centralized failure.',
      accentColor: '#F59E0B',
    },
  ];

  const pillars = [
    {
      title: 'Aggregated RWA Access',
      description:
        "We aggregate the world's leading RWA issuers (Ondo, RealT, etc.) and asset classes—treasuries, gold, real estate—into one secure, cross-chain venue.",
    },
    {
      title: 'Institutional Data Fidelity',
      description: 'Track real-time portfolio performance, risk analytics, and settlement status using data fidelity built for institutional reporting and clarity.',
    },
    {
      title: 'Audit-Ready Security',
      description: 'Every interaction is anchored in decentralized infrastructure designed for institutional reliability.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#1c1c1c] px-6 py-24 sm:py-28 lg:py-36"
      aria-labelledby="values-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(120% 120% at 15% 10%, rgba(255,255,255,0.001), transparent 65%), radial-gradient(140% 140% at 85% 5%, rgba(255,255,255,0.004), transparent 70%), linear-gradient(180deg, rgba(255,255,255,0.005) 0%, transparent 45%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-8"
          style={{
            backgroundImage:
              'linear-gradient(0deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-20 lg:gap-24">
        <motion.div
          className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-8 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase nothingclass[0.25em] text-white/70">
              Our Foundational Commitments
            </div>
            <div className="space-y-6">
              <h2 id="values-heading" className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                <GradientText preset="purple" animate="flow">
                  The Three Pillars of Liquid Trust
                </GradientText>
              </h2>
              <p className="max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                We stand for a unified future, built on speed, verifiable truth, and accessibility. Our core values eliminate the friction, complexity, and opacity of traditional finance, ensuring every interaction on Brik reinforces confidence.
              </p>
            </div>

            <dl className="space-y-5 text-white/80">
              {pillars.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full bg-[#6107E0] shadow-[0_0_12px_rgba(97,7,224,0.6)]" aria-hidden="true" />
                  <div className="space-y-1">
                    <dt className="font-semibold text-white">{item.title}</dt>
                    <dd className="text-sm leading-6 text-white/65 sm:text-base">{item.description}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="mx-auto grid max-w-[720px] grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5">
              {values.map((value, index) => (
                <ValueCard key={value.title} {...value} index={index} />
              ))}
            </div>

            {/* Decorative accent behind grid (no alignment constraints) */}
            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
              <div
                className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
                style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.14), transparent 65%)' }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-4xl border-t border-white/10 pt-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-base font-medium leading-7 text-white/70 sm:text-lg">
            Unlock instant liquidity and institutional-grade confidence in a fragmented market <span className="text-white">that is the Brik mandate.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
