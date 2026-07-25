// Stüdyo tasarımı → fiyat motorunun cfg modeli.
//
// Motorun girdi modeli stüdyonunkinden DAR (plan §1.2): harf, logo ve çubuk fiyatlanır;
// tabela zemini diye bir kalem yoktur. Eşleme kuralları (Murat'ın 25 Tem kararları):
//   yazı satırı → text kalemi (her SATIR ayrı kalem — üretimde ayrı montaj sırası)
//   daire       → logo { shape:'circle' }
//   yıldız      → logo { shape:'rect' }  ← çevreleyen dikdörtgen ölçüsüyle
//   dikdörtgen  → logo { shape:'rect' }
//   görsel/logo → logo { shape:'rect' }
//   çubuk       → cubukLed { lengthCm, heightCm }
//   zemin       → FİYATLANMAZ, teklifte ayrıca kalküle edilir
//
// İlk kalem ana kalemdir; sonrakiler addon:true → ambalaj/minimum/montaj/trafo
// yalnız bir kez alınır (motorun hazır "ek ürün" mantığı).

import { KONFIG_LIMITS } from '@/data/konfigurator';
import { clamp, elementSizeCm, textLines, elementLabel } from '@/lib/studio/model';

/** Motor harf yüksekliğini 5–100 cm arasında ister; logo/çubuk kaleminde de zorunlu. */
const heightForEngine = (cm) =>
  clamp(Math.round(Number(cm) || 0), KONFIG_LIMITS.minHeight, KONFIG_LIMITS.maxHeight);

/**
 * @param {{elements:any[], lighting:{lit:boolean}, product:{constructionId:string,lightingId:string,montageId:string}}} design
 * @returns {{items:Array, warnings:string[]}} items[i] = { key, label, cfg, addon }
 */
export function toPricingItems(design) {
  const { elements = [], lighting, product } = design;
  const base = {
    lightMode: lighting?.lit ? 'beleuchtet' : 'unbeleuchtet',
    lightingId: product?.lightingId,
    constructionId: product?.constructionId,
    montageId: product?.montageId || 'selbst',
    fontId: 'modern',
    trafo: true,
  };

  const items = [];
  const warnings = [];

  for (const el of elements) {
    if (el.type === 'text') {
      const lines = textLines(el).filter((l) => l.trim().length);
      if (!lines.length) continue;
      lines.forEach((line, i) => {
        items.push({
          key: lines.length > 1 ? `${el.id}:${i}` : el.id,
          label: line,
          cfg: { ...base, fontId: el.fontId, text: line, heightCm: heightForEngine(el.heightCm) },
        });
      });
      continue;
    }

    const { widthCm, heightCm } = elementSizeCm(el);

    if (el.type === 'shape' && el.kind === 'bar') {
      items.push({
        key: el.id,
        label: elementLabel(el),
        cfg: {
          ...base,
          text: '',
          heightCm: heightForEngine(heightCm),
          cubukLed: { lengthCm: Math.round(widthCm), heightCm: Math.round(heightCm) },
        },
      });
      continue;
    }

    // Daire dairesel, diğer formlar (yıldız dahil) çevreleyen dikdörtgen ölçüsüyle.
    const shape = el.type === 'shape' && el.kind === 'circle' ? 'circle' : 'rect';
    if (el.type === 'shape' && el.kind === 'star') {
      warnings.push('star');
    }
    items.push({
      key: el.id,
      label: el.type === 'image' ? el.name || elementLabel(el) : elementLabel(el),
      cfg: {
        ...base,
        text: '',
        heightCm: heightForEngine(heightCm),
        logo: { widthCm: Math.round(widthCm), heightCm: Math.round(heightCm), shape },
      },
    });
  }

  // İlki ana kalem, diğerleri ek ürün → proje ücretleri iki kez alınmaz.
  items.forEach((it, i) => {
    it.addon = i > 0;
  });

  return { items, warnings: [...new Set(warnings)] };
}

/**
 * Yalnız FİYATA ETKİ EDEN alanların imzası. x/y, renk, döndürme, köşe yarıçapı ve
 * zemin ölçüsü fiyatı değiştirmez → sürükleme sırasında istek atılmaz (plan §3).
 */
export function pricingSignature(design) {
  const { items } = toPricingItems(design);
  return JSON.stringify(items.map((i) => [i.cfg, i.addon]));
}
