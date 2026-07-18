// KUTUHARF — Canlı fiyat köprüsü: müşteri konfigürasyonu → maliyet motoru → EUR satış fiyatı.
// YALNIZ SUNUCU (fs + gizli fiyat değişkenleri). Sonuç nesnesi konfigPrice ile aynı
// şekildedir, UI/sepet/PDF değişmeden çalışır. Motor eksik veri yüzünden güvenilir fiyat
// üretemezse (kur/malzeme fiyatı tanımsız, katsayısız karakter, motorda olmayan model)
// legacy konfigPrice'a düşer — admin değişkenleri doldurulana kadar site eski fiyatlarla
// çalışmaya devam eder. source: 'motor' | 'legacy' alanı hangi yolun kullanıldığını söyler.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { computeCost, toTRY } from './cost-engine.js';
import { avgLetterCoeffs } from './calibrate.js';
import { getLivePricing } from './pricing-vars.js';
import {
  konfigPrice,
  normalizeLogo,
  logoEquivalentLetters,
  normalizeCubukLed,
  cubukLedPieces,
  KONFIG_FONTS,
  KONFIG_MONTAGE,
  NETZTEIL_PRICE,
} from '../data/konfigurator.js';

const round2 = (n) => Math.round(n * 100) / 100;

// ── Font → katsayı dosyası eşlemesi ──────────────────────────────────────────
// Katsayılar 3 referans font için üretildi (npm run coeff: anton/archivo/oswald).
// Diğer fontlar geometrik olarak en yakın referansa eşlenir (yaklaşıklık):
// el yazıları → oswald (ince/dar), kondanse → anton, geniş/kalın → archivo.
// Yeni font katsayısı üretilirse eşleme buradan daraltılır.
export function coeffFontFor(fontId) {
  const f = KONFIG_FONTS.find((x) => x.id === fontId);
  if (!f) return 'archivo';
  if (f.cat === 'schrift') return 'oswald';
  if (f.widthFactor <= 0.52) return 'anton';
  return 'archivo'; // modern/rund/elegant/deko/tech/custom
}

const coeffCache = new Map();
async function loadCoeffs(name) {
  if (!coeffCache.has(name)) {
    const raw = await readFile(path.join(process.cwd(), 'public', 'coefficients', `${name}.json`), 'utf8');
    coeffCache.set(name, JSON.parse(raw));
  }
  return coeffCache.get(name);
}

// ── Konfigürasyon → motor ürün modeli (yüzey haritası) ───────────────────────
// buildCfg/deriveV3PricingConfig çıktısındaki (constructionId, lightingId,
// unbelMaterial) üçlüsünü Brief §4 yüzey haritasına çevirir. null = motorda
// karşılığı yok (ör. strafor — üretici m² fiyatı tanımsız) → legacy.
function modelFor(cfg) {
  const eff = cfg.lightMode === 'unbeleuchtet' ? 'none' : cfg.lightingId;
  if (eff === 'none') {
    switch (cfg.unbelMaterial) {
      case 'plexi':
        return { id: 'live_unbel_plexi', label: 'Işıksız tam akril', surfaces: { face: 'pleksi_oto', side: 'pleksi_oto', back: 'dekota' }, lighting: 'none', extras: [] };
      case 'edelstahl_chrom':
        return { id: 'live_unbel_chrom', label: 'Işıksız krom', surfaces: { face: 'krom', side: 'krom', back: 'dekota' }, lighting: 'none', extras: ['krom_boyama'] };
      case 'alu_lackiert':
        return { id: 'live_unbel_alu', label: 'Işıksız boyalı', surfaces: { face: 'alu', side: 'alu_yan_bant', back: 'dekota' }, lighting: 'none', extras: [] };
      default:
        return null; // strafor + eski/bilinmeyen konfigürasyonlar
    }
  }
  switch (`${cfg.constructionId}:${eff}`) {
    case 'chrom_halo:halo':
      return { id: 'live_halo', label: 'Rückleuchtend (halo)', surfaces: { face: 'krom', side: 'krom', back: 'raki_beyazi_8mm', diffuser: 'raki_beyazi_8mm' }, lighting: 'back', extras: ['halo_ayak', 'krom_boyama'] };
    case 'alu_plexi:front':
      return { id: 'live_front_alu', label: 'Frontleuchtend · alu yan', surfaces: { face: 'pleksi_oto', side: 'alu_yan_bant', back: 'dekota' }, lighting: 'front', extras: [] };
    case 'chrom_plexi:front':
      return { id: 'live_front_krom', label: 'Frontleuchtend · krom yan', surfaces: { face: 'pleksi_oto', side: 'krom', back: 'dekota' }, lighting: 'front', extras: [] };
    case 'voll_plexi:front_seite':
      return { id: 'live_front_seite', label: 'Acryl leuchtend', surfaces: { face: 'pleksi_oto', side: 'pleksi_oto', back: 'dekota' }, lighting: 'front_side', extras: [] };
    case 'voll_plexi:seite':
      return { id: 'live_seite', label: 'Seitenleuchtend', surfaces: { face: 'krom', side: 'pleksi_oto', back: 'dekota' }, lighting: 'side', extras: ['krom_boyama'] };
    default:
      return null;
  }
}

