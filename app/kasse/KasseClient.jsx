'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Truck } from 'lucide-react';
import { useCartStore, cartTotals } from '@/store/cartStore';
import { fmtEur, PRODUCTION_DAYS, versandfertigBis } from '@/data/categories';
import { KONFIG_LIMITS } from '@/data/konfigurator';
import { useT } from '@/components/LocaleProvider';

const inputCls = 'p-3 text-base font-sans border border-inputline bg-white text-charcoal w-full';
const labelCls = 'flex flex-col gap-2 text-sm font-semibold text-charcoal';

export default function KasseClient() {
  const tx = useT();
  const { items, reseller, clear } = useCartStore();
  const t = cartTotals(items, reseller?.rate || 0, null, null);
  // Positionen über quoteHeight (50 cm) ODER angebotspflichtige Optionen (Profi-Montage,
  // Grundplatte/Tragprofil): Online-Zahlung gesperrt — automatisch Angebots-Anfrage.
  const hasOversize = items.some((i) => i.oversize || i.quoteOnly);
  const onlyQuoteOpts = hasOversize && !items.some((i) => i.oversize);
  // Projektzeichnung eines angebotspflichtigen Postens an die Anfrage weiterreichen
  const quoteZeichnung = items.find((i) => i.quoteOnly && i.konfig && i.fileUrl)?.fileUrl || '';
  const quoteHref = `/kontakt?kategorie=werbetechnik${quoteZeichnung ? `&zeichnung=${encodeURIComponent(quoteZeichnung)}` : ''}`;
  const [form, setForm] = useState({ name: '', firma: '', email: '', telefon: '', strasse: '', plz: '', ort: '', land: '', notes: '' });
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [agb, setAgb] = useState(false);

  const versandDatum = items.length
    ? versandfertigBis(Math.max(...items.map((i) => PRODUCTION_DAYS[i.categorySlug] || 5)))
    : null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          resellerEmail: reseller?.email || null,
          items: items.map((i) => ({
            categorySlug: i.categorySlug,
            productSlug: i.productSlug,
            detail: i.detail,
            qty: i.qty,
            m2: i.m2 || null,
            konfig: i.konfig || null,
            fileUrl: i.fileUrl || null,
            fileName: i.fileName || null,
            note: i.note || null,
            datencheck: !!i.datencheck,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setOrderNo(data.orderNo || '');
        setStatus('ok');
        clear();
      } else {
        setStatus('error');
        setErrorMsg(data.error || tx('checkout.genericError'));
      }
    } catch {
      setStatus('error');
      setErrorMsg(tx('checkout.connError'));
    }
  };

  if (status === 'ok') {
    return (
      <main className="bg-sectionlight px-12 py-24 max-sm:px-6">
        <div className="max-w-[640px] mx-auto bg-white border border-linegray p-10 flex flex-col gap-4 text-center">
          <span className="text-4xl">✅</span>
          <h1 className="m-0 text-3xl font-extrabold">{tx('checkout.okTitle')}</h1>
          <p className="m-0 text-[15px] leading-relaxed text-textsec">
            {tx('checkout.okDesc', { no: orderNo })}
          </p>
          <Link href="/" className="self-center mt-2 bg-accent text-white text-base font-semibold px-8 py-4 hover:brightness-90">
            {tx('checkout.backHome')}
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="bg-sectionlight px-12 py-24 max-sm:px-6">
        <div className="max-w-[640px] mx-auto bg-white border border-linegray p-10 flex flex-col gap-4 text-center">
          <h1 className="m-0 text-3xl font-extrabold">{tx('checkout.emptyTitle')}</h1>
          <p className="m-0 text-[15px] text-textsec">{tx('checkout.emptyDesc')}</p>
          <Link href="/" className="self-center mt-2 bg-accent text-white text-base font-semibold px-8 py-4 hover:brightness-90">
            {tx('checkout.toDruck')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-sectionlight px-12 py-16 max-sm:px-6">
      <div className="max-w-[1100px] mx-auto flex flex-col gap-8">
        <h1 className="m-0 text-4xl max-sm:text-3xl font-extrabold">{tx('checkout.title')}</h1>
        <div className="grid grid-cols-1 min-[900px]:grid-cols-[1.6fr_1fr] gap-10 items-start">
          <form onSubmit={submit} className="bg-white border border-linegray p-8 flex flex-col gap-5">
            <h2 className="m-0 text-[22px] font-extrabold">{tx('checkout.addressTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={labelCls}>{tx('checkout.name')} *<input required value={form.name} onChange={set('name')} className={inputCls} /></label>
              <label className={labelCls}>{tx('checkout.firma')}<input value={form.firma} onChange={set('firma')} className={inputCls} /></label>
              <label className={labelCls}>{tx('checkout.email')} *<input required type="email" value={form.email} onChange={set('email')} className={inputCls} /></label>
              <label className={labelCls}>{tx('checkout.telefon')}<input type="tel" value={form.telefon} onChange={set('telefon')} className={inputCls} /></label>
            </div>
            <label className={labelCls}>{tx('checkout.strasse')} *<input required value={form.strasse} onChange={set('strasse')} className={inputCls} /></label>
            <div className="grid grid-cols-[1fr_2fr] gap-4">
              <label className={labelCls}>{tx('checkout.plz')} *<input required value={form.plz} onChange={set('plz')} className={inputCls} /></label>
              <label className={labelCls}>{tx('checkout.ort')} *<input required value={form.ort} onChange={set('ort')} className={inputCls} /></label>
            </div>
            <label className={labelCls}>{tx('checkout.land')} *<input required value={form.land} onChange={set('land')} className={inputCls} /></label>
            <label className={labelCls}>{tx('checkout.notes')}<textarea rows={3} value={form.notes} onChange={set('notes')} className={inputCls} placeholder={tx('checkout.notesPh')} /></label>

            <p className="m-0 text-[13px] text-textsec bg-sectionlight border border-linegray px-4 py-3">
              {tx('checkout.uploadHint')}
            </p>

            <div className="border border-linegray bg-sectionlight px-4 py-3 text-[14px] text-textsec">
              {tx('checkout.payInfo')}
            </div>

            <label className="flex items-start gap-2.5 text-[14px] text-charcoal cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agb}
                onChange={() => setAgb(!agb)}
                className="mt-0.5 w-[16px] h-[16px] accent-accent flex-shrink-0"
              />
              <span>
                {tx('checkout.agb1')}<Link href="/agb" target="_blank" className="text-accent underline">{tx('checkout.agbLink')}</Link>
                {tx('checkout.agb2')}
                <Link href="/datenschutz" target="_blank" className="text-accent underline">{tx('checkout.dsLink')}</Link>
                {tx('checkout.agb3')}
              </span>
            </label>

            {hasOversize && (
              <div className="flex flex-col gap-2">
                <p className="m-0 text-[14px] text-warnred bg-[#fdeceb] border border-warnred/40 px-4 py-3">
                  {onlyQuoteOpts ? tx('cart.quoteBlock') : tx('cart.oversizeBlock', { max: KONFIG_LIMITS.quoteHeight })}
                </p>
                <Link href={quoteHref} className="self-start bg-charcoal text-white text-base font-semibold px-8 py-4 hover:brightness-90">
                  {tx('cart.oversizeQuote')}
                </Link>
              </div>
            )}
            <button
              type="submit"
              disabled={status === 'sending' || hasOversize}
              className="self-start bg-accent text-white text-base font-semibold px-8 py-4 border-none cursor-pointer hover:brightness-90 disabled:opacity-60 disabled:cursor-wait"
            >
              {status === 'sending' ? tx('checkout.submitting') : tx('checkout.submit')}
            </button>
            {status === 'error' && <p className="m-0 text-[15px] text-warnred">{errorMsg}</p>}
            <p className="m-0 text-[13px] text-textmut">
              {tx('checkout.privacyNote')}<Link href="/datenschutz" className="text-accent">{tx('checkout.datenschutz')}</Link>.
            </p>
          </form>

          <aside className="bg-white border border-linegray p-6 flex flex-col gap-3">
            <h2 className="m-0 text-[20px] font-extrabold">{tx('checkout.overviewTitle')}</h2>
            {versandDatum && (
              <div className="flex items-center gap-2 text-[13px] text-textsec bg-sectionlight border border-linegray px-3 py-2">
                <Truck size={15} className="text-accent" /> {tx('checkout.shipBy')} <strong>{versandDatum}</strong>
              </div>
            )}
            {items.map((i) => (
              <div key={i.key} className="flex flex-col gap-0.5 text-[14px] border-b border-linegray pb-2">
                <div className="flex justify-between gap-3">
                  <span>{tx(`product.${i.productSlug}.name`, {}, i.name)} <span className="text-textmut">({i.detail})</span> × {i.qty}</span>
                  <span className="font-semibold whitespace-nowrap">{fmtEur(i.unitPrice * i.qty)}</span>
                </div>
                {i.fileName && <span className="text-[12px] text-textmut">📎 {i.fileName}</span>}
                {i.datencheck && <span className="text-[12px] text-textmut">✓ {tx('cart.datencheckShort')}</span>}
              </div>
            ))}
            {t.datencheckCount > 0 && (
              <div className="flex justify-between text-[14px]">
                <span>{tx('cart.datencheckShort')} ({t.datencheckCount}×)</span><span>{fmtEur(t.datencheckTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-[14px]"><span>{tx('cart.subtotal')}</span><span>{fmtEur(t.subtotal)}</span></div>
            {t.discount > 0 && (
              <div className="flex justify-between text-[14px] text-accent font-semibold">
                <span>{tx('cart.haendlerrabatt')} −{reseller.rate}%</span><span>−{fmtEur(t.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[14px]"><span>{tx('cart.versand')}</span><span>{t.shipping === 0 ? tx('common.free') : fmtEur(t.shipping)}</span></div>
            <div className="flex justify-between text-[14px]"><span>{tx('common.vat19')}</span><span>{fmtEur(t.vat)}</span></div>
            <div className="flex justify-between font-extrabold text-lg pt-2 border-t-2 border-charcoal">
              <span>{tx('cart.gesamt')}</span><span>{fmtEur(t.total)}</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
