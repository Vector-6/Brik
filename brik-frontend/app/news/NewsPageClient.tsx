'use client';

import { NewsPageContainer } from '@/components/features/news/containers/NewsPageContainer';

export function NewsPageClient() {
  return (
    <main className="min-h-screen bg-gradient-to-br mt-32 from-[#1c1c1c] via-[#1b1b1b] to-[#161616]">
      {/* Background Effects - Consistent with asset detail page */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[rgba(97,7,224,0.12)] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[rgba(255,215,0,0.08)] rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <NewsPageContainer
          pageSize={20}
          heroProps={{
            title: 'Latest RWA News & Insights',
            subtitle: 'Stay informed about real-world asset tokenization, market trends, and industry developments',
            showBackground: false, // Background now handled by parent
          }}
          onArticleClick={(article) => {
            // Analytics tracking
            console.log('Article clicked:', article.title);

            // Track with gtag if available
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'news_article_click', {
                event_category: 'engagement',
                event_label: article.id,
                article_id: article.id,
                article_title: article.title,
                article_category: article.category[0] || 'uncategorized'
              });
            }
          }}
        />
      </div>
    </main>
  );
}