// Derinlik (m): müşteri seçtiyse onu, yoksa yüksekliğe göre standart kademe
// (docs/URETICI-MODEL-LISTESI.md varsayımları) kullan.
function depthM(depthMm, heightCm) {
  const d = Number(depthMm);
  if (d >= 20 && d <= 200) return d / 1000;
  const h = Number(heightCm) || 20;
  if (h < 20) return 0.04;
  if (h < 40) return 0.06;
  if (h < 70) return 0.1;
  return 0.12;
}

// ── Admin tanımlı ek maliyet kalemleri (kutuharf_extra_costs) ─────────────────
// Üretim maliyetine TRY olarak eklenir (fire/risk/marj çarpanlarından geçer).
// Boş applies_* dizisi = tüm ışık tipleri / tüm konstrüksiyonlar.
function extraCostsTRY({ extras, eff, constructionId, N, areaM2, prodTRY, vars, warnings }) {
  let sum = 0;
  for (const e of extras || []) {
    if (Array.isArray(e.applies_lighting) && e.applies_lighting.length && !e.applies_lighting.includes(eff)) continue;
    if (Array.isArray(e.applies_construction) && e.applies_construction.length && !e.applies_construction.includes(constructionId)) continue;
    if (e.cost_type === 'percent') { sum += (prodTRY * Number(e.amount)) / 100; continue; }
    const unit = toTRY({ amount: Number(e.amount), currency: e.currency }, vars, warnings, e.name);
    if (e.cost_type === 'per_letter') sum += unit * N;
    else if (e.cost_type === 'per_m2') sum += unit * areaM2;
    else if (e.cost_type === 'per_order') sum += unit;
  }
  return sum;
}

