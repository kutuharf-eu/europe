// 3D-Buchstaben Konfigurator — Preislogik (Netto, VORLÄUFIGE Preise, von Murat zu prüfen).
// Wird im Client (Live-Preis) UND in /api/order (Verifikation) verwendet — nie nur clientseitig ändern.
//
// Ablauf (von Murat vorgegeben): 1. Buchstabenhöhe → 2. Schildmaß (B×H, berechnet) →
// 3. Beleuchtet/Unbeleuchtet → 4. Beleuchtungsart → 5. Konstruktion → Schriftart (5 Fonts).

export const KONFIG_LIGHT_MODES = [
  { id: 'beleuchtet', label: 'Beleuchtet (LED)' },
  { id: 'unbeleuchtet', label: 'Unbeleuchtet' },
];

// Beleuchtungsarten (nur wenn beleuchtet)
export const KONFIG_LIGHTING = [
  { id: 'halo', label: 'Rückleuchtend zur Wand (Halo-Effekt)', factor: 1.7 },
  { id: 'front', label: 'Nur frontleuchtend', factor: 1.8 },
  { id: 'front_seite', label: 'Front- & seitenleuchtend', factor: 2.0 },
  { id: 'seite', label: 'Seitenleuchtend', factor: 1.7 },
];

// Konstruktionen: allowed = erlaubte Beleuchtungsarten ('none' = unbeleuchtet erlaubt)
// materials = verwendete Materialbereiche (bestimmt die angebotene Farbauswahl)
export const KONFIG_CONSTRUCTIONS = [
  { id: 'alu_plexi', label: 'Seiten Aluminium · Front Plexiglas', base: 38, previewColor: '#e8e9eb',
    materials: ['plexiglas', 'aluminium'], allowed: ['none', 'halo', 'front', 'front_seite', 'seite'] },
  { id: 'voll_plexi', label: 'Seiten & Front Plexiglas (Voll-Acryl)', base: 45, previewColor: '#f5f5f0',
    materials: ['plexiglas'], allowed: ['none', 'halo', 'front', 'front_seite', 'seite'] },
  { id: 'chrom_plexi', label: 'Chrom-Profil · Front Plexiglas', base: 55, previewColor: '#dfe3e8',
    materials: ['chrome', 'plexiglas'], allowed: ['none', 'front', 'front_seite'] },
  { id: 'chrom_halo', label: 'Front & Seiten Chrom · rückleuchtend', base: 75, previewColor: '#c3c8cf',
    materials: ['chrome'], allowed: ['halo'] },
  { id: 'chrom_lichtkern', label: 'Front & Seiten Chrom · leuchtender Plexi-Kern', base: 85, previewColor: '#ccd1d8',
    materials: ['chrome', 'plexiglas'], allowed: ['front', 'front_seite', 'seite'] },
];

// Schriftarten — alle für den Konturschnitt (Fräse/Laser) geeignet: kräftige Strichstärken,
// keine Haarlinien; Schreibschriften mit verbundenen Buchstaben.
// widthFactor = durchschnittliche Buchstabenbreite relativ zur Höhe (für Maßschätzung).
// cat = Filterkategorie im Konfigurator. 'custom' = vom Kunden hochgeladene Schrift.
export const KONFIG_FONT_CATS = [
  { id: 'alle' }, { id: 'modern' }, { id: 'schmal' }, { id: 'rund' },
  { id: 'elegant' }, { id: 'deko' }, { id: 'tech' },
];

