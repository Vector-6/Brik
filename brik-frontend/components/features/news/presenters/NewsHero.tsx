/**
 * NewsHero Component
 * Hero section for the news page with title and description
 */

'use client';

import { LazyMotion, domAnimation, m } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { GradientText } from '@/components/ui/common';

// ============================================================================
// Types
// ============================================================================

interface NewsHeroProps {
  /** Main heading text */
  title?: string;
  /** Subtitle/description text */
  subtitle?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show background pattern (deprecated - now handled by parent) */
  showBackground?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export function NewsHero({
  title = 'Latest RWA News & Insights',
  subtitle = 'Stay informed about real-world asset tokenization, market trends, and industry developments',
  className = '',
  showBackground: _showBackground = false, // Deprecated but kept for backwards compatibility
}: NewsHeroProps) {
  // Suppress unused variable warning by prefixing with underscore
  void _showBackground;
  void title; // Title is now hardcoded in the component

  return (
    <LazyMotion features={domAnimation}>
      <section className={`relative ${className}`}>
        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation - Consistent with asset detail page */}
          <nav aria-label="Breadcrumb" className="mb-6">
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
                <span className="text-white font-semibold" aria-current="page">
                  News
                </span>
              </li>
            </ol>
          </nav>

          {/* Header Content */}
          <div className="space-y-3">
            {/* Title - More compact, single line on desktop */}
          <h1 
            className="font-burbank mb-6 animate-gradient"
            style={{ 
              fontWeight: 700,
              fontSize: '74px',
              background: 'linear-gradient(90deg, #870BDD 0%, #FF0CE7 50%, #870BDD 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: '64px',
              letterSpacing: '0.02em',
              animation: 'gradient-flow 3s ease infinite'
            }}
          >Latest RWA News & Insights
            </h1>

            {/* Subtitle - More compact */}
            <m.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base md:text-lg text-gray-300 max-w-3xl leading-relaxed"
            >
              {subtitle}
            </m.p>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}

// ============================================================================
// Compact Hero Variant
// ============================================================================

interface CompactNewsHeroProps {
  /** Main heading text */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}

export function CompactNewsHero({
  title = 'RWA News',
  className = '',
}: CompactNewsHeroProps) {
  return (
    <LazyMotion features={domAnimation}>
      <section className={`py-8 text-center ${className}`}>
        <m.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl md:text-3xl font-bold text-white"
        >
          <span className="bg-gradient-to-r from-[#6107e0] via-[#7a3df2] to-[#ffd700] bg-clip-text text-transparent">
            {title}
          </span>~
        </m.h1>
      </section>
    </LazyMotion>
  );
}

// ============================================================================
// Export
// ============================================================================

export default NewsHero;
