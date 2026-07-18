import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import WarenkorbClient from './WarenkorbClient';

export const metadata = {
  title: 'Warenkorb | KUTUHARF',
  description:
    'Ihr Warenkorb bei KUTUHARF: konfigurierte 3D-Buchstaben und Leuchtbuchstaben prüfen und bestellen. Deutschlandweiter Versand.',
  robots: { index: false },
};

export default function WarenkorbPage() {
  // theme-studio: Warenkorb gehört zum Konfigurator-Flow → gleiche koyu Studio-Optik
  return (
    <div className="theme-studio min-h-screen bg-sectionlight text-charcoal">
      <div className="h-2 bg-accent" />
      <SiteNav />
      <div className="kh-beams">
        <WarenkorbClient />
      </div>
      <SiteFooter />
    </div>
  );
}
