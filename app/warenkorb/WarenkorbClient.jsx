'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Minus, Plus, Upload, MessageSquarePlus, ArrowLeft } from 'lucide-react';
import { useCartStore, cartTotals } from '@/store/cartStore';
import { fmtEur, FREE_SHIPPING_FROM, DATENCHECK_PRICE } from '@/data/categories';
import { KONFIG_LIMITS } from '@/data/konfigurator';
import { supabase } from '@/utils/supabaseClient';
import { useT } from '@/components/LocaleProvider';

const SERVICES = [
  { categorySlug: 'druckprodukte', productSlug: 'logo-erstellungsservice', name: 'Logo-Erstellungsservice', detail: 'Professionelles Logo-Design', price: 100, hint: 'Noch kein Logo? Wir gestalten es für Sie.' },
];

export default function WarenkorbClient() {
  const tx = useT();
  const { items, removeItem, setQty, setItemMeta, reseller, addItem } = useCartStore();
  const [uploadingKey, setUploadingKey] = useState(null);
  const [noteKey, setNoteKey] = useState(null);

  const uploadFor = async (key, file) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return;
    setUploadingKey(key);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `positionen/${Date.now()}_${safeName}`;
    const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: false });
    if (!error) {
      const url = supabase.storage.from('uploads').getPublicUrl(path).data.publicUrl;
      setItemMeta(key, { fileUrl: url, fileName: file.name });
    }
    setUploadingKey(null);
  };
  const t = cartTotals(items, reseller?.rate || 0, null, null);

  return (
    <main className="px-12 py-14 max-sm:px-6">
      <div className="max-w-[1100px] mx-auto flex flex-col gap-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="m-0 text-4xl max-sm:text-3xl font-extrabold text-charcoal">{tx('cart.title')}</h1>
          <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold text-accent hover:underline">
            <ArrowLeft size={17} /> {tx('cart.continueShopping')}
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-linegray p-10 flex flex-col items-start gap-4">
            <p className="m-0 text-[15px] text-textmut">
              {tx('cart.empty1')}
              <Link href="/" className="text-accent font-semibold">
                {tx('cart.emptyLink')}
              </Link>
              {tx('cart.empty2')}
            </p>
            <Link href="/" className="bg-accent text-white text-base font-semibold px-8 py-4 hover:brightness-90">
              {tx('cart.continueShopping')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[900px]:grid-cols-[1.6fr_1fr] gap-10 items-start">
            {/* Positionen */}
            <div className="flex flex-col gap-4">
              {items.map((i) => (
                <div key={i.key} className="bg-white border border-linegray p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="m-0 font-bold text-[16px] text-charcoal">{tx(`product.${i.productSlug}.name`, {}, i.name)}</p>
                      <p className="m-0 text-[13px] text-textmut">{i.detail}</p>
                    </div>
                    <button onClick={() => removeItem(i.key)} aria-label={tx('common.remove')} className="text-textmut hover:text-warnred bg-transparent border-none cursor-pointer p-1">
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-inputline">
                      <button onClick={() => setQty(i.key, i.qty - 1)} className="px-3 py-2 bg-transparent border-none cursor-pointer hover:bg-sectionlight">
                        <Minus size={14} />
                      </button>
                      <span className="px-3.5 text-[15px] font-bold text-charcoal">{i.qty}</span>
                      <button onClick={() => setQty(i.key, i.qty + 1)} className="px-3 py-2 bg-transparent border-none cursor-pointer hover:bg-sectionlight">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-bold text-[16px] text-charcoal">{fmtEur(i.unitPrice * i.qty)}</span>
                  </div>

                  {/* Datenupload je Position */}
                  <div className="border-t border-linegray pt-3 flex flex-col gap-2">
                    {i.fileUrl ? (
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-charcoal font-semibold truncate">✓ {i.fileName}</span>
                        <button
                          onClick={() => setItemMeta(i.key, { fileUrl: null, fileName: null })}
                          className="text-warnred bg-transparent border-none cursor-pointer text-[13px] hover:underline flex-shrink-0"
                        >
                          {tx('common.remove')}
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 text-[13px] font-semibold text-accent cursor-pointer hover:underline">
                        <Upload size={14} />
                        {uploadingKey === i.key ? tx('cart.uploading') : tx('cart.uploadPrompt')}
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.svg,.ai,.eps,.zip"
                          className="hidden"
                          onChange={(e) => uploadFor(i.key, e.target.files && e.target.files[0])}
                        />
                      </label>
                    )}

                    {/* Bemerkung */}
                    {noteKey === i.key || i.note ? (
                      <textarea
                        rows={2}
                        value={i.note || ''}
                        onChange={(e) => setItemMeta(i.key, { note: e.target.value })}
                        placeholder={tx('cart.notePlaceholder')}
                        className="w-full px-3 py-2 text-[13px] font-sans border border-inputline"
                      />
                    ) : (
                      <button
                        onClick={() => setNoteKey(i.key)}
                        className="self-start flex items-center gap-1.5 text-[13px] text-textmut bg-transparent border-none cursor-pointer hover:text-accent"
                      >
                        <MessageSquarePlus size={14} /> {tx('cart.addNote')}
                      </button>
                    )}

                    {/* Datencheck */}
                    <label className="flex items-center gap-2 text-[13px] cursor-pointer text-charcoal">
                      <input
                        type="checkbox"
                        checked={!!i.datencheck}
                        onChange={() => setItemMeta(i.key, { datencheck: !i.datencheck })}
                        className="w-[15px] h-[15px] accent-accent"
                      />
                      {tx('cart.datencheck', { price: fmtEur(DATENCHECK_PRICE) })}
                    </label>
                  </div>
                </div>
              ))}

              {/* Service-Empfehlungen */}
              {SERVICES.filter((s) => !items.some((i) => i.productSlug === s.productSlug)).map((s) => (
                <div key={s.productSlug} className="border border-dashed border-inputline bg-sectionlight p-5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="m-0 font-bold text-[15px] text-charcoal">{tx(`product.${s.productSlug}.name`, {}, s.name)}</p>
                    <span className="font-bold text-[15px] text-charcoal whitespace-nowrap">{fmtEur(s.price)}</span>
                  </div>
                  <p className="m-0 text-[13px] text-textmut">{tx('cart.serviceLogoHint', {}, s.hint)}</p>
                  <button
                    onClick={() => addItem({ categorySlug: s.categorySlug, productSlug: s.productSlug, name: s.name, detail: s.detail, unitPrice: s.price })}
                    className="self-start mt-1 text-[14px] font-semibold text-accent bg-transparent border-none cursor-pointer p-0 hover:underline"
                  >
                    {tx('cart.serviceAdd')}
                  </button>
                </div>
              ))}
            </div>

            {/* Zusammenfassung */}
            <aside className="bg-white border border-linegray p-6 flex flex-col gap-2 text-[14px] min-[900px]:sticky min-[900px]:top-6">
              {/* Versandkosten-Fortschritt */}
              <div className="flex flex-col gap-1.5 pb-2">
                {t.shipping === 0 ? (
                  <span className="text-[13px] font-semibold text-charcoal">{tx('cart.freeShipReached')}</span>
                ) : (
                  <span className="text-[13px] text-textsec">
                    {tx('cart.freeShipRemaining', { amount: fmtEur(FREE_SHIPPING_FROM - t.afterDiscount) })}
                  </span>
                )}
                <div className="h-2 bg-sectionlight border border-linegray overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${Math.min(100, (t.afterDiscount / FREE_SHIPPING_FROM) * 100)}%` }}
                  />
                </div>
              </div>

              {t.datencheckCount > 0 && (
                <div className="flex justify-between pt-1">
                  <span>{tx('cart.datencheckShort')} ({t.datencheckCount}×)</span><span>{fmtEur(t.datencheckTotal)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1"><span>{tx('cart.subtotal')}</span><span>{fmtEur(t.subtotal)}</span></div>
              {t.discount > 0 && (
                <div className="flex justify-between text-accent font-semibold">
                  <span>{tx('cart.haendlerrabatt')} −{reseller.rate}%</span><span>−{fmtEur(t.discount)}</span>
                </div>
              )}
              <div className="flex justify-between"><span>{tx('cart.versand')}</span><span>{t.shipping === 0 ? tx('common.free') : fmtEur(t.shipping)}</span></div>
              <div className="flex justify-between"><span>{tx('common.vat19')}</span><span>{fmtEur(t.vat)}</span></div>
              <div className="flex justify-between font-extrabold text-lg pt-1 border-t border-linegray">
                <span>{tx('cart.gesamt')}</span><span>{fmtEur(t.total)}</span>
              </div>
              {items.some((i) => i.oversize || i.quoteOnly) ? (
                /* Positionen über quoteHeight ODER angebotspflichtige Optionen (Profi-Montage,
                   Grundplatte/Tragprofil): Online-Zahlung gesperrt — automatisch Angebots-Anfrage */
                <div className="mt-3 flex flex-col gap-2">
                  <p className="m-0 text-[13px] text-warnred bg-[#fdeceb] border border-warnred/40 px-3 py-2.5">
                    {items.some((i) => i.oversize) ? tx('cart.oversizeBlock', { max: KONFIG_LIMITS.quoteHeight }) : tx('cart.quoteBlock')}
                  </p>
                  <Link
                    href="/kontakt?kategorie=werbetechnik"
                    className="bg-charcoal text-white text-center text-base font-semibold px-6 py-4 hover:brightness-90"
                  >
                    {tx('cart.oversizeQuote')}
                  </Link>
                </div>
              ) : (
                <Link
                  href="/kasse"
                  className="mt-3 kh-glow-btn bg-accent text-white text-center text-base font-semibold px-6 py-4 hover:brightness-90"
                >
                  {tx('cart.toCheckout')}
                </Link>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
