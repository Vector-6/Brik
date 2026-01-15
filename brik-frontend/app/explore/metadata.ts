import type { Metadata } from 'next';

export const exploreMetadata: Metadata = {
  title: 'Explore Real-World Assets | Browse 23+ Tokenized Commodities & ETFs | Brik',
  description: 'Discover and compare 23+ tokenized real-world assets including gold, stocks, and ETFs. Filter by blockchain, APY, and market cap. Trade seamlessly across Ethereum, BSC, and more.',
  keywords: [
    'tokenized assets',
    'real-world assets',
    'RWA tokens',
    'tokenized gold',
    'tokenized ETFs',
    'blockchain commodities',
    'crypto trading',
    'DeFi assets'
  ],

  // Open Graph metadata
  openGraph: {
    title: 'Explore Real-World Assets | Tokenized Commodities on Brik',
    description: 'Browse and filter 23+ tokenized real-world assets. Compare yields, track performance, and invest in gold, ETFs, and more across multiple blockchains.',
    url: 'https://brik.gg/explore',
    siteName: 'Brik',
    type: 'website',
    images: [
      {
        url: '/images/og-explore.png',
        width: 1200,
        height: 630,
        alt: 'Brik Explore - Real-World Asset Marketplace',
      },
    ],
    locale: 'en_US',
  },

  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Real-World Assets | Tokenized Commodities',
    description: 'Discover 23+ tokenized assets including gold, stocks, and ETFs. Filter by chain, APY, and market cap.',
    images: ['/images/twitter-explore.png'],
    creator: '@BrikRWA',
    site: '@BrikRWA',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Canonical URL
  alternates: {
    canonical: 'https://brik.gg/explore',
  },

  // Additional metadata
  category: 'finance',
  classification: 'Real-World Assets, DeFi, Cryptocurrency',
};
