// KUTUHARF Stüdyo — toplu canlı fiyat. Tasarımdaki her kalem SUNUCUDA fiyatlanır.
// /api/price ile aynı güvenlik modeli: istemciden gelen cfg allowlist'ten geçer,
// ham maliyet kalemleri ve fiyat değişkenleri İSTEMCİYE DÖNMEZ.
//
// Fark: burada tek cfg değil, tasarımın tamamı gelir. İlk kalem ana kalemdir,
// diğerleri addon → ambalaj/minimum/montaj/trafo bir kez alınır.
import { rateLimit } from '@/utils/rateLimit';
import { pickStudioCfg, MAX_STUDIO_ITEMS } from '@/lib/studio/cfgAllowlist';
import { priceItems } from '@/lib/studio/priceItems';

export async function POST(request) {
  if (!rateLimit(request, 'studio-price', 240, 60 * 1000)) {
    return Response.json({ error: 'Zu viele Anfragen.' }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const raw = Array.isArray(body?.items) ? body.items.slice(0, MAX_STUDIO_ITEMS) : [];
  const items = raw
    .map((it) => ({
      key: String(it?.key || '').slice(0, 64),
      cfg: pickStudioCfg(it?.cfg),
      addon: it?.addon === true,
    }))
    .filter((it) => it.cfg);

  const result = await priceItems(items);
  return Response.json(result);
}