// ── Motor tabanlı fiyat — null dönerse arayan legacy'ye düşer ─────────────────
// opts.marjKey ('rekabetci'|'standart'|'premium') hangi kâr çarpanının kullanılacağını,
// opts.detailed=true ise sonuca _detail (üretim maliyeti + çarpanlar) eklenmesini seçer.
// Müşteri yolu (serverKonfigPrice) opts vermez → 'standart', detay yok; /api/price zaten
// alan-allowlist yaptığı için _detail müşteriye ASLA dönmez.
async function motorKonfigPrice(cfg, vars, extras, opts = {}) {
  if (!vars.eurTry) return null; // EUR satış fiyatı kursuz üretilemez
  const model = modelFor(cfg);
  if (!model) return null;
  const montage = KONFIG_MONTAGE.find((m) => m.id === cfg.montageId);
  if (!montage) return null;

  const coeffs = await loadCoeffs(coeffFontFor(cfg.fontId));
  const h = Number(cfg.heightCm) / 100;
  const lit = model.lighting !== 'none';
  const kromBoyama = cfg.chromColor === 'ral'; // RAL istenen krom yüzey = boyama kalemi
  const warnings = [];

  const cost = computeCost({
    text: cfg.text, h, model, depth: depthM(cfg.depth, cfg.heightCm),
    ledType: 'standart', kromBoyama, uvBaski: false, vars, coeffs,
  });
  // Güvenilirlik kapıları: katsayısız karakter → harf atlanır (eksik fiyat!) → legacy.
  // Yüzey/LED kalemi 0 TL ise (malzeme fiyatı ya da USD kuru tanımsız) → legacy.
  if (!cost.geometry.N || cost.geometry.missing.length) return null;
  const surfaceBroken = cost.items.some((i) => (i.birim === 'm²' || i.birim === 'mt') && i.miktar > 0 && i.tryTotal <= 0);
  const ledBroken = lit && cost.items.some((i) => i.id === 'led' && i.tryTotal <= 0);
  if (surfaceBroken || ledBroken) return null;

  const fire = 1 + (Number(vars.fireYuzde) || 0) / 100;
  const risk = 1 + (Number(vars.riskYuzde) || 0) / 100;
  const marjKey = opts.marjKey || 'standart';
  const marj = (vars.marj && Number.isFinite(Number(vars.marj[marjKey])) && vars.marj[marjKey])
    || vars.marj?.standart || 1;
  const eur = (x) => x / vars.eurTry;
  const N = cost.geometry.N;

  // Harf bloğu: üretim (trafo hariç) + ek kalemler + işçilik → fire → risk → marj → EUR
  const prodTRY = cost.items.filter((i) => i.id !== 'trafo').reduce((a, i) => a + i.tryTotal, 0);
  const eff = model.lighting === 'none' ? 'none' : cfg.lightingId;
  const extraTRY = extraCostsTRY({ extras, eff, constructionId: cfg.constructionId, N, areaM2: cost.geometry.toplamOnYuz, prodTRY, vars, warnings });
  const iscilikUnitTRY = toTRY(vars.iscilikPerHarf, vars, warnings, 'İşçilik');
  const iscilikTRY = iscilikUnitTRY * N;
  const lettersTotal = round2(eur((prodTRY + extraTRY + iscilikTRY) * fire * risk * marj));
  const perLetter = round2(lettersTotal / N);

  // Harf bazlı satış dökümü (müşteri tablosu: Harf · Yükseklik · Fiyat): her harf kendi
  // geometrisiyle tek başına hesaplanır, satırlar lettersTotal'a ölçeklenir — LED yuvarlama
  // ve ek kalem farkları orantılı dağıtılır, satır toplamı DAİMA lettersTotal'a eşittir.
  const rawRows = cost.geometry.letters.map((l) => {
    const single = computeCost({
      text: l.ch, h, model, depth: depthM(cfg.depth, cfg.heightCm),
      ledType: 'standart', kromBoyama, uvBaski: false, vars, coeffs,
    });
    return { ch: l.ch, raw: single.items.filter((i) => i.id !== 'trafo').reduce((a, i) => a + i.tryTotal, 0) };
  });
  const rawSum = rawRows.reduce((a, r) => a + r.raw, 0) || 1;
  let accEUR = 0;
  const letterRows = rawRows.map((r, i) => {
    const heightCm = Math.round((coeffs.chars[r.ch]?.yukseklik || 1) * h * 100);
    const price = i === rawRows.length - 1 ? round2(lettersTotal - accEUR) : round2((r.raw / rawSum) * lettersTotal);
    accEUR = round2(accEUR + price);
    return { ch: r.ch, heightCm, price };
  });

  // Trafo: motor kademe fiyatı tanımlıysa onu (risk+marj ile), değilse sabit 49 € (legacy kalem)
  let netzteil = 0;
  if (lit && cfg.trafo !== false) {
    const t = cost.items.find((i) => i.id === 'trafo');
    netzteil = t && t.tryTotal > 0 ? round2(eur(t.tryTotal * risk * marj)) : NETZTEIL_PRICE;
  }

  // Logo: logo yüksekliğinde "ortalama harf" × eşdeğer harf sayısı — harflerle aynı model/boru hattı
  let logoInfo = null;
  let logoCostTRY = 0; // logo üretim maliyeti (fire dahil, risk/marj hariç) — admin karşılaştırması için
  if (cfg.logo) {
    const lg = normalizeLogo(cfg.logo);
    if (!lg) return null;
    const eq = logoEquivalentLetters(lg.widthCm, lg.heightCm);
    const synth = avgLetterCoeffs(coeffs);
    const lCost = computeCost({
      text: 'X', h: lg.heightCm / 100, model, depth: depthM(cfg.depth, lg.heightCm),
      ledType: 'standart', kromBoyama, uvBaski: false, vars, coeffs: synth,
    });
    const lProd = lCost.items.filter((i) => i.id !== 'trafo').reduce((a, i) => a + i.tryTotal, 0);
    logoCostTRY = (lProd + iscilikUnitTRY) * fire * eq;
    const logoPerLetter = round2(eur((lProd + iscilikUnitTRY) * fire * risk * marj));
    logoInfo = { ...lg, eqLetters: eq, perLetter: logoPerLetter, total: round2(logoPerLetter * eq) };
  }

  // Çubuk LED (LED-Leiste): logo ile AYNI boru hattı — kendi yüksekliğinde "ortalama
  // harf" maliyeti × eşdeğer harf sayısı (uzunluk = genişlik). Parça listesi (max 150 cm)
  // yalnız gösterim içindir, fiyat toplam ölçüden hesaplanır.
  let cubukInfo = null;
  let cubukCostTRY = 0;
  if (cfg.cubukLed) {
    const cl = normalizeCubukLed(cfg.cubukLed);
    if (!cl) return null;
    const eq = logoEquivalentLetters(cl.lengthCm, cl.heightCm);
    const synth = avgLetterCoeffs(coeffs);
    const cCost = computeCost({
      text: 'X', h: cl.heightCm / 100, model, depth: depthM(cfg.depth, cl.heightCm),
      ledType: 'standart', kromBoyama, uvBaski: false, vars, coeffs: synth,
    });
    const cProd = cCost.items.filter((i) => i.id !== 'trafo').reduce((a, i) => a + i.tryTotal, 0);
    cubukCostTRY = (cProd + iscilikUnitTRY) * fire * eq;
    const cPerLetter = round2(eur((cProd + iscilikUnitTRY) * fire * risk * marj));
    cubukInfo = { ...cl, pieces: cubukLedPieces(cl.lengthCm), eqLetters: eq, perLetter: cPerLetter, total: round2(cPerLetter * eq) };
  }

  // Sipariş bazlı: ambalaj (risk+marj ile) + minimum sipariş tabanı (montaj hariç uygulanır)
  const ambalaj = round2(eur(toTRY(vars.ambalajTaban, vars, warnings, 'Ambalaj') * risk * marj));
  const minEUR = vars.minSiparis?.currency === 'EUR' ? Number(vars.minSiparis.amount) || 0 : 0;
  const prodTotal = lettersTotal + (logoInfo ? logoInfo.total : 0) + (cubukInfo ? cubukInfo.total : 0) + netzteil + ambalaj;
  const minApplied = prodTotal < minEUR;
  const total = round2(Math.max(prodTotal, minEUR) + montage.price);

  const result = { letters: N, perLetter, lettersTotal, letterRows, logo: logoInfo, cubukLed: cubukInfo, netzteil, ambalaj, minApplied, montage: montage.price, total, source: 'motor' };

  if (opts.detailed) {
    // ── Üretim maliyeti (fire dahil gerçek tüketim; risk & marj HARİÇ) ─────────
    // Sipariş düzeyinde satış 'total' ile kıyaslanabilir olsun diye montaj (birebir
    // müşteriye yansıyan geçiş kalemi) maliyet tarafına da nötr eklenir.
    const trafoCostTRY = (lit && cfg.trafo !== false) ? (cost.items.find((i) => i.id === 'trafo')?.tryTotal || 0) : 0;
    const ambalajCostTRY = toTRY(vars.ambalajTaban, vars, warnings, 'Ambalaj');
    const lettersCostTRY = (prodTRY + extraTRY + iscilikTRY) * fire;
    const costOrderTRY = lettersCostTRY + trafoCostTRY + ambalajCostTRY + logoCostTRY + cubukCostTRY + montage.price * vars.eurTry;
    const costOrderEUR = round2(eur(lettersCostTRY + trafoCostTRY + ambalajCostTRY + logoCostTRY + cubukCostTRY) + montage.price);
    result._detail = {
      eurTry: vars.eurTry, fire, risk, marj, marjKey,
      costOrderEUR, costOrderTRY: round2(costOrderTRY),
      breakdown: {
        lettersCostEUR: round2(eur(lettersCostTRY)),
        trafoCostEUR: round2(eur(trafoCostTRY)),
        ambalajCostEUR: round2(eur(ambalajCostTRY)),
        logoCostEUR: round2(eur(logoCostTRY)),
        cubukLedCostEUR: round2(eur(cubukCostTRY)),
        montageEUR: montage.price,
      },
    };
  }
  return result;
}

