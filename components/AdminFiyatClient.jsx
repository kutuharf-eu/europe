'use client';
// KUTUHARF Admin — Fiyat Yönetimi (Aşama 1 / üretici-malzeme fiyat girişi).
// Anahtar sessionStorage'da tutulur, her istek x-admin-key başlığıyla gider.
// Değişken tipleri: price = { amount, currency } | null · number = sayı | null · json = serbest JSON.
// null = TANIMSIZ → kırmızı; motor o kombinasyonda legacy fiyata düşer, asla yanlış hesaplamaz.
// Tüm metinler i18n (useT · admin.* / konfig3.*) — panel DE/TR/EN, kombinasyon etiketleri
// müşteri konfigüratörüyle BİREBİR aynı (aynı çeviri anahtarları + buildCfg türetimi).
import { useEffect, useState } from 'react';
import { useT, useLocale } from '@/components/LocaleProvider';
import { LOCALES, LOCALE_LABELS } from '@/data/i18n';
import { KONFIG_FONTS } from '@/data/konfigurator';
import { buildCfg, TABELLE_TYPES, LIGHT_DIRS, SIDE_MAT_FRONT, UNBEL_MAT } from '@/data/konfigurator3';

// [key, i18n-labelKey (admin.*), type]
const VAR_GROUPS = [
  { g: 'grpKur', keys: [['eurTry', 'vEurTry', 'number'], ['usdTry', 'vUsdTry', 'number']] },
  { g: 'grpMatM2', keys: [
    ['kromM2', 'vKromM2', 'price'], ['pleksi3mmM2', 'vPleksi3', 'price'], ['pleksi5mmM2', 'vPleksi5', 'price'],
    ['dekotaM2', 'vDekota', 'price'], ['rakiBeyazi8mmM2', 'vRaki', 'price'], ['uvBaskiM2', 'vUv', 'price'],
    ['aluFaceM2', 'vAluFace', 'price'],
  ] },
  { g: 'grpMatMt', keys: [['aluYanBantMt', 'vAluYanBant', 'price'], ['yanBantDerinlikFarkiYuzde', 'vYanBantFark', 'number']] },
  { g: 'grpLed', keys: [
    ['ledStandart', 'vLedStd', 'price'], ['ledSamsung', 'vLedSamsung', 'price'], ['ledYogunlugu', 'vLedDichte', 'number'],
    ['wattPerModul', 'vWattModul', 'number'], ['trafoFiyat', 'vTrafo', 'json'], ['kabloPerHarf', 'vKablo', 'price'],
  ] },
  { g: 'grpConsum', keys: [
    ['vida', 'vVida', 'price'], ['vidaKurali', 'vVidaKural', 'json'], ['haloAyak', 'vHaloAyak', 'price'], ['yapistiriciPerHarf', 'vYapistirici', 'price'],
  ] },
  { g: 'grpPaint', keys: [['kromBoyamaKucuk', 'vKromBoyamaK', 'price'], ['kromBoyamaBuyuk', 'vKromBoyamaB', 'price']] },
  { g: 'grpMontage', keys: [['montajSablonFiyat', 'vMontajSablon', 'price']] },
  { g: 'grpGeneral', keys: [
    ['iscilikPerHarf', 'vIscilik', 'price'], ['fireYuzde', 'vFire', 'number'], ['riskYuzde', 'vRisk', 'number'],
    ['ambalajTaban', 'vAmbalaj', 'price'], ['minSiparis', 'vMinSiparis', 'price'], ['kdv', 'vKdv', 'number'],
  ] },
];

const LIGHTS = ['none', 'halo', 'front', 'front_seite', 'seite'];
const CONSTRUCTIONS = ['alu_plexi', 'voll_plexi', 'chrom_plexi', 'chrom_halo'];
const inputCls = 'border border-inputline px-2.5 py-1.5 text-[13px] w-full focus:outline-none focus:border-accent bg-white';

