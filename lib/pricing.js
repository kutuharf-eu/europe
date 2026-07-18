// Kutu-Harf-Modul v2 — Satış Katmanı (Brief §6). Saf fonksiyon.
// Akış: üretim (+ işçilik) → fire → + ambalaj → risk → net maliyet
//       → EUR'ya çevir × marj → min. sipariş tabanı → + KDV.
// Kargo fiyata GİRMEZ, hiçbir çarpandan geçmez — bilgi metni olarak döner.
import { toTRY } from './cost-engine.js';

export function computeSale({ cost, h, segment = 'standart', vars }) {
  const warnings = [...cost.warnings];
  const N = cost.geometry.N;

  const uretimTRY = cost.uretimTRY;

  // İşçilik: değişken hazır, varsayılan 0 → 0 olduğu sürece uyarı (§6)
  const iscilikUnit = toTRY(vars.iscilikPerHarf, vars, warnings, 'İşçilik');
  const iscilikTRY = iscilikUnit * N;
  if (iscilikTRY === 0 && N > 0) warnings.push('İşçilik dahil değil (iscilikPerHarf = 0).');

  const fire = (Number(vars.fireYuzde) || 0) / 100;
  const ambalajTRY = toTRY(vars.ambalajTaban, vars, warnings, 'Ambalaj'); // kademe: faz 2 (TODO)
  const araTRY = (uretimTRY + iscilikTRY) * (1 + fire) + ambalajTRY;

  const riskTRY = araTRY * ((Number(vars.riskYuzde) || 0) / 100);
  const netMaliyetTRY = araTRY + riskTRY;

  const marj = vars.marj?.[segment] || 1;
  const minSiparisEUR = vars.minSiparis?.currency === 'EUR' ? vars.minSiparis.amount : 0;

  // Satış Almanya'da EUR — eurTry tanımsızsa EUR fiyat üretilemez (§5.5)
  let satisNettoEUR = null, kdvEUR = null, satisBruttoEUR = null, minUygulandi = false;
  if (vars.eurTry) {
    const raw = (netMaliyetTRY / vars.eurTry) * marj;
    minUygulandi = raw < minSiparisEUR;
    satisNettoEUR = Math.max(raw, minSiparisEUR);
    kdvEUR = satisNettoEUR * (vars.kdv ?? 0.19);
    satisBruttoEUR = satisNettoEUR + kdvEUR;
  } else {
    warnings.push('EUR/TL kuru tanımlı değil — EUR satış fiyatı hesaplanamadı.');
  }

  return {
    uretimTRY, iscilikTRY, ambalajTRY, araTRY, riskTRY, netMaliyetTRY,
    marj, segment, minSiparisEUR, minUygulandi,
    satisNettoEUR, kdvEUR, satisBruttoEUR,
    kargoNotu: 'Kargo, paket ölçüsü ve teslimat adresine göre ayrıca hesaplanır — kâr çarpanına dahil edilmez.',
    kurlar: cost.kurlar,
    warnings,
    isIncomplete: warnings.length > 0,
  };
}
