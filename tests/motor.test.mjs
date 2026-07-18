// Kutu-Harf-Modul v2 — Kabul kriterleri (Brief §9). Çalıştır: npm run test:motor
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { letterGeometry, computeCost, trafoSecimi, toTRY } from '../lib/cost-engine.js';
import { computeSale } from '../lib/pricing.js';
import { PRODUCT_MODELS } from '../config/products.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Referans font: Archivo Black — brief §9 prototip referansı (0.943 m² / 14.18 mt) bu fonttan.
const coeffs = JSON.parse(readFileSync(path.join(root, 'public', 'coefficients', 'archivo.json'), 'utf8'));
const baseVars = () => JSON.parse(readFileSync(path.join(root, 'config', 'pricing.json'), 'utf8'));
const model = (id) => PRODUCT_MODELS.find((m) => m.id === id);

// §9.2 Geometri: "DÖNER", bold font (Archivo Black), h=0.5 → net alan 0.9–1.0 m²,
// çevre 13–15 mt (prototip referansı 0.943 m² / 14.18 mt)
test('geometri: DÖNER @ 0.5 m (Archivo Black)', () => {
  const g = letterGeometry({ text: 'DÖNER', h: 0.5, coeffs });
  assert.equal(g.N, 5);
  assert.ok(g.toplamOnYuz >= 0.9 && g.toplamOnYuz <= 1.0, `net alan ${g.toplamOnYuz}`);
  assert.ok(g.toplamCevre >= 13 && g.toplamCevre <= 15, `çevre ${g.toplamCevre}`);
});

// §9.3 Pleksi kuralı: h=0.9 → 3 mm TRY; h=1.0 → 5 mm USD + kur raporu; kur null → uyarı + 0
test('pleksi kalınlık kuralı ve USD kuru', () => {
  const vars = baseVars();
  vars.usdTry = 40; vars.eurTry = 45;
  const mk = (h) => computeCost({ text: 'AB', h, model: model('onden_isikli'), depth: 0.1, ledType: 'standart', vars, coeffs });

  const c09 = mk(0.9);
  const face09 = c09.items.find((i) => i.id === 'face');
  assert.match(face09.label, /3 mm/);
  assert.equal(face09.birimFiyat.currency, 'TRY');

  const c10 = mk(1.0);
  const face10 = c10.items.find((i) => i.id === 'face');
  assert.match(face10.label, /5 mm/);
  assert.equal(face10.birimFiyat.currency, 'USD');
  assert.equal(c10.kurlar.usdTry, 40); // kullanılan kur sonuçta raporlanır
  assert.ok(Math.abs(face10.tryTotal - face10.miktar * 45 * 40) < 1e-9);

  // kur tanımsız → uyarı + kalem 0
  const varsNull = baseVars();
  const cNull = computeCost({ text: 'AB', h: 1.0, model: model('onden_isikli'), depth: 0.1, ledType: 'standart', vars: varsNull, coeffs });
  const faceNull = cNull.items.find((i) => i.id === 'face');
  assert.equal(faceNull.tryTotal, 0);
  assert.ok(cNull.warnings.some((w) => w.includes('USD/TL kuru tanımlı değil')));
  assert.equal(cNull.isIncomplete, true);
});

// §9.4 Model haritası: halo → rakı beyazı + ayak + kablo aktif; ışıksız pleksi → LED/trafo/kablo YOK
test('model haritası: halo vs ışıksız pleksi', () => {
  const vars = baseVars(); vars.usdTry = 40; vars.eurTry = 45;
  const halo = computeCost({ text: 'CAFE', h: 0.4, model: model('halo'), depth: 0.08, ledType: 'samsung', vars, coeffs });
  const ids = halo.items.map((i) => i.id);
  assert.ok(ids.includes('back') || ids.includes('diffuser'), 'rakı beyazı yüzeyi yok');
  assert.ok(halo.items.some((i) => /Rakı beyazı/.test(i.label)));
  assert.ok(ids.includes('halo_ayak'));
  assert.ok(ids.includes('kablo'));
  assert.ok(ids.includes('led'));

  const unlit = computeCost({ text: 'CAFE', h: 0.4, model: model('isiksiz_pleksi'), depth: 0.08, ledType: 'samsung', vars, coeffs });
  const uids = unlit.items.map((i) => i.id);
  for (const forbidden of ['led', 'trafo', 'kablo']) assert.ok(!uids.includes(forbidden), `${forbidden} ışıksızda olmamalı`);
});

// §9.5 Krom boyama: h=0.4 → 150 TL/harf; h=0.6 → kalem 0 + uyarı
test('krom boyama fiyat kuralı', () => {
  const vars = baseVars(); vars.usdTry = 40; vars.eurTry = 45;
  const small = computeCost({ text: 'ABC', h: 0.4, model: model('isiksiz_krom'), depth: 0.1, ledType: 'standart', kromBoyama: true, vars, coeffs });
  const kb = small.items.find((i) => i.id === 'krom_boyama');
  assert.equal(kb.tryTotal, 3 * 150);

  const big = computeCost({ text: 'ABC', h: 0.6, model: model('isiksiz_krom'), depth: 0.1, ledType: 'standart', kromBoyama: true, vars, coeffs });
  const kbBig = big.items.find((i) => i.id === 'krom_boyama');
  assert.equal(kbBig.tryTotal, 0);
  assert.ok(big.warnings.some((w) => w.includes('Krom boyama >50 cm')));
  assert.equal(big.isIncomplete, true);
});

