// Kutu-Harf-Modul v2 — Maliyet Motoru (Brief §5). SAF fonksiyonlar: React/DOM yok,
// sunucuda ve testte aynen çalışır. Tüm ara hesaplar tam hassasiyetle (float) tutulur,
// yuvarlama yalnız gösterimde yapılır (Brief §5.4).
//
// Uyarı mekanizması (§5.5): eksik fiyat / tanımsız kur / fontta olmayan karakter
// durumunda motor SESSİZCE yanlış hesaplamaz — kalem 0 + warnings[] + isIncomplete.

// Göreli import: node --test alias çözmez; Next.js her ikisini de destekler.
import { TRAFO_KADEMELER } from '../config/products.js';

// ── Para birimi (§5.4): her değişken { amount, currency } — motor TRY bazında toplar ──
export function toTRY(price, vars, warnings, label) {
  if (!price || typeof price.amount !== 'number') {
    warnings.push(`${label}: fiyat tanımlı değil — kaleme 0 yazıldı.`);
    return 0;
  }
  if (price.currency === 'TRY') return price.amount;
  if (price.currency === 'USD') {
    if (!vars.usdTry) { warnings.push(`${label}: USD/TL kuru tanımlı değil — kaleme 0 yazıldı.`); return 0; }
    return price.amount * vars.usdTry;
  }
  if (price.currency === 'EUR') {
    if (!vars.eurTry) { warnings.push(`${label}: EUR/TL kuru tanımlı değil — kaleme 0 yazıldı.`); return 0; }
    return price.amount * vars.eurTry;
  }
  warnings.push(`${label}: bilinmeyen para birimi '${price.currency}' — kaleme 0 yazıldı.`);
  return 0;
}

// ── §5.1 Harf bazlı geometri (glyph katsayılarından; h metre) ─────────────────
export function letterGeometry({ text, h, coeffs }) {
  const letters = [];
  const missing = [];
  // NFC normalize: Katsayı anahtarları vorkomponiert (Ü=U+00DC). Eingabe (z. B.
  // aus macOS-Copy-Paste) kann zerlegt sein (U+0055+U+0308) → sonst kein Treffer.
  for (const ch of String(text || '').normalize('NFC')) {
    if (ch === ' ') continue;
    const k = coeffs?.chars?.[ch];
    if (!k) { missing.push(ch); continue; }
    letters.push({
      ch,
      onYuz: k.alan * h * h,        // m² (net glyph alanı — bilgi/istatistik)
      // Kesim plakası (en × boy): üretici pleksi/dekotayı dikdörtgen plakadan hesaplar,
      // fire dahildir (23 Tem 2026 eCut xlsx kalibrasyonu — "50cm D = 0,50 × 0,34 m²").
      plaka: k.genislik * k.yukseklik * h * h, // m²
      cevre: k.cevre * h,           // mt
      genislik: k.genislik * h,     // m
    });
  }
  const sum = (f) => letters.reduce((s, l) => s + f(l), 0);
  return {
    letters, missing, N: letters.length,
    toplamOnYuz: sum((l) => l.onYuz), toplamPlaka: sum((l) => l.plaka), toplamCevre: sum((l) => l.cevre),
  };
}

// ── §5.2 Malzeme m² fiyatı çözümleyici ────────────────────────────────────────
// pleksi_oto: h < 1.00 m → 3 mm (TRY) · h ≥ 1.00 m → 5 mm (USD, kurla çevrilir)
function materialM2(matId, h, vars, warnings) {
  switch (matId) {
    case 'krom': return { price: vars.kromM2, label: 'Krom' };
    case 'pleksi_oto':
      return h < 1.0
        ? { price: vars.pleksi3mmM2, label: 'Pleksi 3 mm' }
        : { price: vars.pleksi5mmM2, label: 'Pleksi 5 mm' };
    case 'dekota': return { price: vars.dekotaM2, label: 'Dekota' };
    case 'raki_beyazi_8mm': return { price: vars.rakiBeyazi8mmM2, label: 'Rakı beyazı 8 mm' };
    case 'alu': {
      // TODO (Brief §4***): boyalı alüminyum m² fiyatı — tanımlanana kadar krom referans.
      if (vars.aluFaceM2) return { price: vars.aluFaceM2, label: 'Boyalı alüminyum' };
      warnings.push('Boyalı alüminyum m² fiyatı tanımlı değil — krom fiyatı referans alındı (TODO).');
      return { price: vars.kromM2, label: 'Boyalı alüminyum (krom referans)' };
    }
    default:
      warnings.push(`Bilinmeyen malzeme '${matId}' — kaleme 0 yazıldı.`);
      return { price: null, label: matId };
  }
}

