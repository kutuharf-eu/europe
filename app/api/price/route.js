// KUTUHARF — Canlı fiyat API'si. Konfigüratör her seçim değişiminde (debounce'lu)
// buraya sorar; fiyat SUNUCUDA hesaplanır (lib/live-pricing). Ham maliyet kalemleri,
// fiyat değişkenleri ve uyarılar İSTEMCİYE DÖNMEZ — yalnız satış rakamları döner.
import { serverKonfigPrice } from '@/lib/live-pricing';
import { getLivePricing } from '@/lib/pricing-vars';
import { MONTAGE_QUOTE_DEFAULT } from '@/data/konfigurator';
import { resolveHaendler } from '@/utils/haendlerAuth';
import { KONFIG_LIMITS } from '@/data/konfigurator';

// Teklif-boyutu: herhangi bir bileşen quoteHeight'i (50 cm) aşarsa iş online sipariş
// dışıdır → PDF/Angebot Premium marjıyla fiyatlanır (pazarlık payı). Händler girişliyse
// kendi kademesi önceliklidir (Händler büyük işte de Händler fiyatı alır).
function isOversize(cfg) {
  const h = Number(cfg.heightCm) || 0;
  const lh = cfg.logo ? Number(cfg.logo.heightCm) || 0 : 0;
  const ch = cfg.cubukLed ? Number(cfg.cubukLed.heightCm) || 0 : 0;
  return h > KONFIG_LIMITS.quoteHeight || lh > KONFIG_LIMITS.quoteHeight || ch > KONFIG_LIMITS.quoteHeight;
}

