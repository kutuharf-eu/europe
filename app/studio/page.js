import StudioClient from '@/components/studio/StudioClient';

// Tasarım Stüdyosu — Faz 0 (PoC): mevcut konfigüratör (ana sayfa) hiç etkilenmez,
// stüdyo tamamen ayrı rotada büyür. Plan: STUDIO-PLAN.md
export const metadata = {
  title: 'Schilder-Designer — Leuchtreklame online gestalten | KUTUHARF',
  description:
    'Gestalten Sie Ihr Leuchtschild online: Schriftzug, Logo und Maße frei platzieren — mit Preisvorschau. Deutschlandweiter Versand.',
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <StudioClient />;
}
