import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import KasseClient from './KasseClient';

export const metadata = {
  title: 'Kasse | KUTUHARF',
  robots: { index: false, follow: false },
};

export default function KassePage() {
  return (
    <div className="min-h-screen bg-white text-charcoal">
      <div className="h-2 bg-accent" />
      <SiteNav />
      <KasseClient />
      <SiteFooter />
    </div>
  );
}
