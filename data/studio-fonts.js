// Stüdyo font listesi.
// Kaynak: KONFIG_FONTS (id/label/widthFactor) + KonfiguratorTest.jsx içindeki FONT_PDF
// haritasının (Google-Font adı + ağırlık) kopyası. KonfiguratorTest.jsx'e dokunmamak
// için kopyalandı — yeni font eklenirse İKİ yer de güncellenmeli.

import { KONFIG_FONTS } from '@/data/konfigurator';

/** fontId → [Google-Font ailesi, ağırlık] */
export const STUDIO_FONT_FAMILY = {
  modern: ['Archivo Black', 400], elegant: ['Playfair Display', 700], schmal: ['Oswald', 600], rund: ['Baloo 2', 700],
  montserrat: ['Montserrat', 800], poppins: ['Poppins', 700], raleway: ['Raleway', 800], russo: ['Russo One', 400],
  bebas: ['Bebas Neue', 400], anton: ['Anton', 400], fjalla: ['Fjalla One', 400], staatliches: ['Staatliches', 400],
  nunito: ['Nunito', 800], quicksand: ['Quicksand', 700], comfortaa: ['Comfortaa', 700], fredoka: ['Fredoka', 600], lilita: ['Lilita One', 400],
  abril: ['Abril Fatface', 400], dmserif: ['DM Serif Display', 400], cinzel: ['Cinzel', 700], robotoslab: ['Roboto Slab', 700], alfaslab: ['Alfa Slab One', 400],
  bungee: ['Bungee', 400], righteous: ['Righteous', 400], bangers: ['Bangers', 400], luckiest: ['Luckiest Guy', 400], titan: ['Titan One', 400],
  orbitron: ['Orbitron', 700], audiowide: ['Audiowide', 400], blackops: ['Black Ops One', 400], sairastencil: ['Saira Stencil One', 400],
  rubik: ['Rubik', 700], worksans: ['Work Sans', 700], barlow: ['Barlow', 700], mulish: ['Mulish', 800], manrope: ['Manrope', 700], sora: ['Sora', 700], exo2: ['Exo 2', 700], lexend: ['Lexend', 700], kanit: ['Kanit', 700], prompt: ['Prompt', 700], jost: ['Jost', 600],
  archivonarrow: ['Archivo Narrow', 400], barlowcond: ['Barlow Condensed', 700], sairacond: ['Saira Condensed', 700], teko: ['Teko', 700], khand: ['Khand', 700], rajdhani: ['Rajdhani', 700], pathwaygothic: ['Pathway Gothic One', 400],
  varelaround: ['Varela Round', 400], chewy: ['Chewy', 400], sniglet: ['Sniglet', 800], paytone: ['Paytone One', 400], concertone: ['Concert One', 400],
  merriweather: ['Merriweather', 700], lora: ['Lora', 700], ptserif: ['PT Serif', 700], zillaslab: ['Zilla Slab', 700], yeseva: ['Yeseva One', 400], bitter: ['Bitter', 700],
  passionone: ['Passion One', 700], bowlby: ['Bowlby One', 400], ultra: ['Ultra', 400], sigmar: ['Sigmar One', 400], rowdies: ['Rowdies', 700], fugaz: ['Fugaz One', 400],
  michroma: ['Michroma', 400], syncopate: ['Syncopate', 700],
};

/** Panelde gösterilecek font listesi — motorun tanıdığı id'lerle birebir. */
export const STUDIO_FONTS = KONFIG_FONTS.filter((f) => STUDIO_FONT_FAMILY[f.id]).map((f) => ({
  ...f,
  family: STUDIO_FONT_FAMILY[f.id][0],
  weight: STUDIO_FONT_FAMILY[f.id][1],
}));

export const fontById = (id) => STUDIO_FONTS.find((f) => f.id === id) || STUDIO_FONTS[0];

const loaded = new Map();

/**
 * Fontu Google Fonts'tan yükler ve tarayıcı gerçekten hazır olunca çözülür.
 * Konva metni fonttan ÖNCE çizerse yedek yazı tipiyle kalır — bu yüzden çağıran
 * taraf promise çözülünce yeniden çizim tetiklemeli.
 * @returns {Promise<void>}
 */
export function loadStudioFont(fontId) {
  if (typeof window === 'undefined') return Promise.resolve();
  const f = fontById(fontId);
  if (!f) return Promise.resolve();
  if (loaded.has(f.family)) return loaded.get(f.family);

  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f.family).replace(/%20/g, '+')}:wght@${f.weight}&display=swap`;
  if (!document.querySelector(`link[data-studio-font="${f.family}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.studioFont = f.family;
    document.head.appendChild(link);
  }

  const p = document
    .fonts.load(`${f.weight} 48px "${f.family}"`)
    .then(() => document.fonts.ready)
    .then(() => undefined)
    .catch(() => undefined);
  loaded.set(f.family, p);
  return p;
}
