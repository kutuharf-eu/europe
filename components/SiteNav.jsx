'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import LangSwitcher from '@/components/LangSwitcher';
import { useT } from '@/components/LocaleProvider';
import { supabase } from '@/utils/supabaseClient';

// Händler durumu: giriş yoksa null; onaylı Händler ise 'approved' (nav'da yeşil rozet).
function useHaendlerStatus() {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    let alive = true;
    const read = async (session) => {
      if (!session?.user?.id) { if (alive) setStatus(null); return; }
      const { data } = await supabase
        .from('kutuharf_profiles').select('status,role').eq('id', session.user.id).single();
      if (alive) setStatus(data?.role === 'haendler' ? data.status : null);
    };
    supabase.auth.getSession().then(({ data }) => read(data?.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => read(s));
    return () => { alive = false; sub?.subscription?.unsubscribe?.(); };
  }, []);
  return status;
}

export default function SiteNav() {
  const t = useT();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const haendlerStatus = useHaendlerStatus();

  // Nav Händler göstergesi: onaylı → yeşil rozet ("çalışıyor" sinyali); değilse ince link.
  const haendlerChip = haendlerStatus === 'approved' ? (
    <Link href="/haendler" onClick={() => setMobileOpen(false)}
      className="inline-flex items-center gap-1 bg-accentlite text-charcoal text-[13px] font-extrabold px-2.5 py-1.5 rounded whitespace-nowrap">
      ★ Händler
    </Link>
  ) : (
    <Link href="/haendler" onClick={() => setMobileOpen(false)}
      className="text-[15px] font-semibold text-lighttxt hover:text-accentlite whitespace-nowrap">
      Händler
    </Link>
  );

  const links = [
    { href: '/', label: t('nav.konfigurator') },
    { href: '/kontakt', label: t('footer.contact', null, 'Kontakt') },
  ];

  const cartButton = (
    <Link
      href="/warenkorb"
      onClick={() => setMobileOpen(false)}
      aria-label={t('nav.cartOpen')}
      className="relative p-2 text-white hover:text-accentlite"
    >
      <ShoppingBag size={22} />
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-black w-[18px] h-[18px] flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  );

  return (
    <nav className="relative z-50 bg-charcoal">
      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-between gap-8 px-6 min-h-[72px]">
        <Link href="/" className="text-lg font-extrabold text-white tracking-wide whitespace-nowrap">
          KUTU<span className="text-accentlite">HARF</span>
        </Link>
        <div className="flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={l.href === '/'
                ? 'kh-nav-pulse text-[15px] whitespace-nowrap'
                : `text-[15px] font-semibold whitespace-nowrap ${pathname === l.href ? 'text-accentlite' : 'text-lighttxt hover:text-accentlite'}`}
            >
              {l.label}
            </Link>
          ))}
          {haendlerChip}
          <LangSwitcher />
          {cartButton}
        </div>
      </div>

      {/* Mobil */}
      <div className="flex sm:hidden items-center justify-between gap-2 px-4 min-h-[60px]">
        <Link href="/" onClick={() => setMobileOpen(false)} className="text-base font-extrabold text-white tracking-wide whitespace-nowrap">
          KUTU<span className="text-accentlite">HARF</span>
        </Link>
        <div className="flex items-center gap-1">
          {cartButton}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? t('nav.menuClose') : t('nav.menuOpen')}
            className="bg-transparent border-none cursor-pointer p-2 text-white hover:text-accentlite"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-charcoal border-t border-white/10 shadow-dropdown flex flex-col pb-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={l.href === '/'
                ? 'kh-nav-pulse self-start mx-5 my-2 text-[15px]'
                : 'px-5 py-3.5 text-[16px] font-medium text-lighttxt hover:text-accentlite'}
            >
              {l.label}
            </Link>
          ))}
          <div className="px-5 py-2">{haendlerChip}</div>
          <div className="px-5 py-2"><LangSwitcher /></div>
        </div>
      )}
    </nav>
  );
}
