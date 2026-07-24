import HaendlerKonfigurator from '@/components/HaendlerKonfigurator';

export const metadata = {
  title: 'Händler-Konfigurator — KUTUHARF',
  description: 'Konfigurator zu Händlerkonditionen — nur für freigeschaltete Händler & Werbeagenturen.',
  robots: { index: false, follow: false },
};

export default function HaendlerKonfiguratorPage() {
  return <HaendlerKonfigurator />;
}