function LangSwitch() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex gap-1">
      {LOCALES.map((l) => (
        <button key={l} onClick={() => setLocale(l)}
          className={`px-2 py-1 text-[12px] font-bold border cursor-pointer ${locale === l ? 'border-accent text-accent' : 'border-inputline text-textmut hover:border-accent'}`}>
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}

function PriceEditor({ value, onChange }) {
  const t = useT();
  const amount = value && typeof value === 'object' ? value.amount : '';
  const currency = (value && typeof value === 'object' && value.currency) || 'TRY';
  const emit = (a, c) => onChange(a === '' || a === null ? null : { amount: Number(a), currency: c });
  return (
    <span className="flex gap-1.5 items-center">
      <input type="number" step="any" className={inputCls + ' w-[110px]'} value={amount ?? ''} placeholder={t('admin.undefinedPh')}
        onChange={(e) => emit(e.target.value, currency)} />
      <select className={inputCls + ' w-[70px]'} value={currency} onChange={(e) => emit(amount, e.target.value)}>
        <option>TRY</option><option>USD</option><option>EUR</option>
      </select>
    </span>
  );
}

function NumberEditor({ value, onChange }) {
  const t = useT();
  return (
    <input type="number" step="any" className={inputCls + ' w-[110px]'} value={value ?? ''} placeholder={t('admin.undefinedPh')}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />
  );
}

function JsonEditor({ value, onChange }) {
  const [text, setText] = useState(JSON.stringify(value ?? null));
  const [bad, setBad] = useState(false);
  useEffect(() => { setText(JSON.stringify(value ?? null)); setBad(false); }, [value]);
  return (
    <input className={`${inputCls} font-mono text-[12px] ${bad ? 'border-warnred' : ''}`} value={text}
      onChange={(e) => {
        setText(e.target.value);
        try { onChange(JSON.parse(e.target.value)); setBad(false); } catch { setBad(true); }
      }} />
  );
}

export default function AdminFiyatClient() {
  const t = useT();
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [vars, setVars] = useState({});
  const [extras, setExtras] = useState([]);
  const [dirty, setDirty] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);

  const load = async (k) => {
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/admin/pricing', { headers: { 'x-admin-key': k } });
      if (res.status === 401) { setMsg(t('admin.keyWrong')); setOk(false); setAuthed(false); return; }
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || t('admin.loadErr')); setOk(false); return; }
      setVars(Object.fromEntries(data.vars.map((r) => [r.key, r.value])));
      setExtras(data.extras);
      setAuthed(true);
      sessionStorage.setItem('kh-admin-key', k);
    } catch { setMsg(t('admin.connErr')); setOk(false); }
    finally { setBusy(false); }
  };

  useEffect(() => {
    const k = sessionStorage.getItem('kh-admin-key');
    if (k) { setKey(k); load(k); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setVar = (k, v) => { setVars((s) => ({ ...s, [k]: v })); setDirty((d) => ({ ...d, [k]: v })); };

  const save = async (extraRows) => {
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify({ vars: dirty, extras: extraRows || [] }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || t('admin.saveErr')); setOk(false); return; }
      setDirty({});
      setMsg(t('admin.saved')); setOk(true);
      await load(key);
    } catch { setMsg(t('admin.connErr')); setOk(false); }
    finally { setBusy(false); }
  };

  const missing = VAR_GROUPS.flatMap((g) => g.keys).filter(([k]) => vars[k] === null || vars[k] === undefined).map(([, lk]) => t('admin.' + lk));

  if (!authed) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-extrabold m-0">{t('admin.loginTitle')}</h1>
          <LangSwitch />
        </div>
        <input type="password" className={inputCls} placeholder={t('admin.keyPlaceholder')} value={key} onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(key)} />
        <button onClick={() => load(key)} disabled={busy || !key} className="bg-accent text-white font-semibold px-5 py-2.5 cursor-pointer disabled:opacity-40">{t('admin.loginBtn')}</button>
        {msg && <p className="text-warnred text-[13px] m-0">{msg}</p>}
      </main>
    );
  }

  const dirtyN = Object.keys(dirty).length;
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-7">
      <header className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-extrabold m-0">{t('admin.title')} <span className="text-textmut text-sm font-normal">{t('admin.subtitle')}</span></h1>
        <div className="flex items-center gap-3">
          <LangSwitch />
          <button onClick={() => save()} disabled={busy || !dirtyN}
            className="bg-accent text-white font-semibold px-6 py-2.5 cursor-pointer disabled:opacity-40">
            {busy ? t('admin.saving') : `${t('admin.save')}${dirtyN ? ` (${dirtyN})` : ''}`}
          </button>
        </div>
      </header>
      {msg && <p className={`m-0 text-[13px] font-semibold ${ok ? 'text-[#1c7a45]' : 'text-warnred'}`}>{msg}</p>}
      {missing.length > 0 && (
        <div className="border border-warnred/50 bg-[#fdeceb] px-4 py-3 text-[13px] text-warnred">
          <strong>{t('admin.missingTitle', { n: missing.length })}</strong> {missing.join(', ')} {t('admin.missingSuffix')}
        </div>
      )}

      <MarginPreviewSection marj={vars.marj} onMarjChange={(v) => setVar('marj', v)} adminKey={key} />

      {VAR_GROUPS.map((g) => (
        <section key={g.g} className="flex flex-col gap-2">
          <h2 className="text-[15px] font-extrabold m-0 border-b border-linegray pb-1.5">{t('admin.' + g.g)}</h2>
          <table className="w-full text-[13px] border-collapse">
            <tbody>
              {g.keys.map(([k, lk, type]) => (
                <tr key={k} className={vars[k] === null || vars[k] === undefined ? 'bg-[#fdeceb]' : ''}>
                  <td className="py-1.5 pr-3 align-middle w-[55%]">
                    {t('admin.' + lk)} <code className="text-[11px] text-textmut">{k}</code>
                    {(vars[k] === null || vars[k] === undefined) && <span className="text-warnred font-bold ml-1">{t('admin.undefinedTag')}</span>}
                  </td>
                  <td className="py-1.5">
                    {type === 'price' && <PriceEditor value={vars[k]} onChange={(v) => setVar(k, v)} />}
                    {type === 'number' && <NumberEditor value={vars[k]} onChange={(v) => setVar(k, v)} />}
                    {type === 'json' && <JsonEditor value={vars[k]} onChange={(v) => setVar(k, v)} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <ExtrasSection extras={extras} onSave={(rows) => save(rows)} busy={busy} />
      <p className="text-[12px] text-textmut m-0">{t('admin.extrasNote')}</p>

      <MetrajSection />
    </main>
  );
}

// ── Harf Bazlı Metraj — Katsayı Tablosu ───────────────────────────────────────
const COEFF_FONTS = [
  { id: 'anton', labelKey: 'refFontAnton' },
  { id: 'archivo', labelKey: 'refFontArchivo' },
  { id: 'oswald', labelKey: 'refFontOswald' },
];

function MetrajSection() {
  const t = useT();
  const [text, setText] = useState('DÖNER');
  const [hCm, setHCm] = useState(50);
  const [font, setFont] = useState('anton');
  const [coeffs, setCoeffs] = useState(null);

  useEffect(() => {
    let live = true;
    fetch(`/coefficients/${font}.json`)
      .then((r) => r.json())
      .then((d) => { if (live) setCoeffs(d); })
      .catch(() => { if (live) setCoeffs(null); });
    return () => { live = false; };
  }, [font]);

  const hm = (Number(hCm) || 0) / 100; // metre
  const rows = [];
  const missing = [];
  if (coeffs?.chars && hm > 0) {
    for (const ch of String(text)) {
      if (ch === ' ') continue;
      const k = coeffs.chars[ch];
      if (!k) { missing.push(ch); continue; }
      rows.push({
        ch,
        genCm: k.genislik * hm * 100,
        netAlan: k.alan * hm * hm,
        dikdAlan: k.genislik * hm * (k.yukseklik || 1) * hm,
        cevre: k.cevre * hm,
        cevreH: k.cevre,
      });
    }
  }
  const sum = (f) => rows.reduce((a, r) => a + f(r), 0);
  const fx = (n, d) => n.toFixed(d);

  const download = (filename, obj) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };
  const dlTablo = () => download(`metraj-${font}-${hCm}cm.json`, {
    font, yazi: text, yukseklikCm: Number(hCm),
    harfler: rows.map((r) => ({ harf: r.ch, genislikCm: +fx(r.genCm, 1), netAlanM2: +fx(r.netAlan, 4), dikdAlanM2: +fx(r.dikdAlan, 4), cevreMt: +fx(r.cevre, 3), cevrePerH: +fx(r.cevreH, 3) })),
    toplam: { netAlanM2: +fx(sum((r) => r.netAlan), 4), cevreMt: +fx(sum((r) => r.cevre), 3) },
  });
  const dlAlfabe = () => coeffs && download(`katsayilar-${font}.json`, coeffs);

  const th = 'text-left font-extrabold text-[11px] uppercase tracking-wide text-textmut py-2 border-b border-charcoal';
  const td = 'py-2 border-b border-linegray text-[13px] tabular-nums';

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[15px] font-extrabold m-0 border-b border-linegray pb-1.5">{t('admin.metrajTitle')}</h2>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-textsec">{t('admin.metrajText')}
          <input className={inputCls + ' w-[220px]'} value={text} onChange={(e) => setText(e.target.value)} /></label>
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-textsec">{t('admin.metrajHeight')}
          <input type="number" min={1} className={inputCls + ' w-[110px]'} value={hCm} onChange={(e) => setHCm(e.target.value)} /></label>
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-textsec">{t('admin.metrajFont')}
          <select className={inputCls + ' w-[210px]'} value={font} onChange={(e) => setFont(e.target.value)}>
            {COEFF_FONTS.map((f) => <option key={f.id} value={f.id}>{t('admin.' + f.labelKey)}</option>)}
          </select></label>
      </div>
      {missing.length > 0 && (
        <p className="m-0 text-[12px] text-warnred">{t('admin.metrajMissing')} {[...new Set(missing)].join(' ')}</p>
      )}
      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[560px]">
            <thead>
              <tr>
                <th className={th}>{t('admin.colLetter')}</th>
                <th className={th + ' text-right'}>{t('admin.colWidth')}</th>
                <th className={th + ' text-right'}>{t('admin.colNetArea')}</th>
                <th className={th + ' text-right'}>{t('admin.colRectArea')}</th>
                <th className={th + ' text-right'}>{t('admin.colPerimeter')}</th>
                <th className={th + ' text-right'}>{t('admin.colPerimeterH')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className={td + ' font-extrabold text-[15px]'}>{r.ch}</td>
                  <td className={td + ' text-right'}>{fx(r.genCm, 1)}</td>
                  <td className={td + ' text-right'}>{fx(r.netAlan, 3)}</td>
                  <td className={td + ' text-right'}>{fx(r.dikdAlan, 3)}</td>
                  <td className={td + ' text-right'}>{fx(r.cevre, 2)}</td>
                  <td className={td + ' text-right'}>{fx(r.cevreH, 2)}</td>
                </tr>
              ))}
              <tr>
                <td className={td + ' font-extrabold'}>{t('admin.sumLetters', { n: rows.length })}</td>
                <td className={td} />
                <td className={td + ' text-right font-extrabold'}>{fx(sum((r) => r.netAlan), 3)}</td>
                <td className={td + ' text-right font-extrabold'}>{fx(sum((r) => r.dikdAlan), 3)}</td>
                <td className={td + ' text-right font-extrabold'}>{fx(sum((r) => r.cevre), 2)}</td>
                <td className={td} />
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button onClick={dlTablo} disabled={!rows.length} className="text-[13px] font-semibold border border-inputline px-4 py-2 cursor-pointer hover:border-accent disabled:opacity-40">{t('admin.dlTable')}</button>
        <button onClick={dlAlfabe} disabled={!coeffs} className="text-[13px] font-semibold border border-inputline px-4 py-2 cursor-pointer hover:border-accent disabled:opacity-40">{t('admin.dlAlphabet')}</button>
      </div>
      <p className="m-0 text-[12px] text-textmut">{t('admin.metrajNote')}</p>
    </section>
  );
}

function ExtrasSection({ extras, onSave, busy }) {
  const t = useT();
  const [rows, setRows] = useState(extras);
  useEffect(() => setRows(extras), [extras]);
  const upd = (i, patch) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch, _dirty: true } : x)));
  const add = () => setRows((r) => [...r, { name: '', cost_type: 'per_order', amount: 0, currency: 'TRY', applies_lighting: [], applies_construction: [], active: true, _dirty: true }]);
  const dirtyRows = rows.filter((r) => r._dirty && (r.name || r._delete));
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between border-b border-linegray pb-1.5">
        <h2 className="text-[15px] font-extrabold m-0">{t('admin.extrasTitle')}</h2>
        <div className="flex gap-2">
          <button onClick={add} className="text-[13px] font-semibold border border-inputline px-3 py-1.5 cursor-pointer hover:border-accent">{t('admin.extrasAdd')}</button>
          <button onClick={() => onSave(dirtyRows.map(({ _dirty, ...r }) => r))} disabled={busy || !dirtyRows.length}
            className="text-[13px] font-semibold bg-charcoal text-white px-3 py-1.5 cursor-pointer disabled:opacity-40">{t('admin.extrasSave')}</button>
        </div>
      </div>
      {rows.length === 0 && <p className="text-[13px] text-textmut m-0">{t('admin.extrasEmpty')}</p>}
      {rows.map((e, i) => (
        <div key={e.id || `new-${i}`} className={`border border-linegray px-3 py-2.5 flex flex-col gap-2 ${e._delete ? 'opacity-40' : ''} ${e.active === false ? 'bg-sectionlight' : ''}`}>
          <div className="flex flex-wrap gap-2 items-center">
            <input className={inputCls + ' flex-1 min-w-[140px]'} placeholder={t('admin.extrasNamePh')} value={e.name} onChange={(ev) => upd(i, { name: ev.target.value })} />
            <select className={inputCls + ' w-[120px]'} value={e.cost_type} onChange={(ev) => upd(i, { cost_type: ev.target.value })}>
              <option value="per_letter">{t('admin.ctPerLetter')}</option>
              <option value="per_m2">{t('admin.ctPerM2')}</option>
              <option value="per_order">{t('admin.ctPerOrder')}</option>
              <option value="percent">{t('admin.ctPercent')}</option>
            </select>
            <input type="number" step="any" className={inputCls + ' w-[100px]'} value={e.amount} onChange={(ev) => upd(i, { amount: ev.target.value })} />
            {e.cost_type !== 'percent' && (
              <select className={inputCls + ' w-[70px]'} value={e.currency} onChange={(ev) => upd(i, { currency: ev.target.value })}>
                <option>TRY</option><option>USD</option><option>EUR</option>
              </select>
            )}
            <label className="flex items-center gap-1.5 text-[12px]"><input type="checkbox" checked={e.active !== false} onChange={(ev) => upd(i, { active: ev.target.checked })} /> {t('admin.activeLabel')}</label>
            {e.id && <button onClick={() => upd(i, { _delete: !e._delete })} className="text-[12px] text-warnred underline cursor-pointer bg-transparent border-0">{e._delete ? t('admin.undoBtn') : t('admin.delBtn')}</button>}
          </div>
          <div className="flex flex-wrap gap-3 text-[12px] text-textsec">
            <span className="flex items-center gap-1.5 flex-wrap">{t('admin.lightLabel')}
              {LIGHTS.map((l) => (
                <label key={l} className="flex items-center gap-1">
                  <input type="checkbox" checked={e.applies_lighting?.includes(l) || false}
                    onChange={(ev) => upd(i, { applies_lighting: ev.target.checked ? [...(e.applies_lighting || []), l] : (e.applies_lighting || []).filter((x) => x !== l) })} />
                  {l}
                </label>
              ))}
            </span>
            <span className="flex items-center gap-1.5 flex-wrap">{t('admin.consLabel')}
              {CONSTRUCTIONS.map((c) => (
                <label key={c} className="flex items-center gap-1">
                  <input type="checkbox" checked={e.applies_construction?.includes(c) || false}
                    onChange={(ev) => upd(i, { applies_construction: ev.target.checked ? [...(e.applies_construction || []), c] : (e.applies_construction || []).filter((x) => x !== c) })} />
                  {c}
                </label>
              ))}
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}

// ── Kâr Marjı + Üretim/Satış Karşılaştırma ────────────────────────────────────
// Örnek konfigürasyon MÜŞTERİ modeliyle (tip → ışık yönü / malzeme) seçilir ve
// buildCfg ile fiyat cfg'sine çevrilir → admin ve müşteri birebir aynı kombinasyon.
const MARJ_TIERS = [
  // Üretim = reine Produktionskosten (×1,00) — kein Eingabefeld, dient als Referenz.
  { id: 'uretim', labelKey: 'tierUretim', hintKey: 'hintUretim', fixed: true },
  { id: 'rekabetci', labelKey: 'tierRekabetci', hintKey: 'hintRekabetci' },
  // Händler kademeleri (B2B): onaylı satıcının kademesine göre otomatik uygulanır.
  { id: 'haendler_cok', labelKey: 'tierHaendlerCok', hintKey: 'hintHaendlerCok' },
  { id: 'haendler_az', labelKey: 'tierHaendlerAz', hintKey: 'hintHaendlerAz' },
  { id: 'standart', labelKey: 'tierStandart', hintKey: 'hintStandart' },
  { id: 'premium', labelKey: 'tierPremium', hintKey: 'hintPremium' },
];
const eurFmt = (n) => (typeof n === 'number' ? n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '—');
const tryFmt = (n) => (typeof n === 'number' ? Math.round(n).toLocaleString('de-DE') + ' ₺' : '—');
const REASON_KEY = { invalid: 'reasonInvalid', no_kur: 'reasonNoKur', legacy: 'reasonLegacy' };

function MarginPreviewSection({ marj, onMarjChange, adminKey }) {
  const t = useT();
  const m = marj && typeof marj === 'object' ? marj : {};
  const setTier = (id, v) => onMarjChange({ ...m, [id]: v === '' ? null : Number(v) });

  // Örnek konfigürasyon — Işıklı: ışık yönü + kenar malzemesi · Işıksız: malzeme (UNBEL_MAT).
  // Montaj seçimi yok: Profi-Montage yalnız "Teklif İste" (fiyatlanmaz), örnek hep 'selbst'.
  const [f, setF] = useState({
    text: 'DÖNER', heightCm: 50, lit: 'beleuchtet',
    lightDir: 'rueck', sideMaterial: 'aluminium', unbelMaterial: 'plexi',
    fontId: 'anton',
  });
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const upd = (patch) => { setF((s) => ({ ...s, ...patch })); setRes(null); };

  const run = async () => {
    setBusy(true); setErr('');
    try {
      // Müşteri seçimini fiyat cfg'sine çevir (buildCfg) → tam olarak müşterinin gönderdiği alanlar.
      const cfg = buildCfg({
        text: f.text, heightCm: Number(f.heightCm), lit: f.lit,
        lightDir: f.lightDir, sideMaterial: f.sideMaterial, unbelMaterial: f.unbelMaterial,
        fontId: f.fontId, montageId: 'selbst',
      });
      const body = {
        text: cfg.text, heightCm: cfg.heightCm, lightMode: cfg.lightMode,
        lightingId: cfg.lightingId, constructionId: cfg.constructionId, unbelMaterial: cfg.unbelMaterial,
        fontId: cfg.fontId, montageId: cfg.montageId, trafo: cfg.trafo, chromColor: cfg.chromColor, depth: cfg.depth,
      };
      const r = await fetch('/api/admin/pricing/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || t('admin.loadErr')); return; }
      if (!d.ok) { setErr(t('admin.' + (REASON_KEY[d.reason] || 'calcFailed'))); return; }
      setRes(d);
    } catch { setErr(t('admin.connErr')); }
    finally { setBusy(false); }
  };

  // Örnek fiyatlar OTOMATİK: giriş değişince (debounce) üretim maliyeti yeniden çekilir;
  // marj yüzdesi değişince kutu altındaki fiyatlar anında (istemci tarafında) güncellenir.
  const fKey = JSON.stringify(f);
  useEffect(() => {
    if (!adminKey) return;
    const tmr = setTimeout(run, 600);
    return () => clearTimeout(tmr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fKey, adminKey]);

  // Kutu altı örnek fiyat: Üretim = maliyet ×1,00; kademeler = maliyet × girilen çarpan
  // (kaydedilmemiş girişler de anında yansır).
  const costEUR = res?.ok ? res.cost.orderEUR : null;
  const tierPrice = (tier) => {
    if (costEUR == null) return null;
    if (tier.fixed) return costEUR;
    const mv = Number(m[tier.id]);
    return Number.isFinite(mv) && mv > 0 ? Math.round(costEUR * mv * 100) / 100 : null;
  };

  const th = 'text-left font-extrabold text-[11px] uppercase tracking-wide text-textmut py-2 border-b border-charcoal';
  const td = 'py-2 border-b border-linegray text-[13px] tabular-nums';

  return (
    <section className="flex flex-col gap-4 border border-accent/40 bg-accent/[0.04] px-4 py-4">
      <h2 className="text-[15px] font-extrabold m-0 border-b border-linegray pb-1.5">{t('admin.marginTitle')}</h2>

      {/* Marj kademeleri */}
      <div className="flex flex-col gap-2">
        <p className="m-0 text-[13px] text-textsec">{t('admin.marginIntro')}</p>
        <div className="flex flex-wrap gap-3 items-stretch">
          {MARJ_TIERS.map((tier) => {
            const val = m[tier.id];
            const pct = Number.isFinite(Number(val)) ? Math.round((Number(val) - 1) * 100) : null;
            const p = tierPrice(tier);
            return (
              <div key={tier.id} className="flex flex-col gap-1">
                <label className={`flex flex-col gap-1 border px-3 py-2 bg-white flex-1 ${tier.id === 'standart' ? 'border-accent' : 'border-inputline'}`}>
                  <span className="text-[12px] font-bold">{t('admin.' + tier.labelKey)} {tier.id === 'standart' && <span className="text-accent">{t('admin.active')}</span>}</span>
                  {tier.fixed ? (
                    <span className="flex items-center gap-1.5">
                      <span className="text-textmut text-[13px]">×</span>
                      <span className="text-[15px] font-bold w-[90px] inline-block py-1.5">1,00</span>
                      <span className="text-[12px] font-semibold text-textmut">%0</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span className="text-textmut text-[13px]">×</span>
                      <input type="number" step="0.05" min="1" className={inputCls + ' w-[90px]'} value={val ?? ''} placeholder={t('admin.undefinedPh')}
                        onChange={(e) => setTier(tier.id, e.target.value)} />
                      <span className={`text-[12px] font-semibold ${pct == null ? 'text-warnred' : 'text-[#1c7a45]'}`}>
                        {pct == null ? t('admin.undefinedPh') : `+%${pct}`}
                      </span>
                    </span>
                  )}
                  <span className="text-[11px] text-textmut">{t('admin.' + tier.hintKey)}</span>
                </label>
                {/* Örnek ürün fiyatı — kutunun hemen altında; yüzde değişince anında güncellenir */}
                <span className="text-[12px] font-semibold text-textsec px-1">
                  „{f.text}“ <strong className="text-charcoal tabular-nums">{p == null ? '—' : eurFmt(p)}</strong>
                </span>
              </div>
            );
          })}
        </div>
        <p className="m-0 text-[12px] text-textmut">{t('admin.marginSaveHint')}</p>
      </div>

      {/* Örnek konfigürasyon — iki grup: (1) yazı · font · yükseklik, (2) aydınlatma · ışık yönü · kenar malzemesi */}
      <div className="flex flex-col gap-3 border-t border-linegray pt-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-textmut">{t('admin.grpSampleBase')}</span>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-[12px] font-semibold text-textsec">{t('admin.sampleText')}
              <input className={inputCls + ' w-[150px]'} value={f.text} onChange={(e) => upd({ text: e.target.value })} /></label>
            <label className="flex flex-col gap-1 text-[12px] font-semibold text-textsec">{t('admin.sampleFont')}
              <select className={inputCls + ' w-[150px]'} value={f.fontId} onChange={(e) => upd({ fontId: e.target.value })}>
                {KONFIG_FONTS.filter((x) => !x.custom).map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
              </select></label>
            <label className="flex flex-col gap-1 text-[12px] font-semibold text-textsec">{t('admin.sampleHeight')}
              <input type="number" min={1} className={inputCls + ' w-[90px]'} value={f.heightCm} onChange={(e) => upd({ heightCm: e.target.value })} /></label>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-textmut">{t('admin.grpSampleLight')}</span>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-[12px] font-semibold text-textsec">{t('admin.sampleLighting')}
              <select className={inputCls + ' w-[150px]'} value={f.lit} onChange={(e) => upd({ lit: e.target.value })}>
                {TABELLE_TYPES.map((ty) => <option key={ty.id} value={ty.id}>{t(`konfig3.type.${ty.id}.l`, null, ty.label)}</option>)}
              </select></label>
            {/* Işıklı: ışık yönü + kenar malzemesi · Işıksız: malzeme listesi (müşterideki UNBEL_MAT:
                Akrilik / Boyalı krom / Paslanmaz-Krom / Strafor) — ışık yok, yön de yok. */}
            {f.lit === 'beleuchtet' ? (
              <>
                <label className="flex flex-col gap-1 text-[12px] font-semibold text-textsec">{t('admin.sampleLightDir')}
                  <select className={inputCls + ' w-[190px]'} value={f.lightDir} onChange={(e) => upd({ lightDir: e.target.value })}>
                    {LIGHT_DIRS.map((d) => <option key={d.id} value={d.id}>{t(`konfig3.lightDir.${d.id}.l`, null, d.label)}</option>)}
                  </select></label>
                <label className="flex flex-col gap-1 text-[12px] font-semibold text-textsec">{t('admin.sampleSideMat')}
                  <select className={inputCls + ' w-[190px]'} value={f.sideMaterial} onChange={(e) => upd({ sideMaterial: e.target.value })}>
                    {SIDE_MAT_FRONT.map((s) => <option key={s.id} value={s.id}>{t(`konfig3.sideMat.${s.id}`, null, s.label)}</option>)}
                  </select></label>
              </>
            ) : (
              <label className="flex flex-col gap-1 text-[12px] font-semibold text-textsec">{t('admin.sampleMaterial')}
                <select className={inputCls + ' w-[190px]'} value={f.unbelMaterial} onChange={(e) => upd({ unbelMaterial: e.target.value })}>
                  {UNBEL_MAT.map((mm) => <option key={mm.id} value={mm.id}>{t(`konfig3.unbelMat.${mm.id}.l`, null, mm.label)}</option>)}
                </select></label>
            )}
            <button onClick={run} disabled={busy || !adminKey} className="bg-accent text-white font-semibold px-5 py-2.5 cursor-pointer disabled:opacity-40 self-end">
              {busy ? t('admin.calculating') : t('admin.compareBtn')}
            </button>
          </div>
        </div>
      </div>

      {err && <p className="m-0 text-[13px] text-warnred font-semibold">{err}</p>}

      {res?.ok && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-textsec">
            <span>{t('admin.kur', { rate: res.kurlar.eurTry })}</span>
            <span>{t('admin.letterCount', { n: res.letters })}</span>
            <span>{t('admin.fireRisk', { fire: res.cost.fire?.toFixed?.(2), risk: res.cost.risk?.toFixed?.(2) })}</span>
          </div>

          {/* Üretim maliyeti kutusu */}
          <div className="border border-inputline bg-white px-4 py-3 flex flex-wrap items-baseline gap-x-8 gap-y-1">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-textmut font-bold">{t('admin.prodCost')}</div>
              <div className="text-[22px] font-extrabold">{eurFmt(res.cost.orderEUR)} <span className="text-[13px] font-normal text-textmut">≈ {tryFmt(res.cost.orderTRY)}</span></div>
            </div>
            <div className="text-[12px] text-textsec flex flex-wrap gap-x-4 gap-y-0.5">
              <span>{t('admin.cLetters')} {eurFmt(res.cost.breakdown.lettersCostEUR)}</span>
              {res.cost.breakdown.trafoCostEUR > 0 && <span>{t('admin.cTrafo')} {eurFmt(res.cost.breakdown.trafoCostEUR)}</span>}
              <span>{t('admin.cAmbalaj')} {eurFmt(res.cost.breakdown.ambalajCostEUR)}</span>
              {res.cost.breakdown.logoCostEUR > 0 && <span>{t('admin.cLogo')} {eurFmt(res.cost.breakdown.logoCostEUR)}</span>}
              {res.cost.breakdown.montageEUR > 0 && <span>{t('admin.cMontage')} {eurFmt(res.cost.breakdown.montageEUR)}</span>}
            </div>
          </div>

          {/* Kademe karşılaştırma tablosu */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[520px]">
              <thead>
                <tr>
                  <th className={th}>{t('admin.colTier')}</th>
                  <th className={th + ' text-right'}>{t('admin.colMarj')}</th>
                  <th className={th + ' text-right'}>{t('admin.colSale')}</th>
                  <th className={th + ' text-right'}>{t('admin.colProfit')}</th>
                  <th className={th + ' text-right'}>{t('admin.colMarginPct')}</th>
                </tr>
              </thead>
              <tbody>
                {MARJ_TIERS.map((tier) => {
                  const row = res.tiers[tier.id];
                  if (!row) return null;
                  const active = tier.id === res.activeTier;
                  return (
                    <tr key={tier.id} className={active ? 'bg-accent/10' : ''}>
                      <td className={td + ' font-bold'}>{t('admin.' + tier.labelKey)} {active && <span className="text-accent text-[11px]">{t('admin.activeBadge')}</span>}</td>
                      <td className={td + ' text-right'}>×{row.marj?.toFixed?.(2) ?? row.marj}</td>
                      <td className={td + ' text-right font-extrabold text-[15px]'}>{eurFmt(row.total)}</td>
                      <td className={td + ' text-right text-[#1c7a45] font-semibold'}>{eurFmt(row.profitEUR)}</td>
                      <td className={td + ' text-right font-semibold'}>{row.marginPct == null ? '—' : `%${Math.round(row.marginPct)}`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="m-0 text-[12px] text-textmut">
            {t('admin.previewNote')}{res.tiers[res.activeTier]?.minApplied && t('admin.minApplied')}
          </p>
        </div>
      )}
    </section>
  );
}
