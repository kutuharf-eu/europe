import { findProduct, VAT_RATE, SHIPPING_COST, FREE_SHIPPING_FROM, DISCOUNT_CODES, DATENCHECK_PRICE, codeDiscountAmount, discountLabel, sonderDiscountAmount, sonderLabel } from '@/data/categories';
import { konfigDetail, KONFIG_LIMITS, normalizeLightColor, normalizeColor, normalizeChromeFinish, normalizeRal } from '@/data/konfigurator';
import { serverKonfigPrice } from '@/lib/live-pricing';
import { sanitizeV3Config, deriveV3PricingConfig, detailV3 } from '@/data/konfigurator3';
import { rateLimit } from '@/utils/rateLimit';

const round2 = (n) => Math.round(n * 100) / 100;
const fmt = (n) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

// KUTUHARF hat keinen Händlerbereich — der frühere resellers-Lookup (restaurantspezial-
// Erbe) ist entfernt; die Supabase-DB wird mit restaurantspezial GETEILT, ein Lookup
// würde deren Händlerdaten treffen.
async function resellerRate() {
  return 0;
}

export async function POST(request) {
  if (!rateLimit(request, 'order', 10)) {
    return Response.json({ error: 'Zu viele Bestellungen. Bitte versuchen Sie es später erneut.' }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const { name, firma, email, telefon, strasse, plz, ort, items, resellerEmail, discountCode, sonder, logoUrl, notes } = body || {};

  // Nur Uploads aus unserem eigenen Storage-Bucket akzeptieren
  const uploadPrefix = `${process.env.SUPABASE_URL}/storage/v1/object/public/uploads/`;
  const safeLogoUrl = typeof logoUrl === 'string' && logoUrl.startsWith(uploadPrefix) ? logoUrl.slice(0, 500) : null;
  if (!name || !email || !strasse || !plz || !ort || !Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'Bitte alle Pflichtfelder ausfüllen.' }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' }, { status: 400 });
  }
  if (items.length > 50) {
    return Response.json({ error: 'Zu viele Positionen.' }, { status: 400 });
  }

  // Preise ausschließlich serverseitig aus den Produktdaten berechnen
  const recalc = [];
  let datencheckCount = 0;
  for (const item of items) {
    const qty = Math.min(Math.max(parseInt(item.qty) || 0, 1), 999);

    // Positions-Metadaten (Datei nur aus eigenem Bucket, Bemerkung begrenzt)
    const itemFileUrl = typeof item.fileUrl === 'string' && item.fileUrl.startsWith(uploadPrefix) ? item.fileUrl.slice(0, 500) : null;
    const itemFileName = itemFileUrl && item.fileName ? String(item.fileName).slice(0, 200) : null;
    const itemNote = item.note ? String(item.note).slice(0, 500) : null;
    const itemDatencheck = !!item.datencheck;
    if (itemDatencheck) datencheckCount++;
    const meta = { fileUrl: itemFileUrl, fileName: itemFileName, note: itemNote, datencheck: itemDatencheck };

    // v3-Konfigurator (/konfigurator-test): strikte Allowlist + serverseitig
    // abgeleitete Preis-IDs. Nur bei markiertem v3-Flag; v1/v2 bleiben unberührt.
    if (item.konfig?.v3 === true) {
      const s = sanitizeV3Config(item.konfig);
      if (!s.ok) return Response.json({ error: 'Ungültige Konfiguration.' }, { status: 400 });
      // Über quoteHeight nur per Angebot/Anfrage — Online-Bestellung gesperrt (gilt auch fürs Logo).
      if (s.config.heightCm > KONFIG_LIMITS.quoteHeight || (s.config.logo && s.config.logo.heightCm > KONFIG_LIMITS.quoteHeight) || (s.config.cubukLed && s.config.cubukLed.heightCm > KONFIG_LIMITS.quoteHeight)) {
        return Response.json({ error: `Buchstaben-/Logohöhe über ${KONFIG_LIMITS.quoteHeight} cm — bitte per Anfrage oder PDF-Angebot bestellen.` }, { status: 400 });
      }
      // Angebotspflichtige Optionen (Profi-Montage vor Ort, Grundplatte/Tragprofil):
      // keine Online-Bestellung — der Kunde geht über die Angebots-Anfrage.
      if (s.config.montageId === 'profi' || (s.config.traeger && s.config.traeger !== 'wand')) {
        return Response.json({ error: 'Diese Auswahl (Montage/Untergrund) erfordert ein individuelles Angebot — bitte Anfrage senden.' }, { status: 400 });
      }
      // Logo-Datei nur aus unserem eigenen Upload-Bucket übernehmen.
      if (s.config.logoUrl && !s.config.logoUrl.startsWith(uploadPrefix)) delete s.config.logoUrl;
      const priceCfg = deriveV3PricingConfig(s.config);
      if (!priceCfg) return Response.json({ error: 'Ungültige Konfiguration.' }, { status: 400 });
      // Preis serverseitig über die Live-Preisbrücke (Motor, Fallback: Legacy-Formel) —
      // exakt dieselbe Funktion wie /api/price, damit Anzeige und Bestellung übereinstimmen.
      const p = await serverKonfigPrice({ ...priceCfg, unbelMaterial: s.config.unbelMaterial, chromColor: s.config.chromColor, depth: s.config.depth, bohrschablone: s.config.bohrschablone });
      if (!p) return Response.json({ error: 'Ungültige Konfiguration.' }, { status: 400 });
      // Gespeichert werden nur geprüfte Produktionsfelder + serverseitig
      // abgeleitete Preis-IDs (Client-lightingId/constructionId werden ignoriert).
      const cfg = { ...s.config, v3: true, lightingId: priceCfg.lightingId, constructionId: priceCfg.constructionId, trafo: priceCfg.trafo };
      recalc.push({
        name: '3D-Buchstaben nach Maß',
        categorySlug: 'werbetechnik',
        productSlug: 'konfigurator-3d-buchstaben',
        detail: detailV3(s.config),
        konfig: cfg,
        qty,
        unitPrice: p.total,
        lineTotal: round2(p.total * qty),
        ...meta,
      });
      continue;
    }

    // Konfigurator-Positionen: Preis komplett aus der Konfiguration neu berechnen
    if (item.konfig) {
      if (Number(item.konfig.heightCm) > KONFIG_LIMITS.quoteHeight) {
        return Response.json({ error: `Buchstabenhöhe über ${KONFIG_LIMITS.quoteHeight} cm — bitte per Anfrage oder PDF-Angebot bestellen.` }, { status: 400 });
      }
      const cfgText = String(item.konfig.text || '').trim().slice(0, KONFIG_LIMITS.maxTextLen);
      const cfg = {
        text: cfgText,
        heightCm: Number(item.konfig.heightCm),
        lightMode: item.konfig.lightMode,
        lightingId: item.konfig.lightingId,
        lightColor: normalizeLightColor(item.konfig.lightColor),
        dimmbar: item.konfig.dimmbar === true,
        trafo: item.konfig.trafo !== false,
        constructionId: item.konfig.constructionId,
        plexiColor: normalizeColor('plexiglas', item.konfig.plexiColor),
        chromeFinish: normalizeChromeFinish(item.konfig.chromeFinish),
        ral: normalizeRal(item.konfig.ral),
        fontId: item.konfig.fontId,
        montageId: item.konfig.montageId,
      };
      const p = await serverKonfigPrice(cfg);
      if (!p) return Response.json({ error: 'Ungültige Konfiguration.' }, { status: 400 });
      recalc.push({
        name: '3D-Buchstaben nach Maß',
        categorySlug: 'werbetechnik',
        productSlug: 'konfigurator-3d-buchstaben',
        detail: konfigDetail(cfg).slice(0, 220),
        konfig: cfg,
        qty,
        unitPrice: p.total,
        lineTotal: round2(p.total * qty),
        ...meta,
      });
      continue;
    }

    const found = findProduct(item.categorySlug, item.productSlug);
    if (!found) return Response.json({ error: `Unbekanntes Produkt: ${item.productSlug}` }, { status: 400 });
    const { product } = found;

    let unitPrice = null;
    let detail = String(item.detail || '').slice(0, 200);

    if (Array.isArray(product.variants)) {
      const variant = product.variants.find((v) => v.label === item.detail);
      if (!variant) return Response.json({ error: `Unbekannte Variante bei ${product.name}` }, { status: 400 });
      unitPrice = variant.price;
    } else if (product.m2 && item.m2) {
      const w = Math.max(1, Math.min(2000, Number(item.m2.widthCm) || 0));
      const h = Math.max(1, Math.min(2000, Number(item.m2.heightCm) || 0));
      if (product.m2.maxH && h > product.m2.maxH) {
        return Response.json({ error: `${product.name}: max. ${product.m2.maxH} cm Höhe.` }, { status: 400 });
      }
      unitPrice = round2((w / 100) * (h / 100) * product.m2.rate);
      detail = `${w} × ${h} cm`;
    } else {
      return Response.json({ error: `${product.name} ist nur auf Anfrage erhältlich.` }, { status: 400 });
    }

    recalc.push({ name: product.name, categorySlug: item.categorySlug, productSlug: item.productSlug, detail, qty, unitPrice, lineTotal: round2(unitPrice * qty), ...meta });
  }

  // Datencheck als eigene Position (je markierter Position einmal)
  if (datencheckCount > 0) {
    recalc.push({
      name: 'Datencheck — professionelle Überprüfung der Druckdaten',
      categorySlug: 'service',
      productSlug: 'datencheck',
      detail: `${datencheckCount} Position(en)`,
      qty: datencheckCount,
      unitPrice: DATENCHECK_PRICE,
      lineTotal: round2(datencheckCount * DATENCHECK_PRICE),
    });
  }

  const rate = await resellerRate(resellerEmail);
  const codeRaw = discountCode ? String(discountCode).trim().toUpperCase() : null;
  const code = codeRaw && DISCOUNT_CODES[codeRaw] ? codeRaw : null;
  // Sonderrabatt validieren: { kind: 'percent'|'fixed', value > 0 }, Prozent max. 100
  let sonderDef = null;
  if (sonder && (sonder.kind === 'percent' || sonder.kind === 'fixed')) {
    const v = Number(sonder.value);
    if (isFinite(v) && v > 0 && (sonder.kind !== 'percent' || v <= 100)) {
      sonderDef = { kind: sonder.kind, value: Math.round(v * 100) / 100 };
    }
  }

  const subtotal = round2(recalc.reduce((s, i) => s + i.lineTotal, 0));
  const discount = round2(subtotal * (rate / 100));
  const codeDiscount = code ? codeDiscountAmount(subtotal - discount, code) : 0;
  const sonderDiscount = sonderDef ? sonderDiscountAmount(subtotal - discount - codeDiscount, sonderDef) : 0;
  const afterDiscount = round2(subtotal - discount - codeDiscount - sonderDiscount);
  const shipping = afterDiscount >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
  const vat = round2((afterDiscount + shipping) * VAT_RATE);
  const total = round2(afterDiscount + shipping + vat);

  const orderNo = 'KH-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();

  // Geteilte Supabase-DB (restaurantspezial-Projekt): kutuharf-Bestellungen leben in
  // kutuharf_orders — NIE in der orders-Tabelle von restaurantspezial.
  const insert = await fetch(`${process.env.SUPABASE_URL}/rest/v1/kutuharf_orders`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      order_no: orderNo,
      name: String(name).trim().slice(0, 120),
      firma: firma ? String(firma).trim().slice(0, 160) : null,
      email: String(email).trim().slice(0, 200),
      telefon: telefon ? String(telefon).trim().slice(0, 60) : null,
      strasse: String(strasse).trim().slice(0, 200),
      plz: String(plz).trim().slice(0, 10),
      ort: String(ort).trim().slice(0, 120),
      items: recalc,
      subtotal,
      discount_rate: rate,
      discount_amount: discount,
      discount_code: code,
      code_discount: codeDiscount,
      sonder_discount: sonderDiscount,
      sonder_note: sonderDef ? sonderLabel(sonderDef) : null,
      logo_url: safeLogoUrl,
      shipping_cost: shipping,
      vat_amount: vat,
      total,
      payment_method: 'vorkasse',
      is_reseller: rate > 0,
      reseller_email: rate > 0 ? resellerEmail : null,
      notes: notes ? String(notes).slice(0, 2000) : null,
    }),
  });

  if (!insert.ok) {
    console.error('Order insert failed:', insert.status, await insert.text());
    return Response.json({ error: 'Bestellung konnte nicht gespeichert werden. Bitte rufen Sie uns an.' }, { status: 500 });
  }

  const lines = recalc
    .map((i) => {
      let l = `- ${i.name} (${i.detail}) × ${i.qty} = ${fmt(i.lineTotal)}`;
      if (i.fileUrl) l += `\n  Datei: ${i.fileUrl}`;
      if (i.konfig?.logoUrl) l += `\n  Logo-Datei: ${i.konfig.logoUrl}`;
      if (i.note) l += `\n  Bemerkung: ${i.note}`;
      if (i.datencheck) l += `\n  ✓ Datencheck gebucht`;
      return l;
    })
    .join('\n');
  const summary = [
    `Bestellnummer: ${orderNo}`,
    '',
    lines,
    '',
    `Zwischensumme (netto): ${fmt(subtotal)}`,
    rate > 0 ? `Händlerrabatt (${rate}%): −${fmt(discount)}` : null,
    codeDiscount > 0 ? `Rabattcode ${code} (${discountLabel(code)}): −${fmt(codeDiscount)}` : null,
    sonderDiscount > 0 ? `Sonderrabatt (${sonderLabel(sonderDef)}): −${fmt(sonderDiscount)}` : null,
    `Versand: ${shipping === 0 ? 'kostenlos' : fmt(shipping)}`,
    `MwSt. 19%: ${fmt(vat)}`,
    `Gesamt: ${fmt(total)}`,
    '',
    'Zahlung: Vorkasse / Überweisung — Bankverbindung folgt mit der Auftragsbestätigung.',
  ].filter(Boolean).join('\n');

  if (process.env.RESEND_API_KEY) {
    const send = (payload) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(async (r) => { if (!r.ok) console.error('Resend failed:', r.status, await r.text()); }).catch((e) => console.error('Resend error:', e));

    await Promise.all([
      send({
        from: 'KUTUHARF <info@kittelwerk.de>',
        to: ['info@kutuharf.eu'],
        reply_to: email,
        subject: `Neue Bestellung ${orderNo}${rate > 0 ? ' (Händler)' : ''} — ${name}`,
        text: `Kunde: ${name}${firma ? ' / ' + firma : ''}\nE-Mail: ${email}\nTelefon: ${telefon || '—'}\nAdresse: ${strasse}, ${plz} ${ort}\n${notes ? 'Anmerkung: ' + notes + '\n' : ''}${safeLogoUrl ? 'Logo/Druckdaten: ' + safeLogoUrl + '\n' : ''}\n${summary}`,
      }),
      send({
        from: 'KUTUHARF <info@kittelwerk.de>',
        to: [email],
        reply_to: 'info@kutuharf.eu',
        subject: `Ihre Bestellung ${orderNo} bei KUTUHARF`,
        text: `Guten Tag ${name},\n\nvielen Dank für Ihre Bestellung! Wir prüfen Ihre Angaben und melden uns kurzfristig mit der Auftragsbestätigung und den Zahlungsdetails.\n\n${summary}\n\nMit freundlichen Grüßen\nKUTUHARF · Mil Werbung Marketing\n+49 174 962 33 44 · info@kutuharf.eu`,
      }),
    ]);
  }

  return Response.json({ ok: true, orderNo });
}
