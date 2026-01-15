import ExplorePageContainer from '@/components/features/explore/containers/ExplorePageContainer';
import { exploreMetadata } from './metadata';
import type { Metadata } from 'next';

/**
 * Explore Page
 * Browse and filter tokenized real-world assets
 */

// Export metadata for SEO
export const metadata: Metadata = exploreMetadata;

// Structured Data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Explore Real-World Assets',
  description: 'Discover and compare tokenized real-world assets including gold, stocks, and ETFs across multiple blockchains.',
  url: 'https://brik.gg/explore',
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
        name: 'Explore',
        item: 'https://brik.gg/explore',
      },
    ],
  },
  mainEntity: {
    '@type': 'ItemList',
    name: 'Real-World Asset Tokens',
    description: 'Collection of tokenized real-world assets available for trading',
    numberOfItems: 23,
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

export default function ExplorePage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="min-h-screen bg-[#1c1c1c]">
        <div id="main-content">
          <ExplorePageContainer />
        </div>
      </main>
    </>
  );
}
