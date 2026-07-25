// Stüdyo eleman modeli — renderer'dan BAĞIMSIZ saf veri.
// Konva bu modeli yalnızca çizer; ileride SVG/DXF üretim çıktısı eklenirken bu dosya
// değişmemeli. Tüm ölçüler cm cinsindendir (tek doğruluk kaynağı).

import {
  KONFIG_LIMITS,
  LOGO_LIMITS,
  LOGO_WIDTH_FACTOR,
  CUBUK_LED_LIMITS,
} from '@/data/konfigurator';
import { fontById } from '@/data/studio-fonts';

/**
 * @typedef {'text'|'shape'|'image'} StudioElementType
 * @typedef {'rect'|'circle'|'star'|'bar'} StudioShapeKind
 *
 * @typedef {Object} StudioElementBase
 * @property {string} id
 * @property {StudioElementType} type
 * @property {number} xCm  zemin sol kenarına göre
 * @property {number} yCm  zemin üst kenarına göre
 * @property {number} rotation  derece
 * @property {string} colorHex
 *
 * @typedef {StudioElementBase & {type:'text', text:string, fontId:string, heightCm:number, letterSpacingCm:number, lineGapCm:number}} StudioText
 * @typedef {StudioElementBase & {type:'shape', kind:StudioShapeKind, widthCm:number, heightCm:number}} StudioShape
 * @typedef {StudioElementBase & {type:'image', src:string, name:string, widthCm:number, heightCm:number, shape:'rect'|'circle'}} StudioImage
 * @typedef {StudioText|StudioShape|StudioImage} StudioElement
 */

/** Harf yüksekliği motorun sınırlarıyla aynı; zemin ayrı sınırlara sahip.
 *  maxLen SATIR BAŞINA geçerli — motor da her kalemi tek satır olarak fiyatlıyor. */
export const TEXT_LIMITS = {
  minHeightCm: KONFIG_LIMITS.minHeight,
  maxHeightCm: KONFIG_LIMITS.maxHeight,
  maxLen: KONFIG_LIMITS.maxTextLen,
  maxLines: 5,
  // Harf arası: negatif = sıkıştırma (harfler birbirine yaklaşır), pozitif = açma.
  minSpacingCm: -3,
  maxSpacingCm: 40,
  maxLineGapCm: 60,
};
/** Logo/şekil sınırları (daire, yıldız, dikdörtgen, görsel). */
export const SHAPE_LIMITS = {
  minCm: LOGO_LIMITS.minCm,
  maxWidthCm: LOGO_LIMITS.maxWidth,
  maxHeightCm: LOGO_LIMITS.maxHeight,
};

/**
 * Sınırlar şekil türüne göre değişir — çubuk (Leuchtbalken) motorda ayrı bir kalem
 * ve logodan farklı sınırları var: 5 cm yüksekliğe kadar inebilir, 15 m'ye kadar
 * uzayabilir (motor 150 cm'lik parçalara bölerek üretir).
 */
export function shapeLimitsFor(kind) {
  if (kind === 'bar') {
    return {
      minWidthCm: CUBUK_LED_LIMITS.minCm,
      maxWidthCm: CUBUK_LED_LIMITS.maxLen,
      minHeightCm: CUBUK_LED_LIMITS.minHeight,
      maxHeightCm: CUBUK_LED_LIMITS.maxHeight,
    };
  }
  return {
    minWidthCm: SHAPE_LIMITS.minCm,
    maxWidthCm: SHAPE_LIMITS.maxWidthCm,
    minHeightCm: SHAPE_LIMITS.minCm,
    maxHeightCm: SHAPE_LIMITS.maxHeightCm,
  };
}
export const SIGN_LIMITS = {
  minWidthCm: 40,
  maxWidthCm: 1200,
  minHeightCm: 20,
  maxHeightCm: 400,
};

export const DEFAULT_SIGN = { widthCm: 300, heightCm: 100 };
const DEFAULT_COLOR = '#ffffff';

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

let seq = 0;
const nextId = (prefix) => `${prefix}${Date.now().toString(36)}${(seq++).toString(36)}`;

/** @returns {StudioText} */
export function createText(patch = {}) {
  return {
    id: nextId('t'),
    type: 'text',
    text: 'KUTUHARF',
    fontId: 'modern',
    heightCm: 20,
    letterSpacingCm: 0,
    lineGapCm: 5,
    xCm: 20,
    yCm: 20,
    rotation: 0,
    colorHex: DEFAULT_COLOR,
    ...patch,
  };
}

/**
 * @param {StudioShapeKind} kind
 * @returns {StudioShape}
 */
export function createShape(kind = 'rect', patch = {}) {
  const base = { widthCm: 40, heightCm: 40 };
  // Çubuk uzun ve ince; motorda cubukLed olarak fiyatlanacak (Faz 3).
  if (kind === 'bar') Object.assign(base, { widthCm: 100, heightCm: 10 });
  return {
    id: nextId('s'),
    type: 'shape',
    kind,
    // Köşeler varsayılan olarak keskin; istenirse yuvarlatılır (Murat, 25 Tem).
    cornerRadiusCm: 0,
    ...base,
    xCm: 20,
    yCm: 20,
    rotation: 0,
    colorHex: DEFAULT_COLOR,
    ...patch,
  };
}

