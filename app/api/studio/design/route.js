// KUTUHARF Stüdyo — tasarım kaydet / yükle.
//
// Güvenlik kilidinden sonra anon istemci Supabase'e yazamaz → tüm erişim burada,
// service key ile. Sitede son müşteri girişi olmadığı için sahiplik `owner_token`
// ile kurulur: istemcide üretilen rastgele anahtar, localStorage'da saklanır.
// Yükleme (GET) yalnız aynı token ile mümkün — başkasının tasarımı okunamaz.
//
// Kaydedilen fiyat İSTEMCİDEN GELMEZ: tasarım sunucuda yeniden fiyatlanır.
import { rateLimit } from '@/utils/rateLimit';
import { supabaseServer } from '@/utils/supabaseServer';
import { priceDesign } from '@/lib/studio/priceItems';

const MAX_DESIGN_BYTES = 200 * 1024;
const MAX_PREVIEW_BYTES = 1.5 * 1024 * 1024;
const TOKEN_RE = /^[a-zA-Z0-9-]{16,64}$/;

/** Önizleme PNG'sini uploads bucket'ına yazar; hata kaydı bloke etmez. */
async function uploadPreview(sb, id, dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/png;base64,')) return null;
  const base64 = dataUrl.slice('data:image/png;base64,'.length);
  const buf = Buffer.from(base64, 'base64');
  if (!buf.length || buf.length > MAX_PREVIEW_BYTES) return null;

  const path = `studio/${id}.png`;
  const { error } = await sb.storage
    .from('uploads')
    .upload(path, buf, { contentType: 'image/png', upsert: true });
  if (error) {
    console.error('[studio/design] preview upload failed:', error.message);
    return null;
  }
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/uploads/${path}`;
}

export async function POST(request) {
  if (!rateLimit(request, 'studio-design', 40, 60 * 60 * 1000)) {
    return Response.json({ error: 'Zu viele Speicherungen. Bitte später erneut versuchen.' }, { status: 429 });
  }

  const sb = supabaseServer();
  if (!sb) return Response.json({ error: 'Speichern derzeit nicht möglich.' }, { status: 503 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const ownerToken = String(body?.ownerToken || '');
  if (!TOKEN_RE.test(ownerToken)) {
    return Response.json({ error: 'Ungültige Sitzung.' }, { status: 400 });
  }

  const design = body?.design;
  if (!design || typeof design !== 'object' || !Array.isArray(design.elements)) {
    return Response.json({ error: 'Ungültiger Entwurf.' }, { status: 400 });
  }
  if (JSON.stringify(design).length > MAX_DESIGN_BYTES) {
    return Response.json({ error: 'Entwurf zu groß.' }, { status: 413 });
  }

  // Fiyat sunucuda hesaplanır — istemciden gelen tutara güvenilmez.
  let priceTotal = null;
  try {
    const priced = await priceDesign(design);
    priceTotal = priced.total;
  } catch (e) {
    console.error('[studio/design] pricing failed:', e?.message || e);
  }

  const row = {
    owner_token: ownerToken,
    title: body?.title ? String(body.title).slice(0, 120) : null,
    design,
    price_total: priceTotal,
  };

  const existingId = typeof body?.id === 'string' ? body.id : null;
  let saved;

  if (existingId) {
    // Güncelleme yalnız aynı token ile — başkasının tasarımı değiştirilemez.
    const { data, error } = await sb
      .from('kutuharf_designs')
      .update(row)
      .eq('id', existingId)
      .eq('owner_token', ownerToken)
      .select('id')
      .maybeSingle();
    if (error) {
      console.error('[studio/design] update failed:', error.message);
      return Response.json({ error: 'Entwurf konnte nicht gespeichert werden.' }, { status: 500 });
    }
    if (!data) return Response.json({ error: 'Entwurf nicht gefunden.' }, { status: 404 });
    saved = data;
  } else {
    const { data, error } = await sb
      .from('kutuharf_designs')
      .insert(row)
      .select('id')
      .single();
    if (error) {
      console.error('[studio/design] insert failed:', error.message);
      return Response.json({ error: 'Entwurf konnte nicht gespeichert werden.' }, { status: 500 });
    }
    saved = data;
  }

  const previewUrl = await uploadPreview(sb, saved.id, body?.preview);
  if (previewUrl) {
    await sb.from('kutuharf_designs').update({ preview_url: previewUrl }).eq('id', saved.id);
  }

  return Response.json({ id: saved.id, previewUrl, priceTotal });
}

export async function GET(request) {
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: 'Nicht verfügbar.' }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';
  const ownerToken = searchParams.get('token') || '';
  if (!id || !TOKEN_RE.test(ownerToken)) {
    return Response.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const { data, error } = await sb
    .from('kutuharf_designs')
    .select('id,title,design,preview_url,price_total,updated_at')
    .eq('id', id)
    .eq('owner_token', ownerToken)
    .maybeSingle();

  if (error) {
    console.error('[studio/design] load failed:', error.message);
    return Response.json({ error: 'Entwurf konnte nicht geladen werden.' }, { status: 500 });
  }
  if (!data) return Response.json({ error: 'Entwurf nicht gefunden.' }, { status: 404 });

  return Response.json({ design: data });
}
