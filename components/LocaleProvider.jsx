'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { LOCALES, DEFAULT_LOCALE, translate } from '@/data/i18n';

const LocaleContext = createContext(null);

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export function LocaleProvider({ children }) {
  // Serverseitig und beim ersten Client-Render immer DEFAULT_LOCALE → keine Hydration-Diskrepanz.
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);

  useEffect(() => {
    const saved = readCookie('rs-lang');
    if (saved && LOCALES.includes(saved) && saved !== DEFAULT_LOCALE) setLocaleState(saved);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (l) => {
    if (!LOCALES.includes(l)) return;
    setLocaleState(l);
    document.cookie = `rs-lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext) || { locale: DEFAULT_LOCALE, setLocale: () => {} };
}

// Übersetzungs-Hook: t('nav.login') bzw. t('key', { var: 'x' }, 'Fallback')
export function useT() {
  const { locale } = useLocale();
  return (key, vars, fallback) => translate(locale, key, vars, fallback);
}
