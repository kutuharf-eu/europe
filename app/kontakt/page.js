import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import KontaktClient from './KontaktClient';

export const metadata = {
  title: 'Kontakt & Angebotsanfrage | KUTUHARF',
  description:
    'Kostenlose Beratung zu 3D-Buchstaben und Leuchtbuchstaben: Fragen Sie Ihre Wunschkonfiguration unverbindlich an. Deutschlandweiter Versand.',
};

export default async function KontaktPage({ searchParams }) {
  const params = await searchParams;
  // theme-studio: Angebotsformular im selben koyu Studio-Design wie der Konfigurator
  return (
    <div className="theme-studio min-h-screen bg-sectionlight text-charcoal">
      <div className="h-2 bg-accent" />
      <SiteNav />
      <div className="kh-beams">
        <KontaktClient kategorie={params.kategorie || ''} produkt={params.produkt || ''} />
      </div>
      <SiteFooter />
    </div>
  );
}
