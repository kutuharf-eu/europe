import { rateLimit } from '@/utils/rateLimit';

const MAX = { name: 120, firma: 160, email: 200, telefon: 60, kategorie: 60, produkt: 160, nachricht: 4000 };

export async function POST(request) {
  if (!rateLimit(request, 'anfrage', 5)) {
    return Response.json({ error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const { name, firma, email, telefon, kategorie, produkt, nachricht } = body || {};
  if (!name || !email || !nachricht) {
    return Response.json({ error: 'Bitte Name, E-Mail und Nachricht ausfüllen.' }, { status: 400 });
  }
  for (const [key, limit] of Object.entries(MAX)) {
    if (body[key] && String(body[key]).length > limit) {
      return Response.json({ error: 'Eingabe zu lang.' }, { status: 400 });
    }
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' }, { status: 400 });
  }

  // Secret Key: anon darf seit dem Security-Lockdown nicht mehr direkt inserten
  // Geteilte Supabase-DB (restaurantspezial-Projekt): kutuharf-Anfragen leben in
  // kutuharf_anfragen — NIE in der anfragen-Tabelle von restaurantspezial.
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/kutuharf_anfragen`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      name: String(name).trim(),
      firma: firma ? String(firma).trim() : null,
      email: String(email).trim(),
      telefon: telefon ? String(telefon).trim() : null,
      kategorie: kategorie ? String(kategorie).trim() : null,
      produkt: produkt ? String(produkt).trim() : null,
      nachricht: String(nachricht).trim(),
    }),
  });

  if (!res.ok) {
    console.error('Supabase insert failed:', res.status, await res.text());
    return Response.json({ error: 'Anfrage konnte nicht gespeichert werden. Bitte rufen Sie uns an.' }, { status: 500 });
  }

  // Benachrichtigung per Mail — Fehler hier sollen die Anfrage nicht scheitern lassen,
  // die Datenbank ist die Quelle der Wahrheit.
  if (process.env.RESEND_API_KEY) {
    try {
      const mailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Absender voruebergehend ueber die verifizierte kittelwerk.de-Domain,
          // bis kutuharf.de in Resend verifiziert ist.
          from: 'KUTUHARF <info@kittelwerk.de>',
          to: ['info@kutuharf.eu'],
          reply_to: String(email).trim(),
          subject: `Neue Anfrage${produkt ? ': ' + produkt : ''} — ${name}`,
          text: [
            `Name: ${name}`,
            `Firma: ${firma || '—'}`,
            `E-Mail: ${email}`,
            `Telefon: ${telefon || '—'}`,
            `Kategorie: ${kategorie || '—'}`,
            `Produkt / Thema: ${produkt || '—'}`,
            '',
            nachricht,
            '',
            '— kutuharf.de Anfrageformular',
          ].join('\n'),
        }),
      });
      if (!mailRes.ok) console.error('Resend failed:', mailRes.status, await mailRes.text());
    } catch (err) {
      console.error('Resend error:', err);
    }
  }

  return Response.json({ ok: true });
}
