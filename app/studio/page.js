import StudioClient from '@/components/studio/StudioClient';

// Tasarım Stüdyosu — mevcut konfigüratör (ana sayfa) hiç etkilenmez, stüdyo ayrı
// rotada yaşar. Plan: STUDIO-PLAN.md
// Entwurflar online sipariş edilmez; akış her zaman teklif talebiyle sonuçlanır.
export const metadata = {
  title: 'Schilder-Designer — Leuchtschild online gestalten | KUTUHARF',
  description:
    'Gestalten Sie Ihr Leuchtschild online: Schriftzug, Logo, Formen und Maße frei platzieren, Farben und Beleuchtung wählen — mit Sofort-Preisvorschau und Angebot. Deutschlandweiter Versand.',
  alternates: { canonical: '/studio' },
};

export default function StudioPage() {
  return <StudioClient />;
}
