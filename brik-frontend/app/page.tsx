import Hero from '../components/ui/sections/Hero';
import HowItWorks from '../components/ui/sections/HowItWorks';
import SupportedRWAs from '../components/ui/sections/SupportedRWAs';
import PortfolioPreview from '../components/features/portfolio/PortfolioPreview';
import NewsInsights from '../components/ui/sections/NewsInsights';
import CTASection from '../components/ui/sections/CTASection';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div id="">
        <Hero />
        <HowItWorks />
        <SupportedRWAs />
        <PortfolioPreview />
        <NewsInsights />
        <CTASection />
      </div>
    </main>
  );
}
