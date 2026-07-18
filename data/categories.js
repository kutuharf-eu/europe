import {
  Printer,
  Lightbulb,
  Tv,
  Megaphone,
  Contact,
  FileText,
  BookOpen,
  UtensilsCrossed,
  Stamp,
  CreditCard,
  ClipboardList,
  Sticker,
  Palette,
  Sparkles,
  Type,
  Square,
  RectangleVertical,
  Car,
  Layers,
  PanelTop,
  Flag,
  Monitor,
  QrCode,
  RefreshCw,
  Share2,
  Camera,
  MapPin,
  Target,
  Star,
} from 'lucide-react';

export const CATEGORIES = [
  {
    slug: 'druckprodukte',
    title: 'Druckprodukte',
    short: 'Von Visitenkarten bis Speisekarten — hochwertige Drucksachen für Ihren Auftritt',
    image: '/images/cat-speisekarte.webp',
    icon: Printer,
    products: [
      { name: 'Visitenkarten mit abgerundeten Ecken', icon: Contact, desc: 'Hochwertige Visitenkarten mit abgerundeten Ecken — der bleibende erste Eindruck.',
        variants: [{ label: '1.000 Stück', price: 100 }, { label: '2.000 Stück', price: 180 }, { label: '3.000 Stück', price: 200 }] },
      { name: 'Flyer', icon: FileText, desc: 'Werbeflyer in A5 und A6 — ideal für Aktionen, Eröffnungen und Lieferdienste.',
        variants: [
          { label: 'A5 · 1.000 Stück', price: 150 },
          { label: 'A5 · 2.500 Stück', price: 200 },
          { label: 'A5 · 5.000 Stück', price: 300 },
          { label: 'A5 · 10.000 Stück', price: 500 },
          { label: 'A6 · 1.000 Stück', price: 100 },
          { label: 'A6 · 2.500 Stück', price: 150 },
          { label: 'A6 · 5.000 Stück', price: 250 },
          { label: 'A6 · 10.000 Stück', price: 350 },
        ] },
      { name: 'Falzflyer & Faltblätter', icon: BookOpen, desc: 'Gefalzte Broschüren für Menüs, Angebote und Firmenpräsentationen.',
        variants: [
          { label: 'A3 · 3-Bruch (6 Seiten) · 1.000 Stück', price: 250 },
          { label: 'A3 · 3-Bruch (6 Seiten) · 2.500 Stück', price: 350 },
          { label: 'A3 · 3-Bruch (6 Seiten) · 5.000 Stück', price: 550 },
          { label: 'A3 · 3-Bruch (6 Seiten) · 10.000 Stück', price: 750 },
          { label: 'A4 · 1.000 Stück', price: 150 },
          { label: 'A4 · 2.500 Stück', price: 250 },
          { label: 'A4 · 5.000 Stück', price: 350 },
          { label: 'A4 · 10.000 Stück', price: 600 },
        ] },
      { name: 'Speisekarten', icon: UtensilsCrossed, desc: 'Kreative und strapazierfähige Speisekarten für Ihren perfekten ersten Eindruck.',
        variants: [
          { label: '25 Stück (25,00 €/Stk)', price: 625 },
          { label: '50 Stück (22,50 €/Stk)', price: 1125 },
          { label: '100 Stück (20,00 €/Stk)', price: 2000 },
        ] },
      { name: 'Bonuskarten & Stempelkarten', icon: Stamp, desc: 'Kundenbindung leicht gemacht — Bonuskarten im Visitenkartenformat.',
        variants: [{ label: '1.000 Stück', price: 100 }, { label: '2.000 Stück', price: 180 }, { label: '3.000 Stück', price: 200 }] },
      { name: 'Plastikkarten', icon: CreditCard, desc: 'Plastikvisitenkarten aus 0,7 mm PVC (85 × 54 mm) — beidseitiger UV-Druck, abgerundete Ecken.',
        variants: [
          { label: '250 Stück', price: 140.8 },
          { label: '500 Stück', price: 198 },
          { label: '1.000 Stück', price: 259.6 },
          { label: '1.500 Stück', price: 363 },
          { label: '2.000 Stück', price: 459.8 },
          { label: '2.500 Stück', price: 567.6 },
          { label: '3.000 Stück', price: 677.6 },
          { label: '3.500 Stück', price: 783.2 },
          { label: '4.000 Stück', price: 888.8 },
          { label: '4.500 Stück', price: 998.8 },
          { label: '5.000 Stück', price: 1104.4 },
          { label: '6.000 Stück', price: 1333.2 },
          { label: '7.000 Stück', price: 1546.6 },
          { label: '8.000 Stück', price: 1751.2 },
          { label: '9.000 Stück', price: 1951.4 },
          { label: '10.000 Stück', price: 2151.6 },
        ] },
      { name: 'Schreibblöcke', icon: ClipboardList, desc: 'Notiz- und Bestellblöcke mit Ihrem Logo — praktisch für Service und Büro.',
        variants: [
          { label: '100 Stück', price: 165 },
          { label: '300 Stück', price: 286 },
          { label: '500 Stück', price: 444.4 },
          { label: '1.000 Stück', price: 825 },
        ] },
      { name: 'Aufkleber & Etiketten', icon: Sticker, desc: 'Aufkleber in freier Form, auch auf transparenten Materialien und PVC.',
        variants: [{ label: '250 Stück', price: 49 }, { label: '500 Stück', price: 69 }, { label: '1.000 Stück', price: 99 }] },
      { name: 'Logo-Erstellungsservice', icon: Palette, desc: 'Professionelles Logo-Design für Ihr Unternehmen — inkl. Abstimmungsrunden und druckfertigen Dateien.',
        variants: [{ label: 'Professionelles Logo-Design', price: 100 }] },
    ],
  },
  {
    slug: 'werbetechnik',
    title: 'Werbetechnik',
    short: 'Leuchtreklame, Schilder und Beschriftung — sichtbar bei Tag und Nacht',
    image: '/images/cat-werbetechnik.webp',
    icon: Lightbulb,
    products: [
      { name: 'Leuchtkästen', icon: Lightbulb, desc: 'Beleuchtete Werbekästen mit Digitaldruck — wirksam bei Tag und Nacht.', m2: { rate: 600 } },
      { name: 'LED Neon-Schilder', icon: Sparkles, desc: 'Energieeffiziente LED-Technik in auffälliger Neon-Optik — für Bars, Restaurants und Schaufenster.' },
      { name: '3D-Buchstaben Tabela', icon: Type, desc: 'Profilbuchstaben nach Maß — Material, Beleuchtung und Größe im Konfigurator wählen, Preis sofort berechnen.', konfigurator: true },
      { name: 'Alu-Dibond Schilder', icon: Square, desc: 'Aluminium-Verbundplatten (4 mm) für Innen- und Außenbereich — nutzen Sie unseren Maßrechner.', m2: { rate: 80, maxH: 206 } },
      { name: 'Totem-Werbeanlagen', icon: RectangleVertical, desc: 'Freistehende Werbepylonen — Sichtbarkeit schon aus großer Entfernung.' },
      { name: 'Fahrzeugbeschriftung', icon: Car, desc: 'Vollfolierung oder Teilbeschriftung — macht Ihr Fahrzeug zur mobilen Werbefläche.' },
      { name: 'Folienbeklebung', icon: Layers, desc: 'Schaufenster-, Glas- und Flächenbeklebung — Folie und fachgerechte Verklebung inklusive.', m2: { rate: 120 } },
      { name: 'Werbebanner & Planen', icon: PanelTop, desc: 'Wetterfeste Banner nach Maß — für Fassaden, Zäune und Events.', m2: { rate: 80 } },
      { name: 'Fahnen & Roll-up Banner', icon: Flag, desc: 'Beachflags, Fahnen und Roll-ups für Messen, Aktionen und Ihren Eingangsbereich.',
        variants: [{ label: 'Roll-up 85×200 cm', price: 89 }, { label: 'Beachflag 2,8 m', price: 119 }, { label: 'Beachflag 3,4 m', price: 139 }] },
    ],
  },
  {
    slug: 'digitale-menues',
    title: 'Digitale Menüs',
    short: 'TV-Speisekarten und digitale Anzeigen — flexibel, modern, sofort aktualisierbar',
    image: '/images/cat-digital.webp',
    icon: Tv,
    products: [
      { name: 'Digitale TV-Speisekarte', icon: Tv, desc: 'Menüboard-Design für Ihre Bildschirme — Preise und Angebote in Minuten aktualisiert.' },
      { name: 'Menüboard-Hardware', icon: Monitor, desc: 'Bildschirme, Player und Halterungen — Beratung, Lieferung und Installation.' },
      { name: 'QR-Code Speisekarte', icon: QrCode, desc: 'Digitale Speisekarte per QR-Code — ohne Druckkosten immer aktuell.' },
      { name: 'Inhaltspflege & Updates', icon: RefreshCw, desc: 'Wir pflegen Preise, Bilder und Aktionen — Sie konzentrieren sich auf Ihr Geschäft.' },
    ],
  },
  {
    slug: 'social-marketing',
    title: 'Social Marketing',
    short: 'Sichtbarkeit im Netz — Social Media, Google und Werbeanzeigen für Gastronomen',
    image: '/images/cat-social.webp',
    icon: Megaphone,
    products: [
      { name: 'Social-Media-Betreuung', icon: Share2, desc: 'Instagram- und Facebook-Content: Planung, Gestaltung und Veröffentlichung.' },
      { name: 'Food-Fotografie & Reels', icon: Camera, desc: 'Professionelle Aufnahmen Ihrer Gerichte — Fotos und kurze Videos für Social Media.' },
      { name: 'Google Unternehmensprofil', icon: MapPin, desc: 'Optimierung Ihres Google-Eintrags — mehr Sichtbarkeit bei der lokalen Suche.' },
      { name: 'Meta & Google Ads', icon: Target, desc: 'Werbeanzeigen auf Instagram, Facebook und Google — lokal ausgesteuert, messbar.' },
      { name: 'Bewertungsmanagement', icon: Star, desc: 'Professioneller Umgang mit Bewertungen — Reputation aufbauen und pflegen.' },
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
  druckprodukte: 5,
  werbetechnik: 10,
  'digitale-menues': 5,
  'social-marketing': 5,
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

// Rabattcodes — VORLÄUFIG, von Murat zu bestätigen/erweitern.
// type 'percent' = Prozent auf die Zwischensumme, type 'fixed' = fester Euro-Betrag (netto).
export const DISCOUNT_CODES = {
  SPEZIAL10: { type: 'percent', value: 10 },
  WILLKOMMEN20: { type: 'fixed', value: 20 },
};

export const discountLabel = (code) => {
  const def = DISCOUNT_CODES[code];
  if (!def) return '';
  return def.type === 'percent' ? `−${def.value}%` : `−${fmtEur(def.value)}`;
};

export const codeDiscountAmount = (base, code) => {
  const def = DISCOUNT_CODES[code];
  if (!def || base <= 0) return 0;
  const amount = def.type === 'percent' ? base * (def.value / 100) : Math.min(def.value, base);
  return Math.round(amount * 100) / 100;
};

// Sonderrabatt (frei eingebbar): "10%" bzw. "10 %" = Prozent, "25" bzw. "25€" = fester Betrag.
export const parseSonder = (input) => {
  const raw = String(input || '').trim().replace(',', '.');
  if (!raw) return null;
  const isPercent = /%\s*$/.test(raw);
  const num = parseFloat(raw.replace(/[%€\s]/g, ''));
  if (!isFinite(num) || num <= 0) return null;
  if (isPercent) {
    if (num > 100) return null;
    return { kind: 'percent', value: num };
  }
  return { kind: 'fixed', value: Math.round(num * 100) / 100 };
};

export const sonderDiscountAmount = (base, sonder) => {
  if (!sonder || base <= 0) return 0;
  const amount = sonder.kind === 'percent' ? base * (sonder.value / 100) : Math.min(sonder.value, base);
  return Math.round(amount * 100) / 100;
};

export const sonderLabel = (sonder) =>
  !sonder ? '' : sonder.kind === 'percent' ? `−${sonder.value}%` : `−${fmtEur(sonder.value)}`;

export const findProduct = (categorySlug, productSlug) => {
  const cat = CATEGORIES.find((c) => c.slug === categorySlug);
  if (!cat) return null;
  const product = cat.products.find((p) => slugify(p.name) === productSlug);
  return product ? { category: cat, product } : null;
};

export const fmtEur = (n) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
