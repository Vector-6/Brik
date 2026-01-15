/**
 * Portfolio Page
 * Main page component for the /portfolio route
 */

import { Metadata } from 'next';
import PortfolioPageContainer from '@/components/features/portfolio/containers/PortfolioPageContainer';
import { portfolioMetadata } from './metadata';

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = portfolioMetadata;

// ============================================================================
// Structured Data for SEO
// ============================================================================

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Portfolio',
  description:
    'Track your tokenized real-world asset holdings across multiple blockchains',
  url: 'https://brik.gg/portfolio',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://brik.gg',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Portfolio',
        item: 'https://brik.gg/portfolio',
      },
    ],
  },
  publisher: {
    '@type': 'Organization',
    name: 'Brik',
    url: 'https://brik.gg',
    logo: {
      '@type': 'ImageObject',
      url: 'https://brik.gg/images/new/logo1.jpg',
    },
  },
};

// ============================================================================
// Page Component
// ============================================================================

export default function PortfolioPage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <PortfolioPageContainer />
    </>
  );
}
