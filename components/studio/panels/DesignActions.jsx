'use client';

// Kaydet + Teklif iste. Kaydetme, tasarımı ve tuvalin PNG önizlemesini API'ye
// gönderir (fiyat sunucuda yeniden hesaplanır). Teklif formu önce kaydeder, sonra
// talebi gönderir — böylece teklifte her zaman bir tasarım ve fiyat bulunur.

import { useState } from 'react';
import { useStudioStore } from '@/store/studioStore';
import { useT } from '@/components/LocaleProvider';
import { ownerToken } from '@/lib/studio/owner';
import QuoteDialog from '@/components/studio/QuoteDialog';

const btn =
  'w-full px-3 py-2 rounded-md text-sm border border-white/12 bg-white/5 text-white/85 hover:bg-white/10 disabled:opacity-35 transition';
const btnPrimary =
  'w-full px-3 py-2.5 rounded-md text-sm font-semibold bg-accent text-white hover:brightness-110 disabled:opacity-40 transition';

export default function DesignActions() {
  const t = useT();
  const count = useStudioStore((s) => s.elements.length);
  const designId = useStudioStore((s) => s.designId);
  const setDesignId = useStudioStore((s) => s.setDesignId);
  const designPayload = useStudioStore((s) => s.designPayload);
  const previewFn = useStudioStore((s) => s.previewFn);

  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const [quoteOpen, setQuoteOpen] = useState(false);

  /** @returns {Promise<string|null>} kaydedilen tasarımın id'si */
  const save = async () => {
    const token = ownerToken();
    if (!token) {
      setStatus('error');
      return null;
    }
    setStatus('saving');
    try {
      const res = await fetch('/api/studio/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: designId,
          ownerToken: token,
          design: designPayload(),
          preview: previewFn ? previewFn() : null,
        }),
      });
      if (!res.ok) throw new Error('save');
      const data = await res.json();
      setDesignId(data.id);
      setStatus('saved');
      // Tasarım linki adres çubuğuna yazılır (sayfa yenilenmez). App Router'ın
      // desteklediği biçim: state null + URL string — boş {} state Next'in kendi
      // history kaydını bozuyor ve değişiklik geri alınıyordu.
      if (typeof window !== 'undefined' && data.id) {
        const url = new URL(window.location.href);
        url.searchParams.set('d', data.id);
        window.history.replaceState(null, '', url.toString());
      }
      return data.id;
    } catch {
      setStatus('error');
      return null;
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4">
      {/* Stüdyo işleri online sipariş edilmez: zemin, montaj ve özel formlar
          teklifte netleşir (Murat'ın kararı, 25 Tem). Tek yol teklif talebi. */}
      <button className={btnPrimary} disabled={!count} onClick={() => setQuoteOpen(true)}>
        {t('studio.requestQuote', null, 'Angebot anfordern')}
      </button>
      <p className="mt-2 text-[11px] leading-relaxed text-white/40">{t('studio.quoteOnlyNote')}</p>

      <button className={`${btn} mt-2`} disabled={!count || status === 'saving'} onClick={save}>
        {status === 'saving'
          ? t('studio.saving', null, 'Wird gespeichert…')
          : designId
            ? t('studio.saveUpdate', null, 'Entwurf aktualisieren')
            : t('studio.save', null, 'Entwurf speichern')}
      </button>

      {status === 'saved' && (
        <p className="mt-2 text-[11px] text-emerald-300/80">{t('studio.saved')}</p>
      )}
      {status === 'error' && (
        <p className="mt-2 text-[11px] text-red-300/80">{t('studio.saveError')}</p>
      )}

      {quoteOpen && <QuoteDialog onClose={() => setQuoteOpen(false)} onSave={save} />}
    </div>
  );
}
