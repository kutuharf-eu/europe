// ─────────────────────────────────────────────────────────────────────────────
// Konfigurator v3 (TEST) — Schritt-für-Schritt-Flow ohne Produktkarten.
// EIGENSTÄNDIG & ISOLIERT: berührt weder /konfigurator noch /konfigurator-neu.
// Preis nutzt die vorhandene reine Preislogik (konfigPrice), damit die
// Server-Verifikation in /api/order unverändert greift (Warenkorb/Checkout ok).
// ─────────────────────────────────────────────────────────────────────────────
import {
  konfigPrice,
  estimateSize,
  maxHeightForWidth,
  normalizeRal,
  normalizeLogo,
  logoEquivalentLetters,
  normalizeCubukLed,
  cubukLedPieces,
  CUBUK_LED_LIMITS,
  KONFIG_LIMITS,
  KONFIG_FONTS,
  KONFIG_MONTAGE,
  LOGO_LIMITS,
} from '@/data/konfigurator';

export { estimateSize, KONFIG_LIMITS, KONFIG_FONTS, KONFIG_MONTAGE, LOGO_LIMITS, normalizeLogo, logoEquivalentLetters, normalizeCubukLed, cubukLedPieces, CUBUK_LED_LIMITS };

// ── Farb- & Optionslisten ────────────────────────────────────────────────────
export const ACRYL_COLORS = [
  { id: 'weiss', label: 'Weiß', hex: '#ffffff' },
  { id: 'rot', label: 'Rot', hex: '#d21f26' },
  { id: 'gelb', label: 'Gelb', hex: '#f4c400' },
  { id: 'orange', label: 'Orange', hex: '#ef7d00' },
  { id: 'gruen', label: 'Grün', hex: '#1e8a44' },
  { id: 'blau', label: 'Blau', hex: '#0a5ca8' },
];

// Chrom-Farbtöne — überall wählbar, wo Edelstahl/Chrom als Material gewählt ist
export const CHROM_COLORS = [
  { id: 'gold', label: 'Gold', hex: '#d4af37', img: '/configurator/chrom/chrom-gold.jpg' },
  { id: 'silber', label: 'Silber', hex: '#c9ccd1', img: '/configurator/chrom/chrom-silber.jpg' },
  { id: 'kupfer', label: 'Kupfer', hex: '#b87333', img: '/configurator/chrom/chrom-kupfer.jpg' },
  { id: 'ral', label: 'RAL-Farbe', hex: '#dcdfe4' },
];

// Chrom-Oberflächen (bei Edelstahl/Chrom)
export const CHROM_SURFACES = [
  { id: 'glaenzend', label: 'Glänzend' },
  { id: 'gebuerstet', label: 'Gebürstet' },
];

// Acryl: nur Hauptfarben; Farbtöne über eine unabhängige „Kontakt aufnehmen"-Checkbox

// Metall-Frontfarben (Rückleuchtend-Front / Nur-seitenleuchtend-Front)
export const METAL_FACE = [
  { id: 'gold', label: 'Gold', hex: '#d4af37' },
  { id: 'silber', label: 'Silber', hex: '#c9ccd1' },
  { id: 'bronze', label: 'Bronze', hex: '#b08d57' },
  { id: 'schwarz', label: 'Schwarz', hex: '#1a1a1a' },
  { id: 'ral', label: 'RAL-Farbe', hex: '#dcdfe4' },
];

// Seiten-/Korpusfarben (Metall)
export const SIDE_METAL = [
  { id: 'schwarz', label: 'Schwarz', hex: '#1a1a1a' },
  { id: 'weiss', label: 'Weiß', hex: '#f2f2ef' },
  { id: 'silber', label: 'Silber', hex: '#c9ccd1' },
  { id: 'gold', label: 'Gold', hex: '#d4af37' },
  { id: 'ral', label: 'RAL-Farbe', hex: '#dcdfe4' },
];

// Rück-/Bodenplatte
export const BASE_COLORS = [
  { id: 'schwarz', label: 'Schwarz', hex: '#1a1a1a' },
  { id: 'weiss', label: 'Weiß', hex: '#f2f2ef' },
  { id: 'silber', label: 'Silber', hex: '#c9ccd1' },
];

export const LIGHT_COLORS = [
  { id: 'warmweiss', label: 'Warmweiß', kelvin: '3.000 K', glow: '#ffe6b0', tag: 'Empfohlen für Gastro' },
  { id: 'neutralweiss', label: 'Neutralweiß', kelvin: '4.000 K', glow: '#fff6e0', tag: 'Universell' },
  { id: 'kaltweiss', label: 'Kaltweiß', kelvin: '6.000 K', glow: '#eaf3ff', tag: 'Modern & technisch' },
  { id: 'rgb', label: 'RGB', kelvin: 'mehrfarbig', glow: '#c9a0ff', tag: 'Sonderoption für Bars & Events' },
];

export const WANDABSTAND = [
  { id: '20', label: '20 mm', desc: 'Dezent' },
  { id: '30', label: '30 mm', desc: 'Empfehlung' },
  { id: '50', label: '50 mm', desc: 'Breiter Halo' },
];

export const SURFACES = [
  { id: 'matt', label: 'Matt', desc: 'Blendfrei, modern' },
  { id: 'glaenzend', label: 'Glänzend', desc: 'Hochglanz, auffällig' },
];

