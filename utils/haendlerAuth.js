// KUTUHARF — Händler kimlik çözümü (YALNIZ SUNUCU).
// İstek Authorization: Bearer <supabase access token> taşırsa: token'ı Supabase Auth'a
// doğrular, kutuharf_profiles'tan rolü/durumu/kademeyi okur ve satış için doğru
// marj anahtarını döndürür. Segment ASLA istemciden gelmez — token'dan türetilir.
//
// Dönüş: { marjKey, haendlerId, tier } | null
//   null  → anonim müşteri ya da onaysız/hatalı → çağıran 'standart' kullanır.
//   marjKey: 'haendler_cok' | 'haendler_az'  (kutuharf_pricing_variables.marj anahtarı)

const TIER_TO_MARJ = { cok: 'haendler_cok', az: 'haendler_az' };

export async function resolveHaendler(request) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const base = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SECRET_KEY;
  if (!base || !anon || !service) return null;

  try {
    // 1) Token → kullanıcı (Supabase Auth doğrular; süresi geçmiş/sahte token reddedilir)
    const uRes = await fetch(`${base}/auth/v1/user`, {
      headers: { apikey: anon, Authorization: `Bearer ${token}` },
    });
    if (!uRes.ok) return null;
    const user = await uRes.json();
    if (!user?.id) return null;

    // 2) Profil (service_role ile — RLS baypas): yalnız onaylı Händler indirimli fiyat alır
    const pRes = await fetch(
      `${base}/rest/v1/kutuharf_profiles?id=eq.${user.id}&select=role,status,haendler_tier`,
      { headers: { apikey: service, Authorization: `Bearer ${service}` } },
    );
    if (!pRes.ok) return null;
    const rows = await pRes.json();
    const p = Array.isArray(rows) ? rows[0] : null;
    if (!p || p.role !== 'haendler' || p.status !== 'approved') return null;

    const marjKey = TIER_TO_MARJ[p.haendler_tier];
    if (!marjKey) return null; // kademe atanmamış → standart fiyat

    return { marjKey, haendlerId: user.id, tier: p.haendler_tier };
  } catch (e) {
    console.error('[haendlerAuth] çözüm hatası:', e?.message || e);
    return null; // hata halinde güvenli taraf: standart fiyat
  }
}
