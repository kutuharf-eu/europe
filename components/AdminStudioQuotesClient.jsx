'use client';
// KUTUHARF — Admin: stüdyo teklif talepleri. AdminHaendlerClient ile aynı giriş
// deseni (sessionStorage 'kh-admin-key' + x-admin-key başlığı).
import { useState, useEffect } from 'react';
import PasswordInput from '@/components/PasswordInput';

const inputCls = 'p-3 text-base border border-inputline bg-white text-charcoal w-full';

const STATUS_LABEL = { neu: 'Yeni', gesehen: 'Görüldü', beantwortet: 'Cevaplandı', erledigt: 'Tamamlandı' };
const STATUS_CLS = {
  neu: 'bg-amber-100 text-amber-800',
  gesehen: 'bg-blue-100 text-blue-800',
  beantwortet: 'bg-green-100 text-green-800',
  erledigt: 'bg-gray-200 text-gray-700',
};

const eur = (v) =>
  typeof v === 'number'
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v)
    : '—';

const dt = (s) => (s ? new Date(s).toLocaleString('de-DE') : '—');

export default function AdminStudioQuotesClient() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async (k) => {
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/admin/studio-quotes', { headers: { 'x-admin-key': k } });
      if (res.status === 401) { setMsg('Anahtar yanlış.'); setAuthed(false); return; }
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || 'Yükleme hatası.'); return; }
      setRows(data.quotes || []);
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

  const setStatus = async (id, status) => {
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/admin/studio-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || 'İşlem hatası.'); return; }
      await load(key);
    } catch { setMsg('Bağlantı hatası.'); }
    finally { setBusy(false); }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-sectionlight p-6">
        <div className="mx-auto max-w-sm bg-white p-6 shadow">
          <h1 className="mb-4 text-xl font-bold text-charcoal">Stüdyo Teklifleri — Giriş</h1>
          <PasswordInput
            className={inputCls}
            placeholder="Admin anahtarı"
            showLabel="Anahtarı göster"
            hideLabel="Anahtarı gizle"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(key)}
          />
          <button
            className="mt-3 w-full bg-accent px-4 py-3 font-bold text-white disabled:opacity-50"
            disabled={busy || !key}
            onClick={() => load(key)}
          >
            Giriş
          </button>
          {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sectionlight p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-charcoal">
            Stüdyo Teklif Talepleri <span className="text-base font-normal text-gray-500">({rows.length})</span>
          </h1>
          <button className="border border-inputline px-3 py-2 text-sm" disabled={busy} onClick={() => load(key)}>
            Yenile
          </button>
        </div>

        {msg && <p className="mb-4 text-sm text-red-600">{msg}</p>}
        {!rows.length && <p className="text-gray-600">Henüz teklif talebi yok.</p>}

        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="flex gap-4 bg-white p-4 shadow max-sm:flex-col">
              {r.design?.preview_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <a href={r.design.preview_url} target="_blank" rel="noreferrer" className="shrink-0">
                  <img
                    src={r.design.preview_url}
                    alt="Entwurf"
                    className="h-[90px] w-[160px] border border-inputline bg-gray-100 object-contain"
                  />
                </a>
              ) : (
                <div className="flex h-[90px] w-[160px] shrink-0 items-center justify-center border border-inputline bg-gray-50 text-xs text-gray-400">
                  Önizleme yok
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <strong className="text-charcoal">{r.name}</strong>
                  {r.firma && <span className="text-sm text-gray-600">· {r.firma}</span>}
                  <span className={`px-2 py-0.5 text-xs font-semibold ${STATUS_CLS[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">{dt(r.created_at)}</span>
                </div>

                <div className="mt-1 text-sm text-gray-700">
                  <a className="underline" href={`mailto:${r.email}`}>{r.email}</a>
                  {r.telefon && <> · <a className="underline" href={`tel:${r.telefon}`}>{r.telefon}</a></>}
                </div>

                <div className="mt-1 text-sm">
                  Hesaplanan fiyat (net): <strong>{eur(r.price_total ?? r.design?.price_total)}</strong>
                  <span className="ml-2 text-xs text-gray-500">— zemin ve montaj hariç</span>
                </div>

                {r.nachricht && (
                  <p className="mt-2 whitespace-pre-wrap border-l-2 border-inputline pl-3 text-sm text-gray-700">
                    {r.nachricht}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.keys(STATUS_LABEL).map((s) => (
                    <button
                      key={s}
                      disabled={busy || r.status === s}
                      onClick={() => setStatus(r.id, s)}
                      className="border border-inputline px-2.5 py-1 text-xs disabled:opacity-40"
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
