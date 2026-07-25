'use client';

import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-konva';
import { fontById, loadStudioFont } from '@/data/studio-fonts';
import { useStudioStore } from '@/store/studioStore';
import { nodeHandlers, visualProps } from './nodeHandlers';

// Tabelada "harf yüksekliği" = büyük harf (cap) yüksekliği, Konva'nın fontSize'ı ise
// em kutusudur. Yaklaşık oran; Faz 3'te public/glyphs verisiyle font başına netleşecek.
const CAP_RATIO = 0.72;

export default function TextNode({ el, scale, origin, isSelected, glowHex, onSelect, onChange, register }) {
  const ref = useRef(null);
  const font = fontById(el.fontId);
  const [fontTick, redraw] = useState(0);
  const setMeasured = useStudioStore((s) => s.setMeasured);

  useEffect(() => {
    register(el.id, ref.current);
    return () => register(el.id, null);
  }, [el.id, register]);

  // Font geç yüklenirse Konva yedek yazı tipiyle çizmiş olur → yüklenince yeniden çiz.
  useEffect(() => {
    let alive = true;
    loadStudioFont(el.fontId).then(() => alive && redraw((n) => n + 1));
    return () => {
      alive = false;
    };
  }, [el.fontId]);

  // Gerçek yazı ölçüsünü modele geri besle — hizalama ve "Geschätzt" değeri fonta
  // göre değişen gerçek genişliği kullansın. Eşik, yuvarlamadan doğan salınımı keser.
  useEffect(() => {
    const node = ref.current;
    if (!node || !scale) return;
    const wCm = node.width() / scale;
    const hCm = node.height() / scale;
    if (!Number.isFinite(wCm) || !Number.isFinite(hCm)) return;
    const dw = Math.abs((el.measuredWidthCm ?? -1) - wCm);
    const dh = Math.abs((el.measuredHeightCm ?? -1) - hCm);
    if (dw > 0.3 || dh > 0.3) setMeasured(el.id, { measuredWidthCm: wCm, measuredHeightCm: hCm });
  }, [
    el.id, el.text, el.fontId, el.heightCm, el.letterSpacingCm, el.lineGapCm,
    el.measuredWidthCm, el.measuredHeightCm, scale, fontTick, setMeasured,
  ]);

  const fontSize = (el.heightCm * scale) / CAP_RATIO;
  // Konva lineHeight fontSize'ın katıdır; bizim ölçümüz cm cinsinden satır aralığı.
  const lineHeight = el.heightCm > 0 ? ((el.heightCm + (el.lineGapCm || 0)) * CAP_RATIO) / el.heightCm : 1;

  return (
    <Text
      ref={ref}
      id={el.id}
      text={el.text}
      x={origin.x + el.xCm * scale}
      y={origin.y + el.yCm * scale}
      rotation={el.rotation}
      fontSize={fontSize}
      fontFamily={font?.family || 'sans-serif'}
      fontStyle={String(font?.weight || 400)}
      letterSpacing={(el.letterSpacingCm || 0) * scale}
      lineHeight={lineHeight}
      fill={el.colorHex}
      // em kutusunun üst boşluğunu kabaca düşerek yazının üst kenarını yCm'ye oturt.
      offsetY={fontSize * 0.14}
      draggable
      onClick={() => onSelect(el.id)}
      onTap={() => onSelect(el.id)}
      {...visualProps({ isSelected, glowHex })}
      {...nodeHandlers({ el, scale, origin, onChange })}
    />
  );
}
