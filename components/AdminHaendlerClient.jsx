'use client';
// KUTUHARF — Admin Händler yönetimi. AdminFiyatClient ile aynı giriş deseni
// (sessionStorage 'kh-admin-key' + x-admin-key başlığı). Bekleyen başvuruları
// onayla (kademe ata: çok/az) / reddet; onaylı Händler'in kademesini değiştir.
import { useState, useEffect } from 'react';

const inputCls = 'p-3 text-base border border-inputline bg-white text-charcoal w-full';

const STATUS_LABEL = { pending: 'Bekliyor', approved: 'Onaylı', rejected: 'Reddedildi' };
const STATUS_CLS = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
};
const TIER_LABEL = { cok: 'Çok satan (haendler_cok)', az: 'Az satan (haendler_az)' };

export default function AdminHaendlerClient() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async (k) => {
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/admin/haendler', { headers: { 'x-admin-key': k } });
      if (res.status === 401) { setMsg('Anahtar yanlış.'); setAuthed(false); return; }
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || 'Yükleme hatası.'); return; }
      setRows(data.haendler || []);
      setAuthed(true);
      sessionStorage.setItem('kh-admin-key', k);
    } catch { setMsg('Bağlantı hatası.'); }
    finally { setBusy(false); }
  };

  useEffect(() => {
    const k = sessionStorage.getItem('kh-admin-key');
    if (k) { setKey(k); load(k); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const act = async (id, action, tier) => {
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/admin/haendler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify({ id, action, tier }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || 'İşlem hatası.'); return; }
      await load(key);
    } catch { setMsg('Bağlantı hatası.'); }
    finally { setBusy(false); }
  };

  if (!authed) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 flex flex-col gap-4">
        <h1 className="text-xl font-extrabold m-0">Händler Yönetimi — Giriş</h1>
        <input type="password" className={inputCls} placeholder="Admin anahtarı" value={key}
          onChange={(e) => setKey(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(key)} />
        <button onClick={() => load(key)} disabled={busy || !key}
          className="bg-accent text-white font-semibold px-5 py-2.5 cursor-pointer disabled:opacity-40">Giriş</button>
        {msg && <p className="text-red-600 text-[13px] m-0">{msg}</p>}
      </main>
    );
  }

  const pending = rows.filter((r) => r.status === 'pending');
  const others = rows.filter((r) => r.status !== 'pending');

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
      <header className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-extrabold m-0">Händler Yönetimi
          <span className="text-textmut text-sm font-normal"> · {rows.length} kayıt</span>
        </h1>
        <button onClick={() => load(key)} disabled={busy} className="text-sm font-bold text-accent cursor-pointer">↻ Yenile</button>
      </header>
      {msg && <p className="text-red-600 text-sm m-0">{msg}</p>}

      <Section title={`Bekleyen başvurular (${pending.length})`} empty="Bekleyen başvuru yok.">
        {pending.map((r) => (
          <Card key={r.id} r={r}>
            <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={() => act(r.id, 'approve', 'cok')} disabled={busy}
                className="bg-green-700 text-white text-sm font-bold px-3 py-2 cursor-pointer disabled:opacity-40">Onayla · Çok satan</button>
              <button onClick={() => act(r.id, 'approve', 'az')} disabled={busy}
                className="bg-green-600 text-white text-sm font-bold px-3 py-2 cursor-pointer disabled:opacity-40">Onayla · Az satan</button>
              <button onClick={() => act(r.id, 'reject')} disabled={busy}
                className="bg-white border border-red-400 text-red-700 text-sm font-bold px-3 py-2 cursor-pointer disabled:opacity-40">Reddet</button>
            </div>
          </Card>
        ))}
      </Section>

      <Section title={`Diğer Händler (${others.length})`} empty="Kayıt yok.">
        {others.map((r) => (
          <Card key={r.id} r={r}>
            {r.status === 'approved' && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-xs text-textmut">Kademe:</span>
                {['cok', 'az'].map((tk) => (
                  <button key={tk} onClick={() => act(r.id, 'set_tier', tk)} disabled={busy || r.haendler_tier === tk}
                    className={`text-sm font-bold px-3 py-1.5 cursor-pointer disabled:opacity-100 ${r.haendler_tier === tk ? 'bg-accent text-white' : 'bg-white border border-inputline text-textsec hover:border-accent'}`}>
                    {tk === 'cok' ? 'Çok satan' : 'Az satan'}
                  </button>
                ))}
                <button onClick={() => act(r.id, 'reject')} disabled={busy}
                  className="ml-auto text-sm font-bold text-red-600 cursor-pointer">Erişimi kapat</button>
              </div>
            )}
          </Card>
        ))}
      </Section>
    </main>
  );
}

function Section({ title, empty, children }) {
  const arr = Array.isArray(children) ? children : [children];
  const has = arr.some(Boolean);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-textmut m-0">{title}</h2>
      {has ? children : <p className="text-sm text-textmut m-0">{empty}</p>}
    </section>
  );
}

function Card({ r, children }) {
  return (
    <div className="border border-inputline bg-white p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-bold text-charcoal m-0">{r.firma || '—'}</p>
          <p className="text-sm text-textsec m-0">{r.email || '—'} · {r.telefon || '—'}</p>
          <p className="text-xs text-textmut m-0 mt-0.5">USt-IdNr: {r.ust_id || '—'}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-bold px-2 py-1 ${STATUS_CLS[r.status] || ''}`}>{STATUS_LABEL[r.status] || r.status}</span>
          {r.haendler_tier && <span className="text-[11px] text-textmut">{TIER_LABEL[r.haendler_tier]}</span>}
        </div>
      </div>
      {children}
    </div>
  );
}
