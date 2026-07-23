// KUTUHARF — Admin Händler yönetimi. Koruma: x-admin-key === KUTUHARF_ADMIN_KEY.
// GET  → tüm Händler profilleri (pending/approved/rejected) + e-posta
// POST → { id, action: 'approve'|'reject', tier?: 'cok'|'az' }
//        approve: status=approved + haendler_tier (zorunlu). reject: status=rejected.
import { supabaseServer } from '@/utils/supabaseServer';

const TIERS = ['cok', 'az'];

function authed(request) {
  const key = process.env.KUTUHARF_ADMIN_KEY;
  return !!key && request.headers.get('x-admin-key') === key;
}

// auth.users e-postalarını profil id'leriyle eşle (profiles'ta e-posta tutulmuyor).
async function emailMap(base, service, ids) {
  const out = {};
  await Promise.all(ids.map(async (id) => {
    try {
      const r = await fetch(`${base}/auth/v1/admin/users/${id}`, {
        headers: { apikey: service, Authorization: `Bearer ${service}` },
      });
      if (r.ok) { const u = await r.json(); out[id] = u?.email || null; }
    } catch { /* yok say */ }
  }));
  return out;
}

export async function GET(request) {
  if (!authed(request)) return Response.json({ error: 'Yetkisiz.' }, { status: 401 });
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: 'Supabase yapılandırılmamış.' }, { status: 503 });

  const { data, error } = await sb
    .from('kutuharf_profiles')
    .select('id,role,status,firma,ust_id,telefon,haendler_tier,created_at')
    .eq('role', 'haendler')
    .order('created_at', { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const emails = await emailMap(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, (data || []).map((r) => r.id));
  return Response.json({ haendler: (data || []).map((r) => ({ ...r, email: emails[r.id] || null })) });
}

export async function POST(request) {
  if (!authed(request)) return Response.json({ error: 'Yetkisiz.' }, { status: 401 });
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: 'Supabase yapılandırılmamış.' }, { status: 503 });

  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: 'Geçersiz istek.' }, { status: 400 }); }

  const id = String(body.id || '');
  const action = body.action;
  if (!id) return Response.json({ error: 'id gerekli.' }, { status: 400 });

  let patch;
  if (action === 'approve') {
    if (!TIERS.includes(body.tier)) {
      return Response.json({ error: "Onay için kademe gerekli ('cok' veya 'az')." }, { status: 400 });
    }
    patch = { status: 'approved', haendler_tier: body.tier, updated_at: new Date().toISOString() };
  } else if (action === 'reject') {
    patch = { status: 'rejected', updated_at: new Date().toISOString() };
  } else if (action === 'set_tier') {
    // Onaylı Händler'in kademesini değiştir (terfi/tenzil)
    if (!TIERS.includes(body.tier)) return Response.json({ error: 'Geçersiz kademe.' }, { status: 400 });
    patch = { haendler_tier: body.tier, updated_at: new Date().toISOString() };
  } else {
    return Response.json({ error: 'Geçersiz işlem.' }, { status: 400 });
  }

  const { data, error } = await sb
    .from('kutuharf_profiles')
    .update(patch)
    .eq('id', id)
    .eq('role', 'haendler')
    .select('id,firma,status,haendler_tier')
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Händler'e onay/red bilgisi (Resend varsa — best effort)
  if (process.env.RESEND_API_KEY && (action === 'approve' || action === 'reject')) {
    const emails = await emailMap(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, [id]);
    const to = emails[id];
    if (to) {
      const msg = action === 'approve'
        ? `Guten Tag,\n\nIhr Händlerzugang bei KUTUHARF wurde freigeschaltet. Sie sehen Ihre Händlerpreise nach dem Login unter kutuharf.eu/haendler.\n\nMit freundlichen Grüßen\nKUTUHARF`
        : `Guten Tag,\n\nvielen Dank für Ihr Interesse. Ihre Händler-Anfrage konnten wir derzeit leider nicht freigeben. Bei Fragen erreichen Sie uns unter info@kutuharf.eu.\n\nMit freundlichen Grüßen\nKUTUHARF`;
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'KUTUHARF <info@kutuharf.eu>', to: [to], subject: action === 'approve' ? 'Ihr Händlerzugang ist aktiv' : 'Ihre Händler-Anfrage', text: msg }),
      }).catch(() => {});
    }
  }

  return Response.json({ ok: true, haendler: data });
}
