// Kutu-Harf-Modul v2 — AYRI TEST ORTAMI (Brief: CLAUDE-CODE-BRIEF-kutu-harf-modul-v2.md).
// Canlı konfigüratörden (/) tamamen bağımsız; noindex — arama motorlarına kapalı.
// İÇ ARAÇ: ham maliyetler ve marjlar görünür → production'da kilitli. Canlıda açmak
// için Vercel'e MOTOR_TEST_ACIK=1 env değişkeni eklenir (önerilmez; lokalde kullan).
import { notFound } from 'next/navigation';
import PriceWizard from '@/components/PriceWizard';

export const metadata = {
  title: 'Kutu Harf Fiyat Motoru — Test | KUTUHARF',
  robots: { index: false, follow: false },
};

export default function MotorTestPage() {
  if (process.env.NODE_ENV === 'production' && process.env.MOTOR_TEST_ACIK !== '1') notFound();
  return (
    <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
      <p className="m-0 text-[11px] font-bold uppercase tracking-[0.2em] text-textmut">Glyph tabanlı metraj · Bottom-up maliyet · Test v2</p>
      <h1 className="mt-1 mb-6 text-[26px] sm:text-[34px] font-black text-charcoal leading-tight">
        Kutu Harf <span className="text-accent">Fiyat Motoru</span>
      </h1>
      <PriceWizard view="internal" />
    </main>
  );
}
