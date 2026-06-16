import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { HeroSection } from './sections/HeroSection';

// Lazy load below-the-fold sections to reduce initial bundle size
const TimelineSection = dynamic(() => import('./sections/TimelineSection').then(m => ({ default: m.TimelineSection })), {
  loading: () => <div className="min-h-screen" />,
});
const LiveHeatmapSection = dynamic(() => import('./sections/LiveHeatmapSection').then(m => ({ default: m.LiveHeatmapSection })), {
  loading: () => <div className="py-32" />,
});
const CommunityShowcaseSection = dynamic(() => import('./sections/CommunityShowcaseSection').then(m => ({ default: m.CommunityShowcaseSection })), {
  loading: () => <div className="py-32" />,
});
const StatsSection = dynamic(() => import('./sections/StatsSection').then(m => ({ default: m.StatsSection })), {
  loading: () => <div className="py-20" />,
});
const FeaturesSection = dynamic(() => import('./sections/FeaturesSection').then(m => ({ default: m.FeaturesSection })), {
  loading: () => <div className="py-32" />,
});
const SecuritySection = dynamic(() => import('./sections/SecuritySection').then(m => ({ default: m.SecuritySection })), {
  loading: () => <div className="py-32" />,
});
const FAQSection = dynamic(() => import('./sections/FAQSection').then(m => ({ default: m.FAQSection })), {
  loading: () => <div className="py-32" />,
});
const FooterSection = dynamic(() => import('./sections/FooterSection').then(m => ({ default: m.FooterSection })), {
  loading: () => <div className="py-16" />,
});

export const metadata: Metadata = {
  title: 'Hometown Hub — Connect With Your Community',
  description: 'The hyperlocal platform where neighbors become friends. Share updates, organize events, preserve culture, and solve local problems.',
};

export default function LandingPage() {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      
      {/* Premium Showcase Sections — lazy loaded */}
      <TimelineSection />
      <LiveHeatmapSection />
      <CommunityShowcaseSection />

      <FeaturesSection />
      <SecuritySection />
      <FAQSection />
      <FooterSection />
    </main>
  );
}