export const DEPTHS = [
  { id: '30', label: '30 mm' },
  { id: '50', label: '50 mm' },
  { id: '80', label: '80 mm' },
  { id: '100', label: '100 mm' },
];

// Korpusmaterial bei Rückleuchtend
export const BODY_MAT_RUECK = [
  { id: 'edelstahl_chrom', label: 'Edelstahl / Chrom', img: 'edelstahl-chrom-rueckleuchtend', alt: 'Rückleuchtende 3D-Buchstaben aus gebürstetem Metall mit Halo-Effekt' },
  { id: 'alu_lackiert', label: 'Chrom lackiert', img: 'chrom-lackiert-rueckleuchtend', alt: 'Rückleuchtende lackierte Chrom-Buchstaben in Hochglanz-Schwarz mit Halo-Effekt' },
  { id: 'edelstahl_wand_akryl', label: 'Edelstahl / Chrom · Wand-Acryl', img: 'edelstahl-chrom-wand-acryl', alt: 'Rückleuchtende Edelstahl-Buchstaben mit Acryl-Wandplatte' },
  { id: 'lackiert_wand_akryl', label: 'Chrom lackiert · Wand-Acryl', img: 'chrom-lackiert-wand-acryl', alt: 'Rückleuchtende lackierte Chrom-Buchstaben mit Acryl-Wandplatte' },
];

// Rückleuchtend: Chrom- vs. lackierte Ausführungen und Varianten mit Acryl-Wandplatte
export const RUECK_CHROM_IDS = ['edelstahl_chrom', 'edelstahl_wand_akryl'];
export const RUECK_LACK_IDS = ['alu_lackiert', 'lackiert_wand_akryl'];
export const RUECK_WAND_AKRYL_IDS = ['edelstahl_wand_akryl', 'lackiert_wand_akryl'];

// Rückplatten-Stärke (nur bei Wand-Acryl-Varianten)
export const BACK_PANELS = [
  { id: '8', label: '8 mm' },
  { id: '18', label: '18 mm' },
];

// Seitenmaterial bei Frontleuchtend
export const SIDE_MAT_FRONT = [
  { id: 'aluminium', label: 'Aluminium-Seiten', img: 'aluminium-seiten-3d-buchstaben', alt: 'Frontleuchtende 3D-Buchstaben mit Aluminium-Seiten' },
  { id: 'chrom', label: 'Chrom-Profil', img: 'chrom-profil-3d-buchstaben', alt: 'Frontleuchtende 3D-Buchstaben mit Chrom-Profil an den Seiten' },
  { id: 'pvc_akryl', label: 'Chrom-Profil lackiert', img: 'chrom-profil-lackiert-3d-buchstaben', alt: 'Frontleuchtende 3D-Buchstaben mit lackiertem Chrom-Profil an den Seiten' },
  { id: 'ters_kutu', label: 'Chrom-Rückwanne (Ters Tava)', img: 'krom-ters-tava-3d-buchstaben', alt: 'Frontleuchtende 3D-Buchstaben mit verchromter Rückwanne (Ters Tava)' },
];

// Seitenkonstruktionen mit Chrom-Ausführung → Farbton/Oberfläche statt RAL.
export const CHROM_SIDE_IDS = ['chrom', 'ters_kutu'];

// Materialien bei Unbeleuchtet
export const UNBEL_MAT = [
  { id: 'strafor', label: 'Styropor (Strafor)', desc: 'Leicht & günstig', img: 'styropor-3d-buchstaben', alt: 'Bunte 3D-Buchstaben aus Styropor an einer Wand' },
  { id: 'plexi', label: 'Acryl', desc: 'Farbig, wetterfest', img: 'acryl-3d-buchstaben', alt: 'Glänzende 3D-Buchstaben aus blauem Acrylglas an einer Fassade' },
  { id: 'alu_lackiert', label: 'Chrom lackiert', desc: 'Robust, RAL-lackierbar', img: 'aluminium-lackiert-3d-buchstaben', alt: 'Lackierte Chrom-3D-Buchstaben in mattem Anthrazit' },
  { id: 'edelstahl_chrom', label: 'Edelstahl / Chrom', desc: 'Hochwertig, langlebig', img: 'edelstahl-chrom-3d-buchstaben', alt: '3D-Buchstaben aus gebürstetem Edelstahl an einer Steinfassade' },
];

// Lichtrichtungen (nur bei beleuchtet) → Abbildung auf die Preislogik
export const LIGHT_DIRS = [
  { id: 'rueck', label: 'Rückleuchtend', sub: 'Arkadan ışıklı — Halo-Effekt zur Wand', lighting: 'halo', img: '3d-buchstaben-rueckleuchtend-halo', alt: 'Rückleuchtende 3D-Buchstaben mit Halo-Effekt an einer Fassade' },
  { id: 'front', label: 'Frontleuchtend', sub: 'Önden ışıklı — klassisch nach vorne', lighting: 'front', img: 'led-buchstaben-frontleuchtend', alt: 'Frontleuchtende LED-Buchstaben mit leuchtender Acrylglas-Front' },
  { id: 'front_seite', label: 'Acryl leuchtend', sub: 'Akrilik ışıklı — Rundum-Leuchtkörper', lighting: 'front_seite', img: 'led-buchstaben-front-seitenleuchtend', alt: 'Rundum leuchtende Acryl-LED-Buchstaben' },
  { id: 'seite', label: 'Seitenleuchtend', sub: 'Yandan ışıklı — Lichtband seitlich', lighting: 'seite', img: '3d-buchstaben-seitenleuchtend', alt: 'Seitenleuchtende 3D-Buchstaben mit seitlichem Lichtband' },
];

