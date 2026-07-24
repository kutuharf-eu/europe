import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import HaendlerClient from '@/components/HaendlerClient';

export const metadata = {
  title: 'Händlerbereich — KUTUHARF',
  description: 'Anmeldung und Registrierung für Händler & Werbeagenturen — Preise zu Händlerkonditionen.',
  robots: { index: false, follow: false },
};

export default function HaendlerPage() {
  return (
    <div className="min-h-screen bg-sectionlight text-charcoal flex flex-col">
      <div className="h-2 bg-accent" />
      <SiteNav />
      <div className="flex-1"><HaendlerClient /></div>
      <SiteFooter />
    </div>
  );
}
