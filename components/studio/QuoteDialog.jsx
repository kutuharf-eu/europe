'use client';

// Teklif formu. Gönderim sırası: önce tasarım kaydedilir (fiyat + önizleme sunucuda
// oluşur), sonra teklif talebi gönderilir → teklif her zaman bir tasarıma bağlıdır.

import { useState } from 'react';
import { useStudioStore } from '@/store/studioStore';
import { useT } from '@/components/LocaleProvider';
import { ownerToken } from '@/lib/studio/owner';

const field = 'w-full rounded-md bg-black/40 border border-white/12 px-3 py-2 text-sm text-white';
const label = 'block text-[11px] uppercase tracking-wide text-white/45 mb-1';

export default function QuoteDialog({ onClose, onSave }) {
  const t = useT();
  const designId = useStudioStore((s) => s.designId);
  const [form, setForm] = useState({ name: '', firma: '', email: '', telefon: '', nachricht: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      // Tasarımı önce kaydet — teklifte fiyat ve önizleme sunucudan gelsin.
      const id = (await onSave?.()) || designId;
      const res = await fetch('/api/studio/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, designId: id, ownerToken: ownerToken() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || t('studio.quoteError'));
        setStatus('error');
        return;
      }
      setStatus('sent');
    } catch {
      setError(t('studio.quoteError'));
      setStatus('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-xl border border-white/12 bg-[#0d1219] p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-white">{t('studio.quoteTitle', null, 'Angebot anfordern')}</h2>
          <button
            onClick={onClose}
            aria-label={t('studio.close', null, 'Schließen')}
            className="text-white/50 hover:text-white"
          >
            ✕
          </button>
        </div>

        {status === 'sent' ? (
          <div>
            <p className="text-sm text-emerald-300">{t('studio.quoteSent')}</p>
            <button onClick={onClose} className="mt-4 w-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white">
              {t('studio.close', null, 'Schließen')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="mb-4 text-xs leading-relaxed text-white/45">{t('studio.quoteIntro')}</p>

            <div className="mb-3">
              <span className={label}>{t('studio.qName', null, 'Name')} *</span>
              <input className={field} required maxLength={120} value={form.name} onChange={set('name')} />
            </div>
            <div className="mb-3">
              <span className={label}>{t('studio.qFirma', null, 'Firma')}</span>
              <input className={field} maxLength={160} value={form.firma} onChange={set('firma')} />
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div>
                <span className={label}>{t('studio.qEmail', null, 'E-Mail')} *</span>
                <input className={field} type="email" required maxLength={200} value={form.email} onChange={set('email')} />
              </div>
              <div>
                <span className={label}>{t('studio.qPhone', null, 'Telefon')}</span>
                <input className={field} maxLength={60} value={form.telefon} onChange={set('telefon')} />
              </div>
            </div>
            <div className="mb-4">
              <span className={label}>{t('studio.qMessage', null, 'Nachricht')}</span>
              <textarea className={`${field} min-h-[80px]`} maxLength={4000} value={form.nachricht} onChange={set('nachricht')} />
            </div>

            {error && <p className="mb-3 text-xs text-red-300">{error}</p>}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full rounded-md bg-accent px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              {status === 'sending' ? t('studio.sending', null, 'Wird gesendet…') : t('studio.send', null, 'Anfrage senden')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