// ── §5.3 Trafo kademe seçimi: gerekli watt → {60,100,150,200,320}, gerekirse çoklu ──
export function trafoSecimi(gerekliWatt, kademeler = TRAFO_KADEMELER) {
  if (gerekliWatt <= 0) return [];
  const maxK = kademeler[kademeler.length - 1];
  const out = [];
  let rest = gerekliWatt;
  const n = Math.floor(rest / maxK);
  if (n > 0 && rest > maxK) { out.push({ watt: maxK, adet: n }); rest -= n * maxK; }
  if (rest > 0) {
    const k = kademeler.find((x) => x >= rest) || maxK;
    const exist = out.find((o) => o.watt === k);
    if (exist) exist.adet += 1; else out.push({ watt: k, adet: 1 });
  }
  return out;
}

// ── Ana motor: model haritası + seçenekler → kalem kalem üretim maliyeti (TRY) ──
// Girdi: text, h (m), model (PRODUCT_MODELS öğesi), depth (m), ledType 'samsung'|'standart',
//        kromBoyama/uvBaski (bool), vars (PricingVariables), coeffs (katsayı JSON'u)
export function computeCost({ text, h, model, depth, ledType, kromBoyama, uvBaski, vars, coeffs }) {
  const warnings = [];
  const geo = letterGeometry({ text, h, coeffs });
  if (geo.missing.length) {
    warnings.push(`Fontta bulunmayan karakterler hesaba katılmadı: ${[...new Set(geo.missing)].join(' ')}`);
  }
  const items = [];
  const lit = model.lighting !== 'none';
  const push = (id, label, miktar, birim, price, tryTotal) =>
    items.push({ id, label, miktar, birim, birimFiyat: price || null, tryTotal });

  // m² bazlı yüzey kalemi (face/back/diffuser aynı mantık, alan farklı)
  const m2Item = (id, matId, alanM2, surfaceLabel) => {
    if (alanM2 <= 0) return;
    const { price, label } = materialM2(matId, h, vars, warnings);
    const unit = toTRY(price, vars, warnings, label);
    push(id, `${surfaceLabel} — ${label}`, alanM2, 'm²', price, alanM2 * unit);
  };

  // Yüzeyler (§4 bildirimsel harita) — m² kalemleri PLAKA (en × boy) alanından:
  // üretici harfi dikdörtgen plakadan keser, artan parça fire olarak müşteriye yazılır.
  const s = model.surfaces;
  if (s.face) m2Item('face', s.face, geo.toplamPlaka, 'Ön yüz');

  if (s.side === 'alu_yan_bant') {
    // Metre bazlı; fiyat standart derinlik içindir → yanBantDerinlikFarkiYuzde (TODO, varsayılan 0)
    const unit = toTRY(vars.aluYanBantMt, vars, warnings, 'Alüminyum yan bant');
    const fark = 1 + (vars.yanBantDerinlikFarkiYuzde || 0) / 100;
    push('side', 'Yan bant — Alüminyum', geo.toplamCevre, 'mt', vars.aluYanBantMt, geo.toplamCevre * unit * fark);
  } else if (s.side) {
    m2Item('side', s.side, geo.toplamCevre * depth, 'Yanak (çevre × derinlik)');
  }

  if (s.back) m2Item('back', s.back, geo.toplamPlaka, 'Arka yüz');
  if (s.diffuser) m2Item('diffuser', s.diffuser, geo.toplamPlaka, 'Difüzör');

  // UV baskı (opsiyon) — ana malzemeye EK ayrı kalem (§5.2); plaka alanı üzerinden
  if (uvBaski && geo.toplamPlaka > 0) {
    const unit = toTRY(vars.uvBaskiM2, vars, warnings, 'UV baskı');
    push('uv_baski', 'UV baskı', geo.toplamPlaka, 'm²', vars.uvBaskiM2, geo.toplamPlaka * unit);
  }

  // ── Adet bazlı kalemler (§5.3) ──
  let ledAdet = 0;
  if (lit) {
    // LED (23 Tem 2026 eCut kalibrasyonu): şerit harf konturunu izler → adet çevreyle
    // ölçeklenir: harf başına ceil(çevre × katsayı + taban). xlsx D/E/I/K/A/S ×
    // 30/40/50 cm serisine fit (ort. sapma 0,75 adet). Logo/çubuk çağrıları kendi
    // adetlerini `ledAdetSabit` ile geçirir (alan bazlı — bkz. live-pricing).
    ledAdet = Number.isFinite(vars.ledAdetSabit)
      ? vars.ledAdetSabit
      : geo.letters.reduce(
          (a, l) => a + Math.ceil(l.cevre * (vars.ledCevreKatsayi ?? 2.8) + (vars.ledHarfTaban ?? 2)), 0);
    const ledVar = ledType === 'samsung' ? vars.ledSamsung : vars.ledStandart;
    const unit = toTRY(ledVar, vars, warnings, `LED (${ledType})`);
    push('led', `LED modül (${ledType})`, ledAdet, 'adet', ledVar, ledAdet * unit);

    // Trafo (dokümanda eksikti — MUTLAKA): watt = led × wattPerModul × 1.25 → kademe(ler)
    const gerekliWatt = ledAdet * (vars.wattPerModul || 0) * 1.25;
    const trafolar = trafoSecimi(gerekliWatt);
    let trafoTRY = 0;
    let trafoTanimsiz = false;
    for (const t of trafolar) {
      const f = Number(vars.trafoFiyat?.[String(t.watt)]) || 0;
      if (f <= 0) trafoTanimsiz = true;
      trafoTRY += f * t.adet;
    }
    if (trafolar.length) {
      if (trafoTanimsiz) warnings.push('Trafo birim fiyatı tanımlı değil — kaleme 0 yazıldı (kademe: ' + trafolar.map((t) => `${t.adet}×${t.watt}W`).join(' + ') + ').');
      push('trafo', 'Trafo ' + trafolar.map((t) => `${t.adet}×${t.watt}W`).join(' + ') + ` (gereken ${Math.ceil(gerekliWatt)} W)`, trafolar.reduce((a, t) => a + t.adet, 0), 'adet', null, trafoTRY);
    }

    // Kablo + bağlantı boncukları — yalnız ışıklı modellerde
    const kabloUnit = toTRY(vars.kabloPerHarf, vars, warnings, 'Kablo');
    push('kablo', 'Kablo + bağlantı', geo.N, 'harf', vars.kabloPerHarf, geo.N * kabloUnit);
  }

  // Vida: h ≤ eşik → altAdet, üstü → ustAdet (kural admin'den değiştirilebilir)
  const vk = vars.vidaKurali || { esik: 0.5, altAdet: 4, ustAdet: 6 };
  const vidaPerHarf = h <= vk.esik ? vk.altAdet : vk.ustAdet;
  const vidaUnit = toTRY(vars.vida, vars, warnings, 'Vida');
  push('vida', `Vida (${vidaPerHarf} adet/harf)`, geo.N * vidaPerHarf, 'adet', vars.vida, geo.N * vidaPerHarf * vidaUnit);

  // Halo ayağı — yalnız extras'ta halo_ayak olan modellerde: max(3, ceil(cevre×0.8))/harf
  if (model.extras.includes('halo_ayak')) {
    const ayakAdet = geo.letters.reduce((a, l) => a + Math.max(3, Math.ceil(l.cevre * 0.8)), 0);
    const unit = toTRY(vars.haloAyak, vars, warnings, 'Halo ayağı');
    push('halo_ayak', 'Halo ayağı', ayakAdet, 'adet', vars.haloAyak, ayakAdet * unit);
  }

  // Yapıştırıcı: harf başına (min/max sınırları değişkenlerde; strategy ileride)
  const yapUnit = toTRY(vars.yapistiriciPerHarf, vars, warnings, 'Yapıştırıcı');
  push('yapistirici', 'Yapıştırıcı', geo.N, 'harf', vars.yapistiriciPerHarf, geo.N * yapUnit);

  // Krom boyama (opsiyon): h ≤ 0.5 → kromBoyamaKucuk; üstü TANIMSIZ → 0 + uyarı (§5.5)
  if (kromBoyama && model.extras.includes('krom_boyama')) {
    if (h <= 0.5) {
      const unit = toTRY(vars.kromBoyamaKucuk, vars, warnings, 'Krom boyama');
      push('krom_boyama', 'Krom boyama', geo.N, 'harf', vars.kromBoyamaKucuk, geo.N * unit);
    } else {
      warnings.push('Krom boyama >50 cm fiyatı tanımlı değil — kaleme 0 yazıldı.');
      push('krom_boyama', 'Krom boyama (>50 cm — fiyat tanımsız)', geo.N, 'harf', null, 0);
    }
  }

  const uretimTRY = items.reduce((a, i) => a + i.tryTotal, 0);

  return {
    geometry: geo,
    items,
    ledAdet,
    uretimTRY,
    warnings,
    isIncomplete: warnings.length > 0,
    kurlar: { usdTry: vars.usdTry ?? null, eurTry: vars.eurTry ?? null },
  };
}