export const KONFIG_FONTS = [
  // Modern (Sans, kräftig)
  { id: 'modern', label: 'Modern', widthFactor: 0.66, cat: 'modern' },
  { id: 'montserrat', label: 'Montserrat', widthFactor: 0.68, cat: 'modern' },
  { id: 'poppins', label: 'Poppins', widthFactor: 0.66, cat: 'modern' },
  { id: 'raleway', label: 'Raleway', widthFactor: 0.64, cat: 'modern' },
  { id: 'russo', label: 'Russo One', widthFactor: 0.68, cat: 'modern' },
  // Schmal (Condensed)
  { id: 'schmal', label: 'Schmal (Condensed)', widthFactor: 0.48, cat: 'schmal' },
  { id: 'bebas', label: 'Bebas Neue', widthFactor: 0.42, cat: 'schmal' },
  { id: 'anton', label: 'Anton', widthFactor: 0.5, cat: 'schmal' },
  { id: 'fjalla', label: 'Fjalla One', widthFactor: 0.5, cat: 'schmal' },
  { id: 'staatliches', label: 'Staatliches', widthFactor: 0.48, cat: 'schmal' },
  // Rund & Freundlich
  { id: 'rund', label: 'Rund & Freundlich', widthFactor: 0.64, cat: 'rund' },
  { id: 'nunito', label: 'Nunito', widthFactor: 0.62, cat: 'rund' },
  { id: 'quicksand', label: 'Quicksand', widthFactor: 0.62, cat: 'rund' },
  { id: 'comfortaa', label: 'Comfortaa', widthFactor: 0.66, cat: 'rund' },
  { id: 'fredoka', label: 'Fredoka', widthFactor: 0.64, cat: 'rund' },
  { id: 'lilita', label: 'Lilita One', widthFactor: 0.62, cat: 'rund' },
  // Elegant (Serif)
  { id: 'elegant', label: 'Elegant (Serif)', widthFactor: 0.6, cat: 'elegant' },
  { id: 'abril', label: 'Abril Fatface', widthFactor: 0.58, cat: 'elegant' },
  { id: 'dmserif', label: 'DM Serif Display', widthFactor: 0.6, cat: 'elegant' },
  { id: 'cinzel', label: 'Cinzel', widthFactor: 0.66, cat: 'elegant' },
  { id: 'robotoslab', label: 'Roboto Slab', widthFactor: 0.62, cat: 'elegant' },
  { id: 'alfaslab', label: 'Alfa Slab One', widthFactor: 0.66, cat: 'elegant' },
  // Deko / Display
  { id: 'bungee', label: 'Bungee', widthFactor: 0.72, cat: 'deko' },
  { id: 'righteous', label: 'Righteous', widthFactor: 0.6, cat: 'deko' },
  { id: 'bangers', label: 'Bangers', widthFactor: 0.48, cat: 'deko' },
  { id: 'luckiest', label: 'Luckiest Guy', widthFactor: 0.6, cat: 'deko' },
  { id: 'titan', label: 'Titan One', widthFactor: 0.64, cat: 'deko' },
  // Technik / Stencil
  { id: 'orbitron', label: 'Orbitron', widthFactor: 0.7, cat: 'tech' },
  { id: 'audiowide', label: 'Audiowide', widthFactor: 0.68, cat: 'tech' },
  { id: 'blackops', label: 'Black Ops One', widthFactor: 0.66, cat: 'tech' },
  { id: 'sairastencil', label: 'Saira Stencil One', widthFactor: 0.6, cat: 'tech' },
  // ── Erweiterung: weitere LED-taugliche Google-Fonts (kräftig/mit Körper) ─────
  // Bewusst OHNE dünne Schreibschriften — in dünne Konturen passt kein LED-Modul.
  // Modern (Sans)
  { id: 'rubik', label: 'Rubik', widthFactor: 0.64, cat: 'modern' },
  { id: 'worksans', label: 'Work Sans', widthFactor: 0.62, cat: 'modern' },
  { id: 'barlow', label: 'Barlow', widthFactor: 0.56, cat: 'modern' },
  { id: 'mulish', label: 'Mulish', widthFactor: 0.6, cat: 'modern' },
  { id: 'manrope', label: 'Manrope', widthFactor: 0.62, cat: 'modern' },
  { id: 'sora', label: 'Sora', widthFactor: 0.64, cat: 'modern' },
  { id: 'exo2', label: 'Exo 2', widthFactor: 0.6, cat: 'modern' },
  { id: 'lexend', label: 'Lexend', widthFactor: 0.64, cat: 'modern' },
  { id: 'kanit', label: 'Kanit', widthFactor: 0.56, cat: 'modern' },
  { id: 'prompt', label: 'Prompt', widthFactor: 0.58, cat: 'modern' },
  { id: 'jost', label: 'Jost', widthFactor: 0.56, cat: 'modern' },
  // Schmal (Condensed)
  { id: 'archivonarrow', label: 'Archivo Narrow', widthFactor: 0.46, cat: 'schmal' },
  { id: 'barlowcond', label: 'Barlow Condensed', widthFactor: 0.44, cat: 'schmal' },
  { id: 'sairacond', label: 'Saira Condensed', widthFactor: 0.42, cat: 'schmal' },
  { id: 'teko', label: 'Teko', widthFactor: 0.42, cat: 'schmal' },
  { id: 'khand', label: 'Khand', widthFactor: 0.5, cat: 'schmal' },
  { id: 'rajdhani', label: 'Rajdhani', widthFactor: 0.5, cat: 'schmal' },
  { id: 'pathwaygothic', label: 'Pathway Gothic One', widthFactor: 0.4, cat: 'schmal' },
  // Rund & Freundlich
  { id: 'varelaround', label: 'Varela Round', widthFactor: 0.62, cat: 'rund' },
  { id: 'chewy', label: 'Chewy', widthFactor: 0.66, cat: 'rund' },
  { id: 'sniglet', label: 'Sniglet', widthFactor: 0.64, cat: 'rund' },
  { id: 'paytone', label: 'Paytone One', widthFactor: 0.64, cat: 'rund' },
  { id: 'concertone', label: 'Concert One', widthFactor: 0.62, cat: 'rund' },
  // Elegant (Serif / Slab)
  { id: 'merriweather', label: 'Merriweather', widthFactor: 0.62, cat: 'elegant' },
  { id: 'lora', label: 'Lora', widthFactor: 0.58, cat: 'elegant' },
  { id: 'ptserif', label: 'PT Serif', widthFactor: 0.58, cat: 'elegant' },
  { id: 'zillaslab', label: 'Zilla Slab', widthFactor: 0.56, cat: 'elegant' },
  { id: 'yeseva', label: 'Yeseva One', widthFactor: 0.56, cat: 'elegant' },
  { id: 'bitter', label: 'Bitter', widthFactor: 0.58, cat: 'elegant' },
  // Deko / Display (schwer)
  { id: 'passionone', label: 'Passion One', widthFactor: 0.5, cat: 'deko' },
  { id: 'bowlby', label: 'Bowlby One', widthFactor: 0.68, cat: 'deko' },
  { id: 'ultra', label: 'Ultra', widthFactor: 0.66, cat: 'deko' },
  { id: 'sigmar', label: 'Sigmar One', widthFactor: 0.66, cat: 'deko' },
  { id: 'rowdies', label: 'Rowdies', widthFactor: 0.6, cat: 'deko' },
  { id: 'fugaz', label: 'Fugaz One', widthFactor: 0.56, cat: 'deko' },
  // Technik
  { id: 'michroma', label: 'Michroma', widthFactor: 0.74, cat: 'tech' },
  { id: 'syncopate', label: 'Syncopate', widthFactor: 0.72, cat: 'tech' },
  // Vom Kunden hochgeladene Schrift (TTF/OTF/WOFF) — Datei kommt als Positions-Upload mit.
  { id: 'custom', label: 'Eigene Schrift', widthFactor: 0.66, cat: 'custom', custom: true },
];

