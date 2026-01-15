/**
 * Asset Detail Page
 * Dynamic route for individual RWA asset pages
 */

import { Metadata } from 'next';
import AssetDetailPageContainer from '@/components/features/asset-detail/containers/AssetDetailPageContainer';

// ============================================================================
// Types
// ============================================================================

interface AssetPageProps {
  params: Promise<{
    id: string;
  }>;
}

// ============================================================================
// Metadata
// ============================================================================

export async function generateMetadata({ params }: AssetPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `${id.toUpperCase()} - Asset Details | Brik`,
    description: `View detailed information about ${id.toUpperCase()} including price, market cap, volume, and more on Brik.`,
    openGraph: {
      title: `${id.toUpperCase()} - Asset Details | Brik`,
      description: `Explore ${id.toUpperCase()} - Real-World Asset on Brik`,
      type: 'website',
    },
  };
}

// ============================================================================
// Page Component
// ============================================================================

export default async function AssetPage({ params }: AssetPageProps) {
  const { id } = await params;

  return <AssetDetailPageContainer assetId={id} />;
}
