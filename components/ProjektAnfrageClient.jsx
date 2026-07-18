'use client';
// Projekt-Anfrage — Buchstaben mit Grundplatte/Profil. Der Konfigurator legt die
// Konfiguration unter sessionStorage['kh-projekt'] ab; hier wird sie angezeigt,
// um Plattenmaße/Details ergänzt und über /api/anfrage als Anfrage gespeichert.
import { useEffect, useState } from 'react';
import { useT } from '@/components/LocaleProvider';
import { Send, Check, Info } from 'lucide-react';

const inputCls = 'border border-inputline px-3 py-2.5 text-[14px] w-full focus:outline-none focus:border-accent bg-white';

export default function ProjektAnfrageClient() {
  const t = useT();
  const [cfg, setCfg] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', telefon: '', platteW: '', platteH: '', nachricht: '' });
  const [state, setState] = useState('idle'); // idle | busy | ok | err

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('kh-projekt');
      if (raw) setCfg(JSON.parse(raw));
    } catch { /* leer starten */ }
  }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    if (state === 'busy') return;
    setState('busy');
    const traegerLabel = cfg?.traeger ? t(`konfig3.traeger.${cfg.traeger}`) : '';
    const lines = [
      cfg?.detail ? `${t('konfig3.projConfig')}: ${cfg.detail}` : null,
      traegerLabel ? `${t('konfig3.traegerQ')} ${traegerLabel}` : null,
      form.platteW || form.platteH ? `${t('konfig3.projPlatteW')}: ${form.platteW || '—'} · ${t('konfig3.projPlatteH')}: ${form.platteH || '—'}` : null,
      cfg?.richtwert ? `${t('konfig3.projRichtwert')}: ${Number(cfg.richtwert).toFixed(2)} €` : null,
      form.nachricht || null,
    ].filter(Boolean);
    try {
      const res = await fetch('/api/anfrage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          telefon: form.telefon,
          kategorie: 'projekt',
          produkt: `3D-Buchstaben + ${cfg?.traeger === 'profil' ? 'Profilkonstruktion' : 'Grundplatte'}`,
          nachricht: lines.join('\n'),
        }),
      });
      setState(res.ok ? 'ok' : 'err');
      if (res.ok) sessionStorage.removeItem('kh-projekt');
    } catch {
      setState('err');
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-5">
      <h1 className="m-0 text-2xl font-extrabold">{t('konfig3.projTitle')}</h1>
      <p className="m-0 text-[14px] text-textsec leading-relaxed">{t('konfig3.projIntro')}</p>

      {cfg?.detail && (
        <div className="bg-sectionlight border border-linegray px-4 py-3 text-[13px] flex flex-col gap-1.5">
          <strong>{t('konfig3.projConfig')}</strong>
          <span className="text-textsec leading-relaxed">{cfg.detail}</span>
          <span className="text-textsec">{t(`konfig3.traeger.${cfg.traeger}`, null, '')}</span>
          {cfg.richtwert ? <span className="text-textmut">{t('konfig3.projRichtwert')}: {Number(cfg.richtwert).toFixed(2).replace('.', ',')} €</span> : null}
        </div>
      )}

      {state === 'ok' ? (
        <div className="flex items-start gap-2.5 bg-[#eaf6ee] text-[#1c7a45] border border-[#1c7a45]/30 px-4 py-3.5 text-[14px]">
          <Check size={18} className="flex-shrink-0 mt-0.5" /> {t('konfig3.projOk')}
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3.5">
          {cfg?.traeger !== 'profil' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-textsec">{t('konfig3.projPlatteW')}
                <input type="number" min={1} className={inputCls} value={form.platteW} onChange={(e) => set({ platteW: e.target.value })} /></label>
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-textsec">{t('konfig3.projPlatteH')}
                <input type="number" min={1} className={inputCls} value={form.platteH} onChange={(e) => set({ platteH: e.target.value })} /></label>
            </div>
          )}
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-textsec">{t('konfig3.projMsg')}
            <textarea rows={4} className={inputCls} value={form.nachricht} onChange={(e) => set({ nachricht: e.target.value })} placeholder={!cfg?.detail ? t('konfig3.projConfigPh') : undefined} /></label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-textsec">{t('konfig3.projName')}
              <input required className={inputCls} value={form.name} onChange={(e) => set({ name: e.target.value })} /></label>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-textsec">{t('konfig3.projEmail')}
              <input required type="email" className={inputCls} value={form.email} onChange={(e) => set({ email: e.target.value })} /></label>
          </div>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-textsec">{t('konfig3.projTel')}
            <input className={inputCls} value={form.telefon} onChange={(e) => set({ telefon: e.target.value })} /></label>
          {state === 'err' && (
            <p className="m-0 flex items-start gap-2 text-[13px] text-warnred"><Info size={15} className="flex-shrink-0 mt-0.5" /> {t('konfig3.projErr')}</p>
          )}
          <button type="submit" disabled={state === 'busy'} className="flex items-center justify-center gap-2 text-[15px] font-semibold px-5 py-3.5 bg-accent text-white hover:brightness-90 cursor-pointer disabled:opacity-40">
            <Send size={16} /> {state === 'busy' ? t('konfig3.projSending') : t('konfig3.projSend')}
          </button>
        </form>
      )}
    </main>
  );
}