// Profi-Montage: kein fester Preis mehr — wird als „Angebot anfragen" behandelt
// (quote:true) und NICHT automatisch zum Gesamtpreis addiert (price:0). Die
// Bohrschablone ist jetzt ein eigenständiges, kostenpflichtiges Add-on (Admin-Preis).
export const KONFIG_MONTAGE = [
  { id: 'selbst', label: 'Selbstmontage', price: 0 },
  { id: 'profi', label: 'Profi-Montage vor Ort', price: 0, quote: true },
];

// Materialfarben — reine Spezifikation, ohne Preisaufschlag. hex nur für die Vorschau.
// Plexiglas (Front): Hauptfarben + Weiß. Chrom: Metallic-Oberflächen + RAL. Aluminium (Seiten): Schwarz.
export const KONFIG_COLORS = {
  plexiglas: [
    { id: 'weiss', label: 'Weiß', hex: '#ffffff' },
    { id: 'rot', label: 'Rot', hex: '#d21f26' },
    { id: 'orange', label: 'Orange', hex: '#ef7d00' },
    { id: 'gelb', label: 'Gelb', hex: '#f4c400' },
    { id: 'gruen', label: 'Grün', hex: '#1e8a44' },
    { id: 'blau', label: 'Blau', hex: '#0a5ca8' },
    { id: 'schwarz', label: 'Schwarz', hex: '#1a1a1a' },
  ],
  chrome: [
    { id: 'silber', label: 'Silber', hex: '#c9ccd1' },
    { id: 'gold', label: 'Gold', hex: '#d4af37' },
    { id: 'kupfer', label: 'Kupfer', hex: '#b87333' },
  ],
  aluminium: [
    { id: 'schwarz', label: 'Schwarz', hex: '#1a1a1a' },
  ],
};

