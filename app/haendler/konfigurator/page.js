import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import HaendlerKonfigurator from '@/components/HaendlerKonfigurator';

export const metadata = {
  title: 'Händler-Konfigurator — KUTUHARF',
  description: 'Konfigurator zu Händlerkonditionen — nur für freigeschaltete Händler & Werbeagenturen.',
  robots: { index: false, follow: false },
};

export default function HaendlerKonfiguratorPage() {
  return (
    <div className="theme-studio min-h-screen bg-sectionlight text-charcoal">
      <div className="h-2 bg-accent" />
      <SiteNav />
      <div className="kh-beams">
        <HaendlerKonfigurator />
      </div>
      <SiteFooter />
    </div>
  );
}