/** @returns {StudioImage} */
export function createImage(patch = {}) {
  return {
    id: nextId('i'),
    type: 'image',
    src: '',
    name: '',
    widthCm: 40,
    heightCm: 40,
    shape: 'rect',
    xCm: 20,
    yCm: 20,
    rotation: 0,
    colorHex: DEFAULT_COLOR,
    ...patch,
  };
}

/** Çok satırlı yazının satırları. Her satır üretimde ayrı bir montaj sırasıdır ve
 *  Faz 3'te motora ayrı kalem olarak gidecek (ilki ana, sonrakiler addon). */
export const textLines = (el) => String(el.text ?? '').split('\n');

/**
 * Bir satırın yaklaşık genişliği — fontun widthFactor'ünden türetilir, harf arası
 * eklenir. Tuvalde gerçek genişliği Konva ölçer; bu değer sığma uyarısı, montaj
 * şablonu ve fiyat eşlemesi (Faz 3) için kullanılır.
 */
export function estimateLineWidthCm(line, el) {
  const f = fontById(el.fontId);
  const n = String(line || '').length;
  if (!n) return 0;
  // widthFactor = ortalama karakter genişliği / yükseklik; +%10 doğal harf aralığı payı.
  const base = n * el.heightCm * (f?.widthFactor || 0.66) * 1.1;
  // Harf arası yalnız harflerin ARASINA girer → (n-1) kez.
  return Math.max(0, base + Math.max(0, n - 1) * (el.letterSpacingCm || 0));
}

/** Yazının en geniş satırı = tabelada kapladığı genişlik. */
export function estimateTextWidthCm(el) {
  const widths = textLines(el).map((l) => estimateLineWidthCm(l, el));
  return widths.length ? Math.max(...widths) : 0;
}

/** Çok satırlı yazının toplam yüksekliği (satır aralıkları dahil). */
export function estimateTextHeightCm(el) {
  const n = textLines(el).length;
  return n * el.heightCm + Math.max(0, n - 1) * (el.lineGapCm || 0);
}

/**
 * Elemanın kapsayıcı kutusu (cm) — hizalama, sığma kontrolü ve fiyat eşlemesi için.
 * Yazıda tuvalin ölçtüğü gerçek değer varsa o kullanılır (measuredWidthCm); yoksa
 * fontun widthFactor'ünden türeyen tahmin. Gerçek ölçü hizalamayı isabetli yapar.
 */
export function elementSizeCm(el) {
  if (el.type === 'text') {
    return {
      widthCm: el.measuredWidthCm ?? estimateTextWidthCm(el),
      heightCm: el.measuredHeightCm ?? estimateTextHeightCm(el),
    };
  }
  return { widthCm: el.widthCm, heightCm: el.heightCm };
}

/** Hizalama modları — zemine (Schild) göre. */
export const ALIGN_MODES = ['left', 'centerX', 'right', 'top', 'middleY', 'bottom'];

/** Elemanı zemine hizalayan konum yaması. */
export function alignPatch(el, sign) {
  const { widthCm, heightCm } = elementSizeCm(el);
  return {
    left: { xCm: 0 },
    centerX: { xCm: (sign.widthCm - widthCm) / 2 },
    right: { xCm: sign.widthCm - widthCm },
    top: { yCm: 0 },
    middleY: { yCm: (sign.heightCm - heightCm) / 2 },
    bottom: { yCm: sign.heightCm - heightCm },
  };
}

/** Eleman zeminin dışına taşıyor mu? (uyarı amaçlı, engellemiyoruz) */
export function isOutsideSign(el, sign) {
  const { widthCm, heightCm } = elementSizeCm(el);
  return (
    el.xCm < -1 ||
    el.yCm < -1 ||
    el.xCm + widthCm > sign.widthCm + 1 ||
    el.yCm + heightCm > sign.heightCm + 1
  );
}

/** Logonun "eşdeğer harf" genişlik katsayısı — Faz 3 fiyat eşlemesinde kullanılacak. */
export { LOGO_WIDTH_FACTOR };

/** i18n anahtarı: studio.elementLabels.<key> — Almanca metinler yalnız yedek. */
export const elementLabelKey = (el) => (el.type === 'shape' ? el.kind : el.type);

export const ELEMENT_LABELS = {
  text: 'Schriftzug',
  rect: 'Rechteck',
  circle: 'Kreis',
  star: 'Stern',
  bar: 'Leuchtbalken',
  image: 'Bild/Logo',
};

export const elementLabel = (el) => ELEMENT_LABELS[elementLabelKey(el)];

/** Çeviren etiket — bileşenler t() ile çağırır (sunucu tarafı yedeğe düşer). */
export const translatedElementLabel = (t, el) =>
  t(`studio.elementLabels.${elementLabelKey(el)}`, null, elementLabel(el));
