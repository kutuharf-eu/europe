// Kutu-Harf-Modul v2 — KALİBRASYON: motor (bottom-up maliyet) → canlı site fiyatları.
// kutuharf.eu müşteri tarafı basit formülle çalışır (data/konfigurator.js):
//   toplam = base × (h/20) × ışıkFaktörü × harfSayısı + 49€ trafo + montaj
// Bu modül, canlıdaki her fiyat kombinasyonu için motorun gerçek maliyetinden
// "harf başına satış fiyatı (EUR)" üretir ve buradan yeni `base` önerir:
//   yeniBase = motorPerLetterEUR@20cm / ışıkFaktörü
// Sipariş bazlı kalemler (trafo, ambalaj, min. sipariş) harf fiyatına KATILMAZ —
// canlı formülde trafo zaten sabit kalem; ambalaj/min. sipariş notta raporlanır.
import { computeCost } from './cost-engine.js';
import { KONFIG_CONSTRUCTIONS } from '../data/konfigurator.js';

// Canlı kombinasyonlar (docs/FIYATLANDIRMA.md §4 ASIL TABLO) → motor yüzey haritası.
// model:null → motorun malzeme karşılığı yok (üreticiden ayrı fiyat gerekir).
export const LIVE_COMBOS = [
  { id: 'rueck', label: 'Rückleuchtend (halo)', constructionId: 'chrom_halo', factor: 1.7, lit: true,
    model: { id: 'cal_halo', label: 'Halo', surfaces: { face: 'krom', side: 'krom', back: 'raki_beyazi_8mm', diffuser: 'raki_beyazi_8mm' }, lighting: 'back', extras: ['halo_ayak'] } },
  { id: 'front_alu', label: 'Frontleuchtend · alu yan', constructionId: 'alu_plexi', factor: 1.8, lit: true,
    model: { id: 'cal_front_alu', label: 'Önden ışıklı', surfaces: { face: 'pleksi_oto', side: 'alu_yan_bant', back: 'dekota' }, lighting: 'front', extras: [] } },
  { id: 'front_krom', label: 'Frontleuchtend · krom yan', constructionId: 'chrom_plexi', factor: 1.8, lit: true,
    model: { id: 'cal_front_krom', label: 'Önden ışıklı, krom yanak', surfaces: { face: 'pleksi_oto', side: 'krom', back: 'dekota' }, lighting: 'front', extras: [] } },
  { id: 'front_seite', label: 'Acryl leuchtend (ön+yan)', constructionId: 'voll_plexi', factor: 2.0, lit: true,
    model: { id: 'cal_front_seite', label: 'Ön+yan ışıklı', surfaces: { face: 'pleksi_oto', side: 'pleksi_oto', back: 'dekota' }, lighting: 'front_side', extras: [] } },
  { id: 'seite', label: 'Seitenleuchtend', constructionId: 'voll_plexi', factor: 1.7, lit: true,
    model: { id: 'cal_seite', label: 'Yandan ışıklı', surfaces: { face: 'krom', side: 'pleksi_oto', back: 'dekota' }, lighting: 'side', extras: [] } },
  { id: 'unbel_strafor', label: 'Işıksız · Styropor', constructionId: 'alu_plexi', factor: 1, lit: false,
    model: null }, // strafor malzemesi motorda tanımlı değil — üreticiden m² fiyatı gerekir
  { id: 'unbel_plexi', label: 'Işıksız · Acryl', constructionId: 'voll_plexi', factor: 1, lit: false,
    model: { id: 'cal_unbel_plexi', label: 'Işıksız tam akril', surfaces: { face: 'pleksi_oto', side: 'pleksi_oto', back: 'dekota' }, lighting: 'none', extras: [] } },
  { id: 'unbel_alu', label: 'Işıksız · Chrom lackiert', constructionId: 'alu_plexi', factor: 1, lit: false,
    model: { id: 'cal_unbel_alu', label: 'Işıksız boyalı', surfaces: { face: 'alu', side: 'alu_yan_bant', back: 'dekota' }, lighting: 'none', extras: [] } },
  { id: 'unbel_chrom', label: 'Işıksız · Edelstahl/Chrom', constructionId: 'chrom_plexi', factor: 1, lit: false,
    model: { id: 'cal_unbel_chrom', label: 'Işıksız krom', surfaces: { face: 'krom', side: 'krom', back: 'dekota' }, lighting: 'none', extras: [] } },
];

// "Ortalama harf": A–Z büyük harf katsayılarının ortalaması (tabelalar ağırlıkla
// versal). Motor tek karakterlik sentetik katsayı tablosuyla çağrılır.
export function avgLetterCoeffs(coeffs) {
  const keys = Object.keys(coeffs.chars).filter((c) => /^[A-ZÇĞİÖŞÜ]$/.test(c));
  const avg = { alan: 0, cevre: 0, genislik: 0, yukseklik: 0 };
  for (const k of keys) for (const p of Object.keys(avg)) avg[p] += coeffs.chars[k][p];
  for (const p of Object.keys(avg)) avg[p] /= keys.length;
  return { font: coeffs.font, chars: { X: avg } };
}

// Bir kombinasyon için harf başına SATIŞ fiyatı (EUR, netto) — sipariş bazlı
// kalemler (trafo/ambalaj/minSipariş) hariç; işçilik+fire+risk+marj dahil.
export function perLetterEUR({ combo, h, vars, coeffs, depth = 0.1, ledType = 'standart', segment = 'standart' }) {
  if (!combo.model || !vars.eurTry) return null;
  const synth = avgLetterCoeffs(coeffs);
  const cost = computeCost({ text: 'X', h, model: combo.model, depth, ledType, vars, coeffs: synth });
  const perLetterTRY = cost.items.filter((i) => i.id !== 'trafo').reduce((a, i) => a + i.tryTotal, 0);
  const iscilik = vars.iscilikPerHarf?.currency === 'TRY' ? (vars.iscilikPerHarf.amount || 0) : 0;
  const fire = 1 + (Number(vars.fireYuzde) || 0) / 100;
  const risk = 1 + (Number(vars.riskYuzde) || 0) / 100;
  const marj = vars.marj?.[segment] || 1;
  return ((perLetterTRY + iscilik) * fire * risk * marj) / vars.eurTry;
}

// Tam kalibrasyon tablosu: her canlı kombinasyon için mevcut vs motor önerisi.
// yeniBase: canlı formül 20 cm'de motoru birebir tutturur; 30/50 cm sütunları
// lineer canlı formülün motordan ne kadar saptığını gösterir (motor ~h² büyür).
export function calibrate({ vars, coeffs, depth, ledType, segment }) {
  return LIVE_COMBOS.map((combo) => {
    const c = KONFIG_CONSTRUCTIONS.find((x) => x.id === combo.constructionId);
    const mevcutBase = c?.base ?? null;
    const mevcut20 = mevcutBase !== null ? mevcutBase * combo.factor : null;
    const at = (hCm) => perLetterEUR({ combo, h: hCm / 100, vars, coeffs, depth, ledType, segment });
    const m20 = at(20), m30 = at(30), m50 = at(50);
    return {
      ...combo,
      mevcutBase, mevcut20,
      motor20: m20, motor30: m30, motor50: m50,
      yeniBase: m20 !== null ? m20 / combo.factor : null,
      // canlı lineer formülün 50 cm'deki değeri (yeni base ile) vs motor — sapma %
      sapma50: m20 !== null && m50 ? ((m20 * 2.5 - m50) / m50) * 100 : null,
    };
  });
}