// §9.6 Trafo: watt'tan kademe seçimi doğru; fiyat 0 iken uyarı
test('trafo kademe seçimi + tanımsız fiyat uyarısı', () => {
  assert.deepEqual(trafoSecimi(50), [{ watt: 60, adet: 1 }]);
  assert.deepEqual(trafoSecimi(320), [{ watt: 320, adet: 1 }]);
  assert.deepEqual(trafoSecimi(400), [{ watt: 320, adet: 1 }, { watt: 100, adet: 1 }]);
  assert.deepEqual(trafoSecimi(650), [{ watt: 320, adet: 2 }, { watt: 60, adet: 1 }]);
  assert.deepEqual(trafoSecimi(0), []);

  const vars = baseVars(); vars.usdTry = 40; vars.eurTry = 45; // trafoFiyat hepsi 0
  const c = computeCost({ text: 'DÖNER', h: 0.5, model: model('onden_isikli'), depth: 0.1, ledType: 'samsung', vars, coeffs });
  assert.ok(c.items.some((i) => i.id === 'trafo' && i.tryTotal === 0));
  assert.ok(c.warnings.some((w) => w.includes('Trafo birim fiyatı tanımlı değil')));
});

// §9.7 Satış katmanı: fire → ambalaj → risk → marj → minSiparis → KDV sırası;
// kargo hiçbir çarpandan geçmez; işçilik=0 uyarısı
test('satış katmanı akışı', () => {
  const vars = baseVars();
  vars.usdTry = 40; vars.eurTry = 50; vars.fireYuzde = 10;
  const cost = { uretimTRY: 10000, warnings: [], geometry: { N: 4 }, kurlar: { usdTry: 40, eurTry: 50 } };
  const s = computeSale({ cost, h: 0.5, segment: 'standart', vars });

  const ambalajTRY = 45 * 50;                       // EUR 45 × kur
  const ara = 10000 * 1.10 + ambalajTRY;            // işçilik 0
  const risk = ara * 0.03;
  const net = ara + risk;
  const nettoEUR = Math.max((net / 50) * 2.0, 250);
  assert.ok(Math.abs(s.araTRY - ara) < 1e-9);
  assert.ok(Math.abs(s.netMaliyetTRY - net) < 1e-9);
  assert.ok(Math.abs(s.satisNettoEUR - nettoEUR) < 1e-9);
  assert.ok(Math.abs(s.kdvEUR - nettoEUR * 0.19) < 1e-9);
  assert.ok(s.warnings.some((w) => w.includes('İşçilik dahil değil')));
  assert.ok(s.kargoNotu.includes('çarpan'));        // kargo bilgi metni, fiyata dahil değil

  // min. sipariş tabanı
  const cheap = computeSale({ cost: { ...cost, uretimTRY: 100 }, h: 0.3, segment: 'standart', vars });
  assert.equal(cheap.satisNettoEUR, 250);
  assert.equal(cheap.minUygulandi, true);

  // eurTry tanımsız → EUR fiyat yok + uyarı
  const varsNull = baseVars();
  const noKur = computeSale({ cost, h: 0.5, segment: 'standart', vars: varsNull });
  assert.equal(noKur.satisNettoEUR, null);
  assert.ok(noKur.warnings.some((w) => w.includes('EUR/TL kuru tanımlı değil')));
});

// Kalibrasyon: canlı kombinasyon → motor bazlı base önerisi
test('kalibrasyon: canlı base önerileri', async () => {
  const { calibrate, LIVE_COMBOS } = await import('../lib/calibrate.js');
  const vars = baseVars(); vars.usdTry = 41; vars.eurTry = 48;
  const rows = calibrate({ vars, coeffs, depth: 0.1, ledType: 'samsung', segment: 'standart' });
  assert.equal(rows.length, LIVE_COMBOS.length);
  const strafor = rows.find((r) => r.id === 'unbel_strafor');
  assert.equal(strafor.motor20, null); // motor karşılığı yok
  const halo = rows.find((r) => r.id === 'rueck');
  assert.ok(halo.motor20 > 0 && halo.motor50 > halo.motor30 && halo.motor30 > halo.motor20);
  assert.ok(Math.abs(halo.yeniBase * halo.factor - halo.motor20) < 1e-9); // base tanımı
  // kur yokken hesaplanamaz
  const noKur = calibrate({ vars: baseVars(), coeffs, depth: 0.1, ledType: 'samsung', segment: 'standart' });
  assert.equal(noKur[0].motor20, null);
});

// §5.4 toTRY para birimi çevrimi
test('toTRY çevrim ve uyarılar', () => {
  const vars = { usdTry: 40, eurTry: 50 };
  let w = [];
  assert.equal(toTRY({ amount: 100, currency: 'TRY' }, vars, w, 'x'), 100);
  assert.equal(toTRY({ amount: 10, currency: 'USD' }, vars, w, 'x'), 400);
  assert.equal(toTRY({ amount: 10, currency: 'EUR' }, vars, w, 'x'), 500);
  assert.equal(w.length, 0);
  assert.equal(toTRY(null, vars, w, 'kalem'), 0);
  assert.ok(w[0].includes('tanımlı değil'));
});
