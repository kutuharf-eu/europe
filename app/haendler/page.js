import HaendlerClient from '@/components/HaendlerClient';

export const metadata = {
  title: 'Händlerbereich — KUTUHARF',
  description: 'Anmeldung und Registrierung für Händler & Werbeagenturen — Preise zu Händlerkonditionen.',
  robots: { index: false, follow: false },
};

export default function HaendlerPage() {
  return <HaendlerClient />;
}
