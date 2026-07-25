'use client';

// Zemin (tabela kasası): tür, ölçü, renk. Ölçü değişince öğelerin cm değerleri
// sabit kalır — sadece tuval ölçeği değişir (plan §3).

import { useStudioStore } from '@/store/studioStore';
import { useT } from '@/components/LocaleProvider';
import { SIGN_LIMITS } from '@/lib/studio/model';
import {
  STUDIO_BACKGROUNDS,
  BACKGROUND_COLORS,
  backgroundById,
} from '@/data/studio-backgrounds';
import ColorPicker from './ColorPicker';

const field = 'w-full rounded-md bg-black/40 border border-white/12 px-2 py-1.5 text-sm text-white';
const label = 'block text-[11px] uppercase tracking-wide text-white/40 mb-1';

export default function BackgroundPicker() {
  const t = useT();
  const sign = useStudioStore((s) => s.sign);
  const setSign = useStudioStore((s) => s.setSign);
  const bg = backgroundById(sign.kind);

  return (
    <div>
      <div className="mb-3">
        <span className={label}>{t('studio.signKind', null, 'Schildtyp')}</span>
        <select
          className={field}
          value={sign.kind}
          onChange={(e) => setSign({ kind: e.target.value })}
        >
          {STUDIO_BACKGROUNDS.map((b) => (
            <option key={b.id} value={b.id}>
              {t(`studio.bg.${b.id}`, null, b.label)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="mb-3">
          <span className={label}>{t('studio.signWidth', null, 'Breite (cm)')}</span>
          <input
            type="number"
            className={field}
            value={sign.widthCm}
            min={SIGN_LIMITS.minWidthCm}
            max={SIGN_LIMITS.maxWidthCm}
            onChange={(e) => setSign({ widthCm: Number(e.target.value) }, { tag: 'sign:w' })}
          />
        </div>
        <div className="mb-3">
          <span className={label}>{t('studio.signHeight', null, 'Höhe (cm)')}</span>
          <input
            type="number"
            className={field}
            value={sign.heightCm}
            min={SIGN_LIMITS.minHeightCm}
            max={SIGN_LIMITS.maxHeightCm}
            onChange={(e) => setSign({ heightCm: Number(e.target.value) }, { tag: 'sign:h' })}
          />
        </div>
      </div>

      {bg.colorizable && (
        <ColorPicker
          groups={[{ title: t('studio.signColor', null, 'Schildfarbe (RAL)'), colors: BACKGROUND_COLORS }]}
          value={sign.colorHex || bg.fill}
          onChange={(hex) => setSign({ colorHex: hex })}
        />
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-white/35">
        {t(
          'studio.signNote',
          null,
          'Schildfläche wird nicht online berechnet — sie wird im Angebot separat kalkuliert.'
        )}
      </p>
    </div>
  );
}