// ── Admin-only: üretim maliyeti ↔ satış fiyatı karşılaştırması ────────────────
// Üç marj kademesi (rekabetçi/standart/premium) için satış fiyatını, sabit üretim
// maliyetiyle birlikte döndürür. YALNIZ admin API'sinden çağrılır (maliyet ifşası).
export async function serverAdminPricePreview(cfg) {
  const legacy = konfigPrice(cfg);
  if (!legacy) return { ok: false, reason: 'invalid' };
  const { vars, extras } = await getLivePricing();
  if (!vars.eurTry) return { ok: false, reason: 'no_kur' };

  const tierKeys = ['rekabetci', 'standart', 'premium'];
  const tiers = {};
  let cost = null;
  let letters = 0;
  for (const tk of tierKeys) {
    const p = await motorKonfigPrice(cfg, vars, extras, { marjKey: tk, detailed: true });
    if (!p || !p._detail) return { ok: false, reason: 'legacy' };
    if (!cost) {
      cost = {
        orderEUR: p._detail.costOrderEUR,
        orderTRY: p._detail.costOrderTRY,
        breakdown: p._detail.breakdown,
        fire: p._detail.fire,
        risk: p._detail.risk,
      };
      letters = p.letters;
    }
    const profitEUR = round2(p.total - p._detail.costOrderEUR);
    tiers[tk] = {
      marj: p._detail.marj,
      lettersTotal: p.lettersTotal,
      netzteil: p.netzteil,
      ambalaj: p.ambalaj,
      montage: p.montage,
      minApplied: p.minApplied,
      total: p.total,
      profitEUR,
      marginPct: p._detail.costOrderEUR > 0 ? round2((profitEUR / p._detail.costOrderEUR) * 100) : null,
    };
  }
  return { ok: true, source: 'motor', letters, kurlar: { eurTry: vars.eurTry, usdTry: vars.usdTry ?? null }, cost, tiers, activeTier: 'standart' };
}

