'use client';
// KUTUHARF — Händler-Konfigurator. Aynı KonfiguratorTest bileşeni, ama haendlerMode=true ile:
// fiyat/sipariş istekleri token + haendlerContext gönderir → sunucu Händler kademe fiyatını döner.
// Erişim yalnız onaylı Händler'e açıktır (profile.status === 'approved'). Aksi halde giriş/uyarı.
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import KonfiguratorTest from '@/components/KonfiguratorTest';

export default function HaendlerKonfigurator() {
  const [session, setSession] = useState(undefined); // undefined = yükleniyor
  const [profile, setProfile] = useState(undefined); // undefined = yükleniyor

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data?.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s || null));
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  useEffect(() => {
    if (session === undefined) return;
    if (!session?.user?.id) { setProfile(null); return; }
    supabase.from('kutuharf_profiles').select('status,firma,role').eq('id', session.user.id).single()
      .then(({ data }) => setProfile(data || null));
  }, [session]);

  // Yükleniyor
  if (session === undefined || (session && profile === undefined)) {
    return <div className="max-w-md mx-auto px-4 py-20 text-center text-textmut">…</div>;
  }

  // Giriş yok → Händlerbereich'e yönlendir
  if (!session) return <Gate title="Anmeldung erforderlich" msg="Bitte melden Sie sich mit Ihrem Händlerkonto an, um zu Händlerkonditionen zu konfigurieren." />;

  const status = profile?.status;
  if (status !== 'approved') {
    const msg = status === 'pending'
      ? 'Ihr Händlerzugang wird noch geprüft. Nach der Freigabe sehen Sie hier automatisch Ihre Händlerpreise.'
      : status === 'rejected'
      ? 'Ihr Zugang wurde nicht freigegeben. Bei Fragen: info@kutuharf.eu'
      : 'Für diesen Bereich ist ein freigeschaltetes Händlerkonto nötig.';
    return <Gate title="Kein Händlerzugang" msg={msg} />;
  }

  // Onaylı Händler → konfigüratör Händler modunda
  return (
    <div>
      <div className="bg-charcoal text-white px-6 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 bg-accentlite text-charcoal text-[12px] font-extrabold uppercase tracking-wide px-2.5 py-1">★ Händler</span>
            <p className="m-0 mt-1.5 text-sm text-white/70">
              {profile?.firma ? `${profile.firma} · ` : ''}Preise zu Ihren Händlerkonditionen.
            </p>
          </div>
          <Link href="/haendler" className="text-sm font-semibold text-white/80 hover:text-accentlite whitespace-nowrap">Mein Konto →</Link>
        </div>
      </div>
      <KonfiguratorTest haendlerMode />
    </div>
  );
}

function Gate({ title, msg }) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-extrabold text-charcoal mb-2">{title}</h1>
      <p className="text-sm text-textsec mb-6">{msg}</p>
      <Link href="/haendler" className="inline-block bg-accent text-white font-bold px-5 py-3">Zum Händlerbereich</Link>
    </div>
  );
}
