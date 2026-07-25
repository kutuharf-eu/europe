'use client';

// Hazır şablon şeridi. Şablon seçmek mevcut tasarımın ÜZERİNE yazar — üzerinde
// çalışılmış bir tasarım varsa önce onay istenir (geri alınabilir olsa da sürpriz
// olmasın diye).

import { useEffect, useState } from 'react';
import { useStudioStore } from '@/store/studioStore';
import { useT } from '@/components/LocaleProvider';

export default function TemplateBar() {
  const t = useT();
  const [templates, setTemplates] = useState([]);
  const elementCount = useStudioStore((s) => s.elements.length);
  const loadDesign = useStudioStore((s) => s.loadDesign);

  useEffect(() => {
    let alive = true;
    fetch('/api/studio/templates')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setTemplates(d?.templates || []))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!templates.length) return null;

  const apply = (tpl) => {
    if (elementCount && !window.confirm(t('studio.templateConfirm'))) return;
    // designId sıfırlanır: şablondan doğan çalışma yeni bir tasarımdır, mevcut
    // kaydın üzerine yazmaz.
    loadDesign(tpl.design, null);
  };

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/55">
          {t('studio.templates', null, 'Vorlagen')}
        </h2>
        <span className="text-[11px] text-white/30">{t('studio.templatesHint')}</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {templates.map((tpl) => (
          <button
            key={tpl.slug}
            onClick={() => apply(tpl)}
            className="shrink-0 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-left transition hover:border-white/30 hover:bg-white/10"
          >
            <span className="block text-sm font-semibold text-white/85">{tpl.title}</span>
            {tpl.branche && (
              <span className="block text-[11px] text-white/40">{tpl.branche}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
