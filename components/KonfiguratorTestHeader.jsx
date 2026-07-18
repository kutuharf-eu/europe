'use client';
// Studio-Hero (17 Tem 2026): Vollbild-Hintergrundfoto (public/images/kutuharfduvar.webp —
// dunkle Wand, rückleuchtender 3D-Schriftzug rechts). Text/CTAs links über der leeren
// Wandfläche, Lesbarkeit über einen Links-nach-rechts-Verlauf; unten Blend in den Seiten-BG.
import Link from 'next/link';
import Image from 'next/image';
import { useT } from '@/components/LocaleProvider';
import { Tag, Type, Truck } from 'lucide-react';

export default function KonfiguratorTestHeader() {
  const t = useT();
  const scrollToStart = (e) => {
    e.preventDefault();
    document.getElementById('kh-step-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <header className="relative overflow-hidden">
      {/* Zemin: ışıklı harfler sağda kalsın diye sağa çapalı; mobilde %72 ile kısmen görünür */}
      <Image
        src="/images/kutuharfduvar.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[72%_center] min-[920px]:object-right"
      />
      {/* Sol karartma (metin zemini) + alta sayfa arka planına geçiş */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(7,6,21,0.93) 0%, rgba(7,6,21,0.72) 34%, rgba(7,6,21,0.25) 58%, rgba(7,6,21,0) 78%),' +
            'linear-gradient(0deg, rgba(7,6,21,0.9) 0%, rgba(7,6,21,0) 22%)',
        }}
      />
      <div className="relative px-12 max-sm:px-6 py-24 max-sm:py-14 min-[920px]:min-h-[480px] flex items-center">
        <div className="max-w-[1180px] mx-auto w-full">
          {/* Sol: mesaj + CTA'lar + güven satırı */}
          <div className="flex flex-col gap-5 max-w-[560px]">
            <span className="text-accent text-[14px] font-bold tracking-[0.1em] uppercase border-l-4 border-accent pl-3">
              {t('konfig3.pageKicker')}
            </span>
            <h1 className="m-0 text-5xl max-sm:text-4xl font-extrabold text-charcoal leading-[1.04]">
              {t('konfig3.heroHead1')}<br />{t('konfig3.heroHead2')}
            </h1>
            <p className="m-0 text-lg max-sm:text-base leading-relaxed text-mutedark max-w-[520px]">{t('konfig3.pageIntro')}</p>
            <div className="flex flex-wrap gap-3 mt-1">
              <a href="#kh-step-1" onClick={scrollToStart}
                className="kh-glow-btn bg-accent px-7 py-3.5 text-[15px] font-bold cursor-pointer hover:brightness-95">
                {t('konfig3.heroCta')}
              </a>
              <Link href="/kontakt"
                className="border-2 border-linegray text-charcoal px-7 py-3.5 text-[15px] font-bold hover:border-accent bg-[rgba(7,6,21,0.35)]">
                {t('konfig3.heroCta2')}
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-textsec mt-1">
              <span className="inline-flex items-center gap-1.5"><Tag size={14} className="text-accent" /> {t('konfig3.heroTrust1')}</span>
              <span className="text-textmut">·</span>
              <span className="inline-flex items-center gap-1.5"><Type size={14} className="text-accent" /> {t('konfig3.heroTrust2')}</span>
              <span className="text-textmut">·</span>
              <span className="inline-flex items-center gap-1.5"><Truck size={14} className="text-accent" /> {t('konfig3.heroTrust3')}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
