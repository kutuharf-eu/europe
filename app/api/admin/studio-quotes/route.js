// KUTUHARF — Admin: stüdyodan gelen teklif talepleri.
// Koruma: x-admin-key === KUTUHARF_ADMIN_KEY (AdminFiyat/AdminHaendler ile aynı desen).
// GET  → talepler + bağlı tasarımın önizlemesi/fiyatı
// POST → { id, status } durum güncelle
import { supabaseServer } from '@/utils/supabaseServer';

const STATUS = ['neu', 'gesehen', 'beantwortet', 'erledigt'];

function authed(request) {
  const key = process.env.KUTUHARF_ADMIN_KEY;
  return !!key && request.headers.get('x-admin-key') === key;
}

export async function GET(request) {
  if (!authed(request)) return Response.json({ error: 'Yetkisiz.' }, { status: 401 });
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: 'Supabase yapılandırılmamış.' }, { status: 503 });

  const { data, error } = await sb
    .from('kutuharf_quote_requests')
    .select('id,design_id,name,firma,email,telefon,nachricht,price_total,status,created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Tasarım önizlemesi ayrı sorguyla — teklif tablosu tasarımdan bağımsız kalsın.
  const ids = [...new Set((data || []).map((r) => r.design_id).filter(Boolean))];
  let previews = {};
  if (ids.length) {
    const { data: designs } = await sb
      .from('kutuharf_designs')
      .select('id,preview_url,price_total,title')
      .in('id', ids);
    previews = Object.fromEntries((designs || []).map((d) => [d.id, d]));
  }

  return Response.json({
    quotes: (data || []).map((r) => ({ ...r, design: previews[r.design_id] || null })),
  });
}

export async function POST(request) {
  if (!authed(request)) return Response.json({ error: 'Yetkisiz.' }, { status: 401 });
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: 'Supabase yapılandırılmamış.' }, { status: 503 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  const { id, status } = body || {};
  if (!id || !STATUS.includes(status)) {
    return Response.json({ error: 'Geçersiz durum.' }, { status: 400 });
  }

  const { error } = await sb.from('kutuharf_quote_requests').update({ status }).eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
