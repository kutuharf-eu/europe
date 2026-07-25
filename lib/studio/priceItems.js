// Stüdyo kalemlerinin SUNUCU tarafı fiyatlaması (server-only: live-pricing → node:fs).
// Hem canlı fiyat rotası hem tasarım kaydı/teklif buradan geçer; kaydedilen tutar
// asla istemciden gelmez.

import { serverKonfigPrice } from '@/lib/live-pricing';
import { KONFIG_LIMITS } from '@/data/konfigurator';
import { toPricingItems } from '@/lib/studio/toPricingCfg';

/** 50 cm üzeri herhangi bir bileşen → tüm iş Premium marjıyla (Angebotspreis). */
export function isOversize(cfg) {
  const h = Number(cfg.heightCm) || 0;
  const lh = cfg.logo ? Number(cfg.logo.heightCm) || 0 : 0;
  const ch = cfg.cubukLed ? Number(cfg.cubukLed.heightCm) || 0 : 0;
  return (
    h > KONFIG_LIMITS.quoteHeight ||
    lh > KONFIG_LIMITS.quoteHeight ||
    ch > KONFIG_LIMITS.quoteHeight
  );
}

/**
 * @param {Array<{key:string,cfg:object,addon:boolean}>} items
 * @returns {Promise<{items:Array, total:number, premiumQuote:boolean}>}
 */
export async function priceItems(items) {
  if (!items.length) return { items: [], total: 0, premiumQuote: false };

  const premiumQuote = items.some((it) => isOversize(it.cfg));
  const marjKey = premiumQuote ? 'premium' : undefined;

  const priced = await Promise.all(
    items.map(async (it) => {
      const p = await serverKonfigPrice(it.cfg, { addon: it.addon === true, marjKey });
      if (!p) return { key: it.key, priced: false };
      return {
        key: it.key,
        priced: true,
        // Yalnız satış rakamları — maliyet/değişken sızmaz.
        letters: p.letters,
        perLetter: p.perLetter,
        lettersTotal: p.lettersTotal,
        logo: p.logo ? { eqLetters: p.logo.eqLetters, total: p.logo.total } : null,
        cubukLed: p.cubukLed ? { pieces: p.cubukLed.pieces, total: p.cubukLed.total } : null,
        netzteil: p.netzteil || 0,
        ambalaj: p.ambalaj || 0,
        montage: p.montage || 0,
        minApplied: !!p.minApplied,
        total: p.total,
      };
    })
  );

  const total = priced.reduce((sum, p) => sum + (p.priced ? p.total : 0), 0);
  return { items: priced, total: Math.round(total * 100) / 100, premiumQuote };
}

/** Tasarımın tamamını fiyatlar — kayıt ve teklifte kullanılır. */
export async function priceDesign(design) {
  const { items } = toPricingItems(design);
  return priceItems(items);
}
