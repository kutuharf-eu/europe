'use client';

// Sağ panel — canlı fiyat.
// İstek YALNIZ fiyata etki eden alanlar değişince atılır (pricingSignature): sürükleme,
// renk, döndürme ve zemin ölçüsü değişimi ağ trafiği üretmez. 400 ms debounce.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useStudioStore } from '@/store/studioStore';
import { useT } from '@/components/LocaleProvider';
import { toPricingItems, pricingSignature } from '@/lib/studio/toPricingCfg';

const eur = (v) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v || 0);

export default function PricePanel() {
  const t = useT();
  const elements = useStudioStore((s) => s.elements);
  const lighting = useStudioStore((s) => s.lighting);
  const product = useStudioStore((s) => s.product);
  const sign = useStudioStore((s) => s.sign);
  const setPriceInfo = useStudioStore((s) => s.setPriceInfo);

  const design = useMemo(() => ({ elements, lighting, product }), [elements, lighting, product]);
  const { items, warnings } = useMemo(() => toPricingItems(design), [design]);
  const signature = useMemo(() => pricingSignature(design), [design]);

  const [state, setState] = useState({ status: 'idle', data: null });
  const lastSig = useRef(null);

  useEffect(() => {
    if (!items.length) {
      lastSig.current = null;
      setState({ status: 'idle', data: null });
      return;
    }
    if (signature === lastSig.current) return;

    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setState((s) => ({ status: 'loading', data: s.data }));
      try {
        const res = await fetch('/api/studio/price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: items.map(({ key, cfg, addon }) => ({ key, cfg, addon })) }),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error('price');
        const data = await res.json();
        lastSig.current = signature;
        setState({ status: 'ready', data });
        // Sepet/teklif butonları güncel fiyatı ve teklif zorunluluğunu buradan okur.
        setPriceInfo({
          total: data.total || 0,
          premiumQuote: !!data.premiumQuote,
          ready: !data.items?.some((p) => !p.priced),
        });
      } catch (e) {
        if (e.name === 'AbortError') return;
        setState({ status: 'error', data: null });
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [signature, items]);

  const data = state.data;
  const byKey = useMemo(
    () => Object.fromEntries((data?.items || []).map((p) => [p.key, p])),
    [data]
  );
  const unpriced = (data?.items || []).filter((p) => !p.priced).length;

  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/55">
        {t('studio.price', null, 'Preis')}
      </h2>

      {!items.length && <p className="text-sm text-white/45">{t('studio.priceEmpty')}</p>}

      {!!items.length && (
        <>
          <ul className="space-y-1.5 text-sm">
            {items.map((it) => {
              const p = byKey[it.key];
              return (
                <li key={it.key} className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-white/70">
                    {it.label}
                    {it.addon && <span className="ml-1 text-[10px] text-white/30">+</span>}
                  </span>
                  <span className="shrink-0 tabular-nums text-white/85">
                    {p?.priced ? eur(p.total) : p ? '—' : '…'}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-3">
            <span className="text-sm font-semibold text-white">{t('studio.priceTotal', null, 'Summe (netto)')}</span>
            <span className="tabular-nums text-lg font-bold text-white">
              {state.status === 'loading' && !data ? '…' : eur(data?.total)}
            </span>
          </div>

          {state.status === 'loading' && (
            <p className="mt-1 text-[11px] text-white/30">{t('studio.priceLoading', null, 'Wird berechnet…')}</p>
          )}
          {state.status === 'error' && (
            <p className="mt-1 text-[11px] text-red-300/80">{t('studio.priceError', null, 'Preis konnte nicht berechnet werden.')}</p>
          )}
          {data?.premiumQuote && (
            <p className="mt-2 rounded-md bg-amber-400/10 px-2 py-1.5 text-[11px] leading-relaxed text-amber-200/90">
              {t('studio.priceQuote')}
            </p>
          )}
          {unpriced > 0 && (
            <p className="mt-2 text-[11px] text-white/40">{t('studio.priceUnpriced', { n: unpriced })}</p>
          )}
        </>
      )}

      <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-white/35">
        {/* Zemin fiyatı MVP'de yok — Murat'ın kararı (25 Tem): teklifte netleşir. */}
        {sign.kind !== 'keine' && <p>{t('studio.priceNote')}</p>}
        {warnings.includes('star') && <p>{t('studio.priceStarNote')}</p>}
      </div>
    </div>
  );
}
