import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import KonfiguratorTest from '@/components/KonfiguratorTest';
import KonfiguratorTestHeader from '@/components/KonfiguratorTestHeader';

export const metadata = {
  title: 'KUTUHARF — 3D-Buchstaben & Leuchtbuchstaben Konfigurator',
  description:
    'LED-Leuchtbuchstaben und 3D-Buchstaben online konfigurieren: Schriftzug, Maße, Beleuchtung, Material und Farbe wählen — Sofortpreis und Angebot in Minuten. Deutschlandweiter Versand.',
};

export default function HomePage() {
  // theme-studio: koyu premium "3D Tabela Stüdyosu" teması yalnız bu sayfada —
  // token override'ları globals.css'te, diğer sayfalar açık temada kalır.
  return (
    <div className="theme-studio min-h-screen bg-sectionlight text-charcoal">
      <div className="h-2 bg-accent" />
      <SiteNav />

      <div className="kh-beams">
        <KonfiguratorTestHeader />

        <main className="px-12 py-14 max-sm:px-6">
          <div className="max-w-[1180px] mx-auto">
            <KonfiguratorTest />
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
