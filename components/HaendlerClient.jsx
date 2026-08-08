'use client';
// KUTUHARF — Händlerbereich: Anmeldung, Registrierung, Kontostatus.
// Registrierung geht an /api/haendler/register (Server legt Auth-User + Profil an,
// Status 'pending'). Anmeldung via Supabase Auth direkt. Nach Freigabe durch den
// Admin sieht der Händler im Konfigurator automatisch seine Händlerpreise.
import { useState, useEffect } from 'react';
import PasswordInput from '@/components/PasswordInput';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { useT } from '@/components/LocaleProvider';
import { useCartStore } from '@/store/cartStore';

const inputCls = 'p-3 text-base font-sans border border-inputline bg-white text-charcoal w-full';
const labelCls = 'flex flex-col gap-1.5 text-sm font-semibold text-charcoal';
const btnCls = 'bg-accent text-white font-bold px-5 py-3 cursor-pointer disabled:opacity-40 transition';

export default function HaendlerClient() {
  const t = useT();
  const [session, setSession] = useState(undefined); // undefined = yükleniyor
  const [profile, setProfile] = useState(null);
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data?.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s || null));
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  // Oturum açıkken kendi profilini oku (RLS: yalnız kendi satırı)
  useEffect(() => {
    if (!session?.user?.id) { setProfile(null); return; }
    supabase.from('kutuharf_profiles').select('status,firma,role,ust_id,telefon,created_at').eq('id', session.user.id).single()
      .then(({ data }) => setProfile(data || null));
  }, [session]);

  if (session === undefined) {
    return <div className="max-w-md mx-auto px-4 py-20 text-center text-textmut">…</div>;
  }

  if (session) return <Konto session={session} profile={profile} />;

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <h1 className="text-2xl font-extrabold text-charcoal mb-1">{t('account.areaTitle')}</h1>
      <p className="text-sm text-textmut mb-6">{t('account.areaSubtitle')}</p>

      <div className="flex border border-inputline mb-6">
        {[['login', t('account.tabLogin')], ['register', t('account.tabRegister')]].map(([id, label]) => (
          <button key={id} onClick={() => setMode(id)}
            className={`flex-1 py-2.5 text-sm font-bold cursor-pointer transition ${mode === id ? 'bg-accent text-white' : 'bg-white text-textsec hover:bg-gray-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {mode === 'login' ? <LoginForm /> : <RegisterForm onDone={() => setMode('login')} />}
    </div>
  );
}

function LoginForm() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setBusy(false);
    if (error) setErr(t('auth.loginError'));
    // Erfolg → onAuthStateChange rendert Konto-Ansicht.
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className={labelCls}>{t('auth.email')}
        <input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </label>
      <label className={labelCls}>{t('auth.password')}
        <PasswordInput required className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
          showLabel={t('auth.showPw')} hideLabel={t('auth.hidePw')} />
      </label>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button type="submit" disabled={busy} className={btnCls}>{busy ? t('auth.signingIn') : t('auth.signIn')}</button>
    </form>
  );
}

function RegisterForm({ onDone }) {
  const t = useT();
  const [f, setF] = useState({ firma: '', ustId: '', telefon: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/haendler/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setOk(true);
      else setErr(data.error || t('account.regFail'));
    } catch { setErr(t('account.regNet')); }
    setBusy(false);
  };

  if (ok) {
    return (
      <div className="border border-accent/40 bg-accent/5 p-5">
        <p className="font-bold text-charcoal mb-1">{t('account.regDoneTitle')}</p>
        <p className="text-sm text-textsec">{t('account.regDoneMsg')}</p>
        <button onClick={onDone} className="mt-4 text-sm font-bold text-accent cursor-pointer">{t('account.regToLogin')}</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className={labelCls}>{t('account.firma')}
        <input required className={inputCls} value={f.firma} onChange={set('firma')} />
      </label>
      <label className={labelCls}>{t('account.regUstId')}
        <input required className={inputCls} value={f.ustId} onChange={set('ustId')} placeholder="DE…" />
      </label>
      <label className={labelCls}>{t('account.telefon')}
        <input required className={inputCls} value={f.telefon} onChange={set('telefon')} autoComplete="tel" />
      </label>
      <label className={labelCls}>{t('auth.email')}
        <input type="email" required className={inputCls} value={f.email} onChange={set('email')} autoComplete="email" />
      </label>
      <label className={labelCls}>{t('account.regPw')}
        <PasswordInput required minLength={8} className={inputCls} value={f.password} onChange={set('password')} autoComplete="new-password"
          showLabel={t('auth.showPw')} hideLabel={t('auth.hidePw')} />
      </label>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button type="submit" disabled={busy} className={btnCls}>{busy ? t('account.regSending') : t('account.regSubmit')}</button>
      <p className="text-xs text-textmut">{t('account.regHint')}</p>
    </form>
  );
}

function Konto({ session, profile }) {
  const t = useT();
  const status = profile?.status;
  const cartClear = useCartStore((s) => s.clear);
  const cartIsHaendler = useCartStore((s) => s.haendlerMode);
  // Çıkışta Händler-sepeti temizlenir: token gidince fiyatlar standart'a döneceğinden
  // sepette kalan Händler-fiyatlı kalemler tutarsızlık yaratmasın (B2C sepetine dokunulmaz).
  const logout = () => { if (cartIsHaendler) cartClear(); supabase.auth.signOut(); };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  // Durum rozeti (renk + etiket). Kademe (haendler_tier) BİLİNÇLİ gösterilmez.
  const statusBadge = {
    approved: { cls: 'bg-green-100 text-green-800 border-green-600/30', label: t('account.stApproved') },
    pending: { cls: 'bg-amber-100 text-amber-800 border-amber-500/30', label: t('account.stPending') },
    rejected: { cls: 'bg-red-100 text-red-800 border-red-500/30', label: t('account.stRejected') },
  }[status] || { cls: 'bg-gray-100 text-gray-600 border-gray-300', label: '—' };

  const Row = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2.5 border-b border-inputline last:border-0">
      <dt className="text-sm text-textmut flex-shrink-0">{label}</dt>
      <dd className="m-0 text-sm font-semibold text-charcoal text-right break-all">{value || '—'}</dd>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-14">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-extrabold text-charcoal m-0">{t('account.myAccount')}</h1>
        <span className={`inline-flex items-center text-[12px] font-extrabold uppercase tracking-wide px-2.5 py-1 border ${statusBadge.cls}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Durum bandı */}
      {status === 'approved' && (
        <div className="border border-green-600/40 bg-green-50 p-5 mb-6">
          <p className="font-bold text-green-800 mb-1">{t('account.stApproved')} ✓</p>
          <p className="text-sm text-green-900">{t('account.approvedMsg')}</p>
          <Link href="/haendler/konfigurator" className="inline-block mt-4 bg-accent text-white font-bold px-5 py-2.5">{t('account.toKonfig')}</Link>
        </div>
      )}
      {status === 'pending' && (
        <div className="border border-amber-500/40 bg-amber-50 p-5 mb-6">
          <p className="font-bold text-amber-800 mb-1">{t('account.stPending')}</p>
          <p className="text-sm text-amber-900">{t('account.pendingMsg')}</p>
        </div>
      )}
      {status === 'rejected' && (
        <div className="border border-red-500/40 bg-red-50 p-5 mb-6">
          <p className="font-bold text-red-800 mb-1">{t('account.stRejected')}</p>
          <p className="text-sm text-red-900">{t('account.rejectedMsg')}</p>
        </div>
      )}

      {/* Tüm Händler bilgileri */}
      <div className="border border-inputline bg-white p-5 mb-6">
        <h2 className="text-base font-extrabold text-charcoal mt-0 mb-2">{t('account.myData')}</h2>
        <dl className="m-0">
          <Row label={t('account.firma')} value={profile?.firma} />
          <Row label={t('account.email')} value={session.user.email} />
          <Row label={t('account.steuer')} value={profile?.ust_id} />
          <Row label={t('account.telefon')} value={profile?.telefon} />
          <Row label={t('account.statusTitle')} value={statusBadge.label} />
          {memberSince && <Row label={t('account.memberSince')} value={memberSince} />}
        </dl>
      </div>

      {!profile && (
        <div className="border border-inputline p-5 mb-6">
          <p className="text-sm text-textsec">Kein Händlerprofil gefunden.</p>
        </div>
      )}

      <button onClick={logout} className="text-sm font-bold text-textsec cursor-pointer">{t('account.logout')}</button>
    </div>
  );
}
