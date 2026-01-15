/**
 * FAQ Page
 * Provides curated answers for common questions about the Brik platform.
 */

import type { Metadata } from 'next';
import { FAQPageClient } from './FAQPageClient';

export const metadata: Metadata = {
  title: 'Brik FAQ | Answers About Real-World Asset Trading',
  description:
    'Find quick answers about onboarding, pricing, security, and trading on Brik. Learn how to access tokenized real-world assets with full transparency.',
  keywords: [
    'Brik FAQ',
    'real-world assets',
    'tokenized assets',
    'RWA onboarding',
    'crypto compliance',
    'institutional crypto',
  ],
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'Brik FAQ',
    description:
      'Answers to the most common questions about accessing tokenized real-world assets with Brik.',
    url: 'https://brik.gg/faq',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brik FAQ',
    description:
      'Answers to the most common questions about accessing tokenized real-world assets with Brik.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FAQPage() {
  return <FAQPageClient />;
}
