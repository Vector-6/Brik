/**
 * Portfolio Page Metadata
 * SEO and OpenGraph metadata for the portfolio page
 */

import { Metadata } from 'next';

export const portfolioMetadata: Metadata = {
  title: 'Your Portfolio | Track RWA Holdings | Brik',
  description:
    'View your complete portfolio of tokenized real-world assets. Track holdings, monitor performance, and manage your RWA investments across multiple blockchains.',
  keywords: [
    'portfolio',
    'RWA portfolio',
    'crypto portfolio',
    'real-world assets',
    'tokenized assets',
    'blockchain portfolio',
    'asset tracking',
    'DeFi portfolio',
  ],

  openGraph: {
    title: 'Your Portfolio | Brik',
    description:
      'Track your tokenized real-world asset holdings across multiple blockchains',
    type: 'website',
    siteName: 'Brik',
    locale: 'en_US',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Your Portfolio | Brik',
    description: 'Track your RWA holdings and monitor performance',
  },

  alternates: {
    canonical: '/portfolio',
  },

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
};
