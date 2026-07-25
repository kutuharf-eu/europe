'use client';

import { useEffect, useRef, useState } from 'react';
import { Group, Image as KonvaImage, Rect } from 'react-konva';
import { nodeHandlers, visualProps } from './nodeHandlers';

// Görsel şimdilik tarayıcıdaki geçici URL'den çizilir (Faz 1). Faz 4'te tasarım
// kaydedilirken Supabase Storage'a yüklenip kalıcı URL modele yazılacak.
export default function ImageNode({ el, scale, origin, isSelected, glowHex, onSelect, onChange, register }) {
  const ref = useRef(null);
  const [img, setImg] = useState(null);

  useEffect(() => {
    register(el.id, ref.current);
    return () => register(el.id, null);
  }, [el.id, register]);

  useEffect(() => {
    if (!el.src) return;
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = el.src;
    const done = () => setImg(image);
    image.addEventListener('load', done);
    return () => image.removeEventListener('load', done);
  }, [el.src]);

  const w = el.widthCm * scale;
  const h = el.heightCm * scale;

  return (
    <Group
      ref={ref}
      id={el.id}
      x={origin.x + el.xCm * scale}
      y={origin.y + el.yCm * scale}
      rotation={el.rotation}
      draggable
      onClick={() => onSelect(el.id)}
      onTap={() => onSelect(el.id)}
      {...nodeHandlers({ el, scale, origin, onChange })}
    >
      {img ? (
        <KonvaImage image={img} width={w} height={h} {...visualProps({ isSelected, glowHex })} />
      ) : (
        // Görsel yüklenene kadar yer tutucu — Transformer'ın tutunacağı bir kutu kalsın.
        <Rect width={w} height={h} fill="#1c2430" stroke="#3a4657" dash={[6, 4]} />
      )}
    </Group>
  );
}
