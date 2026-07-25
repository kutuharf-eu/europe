// Zemin (tabela kasası) türleri.
// DİKKAT: Fiyat motorunda zemin diye bir kalem YOK — bu seçimler MVP'de fiyata
// girmez, teklifte ayrıca kalküle edilir (Murat'ın kararı, 25 Tem 2026).
// Zemin fiyatlandırması Faz 6'nın işi; o zaman buraya €/m² alanı eklenecek.

import { KONFIG_RAL } from '@/data/konfigurator';

/**
 * @typedef {Object} StudioBackground
 * @property {string} id
 * @property {string} label     Almanca varsayılan (i18n: studio.bg.<id>)
 * @property {string|null} fill null → zemin yok (harfler doğrudan duvara)
 * @property {string} stroke
 * @property {boolean} colorizable  RAL renk seçimi açık mı
 */

/** @type {StudioBackground[]} */
export const STUDIO_BACKGROUNDS = [
  {
    id: 'keine',
    label: 'Ohne Schild (direkt an die Wand)',
    fill: null,
    stroke: '#39424f',
    colorizable: false,
  },
  {
    // Varsayılan zemin. Bilerek gri (RAL 9006 Weißaluminium tonu): beyaz harfler
    // beyaz zeminde görünmüyordu. Kullanıcı RAL paletinden istediğine çevirebilir.
    id: 'dibond',
    label: 'Alu-Verbundplatte (Dibond)',
    fill: '#a5a8a6',
    stroke: '#8a8f8d',
    colorizable: true,
  },
  {
    id: 'alukasten',
    label: 'Aluminium-Kasten',
    fill: '#2b323b',
    stroke: '#1b2027',
    colorizable: true,
  },
  {
    // Pleksi cam gibi açık ama tamamen beyaz değil — yine kontrast için.
    id: 'acryl',
    label: 'Acrylglas-Panel',
    fill: '#c9d2d7',
    stroke: '#aab6bd',
    colorizable: true,
  },
];

export const DEFAULT_BACKGROUND_ID = 'dibond';

export const backgroundById = (id) =>
  STUDIO_BACKGROUNDS.find((b) => b.id === id) || STUDIO_BACKGROUNDS[1];

/** Zemin renk paleti — boyalı alüminyum/kompozit için kurutulmuş RAL listesi. */
export const BACKGROUND_COLORS = KONFIG_RAL.map((r) => ({
  id: r.code,
  label: `${r.code} · ${r.label}`,
  hex: r.hex,
}));

/**
 * Renk açık mı? (WCAG bağıl parlaklık) — yeni elemanın okunur bir varsayılan renkle
 * doğması için. Eşik, gri zeminde (RAL 9006) beyaz harfin korunacağı şekilde seçildi.
 */
export function isLightHex(hex) {
  const h = String(hex || '').replace('#', '');
  if (h.length !== 6) return false;
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const [r, g, b] = [0, 2, 4].map((i) => lin(parseInt(h.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45;
}

/** Gece önizlemesinde LED ışık renginin tuvaldeki karşılığı. */
export const LIGHT_GLOW_HEX = {
  warmweiss: '#ffd9a0',
  neutralweiss: '#fff2dc',
  kaltweiss: '#e6f2ff',
  rgb: '#ff5ce1',
};
