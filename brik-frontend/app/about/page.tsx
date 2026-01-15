import type { Metadata } from 'next';
import AboutHero from '@/components/features/about/AboutHero';
import ProblemSolution from '@/components/features/about/ProblemSolution';
import Mission from '@/components/features/about/Mission';
import Vision from '@/components/features/about/Vision';
import WhyBrik from '@/components/features/about/WhyBrik';
import Values from '@/components/features/about/Values';
import TeamCTA from '@/components/features/about/ExploreCTA';

export const metadata: Metadata = {
  title: 'About Brik - The Vault for On-Chain Value | DeFi RWA Platform',
  description: 'Brik.gg is a DeFi-native platform built to unify the fragmented Real-World Asset (RWA) ecosystem. Trade tokenized commodities, treasuries, real estate, and more in one seamless on-chain experience.',
  keywords: [
    'about brik',
    'real-world assets',
    'RWA platform',
    'tokenized assets',
    'DeFi infrastructure',
    'multi-chain trading',
    'asset tokenization',
    'blockchain assets',
    'institutional DeFi',
    'unified RWA hub'
  ],

  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://brik.gg/about',
    siteName: 'Brik',
    title: 'About Brik - The Vault for On-Chain Value',
    description: 'Discover how Brik.gg is building the trusted gateway for the tokenized world — where institutional-grade assets meet the openness of DeFi.',
    images: [
      {
        url: '/images/og-about.png',
        width: 1200,
        height: 630,
        alt: 'About Brik - Unified RWA Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@BrikRWA',
    creator: '@BrikRWA',
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1C1C1C] via-[#1A1A24] to-[#1C1C1C]">
      <article id="main-content">
        <AboutHero />
        <ProblemSolution />
        <Mission />
        <Vision />
        <WhyBrik />
        <Values />
        <TeamCTA />
      </article>
    </main>
  );
}
