import ProjektAnfrageClient from '@/components/ProjektAnfrageClient';

// Projekt-Anfrage: Buchstaben MIT Grundplatte/Profilkonstruktion — individuelles
// Angebot statt Online-Bestellung. Konfiguration kommt per sessionStorage mit.
export const metadata = {
  title: 'Projekt-Anfrage — 3D-Buchstaben mit Grundplatte oder Profil | KUTUHARF',
  description: 'Individuelles Angebot für 3D-Buchstaben mit Grundplatte oder Profilkonstruktion — deutschlandweiter Versand.',
  robots: { index: false, follow: true },
};

export default function ProjektAnfragePage() {
  return <ProjektAnfrageClient />;
}
