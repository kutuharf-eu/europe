'use client';

import { useEffect, useRef } from 'react';
import { Group, Rect, Ellipse, Star } from 'react-konva';
import { nodeHandlers, visualProps } from './nodeHandlers';

// Tüm şekiller Group içinde: Group sol-üst köşeden konumlanır (model de öyle tutar),
// içindeki daire/yıldız merkez tabanlı çizilir. Transformer Group'a bağlanır.
export default function ShapeNode({ el, scale, origin, isSelected, glowHex, onSelect, onChange, register }) {
  const ref = useRef(null);

  useEffect(() => {
    register(el.id, ref.current);
    return () => register(el.id, null);
  }, [el.id, register]);

  const w = el.widthCm * scale;
  const h = el.heightCm * scale;
  const fill = el.colorHex;
  const highlight = visualProps({ isSelected, glowHex });

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
      {el.kind === 'circle' && (
        <Ellipse x={w / 2} y={h / 2} radiusX={w / 2} radiusY={h / 2} fill={fill} {...highlight} />
      )}
      {el.kind === 'star' && (
        <Star
          x={w / 2}
          y={h / 2}
          numPoints={5}
          innerRadius={Math.min(w, h) / 4}
          outerRadius={Math.min(w, h) / 2}
          fill={fill}
          {...highlight}
        />
      )}
      {(el.kind === 'rect' || el.kind === 'bar') && (
        <Rect
          width={w}
          height={h}
          fill={fill}
          // Köşe yuvarlaklığı kullanıcı ayarı (cm) — 0 = keskin köşe.
          cornerRadius={(el.cornerRadiusCm || 0) * scale}
          {...highlight}
        />
      )}
    </Group>
  );
}
