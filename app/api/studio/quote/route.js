// KUTUHARF Stüdyo — "Angebot anfordern". Tasarım önce kaydedilir, sonra bu rota
// çağrılır; teklifte görünen tutar DB'deki sunucu-hesaplı fiyattır (istemciden gelen
// rakama güvenilmez). Mail hatası talebi başarısız saymaz — DB doğruluk kaynağıdır
// (/api/anfrage ile aynı yaklaşım).
import { rateLimit } from '@/utils/rateLimit';
import { supabaseServer } from '@/utils/supabaseServer';

const MAX = { name: 120, firma: 160, email: 200, telefon: 60, nachricht: 4000 };
const TOKEN_RE = /^[a-zA-Z0-9-]{16,64}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const eur = (v) =>
  typeof v === 'number' ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v) : '—';

export async function POST(request) {
  if (!rateLimit(request, 'studio-quote', 5)) {
    return Response.json({ error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' }, { status: 429 });
  }

  const sb = supabaseServer();
  if (!sb) return Response.json({ error: 'Anfrage derzeit nicht möglich.' }, { status: 503 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const { name, firma, email, telefon, nachricht, designId, ownerToken } = body || {};
  if (!name || !email) {
    return Response.json({ error: 'Bitte Name und E-Mail ausfüllen.' }, { status: 400 });
  }
  for (const [key, limit] of Object.entries(MAX)) {
    if (body[key] && String(body[key]).length > limit) {
      return Response.json({ error: 'Eingabe zu lang.' }, { status: 400 });
    }
  }
  if (!EMAIL_RE.test(String(email))) {
    return Response.json({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' }, { status: 400 });
  }

  // Tasarım varsa: yalnız kendi token'ıyla eşleşen kayıt bağlanır.
  let design = null;
  if (designId && TOKEN_RE.test(String(ownerToken || ''))) {
    const { data } = await sb
      .from('kutuharf_designs')
      .select('id,preview_url,price_total')
      .eq('id', designId)
      .eq('owner_token', ownerToken)
      .maybeSingle();
    design = data || null;
  }

  const { error } = await sb.from('kutuharf_quote_requests').insert({
    design_id: design?.id || null,
    owner_token: TOKEN_RE.test(String(ownerToken || '')) ? ownerToken : null,
    name: String(name).trim(),
    firma: firma ? String(firma).trim() : null,
    email: String(email).trim(),
    telefon: telefon ? String(telefon).trim() : null,
    nachricht: nachricht ? String(nachricht).trim() : null,
    price_total: design?.price_total ?? null,
  });

  if (error) {
    console.error('[studio/quote] insert failed:', error.message);
    return Response.json({ error: 'Anfrage konnte nicht gespeichert werden. Bitte rufen Sie uns an.' }, { status: 500 });
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const mailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'KUTUHARF <info@kutuharf.eu>',
          to: ['info@kutuharf.eu'],
          reply_to: String(email).trim(),
          subject: `Studio-Anfrage — ${name}`,
          text: [
            `Name: ${name}`,
            `Firma: ${firma || '—'}`,
            `E-Mail: ${email}`,
            `Telefon: ${telefon || '—'}`,
            `Kalkulierter Preis (netto): ${eur(design?.price_total)}`,
            design?.preview_url ? `Entwurf-Vorschau: ${design.preview_url}` : null,
            design?.id ? `Entwurf-ID: ${design.id}` : null,
            '',
            nachricht || '(keine Nachricht)',
            '',
            '— kutuharf.eu Schilder-Designer',
          ]
            .filter(Boolean)
            .join('\n'),
        }),
      });
      if (!mailRes.ok) console.error('Resend failed:', mailRes.status, await mailRes.text());
    } catch (err) {
      console.error('Resend error:', err);
    }
  }

  return Response.json({ ok: true });
}
