'use client';
// Kutu-Harf-Modul v2 — Test-UI (Brief §7). AYRI TEST ORTAMI: canlı konfigüratöre
// (/ ana sayfa) dokunmaz; motoru /motor-test rotasında uçtan uca dener.
// view: 'internal' → kalem kalem maliyet dökümü + değişken paneli (Murat/iç kullanım)
//       'customer' → yalnız satış fiyatı + ana özellikler (maliyet DOM'a hiç girmez)
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Ruler, Type, Lightbulb, Settings2, Eye, EyeOff } from 'lucide-react';
import { PRODUCT_MODELS, FONT_OPTIONS, LED_TYPES, TRAFO_KADEMELER } from '@/config/products';
import { computeCost } from '@/lib/cost-engine';
import { computeSale } from '@/lib/pricing';
import { getPricingVariables } from '@/lib/pricing-vars';
import { calibrate } from '@/lib/calibrate';

const inputCls = 'p-2.5 text-[14px] border border-inputline bg-white text-charcoal w-full';
const tl = (v) => v.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + ' TL';
const tl2 = (v) => v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL';
const eur = (v) => v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
const f2 = (v) => v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Section({ icon: Icon, title, children }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 text-[16px] font-extrabold text-charcoal m-0">
        {Icon && <Icon size={17} className="text-accent" />}{title}
      </h3>
      {children}
    </section>
  );
}

// Canlı SVG önizleme — glyph path JSON'dan; ışık türüne göre görünüm (Brief §7.1)
function Preview({ text, glyphs, lighting }) {
  if (!glyphs) return <div className="text-[13px] text-textmut px-4 py-10 text-center">Glyph verisi yükleniyor…</div>;
  const cap = glyphs.cap;
  let x = 0; const parts = []; let minY = 0, maxY = 0;
  for (const ch of text) {
    if (ch === ' ') { x += cap * 0.4; continue; }
    const g = glyphs.chars[ch];
    if (!g) continue;
    parts.push({ d: g.d, tx: x - g.x1 });
    minY = Math.min(minY, g.y1); maxY = Math.max(maxY, g.y2);
    x += (g.x2 - g.x1) + cap * 0.1;
  }
  if (!parts.length) return <div className="text-[13px] text-textmut px-4 py-10 text-center">Yazı bekleniyor…</div>;
  const w = x - cap * 0.1, pad = cap * 0.3;
  const vb = `${-pad} ${minY - pad} ${w + 2 * pad} ${maxY - minY + 2 * pad}`;
  const lit = lighting !== 'none';
  const halo = lighting === 'back';
  const fill = halo ? '#3a3f47' : lit ? 'url(#pwFace)' : 'url(#pwSteel)';
  return (
    <svg viewBox={vb} preserveAspectRatio="xMidYMid meet" className="block w-full" style={{ maxHeight: 220 }}>
      <defs>
        <filter id="pwGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={cap * (halo ? 0.09 : 0.045)} result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="pwFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe3a6" /><stop offset="1" stopColor="#ffb742" />
        </linearGradient>
        <linearGradient id="pwSteel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7eaee" /><stop offset="1" stopColor="#aeb6c2" />
        </linearGradient>
      </defs>
      {halo && (
        <g fill="#ffb742" opacity="0.55" filter="url(#pwGlow)">
          {parts.map((p, i) => <path key={'h' + i} d={p.d} transform={`translate(${p.tx},0)`} />)}
        </g>
      )}
      <g fill={fill} stroke={lit ? '#a06a15' : '#7d8590'} strokeWidth={cap * 0.008} filter={lit && !halo ? 'url(#pwGlow)' : undefined}>
        {parts.map((p, i) => <path key={i} d={p.d} transform={`translate(${p.tx},0)`} />)}
      </g>
    </svg>
  );
}

