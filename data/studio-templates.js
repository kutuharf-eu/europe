// Hazır tasarım şablonları (Faz 5).
// Bunlar kodda tanımlı VARSAYILAN şablonlardır; `kutuharf_design_templates` tablosuna
// kayıt eklenirse API onları döndürür (DB önceliklidir). Böylece stüdyo tablo boşken
// de dolu açılır, Murat sonradan kendi şablonlarını ekleyebilir.
//
// Ölçüler gerçekçi tutuldu: harf yüksekliği 5–100 cm, zemin oranları saha işlerine yakın.

const base = {
  lighting: { lit: true, lightColor: 'warmweiss' },
  product: { constructionId: 'alu_plexi', lightingId: 'halo', montageId: 'selbst' },
};

const text = (id, t, patch = {}) => ({
  id,
  type: 'text',
  text: t,
  fontId: 'modern',
  heightCm: 25,
  letterSpacingCm: 0,
  lineGapCm: 6,
  xCm: 20,
  yCm: 25,
  rotation: 0,
  colorHex: '#ffffff',
  ...patch,
});

const shape = (id, kind, patch = {}) => ({
  id,
  type: 'shape',
  kind,
  widthCm: 40,
  heightCm: 40,
  cornerRadiusCm: 0,
  xCm: 20,
  yCm: 20,
  rotation: 0,
  colorHex: '#ffffff',
  ...patch,
});

export const STUDIO_TEMPLATES = [
  {
    slug: 'cafe',
    title: 'Café / Bistro',
    branche: 'Gastronomie',
    design: {
      ...base,
      sign: { widthCm: 250, heightCm: 80, kind: 'dibond', colorHex: '#383e42' },
      elements: [
        text('c1', 'CAFÉ', { fontId: 'bebas', heightCm: 34, letterSpacingCm: 3, xCm: 22, yCm: 14 }),
        text('c2', 'BISTRO', { fontId: 'montserrat', heightCm: 12, letterSpacingCm: 2, xCm: 24, yCm: 54 }),
      ],
    },
  },
  {
    slug: 'restaurant',
    title: 'Restaurant',
    branche: 'Gastronomie',
    design: {
      ...base,
      sign: { widthCm: 320, heightCm: 110, kind: 'alukasten', colorHex: null },
      elements: [
        text('r1', 'RESTAURANT', { fontId: 'anton', heightCm: 30, letterSpacingCm: 2, xCm: 25, yCm: 16 }),
        text('r2', 'AKDENIZ', { fontId: 'montserrat', heightCm: 18, letterSpacingCm: 6, xCm: 27, yCm: 60 }),
      ],
    },
  },
  {
    slug: 'friseur',
    title: 'Friseur / Salon',
    branche: 'Dienstleistung',
    design: {
      ...base,
      sign: { widthCm: 220, heightCm: 80, kind: 'dibond', colorHex: '#0a0a0d' },
      elements: [
        shape('f0', 'circle', { widthCm: 45, heightCm: 45, xCm: 18, yCm: 18, colorHex: '#d4af37' }),
        text('f1', 'SALON', { fontId: 'raleway', heightCm: 26, letterSpacingCm: 4, xCm: 78, yCm: 20 }),
        text('f2', 'HAIR & STYLE', { fontId: 'jost', heightCm: 10, letterSpacingCm: 3, xCm: 79, yCm: 52 }),
      ],
    },
  },
  {
    slug: 'baeckerei',
    title: 'Bäckerei',
    branche: 'Handel',
    design: {
      ...base,
      sign: { widthCm: 300, heightCm: 95, kind: 'dibond', colorHex: '#45322e' },
      elements: [
        text('b1', 'BÄCKEREI', { fontId: 'lora', heightCm: 28, letterSpacingCm: 2, xCm: 30, yCm: 18 }),
        shape('b2', 'bar', { widthCm: 200, heightCm: 6, cornerRadiusCm: 3, xCm: 30, yCm: 60, colorHex: '#f7b500' }),
      ],
    },
  },
  {
    slug: 'boutique',
    title: 'Boutique / Mode',
    branche: 'Handel',
    design: {
      ...base,
      lighting: { lit: true, lightColor: 'kaltweiss' },
      sign: { widthCm: 240, heightCm: 70, kind: 'keine', colorHex: null },
      elements: [
        text('m1', 'BOUTIQUE', { fontId: 'raleway', heightCm: 22, letterSpacingCm: 8, xCm: 25, yCm: 24 }),
      ],
    },
  },
  {
    slug: 'werkstatt',
    title: 'KFZ-Werkstatt',
    branche: 'Handwerk',
    design: {
      ...base,
      product: { constructionId: 'alu_plexi', lightingId: 'front', montageId: 'selbst' },
      sign: { widthCm: 350, heightCm: 100, kind: 'alukasten', colorHex: null },
      elements: [
        text('w1', 'KFZ-SERVICE', { fontId: 'russo', heightCm: 32, letterSpacingCm: 1, xCm: 28, yCm: 20 }),
        shape('w2', 'bar', { widthCm: 240, heightCm: 8, cornerRadiusCm: 0, xCm: 28, yCm: 64, colorHex: '#c1121c' }),
      ],
    },
  },
];
