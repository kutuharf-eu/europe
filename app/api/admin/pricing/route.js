// KUTUHARF — Admin fiyat API'si. Koruma: x-admin-key başlığı === KUTUHARF_ADMIN_KEY env.
// GET  → tüm fiyat değişkenleri + ek maliyet kalemleri (aktif/pasif hepsi)
// PUT  → { vars: { key: value, ... }, extras: [ { id?, _delete?, ...alanlar } ] }
//        vars: verilen anahtarlar upsert edilir (value=null → tanımsız).
//        extras: id'siz kayıt eklenir, id'li güncellenir, _delete:true silinir.
import { supabaseServer } from '@/utils/supabaseServer';
import { invalidatePricingCache } from '@/lib/pricing-vars';

const EXTRA_TYPES = ['per_letter', 'per_m2', 'per_order', 'percent'];
const CURRENCIES = ['TRY', 'USD', 'EUR'];

function authed(request) {
  const key = process.env.KUTUHARF_ADMIN_KEY;
  return !!key && request.headers.get('x-admin-key') === key;
}

export async function GET(request) {
  if (!authed(request)) return Response.json({ error: 'Yetkisiz.' }, { status: 401 });
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: 'Supabase yapılandırılmamış.' }, { status: 503 });
  const [vars, extras] = await Promise.all([
    sb.from('kutuharf_pricing_variables').select('key,value,updated_at').order('key'),
    sb.from('kutuharf_extra_costs').select('*').order('created_at'),
  ]);
  if (vars.error || extras.error) {
    return Response.json({ error: (vars.error || extras.error).message }, { status: 500 });
  }
  return Response.json({ vars: vars.data, extras: extras.data });
}

export async function PUT(request) {
  if (!authed(request)) return Response.json({ error: 'Yetkisiz.' }, { status: 401 });
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: 'Supabase yapılandırılmamış.' }, { status: 503 });
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  // Değişkenler: key allowlist yok — panel yalnız bilinen anahtarları gönderir,
  // yeni anahtar eklemek de (motor genişleyince) bilinçli bir admin işlemi.
  if (body.vars && typeof body.vars === 'object') {
    const rows = Object.entries(body.vars).map(([key, value]) => ({
      key: String(key).slice(0, 64),
      value: value === undefined ? null : value,
      updated_at: new Date().toISOString(),
    }));
    if (rows.length) {
      const { error } = await sb.from('kutuharf_pricing_variables').upsert(rows);
      if (error) return Response.json({ error: error.message }, { status: 500 });
    }
  }

  if (Array.isArray(body.extras)) {
    for (const e of body.extras) {
      if (e.id && e._delete) {
        const { error } = await sb.from('kutuharf_extra_costs').delete().eq('id', e.id);
        if (error) return Response.json({ error: error.message }, { status: 500 });
        continue;
      }
      const row = {
        name: String(e.name || '').slice(0, 120),
        cost_type: EXTRA_TYPES.includes(e.cost_type) ? e.cost_type : 'per_order',
        amount: Number(e.amount) || 0,
        currency: CURRENCIES.includes(e.currency) ? e.currency : 'TRY',
        applies_lighting: Array.isArray(e.applies_lighting) ? e.applies_lighting.map(String) : [],
        applies_construction: Array.isArray(e.applies_construction) ? e.applies_construction.map(String) : [],
        active: e.active !== false,
        note: e.note ? String(e.note).slice(0, 400) : null,
        updated_at: new Date().toISOString(),
      };
      if (!row.name) continue;
      const q = e.id
        ? sb.from('kutuharf_extra_costs').update(row).eq('id', e.id)
        : sb.from('kutuharf_extra_costs').insert(row);
      const { error } = await q;
      if (error) return Response.json({ error: error.message }, { status: 500 });
    }
  }

  invalidatePricingCache();
  return Response.json({ ok: true });
}
