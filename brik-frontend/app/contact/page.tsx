import type { Metadata } from 'next';
import { ContactHero, ContactForms, ContactCTA } from '@/components/features/contact';

export const metadata: Metadata = {
  title: 'Contact Brik - Get in Touch | Share Your RWA Ideas',
  description: 'Connect with the Brik team. Ask questions, share feedback, or suggest the next real-world asset you\'d like to see tokenized on our platform.',
  keywords: [
    'contact brik',
    'brik support',
    'RWA suggestions',
    'tokenized assets feedback',
    'real-world assets platform',
    'contact brik team',
    'suggest RWA',
    'blockchain contact',
    'DeFi support',
    'tokenization inquiry'
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://brik.gg/contact',
    siteName: 'Brik',
    title: 'Contact Brik - Let\'s Build the Future of Tokenized Finance',
    description: 'Reach out to the Brik team with questions, feedback, or RWA suggestions. Your voice shapes the future of our platform.',
    images: [
      {
        url: '/images/og-contact.png',
        width: 1200,
        height: 630,
        alt: 'Contact Brik - Get in Touch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@BrikRWA',
    creator: '@BrikRWA',
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br mt-20 from-[#1C1C1C] via-[#1A1A24] to-[#1C1C1C]">
      <article id="main-content">
        <ContactHero />
        <ContactForms />
        <ContactCTA />
      </article>
    </main>
  );
}
