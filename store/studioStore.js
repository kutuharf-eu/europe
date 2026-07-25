'use client';
import { create } from 'zustand';
import {
  KONFIG_DEFAULT_LIGHT_COLOR,
  normalizeLightColor,
  KONFIG_CONSTRUCTIONS,
  KONFIG_MONTAGE,
} from '@/data/konfigurator';
import { DEFAULT_BACKGROUND_ID, backgroundById, isLightHex } from '@/data/studio-backgrounds';
import {
  DEFAULT_SIGN,
  SIGN_LIMITS,
  TEXT_LIMITS,
  shapeLimitsFor,
  clamp,
  createText,
  createShape,
  createImage,
  textLines,
  alignPatch,
} from '@/lib/studio/model';

// Stüdyo durumu. cartStore'dan ayrı ve KASITLI olarak persist EDİLMEZ:
// tasarımlar Faz 4'te Supabase'e owner_token ile kaydedilecek, localStorage'a değil.

const MAX_HISTORY = 50;

/** Geri alınabilir durumun tamamı — history bunun anlık kopyalarını tutar.
 *  view (gece önizlemesi) kasıtlı olarak dışarıda: tasarımın parçası değil. */
const snapshot = (s) => ({
  elements: s.elements,
  sign: s.sign,
  lighting: s.lighting,
  product: s.product,
});

/**
 * History kaydı ekler. `tag` verilirse ardışık aynı-tag'li değişiklikler tek adımda
 * birleşir (metin yazarken her harf ayrı undo adımı olmasın diye).
 */
const commit = (s, tag) => {
  if (tag && tag === s.historyTag) return { past: s.past, future: [], historyTag: tag };
  return {
    past: [...s.past, snapshot(s)].slice(-MAX_HISTORY),
    future: [],
    historyTag: tag ?? null,
  };
};

