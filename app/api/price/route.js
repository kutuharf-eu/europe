// KUTUHARF — Canlı fiyat API'si. Konfigüratör her seçim değişiminde (debounce'lu)
// buraya sorar; fiyat SUNUCUDA hesaplanır (lib/live-pricing). Ham maliyet kalemleri,
// fiyat değişkenleri ve uyarılar İSTEMCİYE DÖNMEZ — yalnız satış rakamları döner.
import { serverKonfigPrice } from '@/lib/live-pricing';

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
    logo: body.logo && typeof body.logo === 'object' ? { widthCm: body.logo.widthCm, heightCm: body.logo.heightCm } : null,
    unbelMaterial: typeof body.unbelMaterial === 'string' ? body.unbelMaterial : undefined,
    chromColor: typeof body.chromColor === 'string' ? body.chromColor : undefined,
    depth: body.depth,
    bohrschablone: body.bohrschablone === true,
    cubukLed: body.cubukLed && typeof body.cubukLed === 'object'
      ? { lengthCm: body.cubukLed.lengthCm, heightCm: body.cubukLed.heightCm }
      : null,
  };

  const p = await serverKonfigPrice(cfg);
  if (!p) return Response.json({ price: null });

  return Response.json({
    price: {
      letters: p.letters,
      perLetter: p.perLetter,
      lettersTotal: p.lettersTotal,
      letterRows: Array.isArray(p.letterRows) ? p.letterRows.map((r) => ({ ch: r.ch, heightCm: r.heightCm, price: r.price })) : null,
      logo: p.logo
        ? { widthCm: p.logo.widthCm, heightCm: p.logo.heightCm, eqLetters: p.logo.eqLetters, perLetter: p.logo.perLetter, total: p.logo.total }
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
    },
  });
}
