'use client';
import { useState } from 'react';
import { CATEGORIES } from '@/data/categories';
import { useT } from '@/components/LocaleProvider';

const inputCls = 'p-3 text-base font-sans border border-inputline bg-white text-charcoal w-full';
const labelCls = 'flex flex-col gap-2 text-sm font-semibold text-charcoal';

export default function KontaktClient({ kategorie = '', produkt = '' }) {
  const t = useT();
  const [form, setForm] = useState({
    name: '',
    firma: '',
    email: '',
    telefon: '',
    kategorie,
    produkt,
    nachricht: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | ok | error
  const [errorMsg, setErrorMsg] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/anfrage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('ok');
      } else {
        setStatus('error');
        setErrorMsg(data.error || t('contact.genericError'));
      }
    } catch {
      setStatus('error');
      setErrorMsg(t('contact.connError'));
    }
  };

  return (
    <main>
      {/* Kopf */}
      <section className="bg-charcoal px-12 py-16 max-sm:px-6">
        <div className="max-w-[1100px] mx-auto flex flex-col gap-4">
          <span className="text-accent text-[15px] font-bold tracking-[0.08em] uppercase">{t('contact.kicker')}</span>
          <h1 className="m-0 text-4xl max-sm:text-3xl font-extrabold text-white">{t('contact.title')}</h1>
          <p className="m-0 text-lg leading-relaxed text-mutedark max-w-[720px]">
            {t('contact.intro')}
          </p>
        </div>
      </section>

      <section className="bg-sectionlight px-12 py-16 max-sm:px-6">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 min-[900px]:grid-cols-[1fr_1.6fr] gap-12 items-start">
          {/* Kontaktinfo */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-linegray p-6 flex flex-col gap-2">
              <span className="text-accent text-[13px] font-bold tracking-[0.08em] uppercase">{t('contact.phoneLabel')}</span>
              <a href="tel:+491749623344" className="text-xl font-bold text-charcoal hover:text-accent">
                +49 174 962 33 44
              </a>
              <span className="text-sm text-textmut">{t('contact.phoneHours')}</span>
            </div>
            <div className="bg-white border border-linegray p-6 flex flex-col gap-2">
              <span className="text-accent text-[13px] font-bold tracking-[0.08em] uppercase">{t('contact.emailLabel')}</span>
              <a href="mailto:info@kutuharf.eu" className="text-lg font-bold text-charcoal hover:text-accent break-all">
                info@kutuharf.eu
              </a>
              <span className="text-sm text-textmut">{t('contact.emailHint')}</span>
            </div>
            <div className="bg-white border border-linegray p-6 flex flex-col gap-2">
              <span className="text-accent text-[13px] font-bold tracking-[0.08em] uppercase">{t('contact.stepsLabel')}</span>
              <ol className="m-0 pl-5 text-[15px] leading-relaxed text-textsec flex flex-col gap-1.5">
                <li>{t('contact.step1')}</li>
                <li>{t('contact.step2')}</li>
                <li>{t('contact.step3')}</li>
                <li>{t('contact.step4')}</li>
              </ol>
            </div>
          </div>

          {/* Formular */}
          <form onSubmit={submit} className="bg-white border border-linegray p-8 flex flex-col gap-5">
            <h2 className="m-0 text-[24px] font-extrabold text-charcoal">{t('contact.formTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={labelCls}>
                {t('contact.name')} *
                <input required type="text" value={form.name} onChange={set('name')} className={inputCls} />
              </label>
              <label className={labelCls}>
                {t('contact.firma')}
                <input type="text" value={form.firma} onChange={set('firma')} className={inputCls} />
              </label>
              <label className={labelCls}>
                {t('contact.email')} *
                <input required type="email" value={form.email} onChange={set('email')} className={inputCls} />
              </label>
              <label className={labelCls}>
                {t('contact.telefon')}
                <input type="tel" value={form.telefon} onChange={set('telefon')} className={inputCls} />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={labelCls}>
                {t('contact.kategorie')}
                <select value={form.kategorie} onChange={set('kategorie')} className={inputCls}>
                  <option value="">{t('contact.choose')}</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {t(`cat.${c.slug}.title`, {}, c.title)}
                    </option>
                  ))}
                  <option value="sonstiges">{t('contact.sonstiges')}</option>
                </select>
              </label>
              <label className={labelCls}>
                {t('contact.produkt')}
                <input
                  type="text"
                  value={form.produkt}
                  onChange={set('produkt')}
                  placeholder={t('contact.produktPh')}
                  className={inputCls}
                />
              </label>
            </div>
            <label className={labelCls}>
              {t('contact.message')} *
              <textarea
                required
                rows={6}
                value={form.nachricht}
                onChange={set('nachricht')}
                placeholder={t('contact.messagePh')}
                className={inputCls}
              />
            </label>
            {status !== 'ok' && (
              <button
                type="submit"
                disabled={status === 'sending'}
                className="self-start kh-glow-btn bg-accent text-white text-base font-semibold px-8 py-4 border-none cursor-pointer hover:brightness-90 disabled:opacity-60 disabled:cursor-wait disabled:shadow-none"
              >
                {status === 'sending' ? t('contact.sending') : t('contact.send')}
              </button>
            )}
            {status === 'ok' && (
              <p className="m-0 text-[15px] font-semibold text-charcoal bg-sectionlight border border-linegray px-4 py-3">
                {t('contact.ok')}
              </p>
            )}
            {status === 'error' && (
              <p className="m-0 text-[15px] text-warnred">
                {errorMsg}{t('contact.errSuffix')}
                <a href="mailto:info@kutuharf.eu" className="text-accent">info@kutuharf.eu</a>.
              </p>
            )}
            <p className="m-0 text-[13px] text-textmut">
              {t('contact.privacy')}
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
