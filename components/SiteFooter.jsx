'use client';
import Link from 'next/link';
import { useT } from '@/components/LocaleProvider';

export default function SiteFooter() {
  const t = useT();
  return (
    <footer className="bg-charcoal px-12 py-12 max-sm:px-6">
      <div className="max-w-[1100px] mx-auto flex flex-wrap items-start justify-between gap-8">
        <div className="flex flex-col gap-3">
          <span className="text-lg font-extrabold text-white tracking-wide">
            KUTU<span className="text-accentlite">HARF</span>
          </span>
          <span className="text-[15px] text-mutedark">
            3D-Buchstaben & Leuchtbuchstaben nach Maß
          </span>
          <span className="text-[15px] text-mutedark">Mil Werbung Marketing</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-accentlite text-[13px] font-bold tracking-[0.08em] uppercase">{t('footer.beratung')}</span>
          <a href="tel:+491749623344" className="text-[15px] text-lighttxt hover:text-accentlite">
            +49 174 962 33 44
          </a>
          <a href="mailto:info@kutuharf.eu" className="text-[15px] text-lighttxt hover:text-accentlite">
            info@kutuharf.eu
          </a>
          <Link href="/kontakt" className="text-[15px] text-lighttxt hover:text-accentlite">
            {t('footer.kontaktLink')}
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-accentlite text-[13px] font-bold tracking-[0.08em] uppercase">{t('footer.rechtliches')}</span>
          <Link href="/impressum" className="text-[15px] text-lighttxt hover:text-accentlite">{t('footer.impressum')}</Link>
          <Link href="/datenschutz" className="text-[15px] text-lighttxt hover:text-accentlite">{t('footer.datenschutz')}</Link>
          <Link href="/agb" className="text-[15px] text-lighttxt hover:text-accentlite">{t('footer.agb')}</Link>
        </div>
      </div>
    </footer>
  );
}
