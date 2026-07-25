'use client';

// Konva tuvali — SADECE çizer ve kullanıcı hareketlerini cm modeline yazar.
// İş mantığı store'da (store/studioStore.js), eleman modeli renderer'dan bağımsız
// (lib/studio/model.js) — ileride SVG/DXF üretim çıktısı eklenebilsin diye.
// SSR'da 'canvas' modülü patlar → bu dosya yalnız dynamic(ssr:false) ile yüklenir.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { useStudioStore } from '@/store/studioStore';
import { useT } from '@/components/LocaleProvider';
import { signRect } from '@/lib/studio/geometry';
import { backgroundById, LIGHT_GLOW_HEX } from '@/data/studio-backgrounds';
import TextNode from './nodes/TextNode';
import ShapeNode from './nodes/ShapeNode';
import ImageNode from './nodes/ImageNode';

const NODE_BY_TYPE = { text: TextNode, shape: ShapeNode, image: ImageNode };

export default function StudioCanvas() {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const trRef = useRef(null);
  const nodeRefs = useRef(new Map());
  const [size, setSize] = useState({ width: 0, height: 0 });

  const t = useT();
  const sign = useStudioStore((s) => s.sign);
  const lighting = useStudioStore((s) => s.lighting);
  const night = useStudioStore((s) => s.view.night);
  const elements = useStudioStore((s) => s.elements);
  const selectedId = useStudioStore((s) => s.selectedId);
  const select = useStudioStore((s) => s.select);
  const updateElement = useStudioStore((s) => s.updateElement);
  const removeElement = useStudioStore((s) => s.removeElement);
  const duplicateElement = useStudioStore((s) => s.duplicateElement);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const setPreviewFn = useStudioStore((s) => s.setPreviewFn);

  // Tuval, kapsayıcı genişliğine göre ölçeklenir (mobil dahil).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      setSize({ width, height: Math.round(width * 0.52) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const register = useCallback((id, node) => {
    if (node) nodeRefs.current.set(id, node);
    else nodeRefs.current.delete(id);
  }, []);

  // Önizleme PNG'si (kayıt/teklif için). Seçim çerçevesi görüntüye girmemeli →
  // Transformer geçici olarak boşaltılır, çizim alınır, sonra geri bağlanır.
  const exportPreview = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const tr = trRef.current;
    const selected = tr?.nodes() || [];
    tr?.nodes([]);
    tr?.getLayer()?.batchDraw();
    let url = null;
    try {
      url = stage.toDataURL({
        mimeType: 'image/png',
        pixelRatio: Math.min(2, 1200 / (stage.width() || 1200)),
      });
    } catch (e) {
      // Yüklenen görsel başka kaynaktan geldiyse tuval "kirlenmiş" olabilir.
      console.error('[studio] preview export failed:', e?.message || e);
    }
    tr?.nodes(selected);
    tr?.getLayer()?.batchDraw();
    return url;
  }, []);

  useEffect(() => {
    setPreviewFn(exportPreview);
    return () => setPreviewFn(null);
  }, [exportPreview, setPreviewFn]);

  // Transformer'ı seçili node'a bağla.
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const node = selectedId ? nodeRefs.current.get(selectedId) : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, elements, size]);

  // Klavye kısayolları — form alanlarında yazarken devrede olmamalı.
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (mod && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault();
        duplicateElement(selectedId);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        removeElement(selectedId);
      } else if (e.key === 'Escape') {
        select(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, undo, redo, removeElement, duplicateElement, select]);

  const rect = signRect(size.width, size.height, sign.widthCm, sign.heightCm);
  const origin = { x: rect.x, y: rect.y };
  // Yazının genişliği metinden türer — yalnız yükseklik ölçeklenebilir, o yüzden
  // orantılı köşe tutamakları. Diğer elemanlar serbest boyutlanır.
  const isTextSelected = elements.find((e) => e.id === selectedId)?.type === 'text';

  const bg = backgroundById(sign.kind);
  const bgFill = sign.colorHex || bg.fill;
  // Parlama yalnız gece önizlemesinde ve ışıklı üretimde.
  const glowHex = night && lighting.lit ? LIGHT_GLOW_HEX[lighting.lightColor] : null;

  return (
    <div ref={wrapRef} className="w-full">
      {size.width > 0 && (
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          // Boş alana tıklayınca seçim kalksın.
          onMouseDown={(e) => e.target === e.target.getStage() && select(null)}
          onTouchStart={(e) => e.target === e.target.getStage() && select(null)}
        >
          <Layer>
            {/* Zemin (tabela kasası). "Ohne Schild" seçilirse yalnız kesikli alan
                sınırı çizilir — harfler doğrudan duvara monte edilir. */}
            <Rect
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              fill={bgFill || undefined}
              stroke={bg.stroke}
              strokeWidth={bgFill ? 2 : 1.5}
              dash={bgFill ? undefined : [8, 6]}
              cornerRadius={4}
            />

            {/* Gece önizlemesi: zemin kararır, elemanlar LED renginde parlar. */}
            {night && (
              <Rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                fill="rgba(4,8,14,0.72)"
                cornerRadius={4}
                listening={false}
              />
            )}

            {elements.map((el) => {
              const Node = NODE_BY_TYPE[el.type];
              if (!Node) return null;
              return (
                <Node
                  key={el.id}
                  el={el}
                  scale={rect.scale}
                  origin={origin}
                  isSelected={el.id === selectedId}
                  glowHex={glowHex}
                  onSelect={select}
                  onChange={(patch) => updateElement(el.id, patch)}
                  register={register}
                />
              );
            })}

            <Transformer
              ref={trRef}
              rotateEnabled
              keepRatio={isTextSelected}
              enabledAnchors={
                isTextSelected
                  ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
                  : undefined
              }
              anchorSize={10}
              borderStroke="#7cc4ff"
              anchorStroke="#7cc4ff"
              anchorFill="#0d1520"
              // Çok küçük ölçüler modelde zaten sınırlanıyor; burada da tuval tarafında engelle.
              boundBoxFunc={(oldBox, newBox) =>
                newBox.width < 8 || newBox.height < 8 ? oldBox : newBox
              }
            />
          </Layer>
        </Stage>
      )}

      <p className="mt-3 text-xs text-white/40">
        {t('studio.canvasInfo', {
          w: sign.widthCm,
          h: sign.heightCm,
          s: rect.scale.toFixed(2),
        })}{' '}
        · {t('studio.shortcuts')}
      </p>
    </div>
  );
}
