'use client';

// Eleman listesi — birden fazla yazı/şekil üst üste binince tuvalden seçmek zorlaşır.
// Liste, çizim sırasının TERSİ gösterilir (en üstteki katman en üstte).

import { useStudioStore } from '@/store/studioStore';
import { useT } from '@/components/LocaleProvider';
import { elementLabel, textLines } from '@/lib/studio/model';

export default function LayerList() {
  const t = useT();
  const elements = useStudioStore((s) => s.elements);
  const selectedId = useStudioStore((s) => s.selectedId);
  const select = useStudioStore((s) => s.select);

  if (!elements.length) {
    return <p className="text-sm text-white/40">{t('studio.layersEmpty')}</p>;
  }

  return (
    <ul className="space-y-1">
      {[...elements].reverse().map((el) => {
        const active = el.id === selectedId;
        const lines = el.type === 'text' ? textLines(el) : null;
        const preview =
          el.type === 'text'
            ? `${lines[0] || '—'}${lines.length > 1 ? ` (+${lines.length - 1})` : ''}`
            : el.type === 'image'
              ? el.name || elementLabel(el)
              : elementLabel(el);

        return (
          <li key={el.id}>
            <button
              type="button"
              onClick={() => select(el.id)}
              className={`flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm transition ${
                active
                  ? 'border-[#7cc4ff]/60 bg-[#7cc4ff]/10 text-white'
                  : 'border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.07]'
              }`}
            >
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-sm border border-white/25"
                style={{ backgroundColor: el.type === 'image' ? '#48566b' : el.colorHex }}
              />
              <span className="truncate">{preview}</span>
              <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wide text-white/30">
                {el.type === 'text' ? `${el.heightCm}cm` : `${el.widthCm}×${el.heightCm}`}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