// Kuratierte, gängige RAL-Töne — die im (türkischen) Acrylmarkt üblichsten Farben
// als Dropdown-Auswahl (17 Tem 2026: Freitext-RAL durch diese Liste ersetzt).
export const KONFIG_RAL = [
  { code: 'RAL 9010', label: 'Reinweiß', hex: '#f7f9f4' },
  { code: 'RAL 9016', label: 'Verkehrsweiß', hex: '#f1f0ea' },
  { code: 'RAL 9005', label: 'Tiefschwarz', hex: '#0a0a0d' },
  { code: 'RAL 7016', label: 'Anthrazitgrau', hex: '#383e42' },
  { code: 'RAL 9006', label: 'Weißaluminium', hex: '#a5a8a6' },
  { code: 'RAL 3020', label: 'Verkehrsrot', hex: '#c1121c' },
  { code: 'RAL 3004', label: 'Purpurrot (Bordeaux)', hex: '#701f29' },
  { code: 'RAL 2004', label: 'Reinorange', hex: '#e75b12' },
  { code: 'RAL 1023', label: 'Verkehrsgelb', hex: '#f7b500' },
  { code: 'RAL 6018', label: 'Gelbgrün', hex: '#4b9c33' },
  { code: 'RAL 6005', label: 'Moosgrün', hex: '#114232' },
  { code: 'RAL 5002', label: 'Ultramarinblau', hex: '#1b2e6e' },
  { code: 'RAL 5010', label: 'Enzianblau', hex: '#00417a' },
  { code: 'RAL 5015', label: 'Himmelblau', hex: '#007cb0' },
  { code: 'RAL 6029', label: 'Minzgrün', hex: '#127437' },
  { code: 'RAL 7035', label: 'Lichtgrau', hex: '#c8cbc8' },
  { code: 'RAL 4008', label: 'Signalviolett', hex: '#924e7d' },
  { code: 'RAL 8017', label: 'Schokoladenbraun', hex: '#45322e' },
  { code: 'RAL 1015', label: 'Hellelfenbein', hex: '#e6d2b5' },
];

export const CHROME_FINISHES = ['silber', 'gold', 'kupfer', 'ral'];
const RAL_RE = /^RAL\s?\d{3,4}$/i;
export const normalizeColor = (material, id) =>
  KONFIG_COLORS[material]?.some((c) => c.id === id) ? id : KONFIG_COLORS[material]?.[0]?.id;
export const normalizeChromeFinish = (id) => (CHROME_FINISHES.includes(id) ? id : 'silber');
export const normalizeRal = (code) => {
  const s = String(code || '').trim().toUpperCase().replace(/^RAL(\d)/, 'RAL $1');
  return RAL_RE.test(s) ? s.slice(0, 12) : '';
};

// LED-Lichtfarbe & Dimmbarkeit — nur bei beleuchteten Buchstaben, reine Spezifikation.
export const KONFIG_LIGHT_COLORS = [
  { id: 'warmweiss', label: 'Warmweiß (3.000 K)' },
  { id: 'neutralweiss', label: 'Neutralweiß (4.000 K)' },
  { id: 'kaltweiss', label: 'Kaltweiß (6.000 K)' },
  { id: 'rgb', label: 'RGB (mehrfarbig, steuerbar)' },
];
export const KONFIG_DEFAULT_LIGHT_COLOR = 'warmweiss';
export const normalizeLightColor = (id) =>
  KONFIG_LIGHT_COLORS.some((c) => c.id === id) ? id : KONFIG_DEFAULT_LIGHT_COLOR;

// quoteHeight: über dieser Buchstabenhöhe nur Angebot/PDF — Online-Bestellung gesperrt.
export const KONFIG_LIMITS = { minHeight: 5, maxHeight: 100, maxTextLen: 30, refHeight: 20, quoteHeight: 50 };
export const NETZTEIL_PRICE = 49;

