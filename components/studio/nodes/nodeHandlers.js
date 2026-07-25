// Konva olaylarını cm modeline çeviren ortak yardımcı.
// Konva boyutlandırmayı scale ile yapar; biz scale'i her seferinde 1'e döndürüp
// sonucu cm olarak modele yazıyoruz — böylece model hep gerçek ölçüyü tutar.

export function nodeHandlers({ el, scale, origin, onChange }) {
  const toCm = (node) => ({
    xCm: (node.x() - origin.x) / scale,
    yCm: (node.y() - origin.y) / scale,
  });

  return {
    onDragEnd: (e) => onChange(toCm(e.target)),
    onTransformEnd: (e) => {
      const node = e.target;
      const sx = node.scaleX();
      const sy = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onChange({
        ...toCm(node),
        rotation: node.rotation(),
        ...(el.type === 'text'
          ? { heightCm: el.heightCm * sy }
          : { widthCm: el.widthCm * sx, heightCm: el.heightCm * sy }),
      });
    },
  };
}

/**
 * Görsel efektler. Gece önizlemesinde ışıklı elemanlar LED renginde parlar; bu
 * sadece görünüm — üretim kararı store'daki lighting.lit alanında tutulur.
 * Konva tek shadow desteklediği için parlama seçim vurgusunun önüne geçer
 * (seçim zaten Transformer çerçevesiyle de belli).
 */
export const visualProps = ({ isSelected, glowHex }) => {
  if (glowHex) return { shadowColor: glowHex, shadowBlur: 28, shadowOpacity: 0.95 };
  return isSelected ? { shadowColor: '#7cc4ff', shadowBlur: 12, shadowOpacity: 0.9 } : {};
};
