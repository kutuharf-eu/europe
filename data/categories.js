import { Lightbulb, Type } from 'lucide-react';

// KUTUHARF ist reiner 3D-Buchstaben-Konfigurator. Der frühere breite Katalog
// (Druckprodukte, digitale Menüs, Social Marketing, allgemeine Werbetechnik) war
// restaurantspezial-Erbe und ist entfernt — es bleibt nur das Konfigurator-Produkt.
export const CATEGORIES = [
  {
    slug: 'werbetechnik',
    title: 'Werbetechnik',
    short: 'Leuchtbuchstaben und 3D-Buchstaben nach Maß — sichtbar bei Tag und Nacht',
    image: '/images/cat-werbetechnik.webp',
    icon: Lightbulb,
    products: [
      { name: '3D-Buchstaben Tabela', icon: Type, desc: 'Profilbuchstaben nach Maß — Material, Beleuchtung und Größe im Konfigurator wählen, Preis sofort berechnen.', konfigurator: true },
    ],
  },
];

export const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/&/g, 'und')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Preise sind Netto-Preise; Konditionen zentral, damit Client und /api/order identisch rechnen.
export const VAT_RATE = 0.19;
export const SHIPPING_COST = 6.9;
export const FREE_SHIPPING_FROM = 150;
export const DATENCHECK_PRICE = 20; // je Position, zzgl. MwSt.

// Produktionszeit in Werktagen je Kategorie → "versandfertig bis"-Datum
export const PRODUCTION_DAYS = {
  werbetechnik: 10,
};

export const versandfertigBis = (days = 5) => {
  const d = new Date();
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) added++;
  }
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const findProduct = (categorySlug, productSlug) => {
  const cat = CATEGORIES.find((c) => c.slug === categorySlug);
  if (!cat) return null;
  const product = cat.products.find((p) => slugify(p.name) === productSlug);
  return product ? { category: cat, product } : null;
};

export const fmtEur = (n) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