// Değişken paneli satırı — { amount, currency } veya düz sayı
function VarRow({ label, value, currency, onChange, missing }) {
  return (
    <label className={`flex items-center justify-between gap-2 text-[12px] py-1 border-b border-dashed border-linegray ${missing ? 'text-warnred font-bold' : 'text-textsec'}`}>
      <span>{label}{missing ? ' ⚠' : ''}</span>
      <span className="flex items-center gap-1 flex-shrink-0">
        <input type="number" step="any" value={value ?? ''} placeholder="—"
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className={`w-[90px] p-1 text-right text-[12px] border bg-white text-charcoal ${missing ? 'border-warnred' : 'border-inputline'}`} />
        {currency && <span className="text-[11px] text-textmut w-8">{currency}</span>}
      </span>
    </label>
  );
}

export default function PriceWizard({ view: initialView = 'internal' }) {
  const [view, setView] = useState(initialView);
  const [text, setText] = useState('DÖNER');
  const [fontId, setFontId] = useState('anton');
  const [hCm, setHCm] = useState(50);
  const [modelId, setModelId] = useState('onden_isikli');
  const [depthCm, setDepthCm] = useState(10);
  const [ledType, setLedType] = useState('samsung');
  const [kromBoyama, setKromBoyama] = useState(false);
  const [uvBaski, setUvBaski] = useState(false);
  const [segment, setSegment] = useState('standart');
  const [vars, setVars] = useState(getPricingVariables);
  const [data, setData] = useState({}); // { fontId: { coeffs, glyphs } }

  // Katsayı + glyph JSON'larını fontla birlikte yükle (runtime'da opentype yok — Brief §2)
  useEffect(() => {
    if (data[fontId]) return;
    Promise.all([
      fetch(`/coefficients/${fontId}.json`).then((r) => r.json()),
      fetch(`/glyphs/${fontId}.json`).then((r) => r.json()),
    ]).then(([coeffs, glyphs]) => setData((d) => ({ ...d, [fontId]: { coeffs, glyphs } }))).catch(() => {});
  }, [fontId, data]);

  const model = PRODUCT_MODELS.find((m) => m.id === modelId);
  const coeffs = data[fontId]?.coeffs;
  const h = hCm / 100;

  const result = useMemo(() => {
    if (!coeffs) return null;
    const cost = computeCost({ text, h, model, depth: depthCm / 100, ledType, kromBoyama, uvBaski, vars, coeffs });
    const sale = computeSale({ cost, h, segment, vars });
    return { cost, sale };
  }, [coeffs, text, h, model, depthCm, ledType, kromBoyama, uvBaski, vars, segment]);

  // Canlı site (kutuharf.eu) fiyat kalibrasyonu — motor maliyetinden base önerileri
  const kalibrasyon = useMemo(() => {
    if (!coeffs) return null;
    return calibrate({ vars, coeffs, depth: depthCm / 100, ledType, segment });
  }, [coeffs, vars, depthCm, ledType, segment]);

  // Değişken güncelleme yardımcıları (amount'lu ve düz sayı)
  const setAmount = (key) => (v) => setVars((p) => ({ ...p, [key]: v === null ? null : { ...(p[key] || { currency: 'TRY' }), amount: v } }));
  const setNum = (key) => (v) => setVars((p) => ({ ...p, [key]: v }));
  const setTrafo = (k) => (v) => setVars((p) => ({ ...p, trafoFiyat: { ...p.trafoFiyat, [String(k)]: v ?? 0 } }));

  const geo = result?.cost.geometry;
  const sale = result?.sale;
  const warnings = sale?.warnings || [];
  const internal = view === 'internal';

  return (
    <div className="flex flex-col gap-7">
      {/* Görünüm anahtarı */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="m-0 text-[13px] text-textmut">Ayrı test ortamı — canlı konfigüratörü etkilemez. Fiyatlar glyph geometrisinden bottom-up hesaplanır.</p>
        <button onClick={() => setView(internal ? 'customer' : 'internal')}
          className="flex items-center gap-2 px-3 py-2 text-[12px] font-bold border-2 border-inputline hover:border-accent cursor-pointer bg-white">
          {internal ? <Eye size={14} /> : <EyeOff size={14} />} Görünüm: {internal ? 'İç (maliyet açık)' : 'Müşteri'}
        </button>
      </div>

      {/* Uyarı banner'ı (§5.5) */}
      {warnings.length > 0 && internal && (
        <div className="flex flex-col gap-1 px-4 py-3 bg-[#fdf3e6] border border-[#d9a441]/60 text-[13px] text-[#9a6414]">
          <span className="flex items-center gap-2 font-bold"><AlertTriangle size={15} /> Eksik kalem içerir — tahmini sonuç</span>
          {warnings.map((w, i) => <span key={i}>• {w}</span>)}
        </div>
      )}
      {!internal && sale?.isIncomplete && (
        <div className="px-4 py-3 bg-[#fdf3e6] border border-[#d9a441]/60 text-[13px] text-[#9a6414] font-semibold">
          <AlertTriangle size={14} className="inline mr-1.5" /> Tahmini fiyat — kesin teklif için lütfen iletişime geçin.
        </div>
      )}

      {/* Önizleme */}
      <div className="bg-charcoal border border-linegray px-4 py-6" style={{ background: 'linear-gradient(180deg,#33373e,#1f2226)' }}>
        <Preview text={text} glyphs={data[fontId]?.glyphs} lighting={model.lighting} />
      </div>

      {/* Girdiler */}
      <Section icon={Type} title="Yazı, font & yükseklik">
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-3">
          <label className="flex flex-col gap-1 text-[12px] font-bold text-textsec">Tabela yazısı
            <input type="text" value={text} maxLength={40} onChange={(e) => setText(e.target.value)} className={inputCls + ' text-lg font-bold'} /></label>
          <label className="flex flex-col gap-1 text-[12px] font-bold text-textsec">Font
            <select value={fontId} onChange={(e) => setFontId(e.target.value)} className={inputCls}>
              {FONT_OPTIONS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select></label>
          <label className="flex flex-col gap-1 text-[12px] font-bold text-textsec">Harf yüksekliği: <strong className="text-accent">{hCm} cm</strong>
            <input type="range" min={10} max={150} step={5} value={hCm} onChange={(e) => setHCm(Number(e.target.value))} className="accent-accent mt-2" /></label>
        </div>
      </Section>

      {/* Metrikler */}
      {geo && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[['Net ön yüz alanı', f2(geo.toplamOnYuz) + ' m²'], ['Yanak çevresi', f2(geo.toplamCevre) + ' mt'],
            ['Harf sayısı', geo.N], ['LED modül', result.cost.ledAdet || '—']].map(([k, v]) => (
            <div key={k} className="bg-white border border-linegray px-3.5 py-3">
              <div className="text-[10px] uppercase tracking-wider text-textmut font-bold">{k}</div>
              <div className="text-[19px] font-extrabold text-charcoal mt-1">{v}</div>
            </div>
          ))}
        </div>
      )}
      {geo?.missing.length > 0 && (
        <p className="m-0 text-[13px] text-warnred">⚠ Fontta bulunmayan karakterler hesaba katılmadı: {[...new Set(geo.missing)].join(' ')}</p>
      )}

      {/* Ürün modeli (9 seçenek) */}
      <Section icon={Lightbulb} title="Ürün modeli">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRODUCT_MODELS.map((m) => (
            <button key={m.id} onClick={() => setModelId(m.id)}
              className={`text-left px-3 py-2.5 border-2 cursor-pointer bg-white ${modelId === m.id ? 'border-accent bg-accent/5' : 'border-inputline hover:border-accent'}`}>
              <span className="block font-bold text-[13px] text-charcoal">{m.label}</span>
              <span className="block text-[10px] text-textmut mt-0.5">
                {m.lighting === 'none' ? 'ışıksız' : 'ışıklı · ' + m.lighting}{m.extras.length ? ' · ' + m.extras.join(', ') : ''}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-[12px] font-bold text-textsec">Derinlik
            <select value={depthCm} onChange={(e) => setDepthCm(Number(e.target.value))} className={inputCls + ' w-[120px]'}>
              {[8, 10, 12, 15].map((d) => <option key={d} value={d}>{d} cm</option>)}
            </select></label>
          {model.lighting !== 'none' && (
            <label className="flex flex-col gap-1 text-[12px] font-bold text-textsec">LED türü
              <select value={ledType} onChange={(e) => setLedType(e.target.value)} className={inputCls + ' w-[140px]'}>
                {LED_TYPES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select></label>
          )}
          {model.extras.includes('krom_boyama') && (
            <label className="flex items-center gap-2 text-[13px] font-semibold text-charcoal cursor-pointer pb-2">
              <input type="checkbox" checked={kromBoyama} onChange={(e) => setKromBoyama(e.target.checked)} className="w-4 h-4 accent-accent" /> Krom boyama
            </label>
          )}
          <label className="flex items-center gap-2 text-[13px] font-semibold text-charcoal cursor-pointer pb-2">
            <input type="checkbox" checked={uvBaski} onChange={(e) => setUvBaski(e.target.checked)} className="w-4 h-4 accent-accent" /> UV baskı
          </label>
          {internal && (
            <label className="flex flex-col gap-1 text-[12px] font-bold text-textsec">Kâr segmenti
              <select value={segment} onChange={(e) => setSegment(e.target.value)} className={inputCls + ' w-[170px]'}>
                {Object.entries(vars.marj).map(([k, v]) => <option key={k} value={k}>×{v} — {k}</option>)}
              </select></label>
          )}
        </div>
      </Section>

      <div className={`grid grid-cols-1 ${internal ? 'min-[900px]:grid-cols-2' : ''} gap-6 items-start`}>
        {/* Maliyet dökümü — YALNIZ internal (customer görünümünde DOM'da yok, §9) */}
        {internal && result && (
          <div className="bg-white border border-linegray p-5 flex flex-col gap-1">
            <h4 className="m-0 text-[14px] font-extrabold text-charcoal uppercase tracking-wide mb-2">Maliyet dökümü (üretim)</h4>
            {result.cost.items.filter((i) => i.tryTotal > 0 || i.birimFiyat === null).map((i) => (
              <div key={i.id + i.label} className="flex justify-between gap-3 text-[13px] py-1 border-b border-dashed border-linegray">
                <span className="text-textsec">{i.label} <span className="text-textmut">({f2(i.miktar)} {i.birim}{i.birimFiyat ? ` × ${i.birimFiyat.amount} ${i.birimFiyat.currency}` : ''})</span></span>
                <span className="font-semibold text-charcoal flex-shrink-0">{tl2(i.tryTotal)}</span>
              </div>
            ))}
            <div className="flex justify-between text-[14px] font-bold pt-2"><span>Üretim toplamı</span><span>{tl2(result.cost.uretimTRY)}</span></div>
            <div className="flex flex-col gap-0.5 text-[12px] text-textsec mt-2 pt-2 border-t border-linegray">
              <div className="flex justify-between"><span>+ İşçilik ({geo.N} harf)</span><span>{tl2(sale.iscilikTRY)}</span></div>
              <div className="flex justify-between"><span>+ Fire (%{vars.fireYuzde || 0}) & ambalaj</span><span>{tl2(sale.araTRY - sale.uretimTRY - sale.iscilikTRY)}</span></div>
              <div className="flex justify-between"><span>+ Risk payı (%{vars.riskYuzde})</span><span>{tl2(sale.riskTRY)}</span></div>
              <div className="flex justify-between font-bold text-charcoal"><span>Net maliyet</span><span>{tl2(sale.netMaliyetTRY)}</span></div>
              <div className="flex justify-between"><span>Kurlar</span><span>USD/TL: {vars.usdTry ?? '—'} · EUR/TL: {vars.eurTry ?? '—'}</span></div>
            </div>
          </div>
        )}

        {/* Satış fiyatı */}
        {result && (
          <div className="bg-white border border-linegray p-5 flex flex-col gap-2">
            <h4 className="m-0 text-[14px] font-extrabold text-charcoal uppercase tracking-wide">Satış fiyatı</h4>
            {sale.satisNettoEUR !== null ? (
              <>
                {internal && <div className="flex justify-between text-[13px] text-textsec"><span>Net maliyet × {sale.marj} (marj{sale.minUygulandi ? ' → min. sipariş tabanı uygulandı' : ''})</span></div>}
                <div className="flex justify-between items-baseline text-[15px]"><span>Netto</span><span className="font-bold">{eur(sale.satisNettoEUR)}</span></div>
                <div className="flex justify-between items-baseline text-[13px] text-textsec"><span>+ %19 MwSt</span><span>{eur(sale.kdvEUR)}</span></div>
                <div className="flex justify-between items-baseline font-extrabold text-2xl pt-2 border-t-2 border-charcoal"><span>Brüt</span><span className="text-accent">{eur(sale.satisBruttoEUR)}</span></div>
              </>
            ) : (
              <p className="m-0 text-[13px] text-warnred font-semibold">EUR/TL kuru girilmeden EUR satış fiyatı hesaplanamaz{internal ? ' — sağdaki değişken panelinden girin.' : '.'}</p>
            )}
            <p className="m-0 text-[11px] text-textmut">{sale.kargoNotu}</p>
            {!internal && <p className="m-0 text-[11px] text-textmut">Tahmini fiyat — özel logolu projeler için teklif isteyin.</p>}
          </div>
        )}
      </div>

      {/* Değişken paneli — yalnız internal (Brief §8; admin panelin yerel karşılığı) */}
      {internal && (
        <Section icon={Settings2} title="Fiyat değişkenleri (config/pricing.json — oturumluk düzenleme)">
          <div className="grid grid-cols-1 sm:grid-cols-2 min-[1000px]:grid-cols-3 gap-x-6 gap-y-1 bg-white border border-linegray p-4">
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold uppercase text-textmut mb-1">Kurlar (tanımsız = kırmızı)</span>
              <VarRow label="USD/TL" value={vars.usdTry} onChange={setNum('usdTry')} missing={!vars.usdTry} />
              <VarRow label="EUR/TL" value={vars.eurTry} onChange={setNum('eurTry')} missing={!vars.eurTry} />
              <span className="text-[11px] font-extrabold uppercase text-textmut mt-3 mb-1">Genel</span>
              <VarRow label="Fire" value={vars.fireYuzde} currency="%" onChange={setNum('fireYuzde')} />
              <VarRow label="Risk payı" value={vars.riskYuzde} currency="%" onChange={setNum('riskYuzde')} />
              <VarRow label="İşçilik / harf" value={vars.iscilikPerHarf?.amount} currency="TL" onChange={setAmount('iscilikPerHarf')} />
              <VarRow label="Ambalaj taban" value={vars.ambalajTaban?.amount} currency="EUR" onChange={setAmount('ambalajTaban')} />
              <VarRow label="Min. sipariş" value={vars.minSiparis?.amount} currency="EUR" onChange={setAmount('minSiparis')} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold uppercase text-textmut mb-1">Malzeme</span>
              <VarRow label="Krom m²" value={vars.kromM2?.amount} currency="TL" onChange={setAmount('kromM2')} />
              <VarRow label="Pleksi 3 mm m²" value={vars.pleksi3mmM2?.amount} currency="TL" onChange={setAmount('pleksi3mmM2')} />
              <VarRow label="Pleksi 5 mm m²" value={vars.pleksi5mmM2?.amount} currency="USD" onChange={setAmount('pleksi5mmM2')} />
              <VarRow label="Dekota m²" value={vars.dekotaM2?.amount} currency="TL" onChange={setAmount('dekotaM2')} />
              <VarRow label="Rakı beyazı 8 mm m²" value={vars.rakiBeyazi8mmM2?.amount} currency="TL" onChange={setAmount('rakiBeyazi8mmM2')} />
              <VarRow label="UV baskı m²" value={vars.uvBaskiM2?.amount} currency="TL" onChange={setAmount('uvBaskiM2')} />
              <VarRow label="Boyalı alü m² (TODO)" value={vars.aluFaceM2?.amount} currency="TL" onChange={setAmount('aluFaceM2')} missing={!vars.aluFaceM2} />
              <VarRow label="Alü yan bant / mt" value={vars.aluYanBantMt?.amount} currency="TL" onChange={setAmount('aluYanBantMt')} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold uppercase text-textmut mb-1">Adet kalemleri</span>
              <VarRow label="LED Samsung" value={vars.ledSamsung?.amount} currency="TL" onChange={setAmount('ledSamsung')} />
              <VarRow label="LED Standart" value={vars.ledStandart?.amount} currency="TL" onChange={setAmount('ledStandart')} />
              <VarRow label="LED yoğunluğu" value={vars.ledYogunlugu} currency="ad/m²" onChange={setNum('ledYogunlugu')} />
              <VarRow label="Watt / modül" value={vars.wattPerModul} currency="W" onChange={setNum('wattPerModul')} />
              {TRAFO_KADEMELER.map((k) => (
                <VarRow key={k} label={`Trafo ${k} W`} value={vars.trafoFiyat?.[String(k)] || null} currency="TL" onChange={setTrafo(k)} missing={!(Number(vars.trafoFiyat?.[String(k)]) > 0)} />
              ))}
              <VarRow label="Vida" value={vars.vida?.amount} currency="TL" onChange={setAmount('vida')} />
              <VarRow label="Halo ayağı" value={vars.haloAyak?.amount} currency="TL" onChange={setAmount('haloAyak')} />
              <VarRow label="Yapıştırıcı / harf" value={vars.yapistiriciPerHarf?.amount} currency="TL" onChange={setAmount('yapistiriciPerHarf')} />
              <VarRow label="Kablo / harf" value={vars.kabloPerHarf?.amount} currency="TL" onChange={setAmount('kabloPerHarf')} />
              <VarRow label="Krom boyama ≤50" value={vars.kromBoyamaKucuk?.amount} currency="TL" onChange={setAmount('kromBoyamaKucuk')} />
              <VarRow label="Krom boyama >50" value={vars.kromBoyamaBuyuk?.amount} currency="TL" onChange={setAmount('kromBoyamaBuyuk')} missing={!vars.kromBoyamaBuyuk} />
            </div>
          </div>
          <p className="m-0 text-[11px] text-textmut">Değerler oturumluktur (sayfa yenilenince <code>config/pricing.json</code> varsayılanlarına döner). Kalıcı değişiklik: JSON dosyası; faz 2: Supabase <code>pricing_variables</code> + /admin/pricing.</p>
        </Section>
      )}

      {/* kutuharf.eu FİYAT KALİBRASYONU — motor maliyetinden canlı base önerileri */}
      {internal && kalibrasyon && (
        <Section icon={Settings2} title="kutuharf.eu fiyat kalibrasyonu (canlı base önerileri)">
          <p className="m-0 text-[12px] text-textsec leading-relaxed">
            Canlı site basit formülle satar: <code>base × (h/20) × ışıkFaktörü × harfSayısı + 49 € trafo + montaj</code>.
            Aşağıdaki öneriler, motorun gerçek maliyetinden hesaplanan <strong>ortalama harf başına netto satış fiyatıdır</strong> (seçili
            derinlik {depthCm} cm · LED {ledType} · marj ×{vars.marj?.[segment]} · işçilik/fire/risk dahil; trafo, ambalaj ve min. sipariş hariç — bunlar sipariş bazlı).
            <strong> Önerilen base</strong>, canlı formülü 20 cm&apos;de motora birebir eşitler.
          </p>
          {!vars.eurTry ? (
            <p className="m-0 text-[13px] text-warnred font-semibold">EUR/TL kuru girilmeden kalibrasyon hesaplanamaz — yukarıdaki panelden girin.</p>
          ) : (
            <div className="overflow-x-auto bg-white border border-linegray">
              <table className="w-full text-[12px] whitespace-nowrap">
                <thead><tr className="text-textmut uppercase text-[10px] tracking-wider">
                  <th className="text-left px-3 py-2">Kombinasyon</th>
                  <th className="text-right px-3 py-2">Mevcut base</th>
                  <th className="text-right px-3 py-2">Mevcut €/harf @20</th>
                  <th className="text-right px-3 py-2">Motor @20</th>
                  <th className="text-right px-3 py-2">Motor @30</th>
                  <th className="text-right px-3 py-2">Motor @50</th>
                  <th className="text-right px-3 py-2 text-accent">Önerilen base</th>
                  <th className="text-right px-3 py-2">Lineer sapma @50</th>
                </tr></thead>
                <tbody>
                  {kalibrasyon.map((r) => (
                    <tr key={r.id} className="border-t border-linegray">
                      <td className="px-3 py-1.5 font-semibold text-charcoal">{r.label}<span className="text-textmut font-normal"> · ×{r.factor}</span></td>
                      <td className="px-3 py-1.5 text-right">{r.mevcutBase} €</td>
                      <td className="px-3 py-1.5 text-right">{r.mevcut20?.toFixed(2)} €</td>
                      {r.motor20 === null ? (
                        <td colSpan={4} className="px-3 py-1.5 text-right text-warnred">motor karşılığı yok — üreticiden fiyat gerekir</td>
                      ) : (
                        <>
                          <td className="px-3 py-1.5 text-right">{r.motor20.toFixed(2)} €</td>
                          <td className="px-3 py-1.5 text-right">{r.motor30.toFixed(2)} €</td>
                          <td className="px-3 py-1.5 text-right">{r.motor50.toFixed(2)} €</td>
                          <td className={`px-3 py-1.5 text-right font-extrabold ${Math.abs(r.yeniBase - r.mevcutBase) / r.mevcutBase > 0.15 ? 'text-accent' : 'text-charcoal'}`}>{r.yeniBase.toFixed(0)} €</td>
                          <td className={`px-3 py-1.5 text-right ${Math.abs(r.sapma50) > 20 ? 'text-warnred font-bold' : 'text-textsec'}`}>{r.sapma50 > 0 ? '+' : ''}{r.sapma50.toFixed(0)}%</td>
                        </>
                      )}
                      {r.motor20 === null && <td className="px-3 py-1.5" />}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="m-0 text-[11px] text-textmut leading-relaxed">
            <strong>Uygulama:</strong> Onayladığın &quot;Önerilen base&quot; değerleri <code>data/konfigurator.js → KONFIG_CONSTRUCTIONS[].base</code> içine
            yazılır ve push edilir — canlı site fiyatları otomatik güncellenir (tek doğruluk kaynağı, client + api/order aynı dosyayı okur).
            &quot;Lineer sapma @50&quot; pozitifse canlı formül 50 cm&apos;de motordan pahalı satar (güvenli taraf), negatifse zarar riski — büyük negatif sapmada
            base yerine kademeli fiyat düşünülmeli. Değerleri bana söylemen yeterli, dosyayı güncelleyip deploy ederim.
          </p>
        </Section>
      )}

      {/* Harf bazlı metraj — internal */}
      {internal && geo && geo.letters.length > 0 && (
        <Section icon={Ruler} title="Harf bazlı metraj">
          <div className="overflow-x-auto bg-white border border-linegray">
            <table className="w-full text-[12px]">
              <thead><tr className="text-textmut uppercase text-[10px] tracking-wider">
                <th className="text-left px-3 py-2">Harf</th><th className="text-right px-3 py-2">Genişlik (cm)</th>
                <th className="text-right px-3 py-2">Net alan (m²)</th><th className="text-right px-3 py-2">Çevre (mt)</th>
              </tr></thead>
              <tbody>
                {geo.letters.map((l, i) => (
                  <tr key={i} className="border-t border-linegray">
                    <td className="px-3 py-1.5 font-extrabold text-[15px]">{l.ch}</td>
                    <td className="px-3 py-1.5 text-right">{(l.genislik * 100).toFixed(1)}</td>
                    <td className="px-3 py-1.5 text-right">{l.onYuz.toFixed(3)}</td>
                    <td className="px-3 py-1.5 text-right">{l.cevre.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
}
