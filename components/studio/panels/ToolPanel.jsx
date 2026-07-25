'use client';

// Sol panel — eleman ekleme, seçili elemanın düzenlenmesi, zemin ve aydınlatma.
// Fiyat kartı Faz 3'te sağ panelde.

import { useRef, useState } from 'react';
import { useStudioStore, useSelectedElement, useCanUndo, useCanRedo } from '@/store/studioStore';
import { useT } from '@/components/LocaleProvider';
import { STUDIO_FONTS } from '@/data/studio-fonts';
import {
  KONFIG_COLORS,
  KONFIG_RAL,
  KONFIG_LIGHT_COLORS,
  KONFIG_CONSTRUCTIONS,
  KONFIG_LIGHTING,
  KONFIG_MONTAGE,
} from '@/data/konfigurator';
import {
  TEXT_LIMITS,
  SHAPE_LIMITS,
  shapeLimitsFor,
  elementLabel,
  elementSizeCm,
  textLines,
} from '@/lib/studio/model';
import { uploadStudioImage } from '@/lib/studio/uploadImage';
import BackgroundPicker from '@/components/studio/controls/BackgroundPicker';
import ColorPicker from '@/components/studio/controls/ColorPicker';
import LayerList from '@/components/studio/panels/LayerList';

const btn =
  'px-3 py-2 rounded-md text-sm border border-white/12 bg-white/5 text-white/85 hover:bg-white/10 disabled:opacity-35 disabled:hover:bg-white/5 transition';
const field = 'w-full rounded-md bg-black/40 border border-white/12 px-2 py-1.5 text-sm text-white';
const label = 'block text-[11px] uppercase tracking-wide text-white/40 mb-1';

