/**
 * NewsArticleSchema Component
 * Adds structured data (JSON-LD) for SEO
 */

'use client';

import { NewsArticle } from '@/lib/types/news.types';

interface NewsArticleSchemaProps {
  article: NewsArticle;
}

export function NewsArticleSchema({ article }: NewsArticleSchemaProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.description,
    "image": article.imageUrl,
    "datePublished": article.publishedAt,
    "author": {
      "@type": "Organization",
      "name": article.source
    },
    "publisher": {
      "@type": "Organization",
      "name": "Brik",
      "logo": {
        "@type": "ImageObject",
        "url": "https://brik.gg/images/new/logo1.jpg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
