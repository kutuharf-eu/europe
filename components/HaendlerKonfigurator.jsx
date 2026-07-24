'use client';
// KUTUHARF — Händler-Konfigurator. Aynı KonfiguratorTest bileşeni, ama haendlerMode=true ile:
// fiyat/sipariş istekleri token + haendlerContext gönderir → sunucu Händler kademe fiyatını döner.
// Erişim yalnız onaylı Händler'e açıktır (profile.status === 'approved'). Aksi halde giriş/uyarı.
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import KonfiguratorTest from '@/components/KonfiguratorTest';
import { useT } from '@/components/LocaleProvider';

export default function HaendlerKonfigurator() {
  const t = useT();
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
    return <div className="max-w-md mx-auto px-4 py-24 text-center text-white/60">…</div>;
  }

  // Giriş yok → Händlerbereich'e yönlendir
  if (!session) return <Gate title={t('account.gateLoginTitle')} msg={t('account.gateLoginMsg')} />;

  const status = profile?.status;
  if (status !== 'approved') {
    const msg = status === 'pending' ? t('account.gatePending')
      : status === 'rejected' ? t('account.gateRejected')
      : t('account.gateDefault');
    return <Gate title={t('account.gateNoAccessTitle')} msg={msg} />;
  }

  // Onaylı Händler → konfigüratör Händler modunda
  return (
    <>
      <div className="bg-black/30 border-b border-white/10 px-12 py-4 max-sm:px-6">
        <div className="max-w-[1180px] mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="inline-flex self-start items-center gap-1 bg-accentlite text-charcoal text-[12px] font-extrabold uppercase tracking-wide px-2.5 py-1">★ {t('nav.haendler', null, 'Händler')}</span>
            <p className="m-0 text-sm text-white/70">
              {profile?.firma ? `${profile.firma} · ` : ''}{t('account.haendlerKonditionen')}
            </p>
          </div>
          <Link href="/haendler" className="text-sm font-semibold text-white/80 hover:text-accentlite whitespace-nowrap">{t('account.myAccount')} →</Link>
        </div>
      </div>
      <main className="px-12 py-14 max-sm:px-6">
        <div className="max-w-[1180px] mx-auto">
          <KonfiguratorTest haendlerMode />
        </div>
      </main>
    </>
  );
}

function Gate({ title, msg }) {
  const t = useT();
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold text-white mb-2">{title}</h1>
      <p className="text-sm text-white/70 mb-6">{msg}</p>
      <Link href="/haendler" className="inline-block bg-accent text-white font-bold px-5 py-3">{t('account.gateBtn')}</Link>
    </div>
  );
}
