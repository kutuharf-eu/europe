// İstemciden gelen fiyat cfg'si için allowlist — /api/price'daki desenin stüdyo
// karşılığı. Yalnız fiyata etki eden alanlar geçer; bilinmeyen alanlar düşer.

import { KONFIG_LIMITS } from '@/data/konfigurator';

export const MAX_STUDIO_ITEMS = 60;

export function pickStudioCfg(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    text: String(raw.text || '').slice(0, KONFIG_LIMITS.maxTextLen),
    heightCm: Number(raw.heightCm),
    lightMode: raw.lightMode === 'unbeleuchtet' ? 'unbeleuchtet' : 'beleuchtet',
    lightingId: typeof raw.lightingId === 'string' ? raw.lightingId : undefined,
    constructionId: typeof raw.constructionId === 'string' ? raw.constructionId : undefined,
    fontId: typeof raw.fontId === 'string' ? raw.fontId : undefined,
    montageId: typeof raw.montageId === 'string' ? raw.montageId : 'selbst',
    trafo: raw.trafo !== false,
    logo:
      raw.logo && typeof raw.logo === 'object'
        ? {
            widthCm: Number(raw.logo.widthCm),
            heightCm: Number(raw.logo.heightCm),
            shape: raw.logo.shape === 'circle' ? 'circle' : 'rect',
          }
        : null,
    cubukLed:
      raw.cubukLed && typeof raw.cubukLed === 'object'
        ? { lengthCm: Number(raw.cubukLed.lengthCm), heightCm: Number(raw.cubukLed.heightCm) }
        : null,
  };
}
