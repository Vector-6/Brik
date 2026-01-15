/**
 * News Page
 * Main page component for the /news route
 */

import { Metadata } from 'next';
import { NewsPageClient } from './NewsPageClient';

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'Latest RWA News & Insights | Real-World Asset Tokenization | Brik',
  description: 'Stay informed about real-world asset tokenization, market trends, and industry developments. Get the latest news on RWA tokens, stablecoins, commodities, and crypto innovations.',
  keywords: ['RWA news', 'real-world assets', 'tokenization', 'crypto news', 'commodity tokens', 'stablecoins', 'blockchain news', 'DeFi news'],

  openGraph: {
    title: 'Latest RWA News & Insights',
    description: 'Stay informed about real-world asset tokenization, market trends, and industry developments',
    type: 'website',
    siteName: 'Brik',
    locale: 'en_US',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Latest RWA News & Insights',
    description: 'Stay informed about real-world asset tokenization and market trends',
  },

  alternates: {
    canonical: '/news',
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

// ============================================================================
// Page Component
// ============================================================================

export default function NewsPage() {
  return <NewsPageClient />;
}
