// KUTUHARF — Admin fiyat KARŞILAŞTIRMA API'si. Koruma: x-admin-key === KUTUHARF_ADMIN_KEY.
// Örnek bir konfigürasyon için üretim maliyetini + üç marj kademesindeki satış fiyatını
// döndürür. Maliyet ifşa ettiği için (müşteri /api/price'ından farklı) yalnız admin erişir.
import { serverAdminPricePreview } from '@/lib/live-pricing';

function authed(request) {
  const key = process.env.KUTUHARF_ADMIN_KEY;
  return !!key && request.headers.get('x-admin-key') === key;
}

export async function POST(request) {
  if (!authed(request)) return Response.json({ error: 'Yetkisiz.' }, { status: 401 });
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  // /api/price ile aynı allowlist — yalnız fiyata etki eden alanlar.
  const cfg = {
    text: String(body.text || '').slice(0, 60),
    heightCm: Number(body.heightCm),
    lightMode: body.lightMode === 'unbeleuchtet' ? 'unbeleuchtet' : 'beleuchtet',
    lightingId: typeof body.lightingId === 'string' ? body.lightingId : undefined,
    constructionId: typeof body.constructionId === 'string' ? body.constructionId : undefined,
    fontId: typeof body.fontId === 'string' ? body.fontId : undefined,
    montageId: typeof body.montageId === 'string' ? body.montageId : 'selbst',
    trafo: body.trafo !== false,
    unbelMaterial: typeof body.unbelMaterial === 'string' ? body.unbelMaterial : undefined,
    chromColor: typeof body.chromColor === 'string' ? body.chromColor : undefined,
    depth: body.depth,
  };

  const r = await serverAdminPricePreview(cfg);
  return Response.json(r);
}