// ── Tek giriş noktası: /api/price ve /api/order bunu kullanır ─────────────────
// Önce legacy konfigPrice ile geçerlilik (limitler, izinli kombinasyonlar) doğrulanır;
// geçersizse null. Geçerliyse motor denenir, olmuyorsa legacy fiyat döner.
export async function serverKonfigPrice(cfg) {
  const legacy = konfigPrice(cfg);
  if (!legacy) return null;

  // Değişkenler bir kez yüklenir — hem motor fiyatı hem de delme şablonu (admin TL fiyatı) için.
  let vars = null;
  let extras = null;
  try { ({ vars, extras } = await getLivePricing()); }
  catch (e) { console.error('[live-pricing] getLivePricing hatası:', e?.message || e); }

  let base = null;
  if (vars) {
    try {
      const p = await motorKonfigPrice(cfg, vars, extras);
      // Şekil eşitliği: legacy'nin spesifikasyon nesneleri (UI/PDF bazı yerlerde bekler)
      if (p) base = { ...p, construction: legacy.construction, lighting: legacy.lighting, font: legacy.font, montageOpt: legacy.montageOpt };
    } catch (e) {
      // motor hatası fiyatı ASLA bloke etmez — legacy devam eder
      console.error('[live-pricing] motor hatası, legacy fiyata düşüldü:', e?.message || e);
    }
  }
  if (!base) {
    // Legacy döküm: her harf aynı fiyat (basit formül) — son satır yuvarlama farkını kapatır.
    const chars = [...String(cfg.text || '').trim()].filter((c) => c !== ' ');
    let acc = 0;
    const letterRows = chars.map((ch, i) => {
      const price = i === chars.length - 1 ? Math.round((legacy.lettersTotal - acc) * 100) / 100 : legacy.perLetter;
      acc = Math.round((acc + price) * 100) / 100;
      return { ch, heightCm: Math.round(Number(cfg.heightCm)), price };
    });
    base = { ...legacy, letterRows, ambalaj: 0, minApplied: false, source: 'legacy' };
  }

  // ── Montaj Delme Şablonu (bağımsız ek ürün) ─────────────────────────────────
  // Admin TL fiyatı → EUR (eurTry ile). bohrschablonePrice: birim (kutucuk yanında
  // gösterim), bohrschablone: yalnız seçiliyse toplama eklenen tutar. Kur/fiyat
  // tanımsızsa 0 (add-on gösterilmez, toplamı etkilemez).
  const sablonUnit = vars?.eurTry && vars?.montajSablonFiyat
    ? round2(toTRY(vars.montajSablonFiyat, vars, [], 'Montaj Delme Şablonu') / vars.eurTry)
    : 0;
  const sablonApplied = cfg.bohrschablone === true ? sablonUnit : 0;
  return { ...base, bohrschablonePrice: sablonUnit, bohrschablone: sablonApplied, total: round2(base.total + sablonApplied) };
}