export const TABELLE_TYPES = [
  { id: 'beleuchtet', label: 'Beleuchtet', sub: 'Işıklı — mit LED', img: 'led-leuchtbuchstaben-beleuchtet', alt: 'Beleuchtete LED-Leuchtbuchstaben an einer Hauswand bei Dämmerung' },
  { id: 'unbeleuchtet', label: 'Unbeleuchtet', sub: 'Işıksız — ohne LED', img: '3d-buchstaben-unbeleuchtet', alt: 'Unbeleuchtete 3D-Buchstaben aus Metall an einer Fassade' },
];

// ── Maß-Logik ────────────────────────────────────────────────────────────────
export function recommendDepth(heightCm) {
  const h = Number(heightCm) || 0;
  if (h <= 0) return null;
  if (h < 20) return '30–40 mm';
  if (h < 40) return '50–60 mm';
  if (h < 70) return '80–100 mm';
  return '100–120 mm';
}

// Max. montierbare Buchstabenhöhe = Minimum aus Breiten- und Höhengrenze.
export function sizeAssessment({ text, heightCm, fontId, availWidth, availHeight }) {
  const h = Number(heightCm) || 0;
  if (!String(text || '').trim() || !h) return null;
  const size = estimateSize({ text, heightCm: h, fontId });
  if (!size) return null;
  if (h < 12) return { status: 'tinyLetters', size };

  const limits = [];
  const fromWidth = maxHeightForWidth({ text, widthCm: availWidth, fontId });
  if (fromWidth !== null) limits.push(fromWidth);
  const availH = Number(availHeight) || 0;
  if (availH > 0) limits.push(Math.min(Math.floor(availH), KONFIG_LIMITS.maxHeight));

  if (limits.length > 0) {
    const maxFit = Math.min(...limits);
    if (maxFit < KONFIG_LIMITS.minHeight) return { status: 'areaTooSmall', size, maxFit };
    if (h > maxFit) return { status: 'tooBig', size, recommendHeight: maxFit };
  }
  if (size.widthCm > 500 || h >= 90) return { status: 'veryBig', size };
  return { status: 'good', size, maxFit: limits.length ? Math.min(...limits) : null };
}

// ── Preis & cfg ──────────────────────────────────────────────────────────────
// Baut aus dem Flow-State ein gültiges cfg für konfigPrice (+ /api/order).
export function buildCfg(sel) {
  const lit = sel.lit === 'beleuchtet';
  let constructionId, lightingId;
  if (!lit) {
    constructionId = ({ plexi: 'voll_plexi', alu_lackiert: 'alu_plexi', edelstahl_chrom: 'chrom_plexi', strafor: 'alu_plexi' })[sel.unbelMaterial] || 'alu_plexi';
    lightingId = 'none';
  } else {
    // lightingId aus den LIGHT_DIRS-Daten ableiten (rueck → 'halo'), damit es exakt
    // den KONFIG_LIGHTING-IDs der Preislogik entspricht (sonst liefert konfigPrice null).
    const dir = LIGHT_DIRS.find((d) => d.id === sel.lightDir);
    lightingId = dir ? dir.lighting : 'front';
    if (sel.lightDir === 'rueck') constructionId = 'chrom_halo';
    else if (sel.lightDir === 'front') constructionId = CHROM_SIDE_IDS.includes(sel.sideMaterial) ? 'chrom_plexi' : 'alu_plexi';
    else constructionId = 'voll_plexi';
  }
  // Logo nur übernehmen, wenn die Maße gültig sind — sonst bleibt der Preis
  // ein reiner Buchstabenpreis (UI zeigt einen Hinweis).
  // Rund (Ø): Durchmesser wird als Breite = Höhe geführt (Preis/Vorschau identisch skaliert).
  const logo = normalizeLogo(sel.logoShape === 'circle'
    ? { widthCm: sel.logoDiameterCm, heightCm: sel.logoDiameterCm, shape: 'circle' }
    : { widthCm: sel.logoWidthCm, heightCm: sel.logoHeightCm });
  // Çubuk LED (opsiyonel): uzunluk + yükseklik geçerliyse fiyata girer (harfler gibi).
  const cubukLed = normalizeCubukLed({ lengthCm: sel.cubukLedCm, heightCm: sel.cubukLedHeightCm });
  return {
    // preisrelevant (Server nutzt genau diese Felder)
    text: String(sel.text || '').trim(),
    heightCm: Number(sel.heightCm),
    lightMode: lit ? 'beleuchtet' : 'unbeleuchtet',
    lightingId,
    constructionId,
    fontId: sel.fontId,
    montageId: sel.montageId || 'selbst',
    bohrschablone: sel.bohrschablone === true, // Montaj Delme Şablonu (bağımsız ek ürün)
    trafo: lit,
    logo,
    // Logo türü: '3d' (harflerle aynı kutu mantığı) | 'uv' (düz baskı, m² fiyatı)
    logoPrint: sel.logoMode === 'uv' ? 'uv' : null,
    // UV Baskı: ön yüze baskı. Fiyat/gerçeklik kapısı motorda (yalnız face=pleksi_oto).
    uvBaski: sel.uvBaski === true,
    logoUv: sel.logoUv === true, // UV baskı (logo) — motorda face=pleksi kapısıyla uygulanır
    cubukUv: sel.cubukUv === true, // UV baskı (çubuk LED)
    cubukLed,
    // Spezifikation (Anzeige/Detail)
    v3: true,
    traeger: ['wand', 'grundplatte', 'profil'].includes(sel.traeger) ? sel.traeger : 'wand',
    logoShape: sel.logoShape === 'circle' ? 'circle' : 'rect',
    logoUrl: sel.logoUrl || '',
    logoName: sel.logoName || '',
    customFontName: sel.customFontName,
    lightDir: sel.lightDir,
    lightColor: sel.lightColor,
    bodyMaterial: sel.bodyMaterial,
    sideMaterial: sel.sideMaterial,
    unbelMaterial: sel.unbelMaterial,
    acrylFront: sel.acrylFront,
    acrylSide: sel.acrylSide,
    acrylFrontKontakt: sel.acrylFrontKontakt,
    acrylSideKontakt: sel.acrylSideKontakt,
    chromColor: sel.chromColor,
    chromSurface: sel.chromSurface,
    ralCode: sel.ralCode,
    backPanelSize: sel.backPanelSize,
    unbelAcryl: sel.unbelAcryl,
    unbelAcrylKontakt: sel.unbelAcrylKontakt,
    faceMetal: sel.faceMetal,
    faceRal: sel.faceRal,
    sideMetal: sel.sideMetal,
    sideRal: sel.sideRal,
    baseColor: sel.baseColor,
    wandabstand: sel.wandabstand,
    surface: sel.surface,
    depth: sel.depth,
    unbelRal: sel.unbelRal,
  };
}