// ── Logo (optional) ──────────────────────────────────────────────────────────
// Ein Kundenlogo wird wie „durchschnittliche Buchstaben" in Logohöhe berechnet:
// Äquivalenzharfe = Logobreite / (Logohöhe × LOGO_WIDTH_FACTOR).
// 0.76 ≈ mittlere Buchstabenbreite (0.66) + Buchstabenabstand (0.1) relativ zur Höhe,
// damit ein Logo mit dem Rahmenmaß eines Schriftzugs etwa gleich viel kostet.
export const LOGO_WIDTH_FACTOR = 0.76;
export const LOGO_LIMITS = { minCm: 10, maxWidth: 500, maxHeight: KONFIG_LIMITS.maxHeight };

// Validiert Logo-Maße → { widthCm, heightCm, shape } (gerundet) oder null.
// shape 'circle' → dairesel form: fiyat motoru çevreyi πd, LED'i πr² ile hesaplar
// (23 Tem 2026 eCut yuvarlak kalibrasyonu); plaka (en×boy) her iki şekilde aynıdır.
export function normalizeLogo(logo) {
  if (!logo || typeof logo !== 'object') return null;
  const w = Math.round(Number(logo.widthCm));
  const h = Math.round(Number(logo.heightCm));
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
  if (w < LOGO_LIMITS.minCm || w > LOGO_LIMITS.maxWidth) return null;
  if (h < LOGO_LIMITS.minCm || h > LOGO_LIMITS.maxHeight) return null;
  return { widthCm: w, heightCm: h, shape: logo.shape === 'circle' ? 'circle' : 'rect' };
}

// Wie viele „durchschnittliche Buchstaben" in Logohöhe entspricht das Logo? (min. 1)
export function logoEquivalentLetters(widthCm, heightCm) {
  const w = Number(widthCm), h = Number(heightCm);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return Math.max(1, Math.round(w / (h * LOGO_WIDTH_FACTOR)));
}

// Çubuk LED (LED-Leiste): Länge × Höhe (cm) — Materialrechnung wie Logo/Buchstaben
// (Äquivalenzbuchstaben in Leistenhöhe). Ein STÜCK ist max. 150 cm; die Gesamtlänge
// wird automatisch in Stücke geteilt (letztes Stück = Rest).
export const CUBUK_LED_LIMITS = { minCm: 10, minHeight: 5, maxLen: 1500, maxHeight: KONFIG_LIMITS.maxHeight, pieceMax: 150 };
export function normalizeCubukLed(led) {
  if (!led || typeof led !== 'object') return null;
  const len = Math.round(Number(led.lengthCm));
  const h = Math.round(Number(led.heightCm));
  if (!Number.isFinite(len) || !Number.isFinite(h)) return null;
  if (len < CUBUK_LED_LIMITS.minCm || len > CUBUK_LED_LIMITS.maxLen) return null;
  if (h < CUBUK_LED_LIMITS.minHeight || h > CUBUK_LED_LIMITS.maxHeight) return null;
  return { lengthCm: len, heightCm: h };
}
export function cubukLedPieces(lengthCm) {
  const len = Math.round(Number(lengthCm)) || 0;
  if (len <= 0) return [];
  const n = Math.ceil(len / CUBUK_LED_LIMITS.pieceMax);
  return Array.from({ length: n }, (_, i) => (i < n - 1 ? CUBUK_LED_LIMITS.pieceMax : len - (n - 1) * CUBUK_LED_LIMITS.pieceMax));
}

export const countLetters = (text) => String(text || '').replace(/\s/g, '').length;

const round2 = (n) => Math.round(n * 100) / 100;

// Geschätztes Schildmaß (vektorbasiert): Breite aus Zeichenbreiten + Zwischenräumen
export function estimateSize({ text, heightCm, fontId }) {
  const font = KONFIG_FONTS.find((f) => f.id === fontId) || KONFIG_FONTS[0];
  const h = Number(heightCm) || 0;
  const chars = String(text || '').trim();
  if (!chars || !h) return null;
  let width = 0;
  for (const ch of chars) {
    width += ch === ' ' ? h * 0.35 : h * font.widthFactor;
  }
  width += Math.max(0, chars.length - 1) * h * 0.1; // Buchstabenabstand
  return { widthCm: Math.round(width), heightCm: Math.round(h) };
}