export default function ToolPanel() {
  const t = useT();
  const fileRef = useRef(null);
  const [imgStatus, setImgStatus] = useState('idle'); // idle | uploading | error
  const addText = useStudioStore((s) => s.addText);
  const addShape = useStudioStore((s) => s.addShape);
  const addImage = useStudioStore((s) => s.addImage);
  const updateElement = useStudioStore((s) => s.updateElement);
  const removeElement = useStudioStore((s) => s.removeElement);
  const duplicateElement = useStudioStore((s) => s.duplicateElement);
  const moveLayer = useStudioStore((s) => s.moveLayer);
  const alignElement = useStudioStore((s) => s.alignElement);
  const clearAll = useStudioStore((s) => s.clearAll);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const count = useStudioStore((s) => s.elements.length);
  const lighting = useStudioStore((s) => s.lighting);
  const setLighting = useStudioStore((s) => s.setLighting);
  const night = useStudioStore((s) => s.view.night);
  const setNightView = useStudioStore((s) => s.setNightView);
  const product = useStudioStore((s) => s.product);
  const setProduct = useStudioStore((s) => s.setProduct);
  const construction = KONFIG_CONSTRUCTIONS.find((c) => c.id === product.constructionId);
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const el = useSelectedElement();

  // Görsel önce yerel önizlemeyle eklenir (anında görünür), ardından arka planda
  // Storage'a yüklenip src kalıcı URL ile değiştirilir — yoksa kaydedilen tasarım
  // yeniden açıldığında görsel kaybolur.
  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const localSrc = URL.createObjectURL(file);
    const probe = new window.Image();
    probe.onload = async () => {
      const ratio = probe.height / probe.width || 1;
      const widthCm = 40;
      const id = addImage({
        src: localSrc,
        name: file.name,
        widthCm,
        heightCm: Math.max(SHAPE_LIMITS.minCm, Math.round(widthCm * ratio)),
      });

      setImgStatus('uploading');
      try {
        const url = await uploadStudioImage(file);
        // Yükleme kullanıcı eylemi değil → undo adımı üretmez.
        updateElement(id, { src: url }, { history: false });
        setImgStatus('idle');
      } catch {
        setImgStatus('error');
      }
    };
    probe.src = localSrc;
  };

  const patch = (p, opts) => el && updateElement(el.id, p, opts);
  // Çubuğun sınırları logodan farklı — 5 cm'e kadar ince olabilir.
  const limits = shapeLimitsFor(el?.type === 'shape' ? el.kind : 'image');

  const colorGroups = [
    { title: t('studio.colorAcryl', null, 'Acryl'), colors: KONFIG_COLORS.plexiglas },
    { title: t('studio.colorChrome', null, 'Chrom/Edelstahl'), colors: KONFIG_COLORS.chrome },
    {
      title: t('studio.colorRal', null, 'RAL-Töne'),
      colors: KONFIG_RAL.map((r) => ({ id: r.code, label: `${r.code} · ${r.label}`, hex: r.hex })),
    },
  ];

  return (
    <aside className="w-[280px] shrink-0 max-lg:w-full">
      <Section title={t('studio.add', null, 'Hinzufügen')}>
        <div className="grid grid-cols-2 gap-2">
          <button className={btn} onClick={() => addText()}>{t('studio.addText', null, 'Schriftzug')}</button>
          <button className={btn} onClick={() => addShape('rect')}>{t('studio.addRect', null, 'Rechteck')}</button>
          <button className={btn} onClick={() => addShape('circle')}>{t('studio.addCircle', null, 'Kreis')}</button>
          <button className={btn} onClick={() => addShape('star')}>{t('studio.addStar', null, 'Stern')}</button>
          <button className={btn} onClick={() => addShape('bar')}>{t('studio.addBar', null, 'Leuchtbalken')}</button>
          <button className={btn} onClick={() => fileRef.current?.click()}>{t('studio.addImage', null, 'Bild/Logo')}</button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={onPickImage}
        />
        {imgStatus === 'uploading' && (
          <p className="mt-2 text-[11px] text-white/40">{t('studio.imageUploading')}</p>
        )}
        {imgStatus === 'error' && (
          <p className="mt-2 text-[11px] text-amber-300/80">{t('studio.imageUploadError')}</p>
        )}
      </Section>

      <Section title={`${t('studio.layers', null, 'Elemente')}${count ? ` (${count})` : ''}`}>
        <LayerList />
      </Section>

      <Section title={t('studio.edit', null, 'Bearbeiten')}>
        <div className="flex gap-2">
          <button className={btn} onClick={undo} disabled={!canUndo}>↶ {t('studio.undo', null, 'Rückgängig')}</button>
          <button className={btn} onClick={redo} disabled={!canRedo}>↷ {t('studio.redo', null, 'Wiederholen')}</button>
        </div>
        <button className={`${btn} mt-2 w-full`} onClick={clearAll} disabled={!count}>
          {t('studio.clearAll', null, 'Alles löschen')}
        </button>
      </Section>

      {el ? (
        <Section title={elementLabel(el)}>
          {el.type === 'text' && (
            <>
              <div className="mb-1">
                <span className={label}>{t('studio.text', null, 'Text')}</span>
                {/* Çok satır: her satır üretimde ayrı montaj sırası, Faz 3'te ayrı kalem. */}
                <textarea
                  className={`${field} min-h-[64px] resize-y leading-snug`}
                  value={el.text}
                  rows={Math.min(TEXT_LIMITS.maxLines, textLines(el).length + 1)}
                  onChange={(e) => patch({ text: e.target.value }, { tag: `${el.id}:text` })}
                />
              </div>
              <p className="mb-3 text-[11px] text-white/35">
                {t('studio.textMultiline', { n: TEXT_LIMITS.maxLines })}
              </p>
              <div className="mb-3">
                <span className={label}>{t('studio.font', null, 'Schriftart')}</span>
                <select className={field} value={el.fontId} onChange={(e) => patch({ fontId: e.target.value })}>
                  {STUDIO_FONTS.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>
              <NumberRow
                labelText={t('studio.letterHeight', { min: TEXT_LIMITS.minHeightCm, max: TEXT_LIMITS.maxHeightCm })}
                value={el.heightCm}
                min={TEXT_LIMITS.minHeightCm}
                max={TEXT_LIMITS.maxHeightCm}
                onChange={(v) => patch({ heightCm: v }, { tag: `${el.id}:h` })}
              />

              <div className="grid grid-cols-2 gap-2">
                {/* Harf arası: negatif = sıkıştır, pozitif = aç. Montaj şablonunu ve
                    toplam genişliği doğrudan etkiler. */}
                <NumberRow
                  labelText={t('studio.letterSpacing', null, 'Buchstabenabstand (cm)')}
                  value={el.letterSpacingCm ?? 0}
                  min={TEXT_LIMITS.minSpacingCm}
                  max={TEXT_LIMITS.maxSpacingCm}
                  step={0.5}
                  onChange={(v) => patch({ letterSpacingCm: v }, { tag: `${el.id}:ls` })}
                />
                {textLines(el).length > 1 && (
                  <NumberRow
                    labelText={t('studio.lineGap', null, 'Zeilenabstand (cm)')}
                    value={el.lineGapCm ?? 5}
                    min={0}
                    max={TEXT_LIMITS.maxLineGapCm}
                    onChange={(v) => patch({ lineGapCm: v }, { tag: `${el.id}:lg` })}
                  />
                )}
              </div>

              <p className="-mt-1 mb-3 text-[11px] text-white/40">
                {/* Tuval ölçtüyse gerçek değer, yoksa fonta göre tahmin. */}
                {t('studio.estSize', {
                  w: Math.round(elementSizeCm(el).widthCm),
                  h: Math.round(elementSizeCm(el).heightCm),
                })}
              </p>
            </>
          )}

          {el.type !== 'text' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <NumberRow
                  labelText={t('studio.width', null, 'Breite (cm)')}
                  value={el.widthCm}
                  min={limits.minWidthCm}
                  max={limits.maxWidthCm}
                  onChange={(v) => patch({ widthCm: v }, { tag: `${el.id}:w` })}
                />
                <NumberRow
                  labelText={t('studio.height', null, 'Höhe (cm)')}
                  value={el.heightCm}
                  min={limits.minHeightCm}
                  max={limits.maxHeightCm}
                  onChange={(v) => patch({ heightCm: v }, { tag: `${el.id}:h` })}
                />
              </div>

              {/* Köşe yuvarlaklığı yalnız köşeli formlarda anlamlı. */}
              {el.type === 'shape' && (el.kind === 'rect' || el.kind === 'bar') && (
                <NumberRow
                  labelText={t('studio.cornerRadius', null, 'Eckenradius (cm)')}
                  value={el.cornerRadiusCm ?? 0}
                  min={0}
                  max={Math.min(el.widthCm, el.heightCm) / 2}
                  step={0.5}
                  onChange={(v) => patch({ cornerRadiusCm: v }, { tag: `${el.id}:cr` })}
                />
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-2">
            <NumberRow labelText={t('studio.posX', null, 'X (cm)')} value={el.xCm} onChange={(v) => patch({ xCm: v }, { tag: `${el.id}:x` })} />
            <NumberRow labelText={t('studio.posY', null, 'Y (cm)')} value={el.yCm} onChange={(v) => patch({ yCm: v }, { tag: `${el.id}:y` })} />
          </div>
          <NumberRow
            labelText={t('studio.rotation', null, 'Drehung (°)')}
            value={el.rotation}
            min={-180}
            max={180}
            onChange={(v) => patch({ rotation: v }, { tag: `${el.id}:r` })}
          />

          {/* Görselin rengi tuvalde değiştirilmiyor — kendi renkleriyle çizilir. */}
          {el.type !== 'image' && (
            <div className="mt-1">
              <span className={label}>{t('studio.color', null, 'Farbe')}</span>
              <ColorPicker groups={colorGroups} value={el.colorHex} onChange={(hex) => patch({ colorHex: hex })} />
            </div>
          )}

          {/* Zemine hizalama — sol/orta/sağ ve üst/orta/alt. */}
          <div className="mt-1">
            <span className={label}>{t('studio.align', null, 'Ausrichten')}</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                ['left', '⇤', t('studio.alignLeft', null, 'Links')],
                ['centerX', '↔', t('studio.alignCenterX', null, 'Horizontal zentriert')],
                ['right', '⇥', t('studio.alignRight', null, 'Rechts')],
                ['top', '⇧', t('studio.alignTop', null, 'Oben')],
                ['middleY', '↕', t('studio.alignMiddleY', null, 'Vertikal zentriert')],
                ['bottom', '⇩', t('studio.alignBottom', null, 'Unten')],
              ].map(([mode, icon, title]) => (
                <button
                  key={mode}
                  className={`${btn} !px-2 text-base leading-none`}
                  title={title}
                  aria-label={title}
                  onClick={() => alignElement(el.id, mode)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className={btn} onClick={() => moveLayer(el.id, 'up')}>{t('studio.toFront', null, 'Nach vorne')}</button>
            <button className={btn} onClick={() => moveLayer(el.id, 'down')}>{t('studio.toBack', null, 'Nach hinten')}</button>
            <button className={btn} onClick={() => duplicateElement(el.id)}>{t('studio.duplicate', null, 'Duplizieren')}</button>
            <button
              className={`${btn} !border-red-400/30 !text-red-200 hover:!bg-red-500/10`}
              onClick={() => removeElement(el.id)}
            >
              {t('studio.delete', null, 'Löschen')}
            </button>
          </div>
        </Section>
      ) : (
        <Section title={t('studio.selection', null, 'Auswahl')}>
          <p className="text-sm text-white/45">{t('studio.noSelection')}</p>
        </Section>
      )}

      <Section title={t('studio.sign', null, 'Schild')}>
        <BackgroundPicker />
      </Section>

      {/* Fiyatın temel belirleyicileri: konstrüksiyon taban fiyatı + aydınlatma katsayısı. */}
      <Section title={t('studio.construction', null, 'Ausführung')}>
        <div className="mb-3">
          <select
            className={field}
            value={product.constructionId}
            onChange={(e) => setProduct({ constructionId: e.target.value })}
          >
            {KONFIG_CONSTRUCTIONS.filter((c) =>
              lighting.lit ? c.allowed.some((a) => a !== 'none') : c.allowed.includes('none')
            ).map((c) => (
              <option key={c.id} value={c.id}>
                {t(`studio.constructions.${c.id}`, null, c.label)}
              </option>
            ))}
          </select>
        </div>

        {lighting.lit && (
          <div className="mb-3">
            <span className={label}>{t('studio.lightingType', null, 'Beleuchtungsart')}</span>
            <select
              className={field}
              value={product.lightingId}
              onChange={(e) => setProduct({ lightingId: e.target.value })}
            >
              {KONFIG_LIGHTING.filter((l) => construction?.allowed.includes(l.id)).map((l) => (
                <option key={l.id} value={l.id}>
                  {t(`studio.lightings.${l.id}`, null, l.label)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <span className={label}>{t('studio.montage', null, 'Montage')}</span>
          <select
            className={field}
            value={product.montageId}
            onChange={(e) => setProduct({ montageId: e.target.value })}
          >
            {KONFIG_MONTAGE.map((m) => (
              <option key={m.id} value={m.id}>
                {t(`studio.montages.${m.id}`, null, m.label)}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title={t('studio.lighting', null, 'Beleuchtung')}>
        <label className="mb-3 flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={lighting.lit}
            onChange={(e) => setLighting({ lit: e.target.checked })}
            className="h-4 w-4 accent-[#7cc4ff]"
          />
          {t('studio.lit', null, 'Beleuchtet (LED)')}
        </label>

        {lighting.lit && (
          <div className="mb-3">
            <span className={label}>{t('studio.lightColor', null, 'Lichtfarbe')}</span>
            <select
              className={field}
              value={lighting.lightColor}
              onChange={(e) => setLighting({ lightColor: e.target.value })}
            >
              {KONFIG_LIGHT_COLORS.map((c) => (
                <option key={c.id} value={c.id}>
                  {t(`studio.lightColors.${c.id}`, null, c.label)}
                </option>
              ))}
            </select>
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={night}
            onChange={(e) => setNightView(e.target.checked)}
            className="h-4 w-4 accent-[#7cc4ff]"
          />
          {t('studio.nightView', null, 'Nachtansicht')}
        </label>
      </Section>
    </aside>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-4 rounded-xl border border-white/10 bg-black/25 p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/55">{title}</h2>
      {children}
    </div>
  );
}

function NumberRow({ labelText, value, min, max, step = 1, onChange }) {
  return (
    <div className="mb-3">
      <span className={label}>{labelText}</span>
      <input
        type="number"
        className={field}
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(v);
        }}
      />
    </div>
  );
}
