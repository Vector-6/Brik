/**
 * ImageWithFallback Component
 * Displays article image with branded fallback for missing/failed images
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';

// ============================================================================
// Types
// ============================================================================

interface ImageWithFallbackProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Fill mode for next/image */
  fill?: boolean;
  /** Image sizes for responsive loading */
  sizes?: string;
  /** Loading strategy */
  loading?: 'lazy' | 'eager';
  /** Priority loading for LCP images */
  priority?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the image */
  imageClassName?: string;
}

// ============================================================================
// Fallback Component
// ============================================================================

function BrandedFallback() {
  return (
    <div className="relative w-full h-full bg-[#2a2a2a]">
      <Image
        src="/images/new/banner.jpg"
        alt="Brik News Default Banner"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ImageWithFallback({
  src,
  alt,
  fill = true,
  sizes,
  loading = 'lazy',
  priority = false,
  className = '',
  imageClassName = '',
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if src is empty or invalid
  const shouldShowFallback = !src || src.trim() === '' || hasError;

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (shouldShowFallback) {
    return (
      <div className={className}>
        <BrandedFallback />
      </div>
    );
  }

  return (
    <div className={className}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        loading={loading}
        priority={priority}
        className={imageClassName}
        onError={handleError}
        onLoad={handleLoadingComplete}
      />

      {/* Loading state overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
    </div>
  );
}

// ============================================================================
// Export
// ============================================================================

export default ImageWithFallback;
