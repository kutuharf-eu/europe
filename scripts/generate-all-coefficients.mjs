// Kutu-Harf-Modul — TÜM konfigüratör fontları için gerçek glyph katsayıları (eCut mantığı).
// Google Fonts'tan her fontun TTF'ini (konfigüratördeki AYNI ağırlıkla) indirir,
// opentype.js ile gerçek kontur alan/çevresini ölçer ve şunları üretir:
//   public/coefficients/<fontId>.json  → { alan, cevre, genislik, yukseklik } / karakter
//   public/glyphs/<fontId>.json        → SVG path + BBox (PriceWizard önizlemesi)
// Matematik generate-coefficients.mjs ile birebir aynıdır (h = 1 cap height).
// Aufruf: npm run coeff:all   (İndirilen TTF'ler scripts/.font-cache/ altında saklanır.)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import opentype from 'opentype.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cacheDir = path.join(root, 'scripts', '.font-cache');
mkdirSync(cacheDir, { recursive: true });

// KONFIG_FONTS ↔ Google ailesi + ağırlık — KonfiguratorTest.jsx FONT_PDF ile senkron.
// Konfigüratör hangi kesimle gösteriyorsa katsayı da o kesimden üretilmeli (700 ≠ 400!).
const FONT_GOOGLE = {
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

// Eski UA → Google TTF döner (woff2 yerine; opentype.js woff2 okuyamaz).
const LEGACY_UA = 'Mozilla/5.0 (Windows NT 6.1; rv:10.0) Gecko/20100101 Firefox/10.0';

async function fetchTtf(family, weight) {
  // Google eski UA'ya WOFF1 servis eder — opentype.js WOFF1'i doğrudan okur (tiny-inflate).
  const slug = `${family.replace(/ /g, '_')}-${weight}.woff`;
  const file = path.join(cacheDir, slug);
  if (existsSync(file)) return readFileSync(file);
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@${weight}&display=swap`;
  const css = await (await fetch(cssUrl, { headers: { 'User-Agent': LEGACY_UA } })).text();
  const m = css.match(/src:\s*url\((https:[^)]+\.(?:ttf|woff))\)/);
  if (!m) throw new Error(`Font-URL bulunamadı: ${family}:${weight}\n${css.slice(0, 200)}`);
  const buf = Buffer.from(await (await fetch(m[1])).arrayBuffer());
  writeFileSync(file, buf);
  return buf;
}

// ── Glyph-Geometrie — generate-coefficients.mjs ile birebir aynı ─────────────
function pathToContours(cmds, seg = 16) {
  const cs = []; let cur = null, sx = 0, sy = 0, x = 0, y = 0;
  for (const c of cmds) {
    if (c.type === 'M') { if (cur && cur.length > 2) cs.push(cur); cur = [[c.x, c.y]]; sx = c.x; sy = c.y; x = c.x; y = c.y; }
    else if (c.type === 'L') { cur.push([c.x, c.y]); x = c.x; y = c.y; }
    else if (c.type === 'C') {
      for (let i = 1; i <= seg; i++) {
        const t = i / seg, m = 1 - t;
        cur.push([m * m * m * x + 3 * m * m * t * c.x1 + 3 * m * t * t * c.x2 + t * t * t * c.x,
          m * m * m * y + 3 * m * m * t * c.y1 + 3 * m * t * t * c.y2 + t * t * t * c.y]);
      } x = c.x; y = c.y;
    } else if (c.type === 'Q') {
      for (let i = 1; i <= seg; i++) {
        const t = i / seg, m = 1 - t;
        cur.push([m * m * x + 2 * m * t * c.x1 + t * t * c.x, m * m * y + 2 * m * t * c.y1 + t * t * c.y]);
      } x = c.x; y = c.y;
    } else if (c.type === 'Z') { if (cur) { cur.push([sx, sy]); if (cur.length > 2) cs.push(cur); cur = null; } x = sx; y = sy; }
  }
  if (cur && cur.length > 2) cs.push(cur);
  return cs;
}
const sArea = (p) => { let a = 0; for (let i = 0; i < p.length - 1; i++) a += p[i][0] * p[i + 1][1] - p[i + 1][0] * p[i][1]; return a / 2; };
const pLen = (p) => { let l = 0; for (let i = 0; i < p.length - 1; i++) l += Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]); return l; };

// Zeichensatz — generate-coefficients.mjs ile aynı (Brief §3.6 + DE + aksan).
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÄÖÜäöüßÇĞİŞçğışÉÈÀéèà0123456789&.-\'';

mkdirSync(path.join(root, 'public', 'coefficients'), { recursive: true });
mkdirSync(path.join(root, 'public', 'glyphs'), { recursive: true });

let ok = 0, fail = 0;
for (const [id, [family, weight]] of Object.entries(FONT_GOOGLE)) {
  try {
    const buf = await fetchTtf(family, weight);
    const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    const H = font.charToGlyph('H');
    const capBB = H.getPath(0, 0, 1000).getBoundingBox();
    const cap = capBB.y2 - capBB.y1;

    const coeff = { font: id, family, weight, normalize: 'h=1 (cap height)', chars: {} };
    const glyphs = { font: id, cap: +cap.toFixed(1), chars: {} };
    const missing = [];
    for (const ch of CHARSET) {
      const g = font.charToGlyph(ch);
      if (!g || g.index === 0) { missing.push(ch); continue; }
      const p = g.getPath(0, 0, 1000);
      const cs = pathToContours(p.commands);
      let net = 0, per = 0;
      for (const c of cs) { net += sArea(c); per += pLen(c); }
      if (per <= 0) { missing.push(ch); continue; } // boş kontur (ör. boşluk eşlemesi)
      const bb = p.getBoundingBox();
      coeff.chars[ch] = {
        alan: +(Math.abs(net) / (cap * cap)).toFixed(4),
        cevre: +(per / cap).toFixed(3),
        genislik: +((bb.x2 - bb.x1) / cap).toFixed(3),
        yukseklik: +((bb.y2 - bb.y1) / cap).toFixed(3),
      };
      glyphs.chars[ch] = {
        d: p.toPathData(2),
        x1: +bb.x1.toFixed(1), y1: +bb.y1.toFixed(1), x2: +bb.x2.toFixed(1), y2: +bb.y2.toFixed(1),
      };
    }
    writeFileSync(path.join(root, 'public', 'coefficients', `${id}.json`), JSON.stringify(coeff));
    writeFileSync(path.join(root, 'public', 'glyphs', `${id}.json`), JSON.stringify(glyphs));
    const n = Object.keys(coeff.chars).length;
    console.log(`${id} (${family}:${weight}): ${n}/${CHARSET.length}${missing.length ? ' · EKSİK: ' + missing.join(' ') : ''}`);
    ok++;
  } catch (e) {
    console.error(`HATA ${id} (${family}:${weight}): ${e.message}`);
    fail++;
  }
}
console.log(`\n${ok} font tamam, ${fail} hata → public/coefficients/ + public/glyphs/`);
