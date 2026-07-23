// KUTUHARF — Händler başvuru (self-signup). Service-role ile Supabase Auth hesabı
// oluşturur (e-posta doğrulama açık) + kutuharf_profiles satırı (role=haendler,
// status=pending). Onay/kademe YALNIZ admin API'sinden. Fiyat kademesi burada ATANMAZ.
import { rateLimit } from '@/utils/rateLimit';

const clean = (v, n) => (v == null ? null : String(v).trim().slice(0, n));

export async function POST(request) {
  if (!rateLimit(request, 'haendler-register', 5)) {
    return Response.json({ error: 'Zu viele Anfragen. Bitte später erneut versuchen.' }, { status: 429 });
  }

  const base = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SECRET_KEY;
  if (!base || !service) {
    return Response.json({ error: 'Registrierung derzeit nicht verfügbar.' }, { status: 503 });
  }

  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: 'Ungültige Anfrage.' }, { status: 400 }); }

  const email = clean(body.email, 200)?.toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const firma = clean(body.firma, 160);
  const ustId = clean(body.ustId, 40);
  const telefon = clean(body.telefon, 60);

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: 'Passwort muss mindestens 8 Zeichen haben.' }, { status: 400 });
  }
  if (!firma || !ustId || !telefon) {
    return Response.json({ error: 'Firma, USt-IdNr und Telefon sind Pflichtfelder.' }, { status: 400 });
  }

  const sh = { apikey: service, Authorization: `Bearer ${service}`, 'Content-Type': 'application/json' };

  // 1) Auth kullanıcısı (e-posta onaylı: admin zaten elle onaylayacak, doğrulama akışı beklenmez)
  const uRes = await fetch(`${base}/auth/v1/admin/users`, {
    method: 'POST', headers: sh,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!uRes.ok) {
    const txt = await uRes.text().catch(() => '');
    // E-Mail bereits registriert → freundliche Meldung, kein Leak.
    if (/registered|already|exists|duplicate/i.test(txt)) {
      return Response.json({ error: 'Diese E-Mail ist bereits registriert. Bitte melden Sie sich an.' }, { status: 409 });
    }
    console.error('[haendler/register] user create failed:', uRes.status, txt);
    return Response.json({ error: 'Registrierung fehlgeschlagen. Bitte später erneut versuchen.' }, { status: 500 });
  }
  const user = await uRes.json();
  const uid = user?.id || user?.user?.id;
  if (!uid) {
    console.error('[haendler/register] kein User-ID in Antwort');
    return Response.json({ error: 'Registrierung fehlgeschlagen.' }, { status: 500 });
  }

  // 2) Profil (pending). Kademe/rol/durum yalnız sunucuda — istemci hiçbir şey belirleyemez.
  const pRes = await fetch(`${base}/rest/v1/kutuharf_profiles`, {
    method: 'POST', headers: { ...sh, Prefer: 'return=minimal' },
    body: JSON.stringify({ id: uid, role: 'haendler', status: 'pending', firma, ust_id: ustId, telefon }),
  });
  if (!pRes.ok) {
    const txt = await pRes.text().catch(() => '');
    console.error('[haendler/register] profile insert failed:', pRes.status, txt);
    // Auth kullanıcısını geri al (yetim hesap bırakma) — best effort.
    await fetch(`${base}/auth/v1/admin/users/${uid}`, { method: 'DELETE', headers: sh }).catch(() => {});
    const notMigrated = /kutuharf_profiles/i.test(txt) && /(does not exist|relation)/i.test(txt);
    return Response.json({
      error: notMigrated
        ? 'Händlerbereich wird gerade eingerichtet. Bitte in Kürze erneut versuchen.'
        : 'Registrierung fehlgeschlagen. Bitte später erneut versuchen.',
    }, { status: 500 });
  }

  // 3) Admin'e bilgi maili (Resend varsa — best effort, başvuruyu bloke etmez)
  if (process.env.RESEND_API_KEY) {
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'KUTUHARF <info@kutuharf.eu>',
        to: ['info@kutuharf.eu'],
        subject: `Neue Händler-Anfrage — ${firma}`,
        text: `Firma: ${firma}\nUSt-IdNr: ${ustId}\nTelefon: ${telefon}\nE-Mail: ${email}\n\nStatus: wartet auf Freigabe (/admin/haendler).`,
      }),
    }).catch(() => {});
  }

  return Response.json({ ok: true });
}
