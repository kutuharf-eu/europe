// Kutu-Harf-Modul v2 — Aşama 1: Katsayı üretme scripti (BUILD-TIME, nur lokal).
// Liest die im Prototyp (kutu-harf-fiyat-motoru.html) eingebetteten WOFF-Fonts
// (latin + latin-ext) — dieselbe Quelle, mit der die Glyph-Mathematik validiert
// wurde — und erzeugt pro Font normalisierte Katsayı-Tabellen (h = 1 cap height):
//   public/coefficients/<font>.json  → { alan, cevre, genislik, yukseklik } je Zeichen
//   public/glyphs/<font>.json        → SVG-Pfaddaten + BBox für die Live-Vorschau
// Aufruf: npm run coeff
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import opentype from 'opentype.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(path.join(root, 'kutu-harf-fiyat-motoru.html'), 'utf8');

// FONT_B64 = { archivo: ["<latin>","<latin-ext>"], ... } aus dem Prototyp extrahieren
const FONTS = {};
for (const key of ['archivo', 'anton', 'oswald']) {
  const m = html.match(new RegExp(key + '\\s*:\\s*\\["([A-Za-z0-9+/=]+)"\\s*,\\s*"([A-Za-z0-9+/=]+)"\\]'));
  if (!m) { console.error(`FEHLER: FONT_B64.${key} nicht im Prototyp gefunden`); process.exit(1); }
  FONTS[key] = m.slice(1, 3).map((b64) => {
    const buf = Buffer.from(b64, 'base64');
    return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  });
}

// ── Glyph-Geometrie (identisch zum validierten Prototyp) ─────────────────────
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

function pickGlyph(key, ch) {
  for (const f of FONTS[key]) {
    const g = f.charToGlyph(ch);
    if (g && g.index !== 0) return g;
  }
  return null;
}

// Zeichensatz laut Brief §3.6 + Deutsch (Ä ä ß) + akzentuierte Zeichen (é è à).
// Ö Ü ö ü zählen zum Deutsch-Block (nicht doppelt im türkischen Block).
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÄÖÜäöüßÇĞİŞçğışÉÈÀéèà0123456789&.-\'';

mkdirSync(path.join(root, 'public', 'coefficients'), { recursive: true });
mkdirSync(path.join(root, 'public', 'glyphs'), { recursive: true });

for (const key of Object.keys(FONTS)) {
  const H = pickGlyph(key, 'H');
  const capBB = H.getPath(0, 0, 1000).getBoundingBox();
  const cap = capBB.y2 - capBB.y1; // capHeight bei fontSize 1000

  const coeff = { font: key, normalize: 'h=1 (cap height)', chars: {} };
  const glyphs = { font: key, cap: +cap.toFixed(1), chars: {} };
  const missing = [];

  for (const ch of CHARSET) {
    const g = pickGlyph(key, ch);
    if (!g) { missing.push(ch); continue; }
    const p = g.getPath(0, 0, 1000);
    const cs = pathToContours(p.commands);
    let net = 0, per = 0;
    for (const c of cs) { net += sArea(c); per += pLen(c); }
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

  writeFileSync(path.join(root, 'public', 'coefficients', `${key}.json`), JSON.stringify(coeff));
  writeFileSync(path.join(root, 'public', 'glyphs', `${key}.json`), JSON.stringify(glyphs));
  const n = Object.keys(coeff.chars).length;
  console.log(`${key}: ${n}/${CHARSET.length} Zeichen · cap=${cap.toFixed(0)}${missing.length ? ' · FEHLEND: ' + missing.join(' ') : ''}`);
}
console.log('OK → public/coefficients/ + public/glyphs/');
