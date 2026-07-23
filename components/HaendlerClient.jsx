'use client';
// KUTUHARF — Händlerbereich: Anmeldung, Registrierung, Kontostatus.
// Registrierung geht an /api/haendler/register (Server legt Auth-User + Profil an,
// Status 'pending'). Anmeldung via Supabase Auth direkt. Nach Freigabe durch den
// Admin sieht der Händler im Konfigurator automatisch seine Händlerpreise.
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';

const inputCls = 'p-3 text-base font-sans border border-inputline bg-white text-charcoal w-full';
const labelCls = 'flex flex-col gap-1.5 text-sm font-semibold text-charcoal';
const btnCls = 'bg-accent text-white font-bold px-5 py-3 cursor-pointer disabled:opacity-40 transition';

export default function HaendlerClient() {
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
    supabase.from('kutuharf_profiles').select('status,firma,role').eq('id', session.user.id).single()
      .then(({ data }) => setProfile(data || null));
  }, [session]);

  if (session === undefined) {
    return <div className="max-w-md mx-auto px-4 py-20 text-center text-textmut">…</div>;
  }

  if (session) return <Konto session={session} profile={profile} />;

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <h1 className="text-2xl font-extrabold text-charcoal mb-1">Händlerbereich</h1>
      <p className="text-sm text-textmut mb-6">Für Werbeagenturen & Wiederverkäufer — Preise zu Händlerkonditionen.</p>

      <div className="flex border border-inputline mb-6">
        {[['login', 'Anmelden'], ['register', 'Registrieren']].map(([id, label]) => (
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setBusy(false);
    if (error) setErr('Anmeldung fehlgeschlagen. E-Mail oder Passwort prüfen.');
    // Erfolg → onAuthStateChange rendert Konto-Ansicht.
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className={labelCls}>E-Mail
        <input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </label>
      <label className={labelCls}>Passwort
        <input type="password" required className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      </label>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button type="submit" disabled={busy} className={btnCls}>{busy ? 'Anmelden…' : 'Anmelden'}</button>
    </form>
  );
}

function RegisterForm({ onDone }) {
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
      else setErr(data.error || 'Registrierung fehlgeschlagen.');
    } catch { setErr('Netzwerkfehler. Bitte erneut versuchen.'); }
    setBusy(false);
  };

  if (ok) {
    return (
      <div className="border border-accent/40 bg-accent/5 p-5">
        <p className="font-bold text-charcoal mb-1">Anfrage eingegangen ✓</p>
        <p className="text-sm text-textsec">Wir prüfen Ihre Angaben und schalten Ihren Zugang frei. Sie erhalten eine E-Mail, sobald Sie sich mit Händlerpreisen anmelden können.</p>
        <button onClick={onDone} className="mt-4 text-sm font-bold text-accent cursor-pointer">→ Zur Anmeldung</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className={labelCls}>Firma
        <input required className={inputCls} value={f.firma} onChange={set('firma')} />
      </label>
      <label className={labelCls}>USt-IdNr
        <input required className={inputCls} value={f.ustId} onChange={set('ustId')} placeholder="DE…" />
      </label>
      <label className={labelCls}>Telefon
        <input required className={inputCls} value={f.telefon} onChange={set('telefon')} autoComplete="tel" />
      </label>
      <label className={labelCls}>E-Mail
        <input type="email" required className={inputCls} value={f.email} onChange={set('email')} autoComplete="email" />
      </label>
      <label className={labelCls}>Passwort (mind. 8 Zeichen)
        <input type="password" required minLength={8} className={inputCls} value={f.password} onChange={set('password')} autoComplete="new-password" />
      </label>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button type="submit" disabled={busy} className={btnCls}>{busy ? 'Senden…' : 'Registrierung absenden'}</button>
      <p className="text-xs text-textmut">Nach Prüfung durch unser Team wird Ihr Zugang freigeschaltet.</p>
    </form>
  );
}

function Konto({ session, profile }) {
  const status = profile?.status;
  const logout = () => supabase.auth.signOut();

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <h1 className="text-2xl font-extrabold text-charcoal mb-1">Mein Händlerkonto</h1>
      <p className="text-sm text-textmut mb-6">{session.user.email}</p>

      {status === 'approved' && (
        <div className="border border-green-600/40 bg-green-50 p-5 mb-6">
          <p className="font-bold text-green-800 mb-1">Zugang aktiv ✓</p>
          <p className="text-sm text-green-900">Im Konfigurator sehen Sie automatisch Ihre <strong>Händlerpreise</strong>.</p>
          <Link href="/" className="inline-block mt-4 bg-accent text-white font-bold px-5 py-2.5">Zum Konfigurator</Link>
        </div>
      )}
      {status === 'pending' && (
        <div className="border border-amber-500/40 bg-amber-50 p-5 mb-6">
          <p className="font-bold text-amber-800 mb-1">In Prüfung</p>
          <p className="text-sm text-amber-900">Ihre Anfrage wird bearbeitet. Sie erhalten eine E-Mail nach der Freigabe.</p>
        </div>
      )}
      {status === 'rejected' && (
        <div className="border border-red-500/40 bg-red-50 p-5 mb-6">
          <p className="font-bold text-red-800 mb-1">Nicht freigegeben</p>
          <p className="text-sm text-red-900">Bei Fragen: info@kutuharf.eu</p>
        </div>
      )}
      {!profile && (
        <div className="border border-inputline p-5 mb-6">
          <p className="text-sm text-textsec">Kein Händlerprofil gefunden.</p>
        </div>
      )}

      <button onClick={logout} className="text-sm font-bold text-textsec cursor-pointer">Abmelden</button>
    </div>
  );
}