// Umkehrung von estimateSize: maximale Buchstabenhöhe, die bei verfügbarer
// Breite (cm) für den Schriftzug passt — gedeckelt auf maxHeight.
export function maxHeightForWidth({ text, widthCm, fontId }) {
  const font = KONFIG_FONTS.find((f) => f.id === fontId) || KONFIG_FONTS[0];
  const chars = String(text || '').trim();
  const w = Number(widthCm) || 0;
  if (!chars || w <= 0) return null;
  let unitsPerCmHoehe = 0;
  for (const ch of chars) {
    unitsPerCmHoehe += ch === ' ' ? 0.35 : font.widthFactor;
  }
  unitsPerCmHoehe += Math.max(0, chars.length - 1) * 0.1; // Buchstabenabstand
  if (unitsPerCmHoehe <= 0) return null;
  return Math.min(Math.floor(w / unitsPerCmHoehe), KONFIG_LIMITS.maxHeight);
}

// Größtmögliche Buchstabenhöhe für eine verfügbare Fläche.
// Breite begrenzt über die Schriftbreite (Umkehrung von estimateSize),
// Höhe begrenzt direkt. Mit beiden Angaben ist das Ergebnis das exakte Minimum.
// Gibt null zurück, wenn weder Breite noch Höhe angegeben ist.
export function maxLetterHeight({ text, widthCm, heightCm, fontId }) {
  const limits = [];
  const fromWidth = maxHeightForWidth({ text, widthCm, fontId });
  if (fromWidth !== null) limits.push(fromWidth);
  const h = Number(heightCm) || 0;
  if (h > 0) limits.push(Math.min(Math.floor(h), KONFIG_LIMITS.maxHeight));
  if (limits.length === 0) return null;
  return Math.min(...limits);
}

export function effectiveLightingId(lightMode, lightingId) {
  return lightMode === 'unbeleuchtet' ? 'none' : lightingId;
}

export function allowedConstructions(lightMode, lightingId) {
  const eff = effectiveLightingId(lightMode, lightingId);
  return KONFIG_CONSTRUCTIONS.filter((c) => c.allowed.includes(eff));
}

// Gibt null zurück, wenn die Konfiguration ungültig ist.
// logo (optional): { widthCm, heightCm } — wird mit derselben Konstruktion &
// demselben Lichtfaktor wie die Buchstaben berechnet; ungültige Maße → null.
export function konfigPrice({ text, heightCm, lightMode, lightingId, constructionId, fontId, montageId, trafo, logo, logoPrint, cubukLed }, opts = {}) {
  const h = Number(heightCm);
  const letters = countLetters(text);
  const construction = KONFIG_CONSTRUCTIONS.find((c) => c.id === constructionId);
  const montage = KONFIG_MONTAGE.find((m) => m.id === montageId);
  const font = KONFIG_FONTS.find((f) => f.id === fontId);
  const lit = lightMode === 'beleuchtet';
  const lighting = lit ? KONFIG_LIGHTING.find((l) => l.id === lightingId) : null;

  if (!construction || !montage || !font) return null;
  if (lit && !lighting) return null;
  // Harfsiz ürün (sadece Logo veya Çubuk LED) da geçerli — o zaman letters=0 olur.
  const hasComponent = !!(logo || cubukLed);
  if (letters > KONFIG_LIMITS.maxTextLen) return null;
  if (!letters && !hasComponent) return null;
  if (!h || h < KONFIG_LIMITS.minHeight || h > KONFIG_LIMITS.maxHeight) return null;

  const eff = effectiveLightingId(lightMode, lightingId);
  if (!construction.allowed.includes(eff)) return null;

  const factor = lit ? lighting.factor : 1;
  // Trafo (LED-Netzteil) nur bei Beleuchtung und wenn gewünscht (Standard: inklusive)
  // addon (bağımsız ek ürün): trafo proje-seviyesi → ek üründe uygulanmaz (ana kalemde bir kez).
  const trafoIncl = lit && trafo !== false && !opts.addon;
  const netzteil = trafoIncl ? NETZTEIL_PRICE : 0;
  const perLetter = round2(construction.base * (h / KONFIG_LIMITS.refHeight) * factor);
  const lettersTotal = round2(perLetter * letters);

  // Logo-Zuschlag: Äquivalenzharfe in Logohöhe × Buchstabenpreis bei Logohöhe.
  let logoInfo = null;
  if (logo) {
    const lg = normalizeLogo(logo);
    if (!lg) return null;
    if (logoPrint === 'uv') {
      // Baskı logo (legacy tahmini): m² × 10 € varsayılan — motor gerçek admin fiyatıyla değiştirir.
      const areaM2 = (lg.widthCm / 100) * (lg.heightCm / 100);
      logoInfo = { ...lg, print: logoPrint, eqLetters: 0, perLetter: 0, total: round2(areaM2 * 10) };
    } else {
      const eq = logoEquivalentLetters(lg.widthCm, lg.heightCm);
      const logoPerLetter = round2(construction.base * (lg.heightCm / KONFIG_LIMITS.refHeight) * factor);
      logoInfo = { ...lg, eqLetters: eq, perLetter: logoPerLetter, total: round2(logoPerLetter * eq) };
    }
  }

  // Çubuk LED: aynı malzeme hesabı — uzunluk = genişlik, kendi yüksekliğinde eşdeğer harf.
  let cubukInfo = null;
  if (cubukLed) {
    const cl = normalizeCubukLed(cubukLed);
    if (!cl) return null;
    const eq = logoEquivalentLetters(cl.lengthCm, cl.heightCm);
    const clPerLetter = round2(construction.base * (cl.heightCm / KONFIG_LIMITS.refHeight) * factor);
    cubukInfo = { ...cl, pieces: cubukLedPieces(cl.lengthCm), eqLetters: eq, perLetter: clPerLetter, total: round2(clPerLetter * eq) };
  }

  // addon (bağımsız ek ürün): montaj proje-seviyesi kalem → ek üründe uygulanmaz.
  const montagePrice = opts.addon ? 0 : montage.price;
  const total = round2(lettersTotal + (logoInfo ? logoInfo.total : 0) + (cubukInfo ? cubukInfo.total : 0) + netzteil + montagePrice);

  return { letters, perLetter, lettersTotal, logo: logoInfo, cubukLed: cubukInfo, netzteil, montage: montagePrice, total, construction, lighting, font, montageOpt: montage };
}

