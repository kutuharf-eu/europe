'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import LangSwitcher from '@/components/LangSwitcher';
import { useT } from '@/components/LocaleProvider';

export default function SiteNav() {
  const t = useT();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));

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
              className={`text-[15px] font-semibold whitespace-nowrap ${pathname === l.href ? 'text-accentlite' : 'text-lighttxt hover:text-accentlite'} ${l.href === '/' ? 'kh-nav-pulse' : ''}`}
            >
              {l.label}
            </Link>
          ))}
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
              className={`px-5 py-3.5 text-[16px] font-medium hover:text-accentlite ${l.href === '/' ? 'kh-nav-pulse' : 'text-lighttxt'}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="px-5 py-2"><LangSwitcher /></div>
        </div>
      )}
    </nav>
  );
}