// Profi-Montage richtpreisinin BİRİM fiyatları (satış rakamı, maliyet değil → müşteriye
// dönmesinde sakınca yok). İstemci bunlarla bütün yazıların toplam genişliğinden
// richtpreisi hesaplar; tutar sepete GİRMEZ, teklifte netleşir.
// TRY girilirse kur varsa çevrilir, yoksa varsayılan kullanılır (fiyat yanlış görünmesin).
async function montageRates() {
  try {
    const { vars } = await getLivePricing();
    const eur = (v, def) => {
      if (!v || typeof v !== 'object') return def;
      const a = Number(v.amount);
      if (!Number.isFinite(a) || a <= 0) return def;
      if (v.currency === 'EUR') return a;
      if (v.currency === 'TRY' && vars.eurTry) return Math.round((a / Number(vars.eurTry)) * 100) / 100;
      return def;
    };
    return {
      tabanEUR: eur(vars.montajTaban3m, MONTAGE_QUOTE_DEFAULT.tabanEUR),
      tabanMetre: Number(vars.montajTabanMetre) > 0 ? Number(vars.montajTabanMetre) : MONTAGE_QUOTE_DEFAULT.tabanMetre,
      ekMetreEUR: eur(vars.montajEkMetre, MONTAGE_QUOTE_DEFAULT.ekMetreEUR),
    };
  } catch {
    return { ...MONTAGE_QUOTE_DEFAULT };
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  // Allowlist: yalnız fiyata etki eden alanlar alınır (buildCfg çıktısının alt kümesi).
  const cfg = {
    text: String(body.text || '').slice(0, 60),
    heightCm: Number(body.heightCm),
    lightMode: body.lightMode === 'unbeleuchtet' ? 'unbeleuchtet' : 'beleuchtet',
    lightingId: typeof body.lightingId === 'string' ? body.lightingId : undefined,
    constructionId: typeof body.constructionId === 'string' ? body.constructionId : undefined,
    fontId: typeof body.fontId === 'string' ? body.fontId : undefined,
    montageId: typeof body.montageId === 'string' ? body.montageId : 'selbst',
    trafo: body.trafo !== false,
    logo: body.logo && typeof body.logo === 'object'
      ? { widthCm: body.logo.widthCm, heightCm: body.logo.heightCm, shape: body.logo.shape === 'circle' ? 'circle' : 'rect' }
      : null,
    logoPrint: body.logoPrint === 'uv' ? 'uv' : null,
    uvBaski: body.uvBaski === true,
    logoUv: body.logoUv === true,
    cubukUv: body.cubukUv === true,
    unbelMaterial: typeof body.unbelMaterial === 'string' ? body.unbelMaterial : undefined,
    chromColor: typeof body.chromColor === 'string' ? body.chromColor : undefined,
    depth: body.depth,
    bohrschablone: body.bohrschablone === true,
    cubukLed: body.cubukLed && typeof body.cubukLed === 'object'
      ? { lengthCm: body.cubukLed.lengthCm, heightCm: body.cubukLed.heightCm }
      : null,
  };

  // Händler fiyatı YALNIZ Händler bağlamında (kutuharf.eu/haendler konfigüratörü) uygulanır.
  // Ana site (son müşteri) haendlerContext göndermez → daima standart/premium fiyat görür,
  // Händler girişli olsa bile. Bayrak istemciden gelir ama fiyatı yalnız sunucu-doğrulamalı
  // token açar (resolveHaendler); bayrak tek başına indirim vermez → manipülasyon kapısı kapalı.
  const haendler = body.haendlerContext === true ? await resolveHaendler(request) : null;

  // Marj önceliği: Händler kademesi > (oversize → Premium) > standart.
  const oversize = isOversize(cfg);
  const premiumQuote = oversize && !haendler;
  const marjKey = haendler?.marjKey || (premiumQuote ? 'premium' : undefined);

  // addon: bağımsız ek ürün (ayrı sepete eklenen logo/çubuk) — proje-seviyesi ücretler
  // (ambalaj, minimum sipariş, montaj) uygulanmaz; yalnız üretim + kendi trafosu.
  // zusatz: çok yazılı projenin 2..n. yazı bloğu — proje-seviyesi ücretler (ambalaj, minimum
  // sipariş, montaj) ilk blokta alındı, burada tekrar alınmaz; trafo blok başına kalır.
  const p = await serverKonfigPrice(cfg, { addon: body.addon === true, zusatz: body.zusatz === true, marjKey });
  const montage = await montageRates();
  if (!p) return Response.json({ price: null, montageRates: montage });

  return Response.json({
    montageRates: montage,
    price: {
      letters: p.letters,
      perLetter: p.perLetter,
      lettersTotal: p.lettersTotal,
      letterRows: Array.isArray(p.letterRows) ? p.letterRows.map((r) => ({ ch: r.ch, heightCm: r.heightCm, price: r.price })) : null,
      logo: p.logo
        ? { widthCm: p.logo.widthCm, heightCm: p.logo.heightCm, shape: p.logo.shape || 'rect', eqLetters: p.logo.eqLetters, perLetter: p.logo.perLetter, total: p.logo.total, print: p.logo.print || null, areaM2: p.logo.areaM2 || null }
        : null,
      cubukLed: p.cubukLed
        ? { lengthCm: p.cubukLed.lengthCm, heightCm: p.cubukLed.heightCm, pieces: p.cubukLed.pieces, eqLetters: p.cubukLed.eqLetters, perLetter: p.cubukLed.perLetter, total: p.cubukLed.total }
        : null,
      netzteil: p.netzteil,
      ambalaj: p.ambalaj || 0,
      montage: p.montage,
      bohrschablone: p.bohrschablone || 0,
      bohrschablonePrice: p.bohrschablonePrice || 0,
      minApplied: !!p.minApplied,
      total: p.total,
      source: p.source,
      // Onaylı Händler girişliyse true → UI "Händlerpreis" rozeti gösterir.
      // Kademe (cok/az) İSTEMCİYE DÖNMEZ — Händler hangi kademede olduğunu görmez.
      haendler: !!haendler,
      // >50 cm teklif fiyatı Premium marjıyla üretildiyse true → UI "Angebotspreis" notu.
      premiumQuote,
    },
  });
}