// Beschreibung der gewählten Materialfarben je nach Konstruktion.
export function konfigColorDetail(cfg) {
  const c = KONFIG_CONSTRUCTIONS.find((x) => x.id === cfg.constructionId);
  if (!c) return '';
  const parts = [];
  for (const m of c.materials) {
    if (m === 'plexiglas') {
      const col = KONFIG_COLORS.plexiglas.find((x) => x.id === normalizeColor('plexiglas', cfg.plexiColor));
      parts.push(`Plexiglas: ${col?.label}`);
    } else if (m === 'chrome') {
      const fin = normalizeChromeFinish(cfg.chromeFinish);
      if (fin === 'ral') {
        parts.push(`Chrom: ${normalizeRal(cfg.ral) || 'RAL nach Wahl'}`);
      } else {
        parts.push(`Chrom: ${KONFIG_COLORS.chrome.find((x) => x.id === fin)?.label}`);
      }
    } else if (m === 'aluminium') {
      parts.push('Seiten-Aluminium: Schwarz');
    }
  }
  return parts.join(' · ');
}

export const konfigDetail = (cfg) => {
  const c = KONFIG_CONSTRUCTIONS.find((x) => x.id === cfg.constructionId);
  const f = KONFIG_FONTS.find((x) => x.id === cfg.fontId);
  const mo = KONFIG_MONTAGE.find((x) => x.id === cfg.montageId);
  let light;
  if (cfg.lightMode === 'unbeleuchtet') {
    light = 'Unbeleuchtet';
  } else {
    const art = KONFIG_LIGHTING.find((l) => l.id === cfg.lightingId)?.label;
    const color = KONFIG_LIGHT_COLORS.find((x) => x.id === normalizeLightColor(cfg.lightColor))?.label;
    light = `${art} · ${color}${cfg.dimmbar ? ' · dimmbar' : ''} · ${cfg.trafo === false ? 'ohne Trafo' : 'inkl. Trafo'}`;
  }
  const size = estimateSize(cfg);
  const farben = konfigColorDetail(cfg);
  return `„${String(cfg.text).trim()}" · ${cfg.heightCm} cm hoch · ca. ${size ? size.widthCm + '×' + size.heightCm + ' cm' : ''} · ${light} · ${c?.label}${farben ? ' · ' + farben : ''} · Schrift: ${f?.label} · ${mo?.label}`;
};