export const useStudioStore = create((set, get) => ({
  // sign: zemin — ölçü + tür + renk. Fiyata girmiyor (teklifte kalküle edilir).
  sign: { ...DEFAULT_SIGN, kind: DEFAULT_BACKGROUND_ID, colorHex: null },
  // lighting: ÜRÜN kararı (fiyata girer). view.night ise sadece önizleme.
  lighting: { lit: true, lightColor: KONFIG_DEFAULT_LIGHT_COLOR },
  // product: motorun fiyatı hesaplayabilmesi için ZORUNLU alanlar — konstrüksiyon
  // taban fiyatı (38–85 €) ve aydınlatma türü katsayısı (1,7–2,0) buradan gelir.
  product: { constructionId: 'alu_plexi', lightingId: 'halo', montageId: 'selbst' },
  view: { night: false },
  /** Kaydedilmiş tasarımın id'si — varsa "kaydet" günceller, yoksa yeni kayıt açar. */
  designId: null,
  /** Tuvalin PNG önizlemesini üreten fonksiyon; StudioCanvas kendini burada kaydeder. */
  previewFn: null,
  /** @type {import('@/lib/studio/model').StudioElement[]} */
  elements: [],
  selectedId: null,
  past: [],
  future: [],
  historyTag: null,

  select: (selectedId) => set({ selectedId }),

  addText: (patch) => {
    const s0 = get();
    const el = createText({ ...cascade(s0), colorHex: defaultColorFor(s0), ...patch });
    set((s) => ({ ...commit(s), elements: [...s.elements, el], selectedId: el.id }));
    return el.id;
  },
  addShape: (kind, patch) => {
    const s0 = get();
    const el = createShape(kind, { ...cascade(s0), colorHex: defaultColorFor(s0), ...patch });
    set((s) => ({ ...commit(s), elements: [...s.elements, el], selectedId: el.id }));
    return el.id;
  },
  addImage: (patch) => {
    const el = createImage({ ...cascade(get()), ...patch });
    set((s) => ({ ...commit(s), elements: [...s.elements, el], selectedId: el.id }));
    return el.id;
  },

  /**
   * @param {string} id
   * @param {object} patch
   * @param {{history?: boolean, tag?: string}} [opts]
   *   history:false → sürükleme sırasında ara kareler (undo adımı üretmez)
   *   tag → ardışık düzenlemeleri tek undo adımında birleştirir
   */
  updateElement: (id, patch, opts = {}) =>
    set((s) => {
      const elements = s.elements.map((e) => (e.id === id ? sanitize({ ...e, ...patch }) : e));
      if (opts.history === false) return { elements };
      return { ...commit(s, opts.tag), elements };
    }),

  removeElement: (id) =>
    set((s) => ({
      ...commit(s),
      elements: s.elements.filter((e) => e.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  duplicateElement: (id) => {
    const src = get().elements.find((e) => e.id === id);
    if (!src) return null;
    // id fabrikadan yeni gelmeli — kopyalanan alanlardan çıkarılıyor.
    const { id: _omit, ...rest } = src;
    const offset = { xCm: src.xCm + 5, yCm: src.yCm + 5 };
    const el =
      src.type === 'shape'
        ? createShape(src.kind, { ...rest, ...offset })
        : src.type === 'text'
          ? createText({ ...rest, ...offset })
          : createImage({ ...rest, ...offset });
    set((s) => ({ ...commit(s), elements: [...s.elements, el], selectedId: el.id }));
    return el.id;
  },

  /**
   * Seçili elemanı zemine hizalar (sol/orta/sağ, üst/orta/alt).
   * Yazının genişliği tuvalden ölçülen gerçek değerdir — bkz. setMeasured.
   */
  alignElement: (id, mode) =>
    set((s) => {
      const el = s.elements.find((e) => e.id === id);
      const patch = el && alignPatch(el, s.sign)[mode];
      if (!patch) return {};
      return {
        ...commit(s),
        elements: s.elements.map((e) => (e.id === id ? sanitize({ ...e, ...patch }) : e)),
      };
    }),

  /**
   * Tuvalin ölçtüğü gerçek yazı boyutu. Kullanıcı eylemi değil → history'ye
   * girmez, aksi halde her font yüklemesi bir undo adımı olurdu.
   */
  setMeasured: (id, m) =>
    set((s) => ({
      elements: s.elements.map((e) =>
        e.id === id
          ? { ...e, measuredWidthCm: round1(m.measuredWidthCm), measuredHeightCm: round1(m.measuredHeightCm) }
          : e
      ),
    })),

  /** Katman sırası: dizideki sıra = çizim sırası (son eleman en üstte). */
  moveLayer: (id, dir) =>
    set((s) => {
      const i = s.elements.findIndex((e) => e.id === id);
      const j = i + (dir === 'up' ? 1 : -1);
      if (i < 0 || j < 0 || j >= s.elements.length) return {};
      const elements = [...s.elements];
      [elements[i], elements[j]] = [elements[j], elements[i]];
      return { ...commit(s), elements };
    }),

  setSign: (patch, opts = {}) =>
    set((s) => {
      const kind = patch.kind ?? s.sign.kind;
      const bg = backgroundById(kind);
      const sign = {
        ...s.sign,
        ...patch,
        kind: bg.id,
        widthCm: clamp(
          Math.round(patch.widthCm ?? s.sign.widthCm),
          SIGN_LIMITS.minWidthCm,
          SIGN_LIMITS.maxWidthCm
        ),
        heightCm: clamp(
          Math.round(patch.heightCm ?? s.sign.heightCm),
          SIGN_LIMITS.minHeightCm,
          SIGN_LIMITS.maxHeightCm
        ),
        // Renk seçilemeyen zeminde (ör. "ohne Schild") eski renk taşınmasın.
        colorHex: bg.colorizable ? (patch.colorHex ?? s.sign.colorHex) : null,
      };
      // Öğelerin cm değerleri sabit kalır; sadece tuval ölçeği değişir (plan §3).
      return { ...commit(s, opts.tag), sign };
    }),

  setLighting: (patch) =>
    set((s) => {
      const lighting = {
        lit: patch.lit ?? s.lighting.lit,
        lightColor: normalizeLightColor(patch.lightColor ?? s.lighting.lightColor),
      };
      // Işıksıza geçilince her konstrüksiyon geçerli değil (ör. Chrom-Halo yalnız
      // rückleuchtend üretilir) — motor cfg'yi reddeder, o yüzden uygun olana düşülür.
      const product = reconcileProduct(s.product, lighting.lit);
      return { ...commit(s), lighting, product };
    }),

  setProduct: (patch) =>
    set((s) => ({
      ...commit(s),
      product: reconcileProduct({ ...s.product, ...patch }, s.lighting.lit),
    })),

  /** Gece/gündüz önizlemesi — tasarımı değiştirmez, undo'ya girmez. */
  setNightView: (night) => set((s) => ({ view: { ...s.view, night } })),

  undo: () =>
    set((s) => {
      const prev = s.past[s.past.length - 1];
      if (!prev) return {};
      return {
        ...prev,
        past: s.past.slice(0, -1),
        future: [snapshot(s), ...s.future].slice(0, MAX_HISTORY),
        historyTag: null,
        selectedId: prev.elements.some((e) => e.id === s.selectedId) ? s.selectedId : null,
      };
    }),

  redo: () =>
    set((s) => {
      const next = s.future[0];
      if (!next) return {};
      return {
        ...next,
        past: [...s.past, snapshot(s)].slice(-MAX_HISTORY),
        future: s.future.slice(1),
        historyTag: null,
        selectedId: next.elements.some((e) => e.id === s.selectedId) ? s.selectedId : null,
      };
    }),

  clearAll: () =>
    set((s) => ({ ...commit(s), elements: [], selectedId: null })),

  setDesignId: (designId) => set({ designId }),
  setPreviewFn: (previewFn) => set({ previewFn }),

  /** Kaydedilmiş tasarımı geri yükler — geçmiş sıfırlanır (yeni oturum sayılır). */
  loadDesign: (design, designId = null) =>
    set((s) => ({
      elements: Array.isArray(design?.elements) ? design.elements : [],
      sign: design?.sign ? { ...s.sign, ...design.sign } : s.sign,
      lighting: design?.lighting ? { ...s.lighting, ...design.lighting } : s.lighting,
      product: reconcileProduct(
        { ...s.product, ...(design?.product || {}) },
        design?.lighting?.lit ?? s.lighting.lit
      ),
      designId,
      selectedId: null,
      past: [],
      future: [],
      historyTag: null,
    })),

  /** Sunucuya gönderilecek tasarım gövdesi — görünüm durumu (view) dahil değil. */
  designPayload: () => {
    const s = get();
    return { elements: s.elements, sign: s.sign, lighting: s.lighting, product: s.product };
  },
}));

/**
 * Yeni eleman kademeli yerleşir — aksi halde her ekleme aynı noktaya düşer ve
 * ikinci yazı birincinin tam üstüne biner.
 */
function cascade(s) {
  const step = (s.elements.length % 6) * 6;
  return { xCm: 15 + step, yCm: 12 + step };
}

/**
 * Yeni elemanın varsayılan rengi zemine göre seçilir — beyaz zeminde beyaz harf
 * eklenince kullanıcı hiçbir şey göremiyordu. Yalnız DOĞUŞTA geçerli: sonradan
 * zemin rengi değişse bile mevcut elemanların rengine dokunulmaz (bilerek yapılan
 * ton-sıfır tasarımlar da var — gündüz görünmez, gece halo ile okunur).
 * Her iki değer de gerçek palet renkleri: KONFIG_COLORS 'weiss' / 'schwarz'.
 */
function defaultColorFor(s) {
  const bg = backgroundById(s.sign.kind);
  const fill = s.sign.colorHex || bg.fill;
  return fill && isLightHex(fill) ? '#1a1a1a' : '#ffffff';
}

/**
 * Ürün seçimlerini tutarlı tutar: konstrüksiyon ↔ aydınlatma türü uyumu motorun
 * `allowed` listesiyle belirlenir; uyumsuz kombinasyonda fiyat null dönerdi.
 */
function reconcileProduct(product, lit) {
  const wanted = KONFIG_CONSTRUCTIONS.find((c) => c.id === product.constructionId);
  // Işıksız üründe konstrüksiyon 'none'a izin vermeli; ışıklıda en az bir ışık türü.
  const fits = (c) => (lit ? c.allowed.some((a) => a !== 'none') : c.allowed.includes('none'));
  const construction = wanted && fits(wanted) ? wanted : KONFIG_CONSTRUCTIONS.find(fits);
  if (!construction) return product;

  const allowedLit = construction.allowed.filter((a) => a !== 'none');
  const lightingId = allowedLit.includes(product.lightingId) ? product.lightingId : allowedLit[0];

  return {
    constructionId: construction.id,
    lightingId: lightingId || product.lightingId,
    montageId: KONFIG_MONTAGE.some((m) => m.id === product.montageId) ? product.montageId : 'selbst',
  };
}

/** Sınır kontrolü — panelden veya tuvalden gelsin, model hep geçerli kalsın. */
function sanitize(el) {
  const out = { ...el };
  if (out.type === 'text') {
    // Satır başına uzunluk sınırı: motor da her kalemi tek satır olarak fiyatlıyor.
    out.text = textLines(out)
      .slice(0, TEXT_LIMITS.maxLines)
      .map((line) => line.slice(0, TEXT_LIMITS.maxLen))
      .join('\n');
    out.heightCm = clamp(round1(out.heightCm), TEXT_LIMITS.minHeightCm, TEXT_LIMITS.maxHeightCm);
    out.letterSpacingCm = clamp(
      round1(out.letterSpacingCm || 0),
      TEXT_LIMITS.minSpacingCm,
      TEXT_LIMITS.maxSpacingCm
    );
    out.lineGapCm = clamp(round1(out.lineGapCm ?? 5), 0, TEXT_LIMITS.maxLineGapCm);
  } else {
    // Çubuğun sınırları logodan farklı (5 cm'e kadar ince, 15 m'ye kadar uzun).
    const lim = shapeLimitsFor(out.type === 'shape' ? out.kind : 'image');
    out.widthCm = clamp(round1(out.widthCm), lim.minWidthCm, lim.maxWidthCm);
    out.heightCm = clamp(round1(out.heightCm), lim.minHeightCm, lim.maxHeightCm);
    if (out.type === 'shape') {
      // Yuvarlatma en fazla kısa kenarın yarısı — ötesi zaten tam yarım daire.
      out.cornerRadiusCm = clamp(
        round1(out.cornerRadiusCm || 0),
        0,
        Math.min(out.widthCm, out.heightCm) / 2
      );
    }
  }
  out.xCm = round1(out.xCm);
  out.yCm = round1(out.yCm);
  out.rotation = Math.round(out.rotation || 0);
  return out;
}

const round1 = (v) => Math.round((Number(v) || 0) * 10) / 10;

// Seçiciler — bileşenler gereksiz yere yeniden çizilmesin diye tek tek kullanılır.
export const useSelectedElement = () =>
  useStudioStore((s) => s.elements.find((e) => e.id === s.selectedId) || null);
export const useCanUndo = () => useStudioStore((s) => s.past.length > 0);
export const useCanRedo = () => useStudioStore((s) => s.future.length > 0);
