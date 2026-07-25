// Stüdyo ölçek dönüşümleri.
// Tek doğruluk kaynağı cm'dir; tuval px'i her zaman cm'den türetilir. Zemin ölçüsü
// değişince öğelerin cm değerleri sabit kalır, sadece pxPerCm değişir.

/** Tuvale sığdırma oranı: 1 cm kaç px eder. */
export function pxPerCm(canvasWidthPx, canvasHeightPx, signWidthCm, signHeightCm) {
  if (!signWidthCm || !signHeightCm) return 1;
  return Math.min(canvasWidthPx / signWidthCm, canvasHeightPx / signHeightCm);
}

/** Zeminin tuval içindeki px kutusu — ortalanmış. */
export function signRect(canvasWidthPx, canvasHeightPx, signWidthCm, signHeightCm) {
  const scale = pxPerCm(canvasWidthPx, canvasHeightPx, signWidthCm, signHeightCm);
  const width = signWidthCm * scale;
  const height = signHeightCm * scale;
  return {
    scale,
    width,
    height,
    x: (canvasWidthPx - width) / 2,
    y: (canvasHeightPx - height) / 2,
  };
}

export const cmToPx = (cm, scale) => cm * scale;
export const pxToCm = (px, scale) => (scale ? px / scale : 0);
