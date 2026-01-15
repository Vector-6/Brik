/**
 * Asset Detail Page Container
 * Main orchestrator for the asset detail page
 * Handles data fetching, state management, and component composition
 */

"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useAssetDetail } from "../hooks/useAssetDetail";
import { useSimilarAssets } from "../hooks/useSimilarAssets";
import AssetDetailHeader from "../presenters/AssetDetailHeader";
import AssetMetricsGrid from "../presenters/AssetMetricsGrid";
import AssetAboutSection from "../presenters/AssetAboutSection";
import AssetChainsList from "../presenters/AssetChainsList";
import SimilarAssetsCarousel from "../presenters/SimilarAssetsCarousel";
import AssetDetailChart from "../presenters/AssetDetailChart";
import AssetDetailError from "../presenters/AssetDetailError";
import StickyCTAButton from "../presenters/StickyCTAButton";
import { AssetDetailPageSkeleton } from "../skeletons/AssetDetailSkeletons";

// ============================================================================
// Types
// ============================================================================

interface AssetDetailPageContainerProps {
  assetId: string;
}

// ============================================================================
// Component
// ============================================================================

export default function AssetDetailPageContainer({
  assetId,
}: AssetDetailPageContainerProps) {
  // Fetch asset detail data
  const {
    data: asset,
    isLoading: isLoadingAsset,
    error: assetError,
    refetch: refetchAsset,
  } = useAssetDetail(assetId);

  // Fetch similar assets (only if main asset loaded successfully)
  const {
    data: similarAssets,
    isLoading: isLoadingSimilar,
    error: similarError,
  } = useSimilarAssets(assetId, 8);

  // ============================================================================
  // Loading State
  // ============================================================================

  if (isLoadingAsset) {
    return <AssetDetailPageSkeleton />;
  }

  // ============================================================================
  // Error State
  // ============================================================================

  if (assetError || !asset) {
    return (
      <AssetDetailError
        error={assetError || new Error("Asset not found")}
        assetId={assetId}
        onRetry={refetchAsset}
      />
    );
  }

  // ============================================================================
  // Success State
  // ============================================================================

  return (
    <div className="min-h-screen relative bg-gradient-to-br mt-24 lg:mt-32 from-[#1c1c1c] via-[#1b1b1b] to-[#161616]">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[rgba(97,7,224,0.12)] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[rgba(255,215,0,0.08)] rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <main id="maincontent" className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-2 text-gray-400 hover:text-[#ffd700] transition-colors duration-200"
                >
                  <Home className="w-4 h-4" aria-hidden="true" />
                  <span>Home</span>
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </li>
              <li>
                <Link
                  href="/explore"
                  className="text-gray-400 hover:text-[#ffd700] transition-colors duration-200"
                >
                  Explore
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </li>
              <li>
                <span className="text-white font-semibold" aria-current="page">
                  {asset.name}
                </span>
              </li>
            </ol>
          </nav>

          {/* Asset Detail Header */}
          <AssetDetailHeader asset={asset} />

          {/* Asset Metrics Grid */}
          <AssetMetricsGrid asset={asset} />

          {/* Price Chart */}
          <section className="mb-12">
            <AssetDetailChart 
              symbol={asset.symbol} 
              tokenName={asset.name}
              className="w-full"
            />
          </section>

          {/* Asset About Section */}
          <AssetAboutSection asset={asset} />

          {/* Available Chains */}
          <AssetChainsList
            chains={asset.chainsAvailable}
            contracts={asset.contracts}
          />

          {/* Similar Assets Carousel */}
          <SimilarAssetsCarousel
            assets={similarAssets || []}
            currentAssetId={assetId}
            isLoading={isLoadingSimilar}
            error={similarError}
          />
        </div>
      </main>

      {/* Sticky CTA Button */}
      <StickyCTAButton asset={asset} />
    </div>
  );
}
