'use client';

// Stüdyo kabuğu — 3 panel iskeleti (sol araçlar / orta tuval / sağ fiyat).
// Faz 1: sol panel + tuval çalışıyor. Sağ panel Faz 3'te canlı fiyat kartı olacak.
// Konva SSR'da çalışmadığı için tuval dinamik yüklenir.

import dynamic from 'next/dynamic';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import ToolPanel from '@/components/studio/panels/ToolPanel';
import PricePanel from '@/components/studio/panels/PricePanel';
import DesignActions from '@/components/studio/panels/DesignActions';
import TemplateBar from '@/components/studio/panels/TemplateBar';
import { ownerToken } from '@/lib/studio/owner';
import { useEffect } from 'react';
import { useStudioStore } from '@/store/studioStore';
import { useT } from '@/components/LocaleProvider';

const StudioCanvas = dynamic(() => import('@/components/studio/StudioCanvas'), {
  ssr: false,
  loading: () => <div className="h-[320px] rounded-lg bg-white/5 animate-pulse" />,
});

export default function StudioClient() {
  const t = useT();
  const night = useStudioStore((s) => s.view.night);
  const loadDesign = useStudioStore((s) => s.loadDesign);

  // ?d=<id> ile gelinirse kaydedilmiş tasarım yüklenir — yalnız aynı tarayıcının
  // owner_token'ı eşleşiyorsa (başkasının tasarımı açılamaz).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('d');
    const token = id ? ownerToken() : null;
    if (!id || !token) return;
    let alive = true;
    fetch(`/api/studio/design?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.design?.design) loadDesign(d.design.design, d.design.id);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [loadDesign]);

  return (
    <div className="theme-studio min-h-screen bg-sectionlight text-charcoal">
      <div className="h-2 bg-accent" />
      <SiteNav />

      <main className="px-12 py-10 max-sm:px-4">
        <div className="mx-auto max-w-[1400px]">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-white">{t('studio.title', null, 'Schilder-Designer')}</h1>
            <p className="mt-1 text-sm text-white/55">{t('studio.subtitle')}</p>
          </header>

          <TemplateBar />

          <div className="flex gap-6 max-lg:flex-col">
            <ToolPanel />

            <div className="min-w-0 flex-1">
              {/* Gece önizlemesinde tuvalin çevresi de kararır — ışık etkisi belli olsun. */}
              <div
                className={`rounded-xl border p-4 transition-colors ${
                  night ? 'border-white/5 bg-[#05070c]' : 'border-white/10 bg-black/20'
                }`}
              >
                <StudioCanvas />
              </div>
            </div>

            <aside className="w-[300px] shrink-0 max-lg:w-full">
              <PricePanel />
              <DesignActions />
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