export function priceForState(sel) {
  if (!sel.lit) return null; // Tabellentyp noch nicht gewählt
  if (sel.lit === 'beleuchtet' && !sel.lightDir) return null; // Lichtrichtung fehlt
  return konfigPrice(buildCfg(sel));
}

const findLabel = (list, id) => list.find((x) => x.id === id)?.label || null;
const acrylTxt = (id, kontakt) => `${findLabel(ACRYL_COLORS, id) || ''}${kontakt ? ' · Farbton auf Anfrage' : ''}`;
const chromTxt = (color, surface, ral) => [
  color === 'ral' ? (ral || 'RAL nach Wahl') : findLabel(CHROM_COLORS, color),
  findLabel(CHROM_SURFACES, surface),
].filter(Boolean).join(' · ');

// Menschlich lesbare Zusammenfassung (Deutsch).
// Ürün başlığı: metin varsa metin, yoksa harfsiz ürünün türü (Logo / LED-Leiste / ikisi).
export function productTitle(cfg) {
  if (cfg.text) return cfg.text;
  if (cfg.logo && cfg.cubukLed) return 'Logo + LED-Leiste';
  if (cfg.logo) return 'Logo';
  if (cfg.cubukLed) return 'LED-Leiste';
  return '';
}

export function detail3(sel) {
  const cfg = buildCfg(sel);
  const size = estimateSize(cfg);
  const p = [];
  if (cfg.text) {
    p.push(`„${cfg.text}"`, `${cfg.heightCm} cm`);
    if (size) p.push(`ca. ${size.widthCm}×${size.heightCm} cm`);
    const font = KONFIG_FONTS.find((f) => f.id === sel.fontId);
    if (font) p.push(`Schrift: ${font.id === 'custom' && sel.customFontName ? `${font.label} (${sel.customFontName})` : font.label}`);
  } else {
    p.push(productTitle(cfg)); // harfsiz: Logo / LED-Leiste
  }
  if (cfg.logo) p.push(`Logo${cfg.logoPrint === 'uv' ? ' (UV-Druck)' : ''}: ${cfg.logoShape === 'circle' ? `Ø ${cfg.logo.heightCm}` : `${cfg.logo.widthCm}×${cfg.logo.heightCm}`} cm${sel.logoName ? ` (${sel.logoName})` : ''}`);
  if (cfg.cubukLed) p.push(`LED-Leiste: ${cfg.cubukLed.lengthCm}×${cfg.cubukLed.heightCm} cm (${cubukLedPieces(cfg.cubukLed.lengthCm).join(' + ')} cm)`);

  if (sel.lit === 'unbeleuchtet') {
    p.push('Unbeleuchtet');
    p.push(`Material: ${findLabel(UNBEL_MAT, sel.unbelMaterial)}`);
    if (sel.unbelMaterial === 'alu_lackiert') {
      p.push(`RAL: ${sel.unbelRal || 'nach Wahl'}`);
      p.push(findLabel(SURFACES, sel.surface));
    } else if (sel.unbelMaterial === 'strafor') {
      p.push(`RAL: ${sel.unbelRal || 'nach Wahl'}`);
    } else if (sel.unbelMaterial === 'edelstahl_chrom') {
      p.push(`Farbton: ${chromTxt(sel.chromColor, sel.chromSurface, sel.ralCode)}`);
    } else if (sel.unbelMaterial === 'plexi') {
      p.push(`Acryl: ${acrylTxt(sel.unbelAcryl, sel.unbelAcrylKontakt)}`);
    }
    if (sel.depth) p.push(`Tiefe ${sel.depth} mm`);
  } else {
    const dir = LIGHT_DIRS.find((d) => d.id === sel.lightDir);
    p.push(`Beleuchtet · ${dir ? dir.label : 'bitte Richtung wählen'}`);
    if (sel.lightDir === 'rueck') {
      p.push(`Korpus: ${findLabel(BODY_MAT_RUECK, sel.bodyMaterial)}`);
      if (RUECK_CHROM_IDS.includes(sel.bodyMaterial)) p.push(`Farbton: ${chromTxt(sel.chromColor, sel.chromSurface, sel.ralCode)}`);
      else if (RUECK_LACK_IDS.includes(sel.bodyMaterial)) p.push(`RAL: ${sel.ralCode || 'nach Wahl'}`);
      if (sel.wandabstand) p.push(`Wandabstand ${sel.wandabstand} mm`);
      if (RUECK_WAND_AKRYL_IDS.includes(sel.bodyMaterial)) p.push(`Rückplatte: ${sel.backPanelSize || '8'} mm Acryl`);
    } else if (sel.lightDir === 'front') {
      p.push(`Front-Acryl: ${acrylTxt(sel.acrylFront, sel.acrylFrontKontakt)}`);
      p.push(`Seiten: ${findLabel(SIDE_MAT_FRONT, sel.sideMaterial)} · ${CHROM_SIDE_IDS.includes(sel.sideMaterial) ? chromTxt(sel.chromColor, sel.chromSurface, sel.ralCode) : `RAL ${sel.ralCode || 'nach Wahl'}`}`);
    } else if (sel.lightDir === 'front_seite') {
      p.push(`Front-Acryl: ${acrylTxt(sel.acrylFront, sel.acrylFrontKontakt)}`);
      p.push(`Seiten-Acryl: ${acrylTxt(sel.acrylSide, sel.acrylSideKontakt)}`);
    } else if (sel.lightDir === 'seite') {
      p.push(`Korpus: Chrom · ${chromTxt(sel.chromColor, sel.chromSurface, sel.ralCode)}`);
      p.push(`Seiten-Acryl: ${acrylTxt(sel.acrylSide, sel.acrylSideKontakt)}`);
    }
    const lc = LIGHT_COLORS.find((c) => c.id === sel.lightColor);
    if (lc) p.push(`Licht: ${lc.label}`);
  }
  const mo = KONFIG_MONTAGE.find((m) => m.id === (sel.montageId || 'selbst'));
  if (mo) p.push(mo.quote ? `${mo.label} (Angebot anfragen)` : mo.label);
  if (sel.traeger && sel.traeger !== 'wand') p.push(`Untergrund: ${sel.traeger === 'grundplatte' ? 'Grundplatte' : 'Tragprofil'} (Angebot anfragen)`);
  if (sel.bohrschablone === true) p.push('+ Montage-Bohrschablone');
  return p.join(' · ');
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVER-SEITIGE, REINE HELFER (auch in /api/order genutzt).
// Ziel: v3-Produktionsdetails per strikter Allowlist übernehmen und die
// preisrelevanten IDs serverseitig aus geprüften Auswahlen ableiten — niemals
// dem Client vertrauen. Kein React/DOM, damit serverseitig importierbar.
// ─────────────────────────────────────────────────────────────────────────────

// Enum-Pflichtfeld: nur gültige Listen-ID übernehmen, sonst Fehler (Feldname).
function reqEnum(list, id, key, out, errors) {
  if (list.some((x) => x.id === id)) out[key] = id;
  else errors.push(key);
}

// Metallfarbe (+ optionale RAL-Freitextfarbe, falls 'ral' gewählt).
function reqMetalRal(list, id, ralRaw, key, ralKey, out, errors) {
  if (!list.some((x) => x.id === id)) { errors.push(key); return; }
  out[key] = id;
  if (id === 'ral') {
    const ral = normalizeRal(ralRaw);
    if (!ral) errors.push(ralKey);
    else out[ralKey] = ral;
  }
}

// RAL-Pflichtfeld (Freitext, normalisiert).
function reqRal(raw, key, out, errors) {
  const ral = normalizeRal(raw);
  if (ral) out[key] = ral; else errors.push(key);
}

// Chrom-Auswahl: Farbton (Gold/Silber/Kupfer/RAL) + Oberfläche (Glänzend/Gebürstet).
function reqChrom(r, out, errors) {
  reqEnum(CHROM_COLORS, r.chromColor, 'chromColor', out, errors);
  if (r.chromColor === 'ral') reqRal(r.ralCode, 'ralCode', out, errors);
  reqEnum(CHROM_SURFACES, r.chromSurface, 'chromSurface', out, errors);
}

// Acryl-Hauptfarbe (Pflicht) + unabhängige „Farbtöne — Kontakt"-Checkbox (optional).
function reqAcryl(r, key, kontaktKey, out, errors) {
  reqEnum(ACRYL_COLORS, r[key], key, out, errors);
  out[kontaktKey] = r[kontaktKey] === true;
}

// A. sanitizeV3Config — validiert die vom Client gesendete v3-Konfiguration
// gegen die vorhandenen Optionslisten. Gibt { ok:true, config } mit NUR den
// erlaubten, geprüften Feldern (bedingungsabhängig) zurück, sonst
// { ok:false, errors:[Feldnamen] }. Rohwerte landen weder im Ergebnis noch
// in den Fehlern. Preis-IDs (lightingId/constructionId) werden hier NICHT
// übernommen — sie kommen aus deriveV3PricingConfig.
export function sanitizeV3Config(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const out = {};
  const errors = [];

  // Gemeinsame Pflichtfelder
  const lightMode = r.lightMode;
  if (lightMode === 'beleuchtet' || lightMode === 'unbeleuchtet') out.lightMode = lightMode;
  else errors.push('lightMode');

  // Harfsiz ürün (sadece Logo veya Çubuk LED) da geçerli — metin boş olabilir.
  // Bileşen kontrolü Logo/Çubuk doğrulandıktan SONRA aşağıda yapılır.
  out.text = String(r.text ?? '').trim().slice(0, KONFIG_LIMITS.maxTextLen);

  const h = Number(r.heightCm);
  if (Number.isFinite(h) && h >= KONFIG_LIMITS.minHeight && h <= KONFIG_LIMITS.maxHeight) out.heightCm = Math.round(h);
  else errors.push('heightCm');

  reqEnum(KONFIG_FONTS, r.fontId, 'fontId', out, errors);
  // Hochgeladene Kundenschrift: Dateiname mitführen (Datei selbst kommt als Positions-Upload).
  if (r.fontId === 'custom') out.customFontName = String(r.customFontName || '').trim().slice(0, 120);
  reqEnum(KONFIG_MONTAGE, r.montageId, 'montageId', out, errors);
  // Montaj Delme Şablonu: bağımsız, opsiyonel ek ürün (boolean).
  out.bohrschablone = r.bohrschablone === true;
  // UV Baskı: ön yüze baskı (yalnız önden akrilik ürünlerde geçerli — gerçeklik kapısı motorda).
  out.uvBaski = r.uvBaski === true;
  out.logoUv = r.logoUv === true;
  out.cubukUv = r.cubukUv === true;

  // Optionales Logo: wenn angegeben, müssen beide Maße gültig sein (preisrelevant).
  // logoUrl wird hier nur größenbegrenzt — die Bucket-Prüfung macht /api/order.
  if (r.logo) {
    const lg = normalizeLogo(r.logo);
    if (!lg) errors.push('logo');
    else {
      out.logo = lg;
      out.logoShape = r.logoShape === 'circle' ? 'circle' : 'rect';
      // Baskı logo türü (UV). Yoksa 3D kutu logo (varsayılan).
      if (r.logoPrint === 'uv') out.logoPrint = 'uv';
      if (r.logoUrl) out.logoUrl = String(r.logoUrl).slice(0, 500);
      if (r.logoName) out.logoName = String(r.logoName).trim().slice(0, 200);
    }
  }

  // Opsiyonel Çubuk LED: verildiyse ölçüler geçerli olmalı (fiyata girer).
  if (r.cubukLed) {
    const cl = normalizeCubukLed(r.cubukLed);
    if (!cl) errors.push('cubukLed');
    else out.cubukLed = cl;
  }

  // Montageuntergrund: wand (standart) | grundplatte | profil — plaka/profil teklif gerektirir.
  out.traeger = ['wand', 'grundplatte', 'profil'].includes(r.traeger) ? r.traeger : 'wand';

  if (lightMode === 'beleuchtet') {
    const dir = LIGHT_DIRS.find((d) => d.id === r.lightDir);
    if (!dir) {
      errors.push('lightDir');
    } else {
      out.lightDir = dir.id;
      // Lichtfarbe ist in allen beleuchteten Zweigen sichtbar → Pflicht.
      reqEnum(LIGHT_COLORS, r.lightColor, 'lightColor', out, errors);

      if (dir.id === 'rueck') {
        reqEnum(BODY_MAT_RUECK, r.bodyMaterial, 'bodyMaterial', out, errors);
        // Chrom-Ausführungen → Farbton + Oberfläche; lackierte → RAL-Code.
        if (RUECK_CHROM_IDS.includes(r.bodyMaterial)) reqChrom(r, out, errors);
        else if (RUECK_LACK_IDS.includes(r.bodyMaterial)) reqRal(r.ralCode, 'ralCode', out, errors);
        reqEnum(WANDABSTAND, r.wandabstand, 'wandabstand', out, errors);
        // Rückplatten-Stärke nur bei den Wand-Acryl-Varianten (Pflicht: 8/18 mm).
        if (RUECK_WAND_AKRYL_IDS.includes(r.bodyMaterial)) reqEnum(BACK_PANELS, r.backPanelSize, 'backPanelSize', out, errors);
      } else if (dir.id === 'front') {
        reqAcryl(r, 'acrylFront', 'acrylFrontKontakt', out, errors);
        reqEnum(SIDE_MAT_FRONT, r.sideMaterial, 'sideMaterial', out, errors);
        // Chrom-Ausführungen → Farbton + Oberfläche; sonst (Alu / lackiert) → RAL-Code.
        if (CHROM_SIDE_IDS.includes(r.sideMaterial)) reqChrom(r, out, errors);
        else if (SIDE_MAT_FRONT.some((m) => m.id === r.sideMaterial)) reqRal(r.ralCode, 'ralCode', out, errors);
      } else if (dir.id === 'front_seite') {
        reqAcryl(r, 'acrylFront', 'acrylFrontKontakt', out, errors);
        reqAcryl(r, 'acrylSide', 'acrylSideKontakt', out, errors);
      } else if (dir.id === 'seite') {
        // Seitenleuchtend ist immer Chrom — Farbton + Oberfläche wählbar.
        reqChrom(r, out, errors);
        reqAcryl(r, 'acrylSide', 'acrylSideKontakt', out, errors);
      }
    }
  } else if (lightMode === 'unbeleuchtet') {
    if (UNBEL_MAT.some((m) => m.id === r.unbelMaterial)) {
      out.unbelMaterial = r.unbelMaterial;
      // Zusatzfelder je Materialzweig (so wie im UI gezeigt).
      if (r.unbelMaterial === 'alu_lackiert') {
        reqRal(r.unbelRal, 'unbelRal', out, errors);
        reqEnum(SURFACES, r.surface, 'surface', out, errors);
        reqEnum(DEPTHS, r.depth, 'depth', out, errors);
      } else if (r.unbelMaterial === 'strafor') {
        reqRal(r.unbelRal, 'unbelRal', out, errors);
      } else if (r.unbelMaterial === 'edelstahl_chrom') {
        reqChrom(r, out, errors);
      } else if (r.unbelMaterial === 'plexi') {
        reqAcryl(r, 'unbelAcryl', 'unbelAcrylKontakt', out, errors);
      }
    } else {
      errors.push('unbelMaterial');
    }
  }

  // Harfsiz ürün geçerli sayılır ANCAK en az bir bileşen (Logo veya Çubuk LED) olmalı;
  // metin de yoksa yapılandırma boştur.
  if (!out.text && !out.logo && !out.cubukLed) errors.push('text');

  if (errors.length) return { ok: false, errors };
  return { ok: true, config: out };
}

// B. deriveV3PricingConfig — erzeugt aus der GEPRÜFTEN Konfiguration das
// preisfertige Objekt für konfigPrice. lightingId/constructionId werden aus
// lightMode/lightDir + der buildCfg-Abbildung neu abgeleitet (Client-Werte
// werden ignoriert). Gibt null zurück, wenn Preis-Basisfelder ungültig sind.
export function deriveV3PricingConfig(c) {
  if (!c || typeof c !== 'object') return null;
  const lit = c.lightMode === 'beleuchtet';
  let constructionId, lightingId;
  if (lit) {
    const dir = LIGHT_DIRS.find((d) => d.id === c.lightDir);
    if (!dir) return null;
    lightingId = dir.lighting; // rueck → 'halo'
    if (dir.id === 'rueck') constructionId = 'chrom_halo';
    else if (dir.id === 'front') constructionId = CHROM_SIDE_IDS.includes(c.sideMaterial) ? 'chrom_plexi' : 'alu_plexi';
    else constructionId = 'voll_plexi';
  } else if (c.lightMode === 'unbeleuchtet') {
    constructionId = ({ plexi: 'voll_plexi', alu_lackiert: 'alu_plexi', edelstahl_chrom: 'chrom_plexi', strafor: 'alu_plexi' })[c.unbelMaterial] || 'alu_plexi';
    lightingId = 'none';
  } else {
    return null;
  }

  const text = String(c.text ?? '').trim().slice(0, KONFIG_LIMITS.maxTextLen);
  const h = Number(c.heightCm);
  if (!Number.isFinite(h) || h < KONFIG_LIMITS.minHeight || h > KONFIG_LIMITS.maxHeight) return null;
  if (!KONFIG_FONTS.some((f) => f.id === c.fontId)) return null;
  if (!KONFIG_MONTAGE.some((m) => m.id === c.montageId)) return null;

  // Optionales Logo: falls vorhanden, müssen die Maße gültig sein.
  let logo = null;
  if (c.logo) {
    logo = normalizeLogo(c.logo);
    if (!logo) return null;
  }

  // Optionale LED-Leiste (Çubuk LED): falls vorhanden, müssen die Maße gültig sein.
  let cubukLed = null;
  if (c.cubukLed) {
    cubukLed = normalizeCubukLed(c.cubukLed);
    if (!cubukLed) return null;
  }

  // Harfsiz ürün: metin yoksa en az bir bileşen (Logo/Çubuk LED) olmalı.
  if (!text && !logo && !cubukLed) return null;

  return {
    text,
    heightCm: Math.round(h),
    lightMode: c.lightMode,
    lightingId,
    constructionId,
    fontId: c.fontId,
    montageId: c.montageId,
    bohrschablone: c.bohrschablone === true,
    trafo: lit,
    logo,
    logoPrint: c.logoPrint === 'uv' ? 'uv' : null,
    uvBaski: c.uvBaski === true,
    logoUv: c.logoUv === true,
    cubukUv: c.cubukUv === true,
    cubukLed,
  };
}

// C. detailV3 — deutsche, vollständige Produktions-Zusammenfassung aus der
// GEPRÜFTEN Konfiguration. Zeigt nur die im jeweiligen Zweig relevanten
// Auswahlen; keine Default-Ersetzung („Weiß/Silber"), keine Rohwerte.
export function detailV3(c) {
  if (!c || typeof c !== 'object') return '';
  const size = estimateSize({ text: c.text, heightCm: c.heightCm, fontId: c.fontId });
  const p = [];
  if (c.text) {
    p.push(`„${c.text}"`, `${c.heightCm} cm`);
    if (size) p.push(`ca. ${size.widthCm}×${size.heightCm} cm`);
    const font = KONFIG_FONTS.find((f) => f.id === c.fontId);
    if (font) p.push(`Schrift: ${font.id === 'custom' && c.customFontName ? `${font.label} (${c.customFontName})` : font.label}`);
  } else {
    p.push(productTitle(c)); // harfsiz: Logo / LED-Leiste
  }
  if (c.logo) p.push(`Logo${c.logoPrint === 'uv' ? ' (UV-Druck)' : ''}: ${c.logoShape === 'circle' ? `Ø ${c.logo.heightCm}` : `${c.logo.widthCm}×${c.logo.heightCm}`} cm${c.logoName ? ` (${c.logoName})` : ''}`);
  if (c.cubukLed) p.push(`LED-Leiste: ${c.cubukLed.lengthCm}×${c.cubukLed.heightCm} cm (${cubukLedPieces(c.cubukLed.lengthCm).join(' + ')} cm)`);

  if (c.lightMode === 'unbeleuchtet') {
    p.push('Unbeleuchtet');
    const mat = findLabel(UNBEL_MAT, c.unbelMaterial);
    if (mat) p.push(`Material: ${mat}`);
    if (c.unbelMaterial === 'alu_lackiert') {
      if (c.unbelRal) p.push(`RAL: ${c.unbelRal}`);
      const surf = findLabel(SURFACES, c.surface);
      if (surf) p.push(surf);
      if (c.depth) p.push(`Tiefe ${c.depth} mm`);
    } else if (c.unbelMaterial === 'strafor') {
      if (c.unbelRal) p.push(`RAL: ${c.unbelRal}`);
    } else if (c.unbelMaterial === 'edelstahl_chrom') {
      p.push(`Farbton: ${chromTxt(c.chromColor, c.chromSurface, c.ralCode)}`);
    } else if (c.unbelMaterial === 'plexi') {
      p.push(`Acryl: ${acrylTxt(c.unbelAcryl, c.unbelAcrylKontakt)}`);
    }
  } else {
    const dir = LIGHT_DIRS.find((d) => d.id === c.lightDir);
    if (dir) p.push(`Beleuchtet · ${dir.label}`);
    if (c.lightDir === 'rueck') {
      const korpus = findLabel(BODY_MAT_RUECK, c.bodyMaterial);
      if (korpus) p.push(`Korpus: ${korpus}`);
      if (RUECK_CHROM_IDS.includes(c.bodyMaterial)) p.push(`Farbton: ${chromTxt(c.chromColor, c.chromSurface, c.ralCode)}`);
      else if (RUECK_LACK_IDS.includes(c.bodyMaterial) && c.ralCode) p.push(`RAL: ${c.ralCode}`);
      if (c.wandabstand) p.push(`Wandabstand ${c.wandabstand} mm`);
      if (RUECK_WAND_AKRYL_IDS.includes(c.bodyMaterial) && c.backPanelSize) p.push(`Rückplatte: ${c.backPanelSize} mm Acryl`);
    } else if (c.lightDir === 'front') {
      p.push(`Front-Acryl: ${acrylTxt(c.acrylFront, c.acrylFrontKontakt)}`);
      p.push(`Seiten: ${findLabel(SIDE_MAT_FRONT, c.sideMaterial)} · ${CHROM_SIDE_IDS.includes(c.sideMaterial) ? chromTxt(c.chromColor, c.chromSurface, c.ralCode) : `RAL ${c.ralCode || '—'}`}`);
    } else if (c.lightDir === 'front_seite') {
      p.push(`Front-Acryl: ${acrylTxt(c.acrylFront, c.acrylFrontKontakt)}`);
      p.push(`Seiten-Acryl: ${acrylTxt(c.acrylSide, c.acrylSideKontakt)}`);
    } else if (c.lightDir === 'seite') {
      p.push(`Korpus: Chrom · ${chromTxt(c.chromColor, c.chromSurface, c.ralCode)}`);
      p.push(`Seiten-Acryl: ${acrylTxt(c.acrylSide, c.acrylSideKontakt)}`);
    }
    const lc = LIGHT_COLORS.find((x) => x.id === c.lightColor);
    if (lc) p.push(`Licht: ${lc.label}`);
  }
  const mo = KONFIG_MONTAGE.find((m) => m.id === c.montageId);
  if (mo) p.push(mo.quote ? `${mo.label} (Angebot anfragen)` : mo.label);
  if (c.traeger && c.traeger !== 'wand') p.push(`Untergrund: ${c.traeger === 'grundplatte' ? 'Grundplatte' : 'Tragprofil'} (Angebot anfragen)`);
  if (c.bohrschablone === true) p.push('+ Montage-Bohrschablone');
  return p.join(' · ');
}
