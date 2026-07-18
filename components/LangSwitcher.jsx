'use client';
import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { LOCALES, LOCALE_LABELS } from '@/data/i18n';
import { useLocale } from '@/components/LocaleProvider';

const LOCALE_NAMES = { de: 'Deutsch', tr: 'Türkçe', en: 'English' };

// DE/TR/EN als Dropdown-Menü.
export default function LangSwitcher({ className = '' }) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Sprache wählen"
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-bold tracking-wide cursor-pointer bg-transparent border border-white/25 text-lighttxt hover:text-accentlite hover:border-accentlite"
      >
        <Globe size={15} />
        {LOCALE_LABELS[locale]}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1 min-w-[150px] bg-white border border-linegray shadow-dropdown py-1 z-50 list-none m-0 pl-0"
        >
          {LOCALES.map((l) => (
            <li key={l} role="option" aria-selected={locale === l}>
              <button
                onClick={() => { setLocale(l); setOpen(false); }}
                className={`flex items-center gap-2 w-full px-4 py-2.5 text-left text-[14px] bg-transparent border-none cursor-pointer hover:bg-[#f6f6f6] ${locale === l ? 'text-accent font-bold' : 'text-charcoal'}`}
              >
                <span className="w-6 text-[12px] font-bold text-textmut">{LOCALE_LABELS[l]}</span>
                {LOCALE_NAMES[l]}
                {locale === l && <Check size={14} className="ml-auto text-accent" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
