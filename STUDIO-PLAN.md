# KUTUHARF.EU — 2D TABELA TASARIM STÜDYOSU · ANALİZ ve UYGULAMA PLANI

> Hazırlanma: 25 Temmuz 2026 · Kod yazılmadan önceki analiz aşaması.
> Bu dosya oturum açılışında (PIN doğrulaması sonrası) Murat'a AYNEN yazılacak.
> Kaynak: mevcut `kutuharf-europe` reposunun incelenmesi.

---

# 1. Mevcut Durum Analizi

## 1.1 Teknoloji yığını — bir düzeltme

**Projede TypeScript yok.** Tamamı düz JavaScript + JSX; `tsconfig.json` değil
`jsconfig.json` var (sadece `@/*` alias'ı için). Brief'te TS varsayılmış ama gerçek
durum bu.

| Beyan | Gerçek |
|---|---|
| TypeScript | ❌ Yok — `.js` / `.jsx`, `jsconfig.json` |
| Next.js | ✅ 16.2.10, App Router, Turbopack |
| React | ✅ 19 |
| Tailwind | ✅ 3.4.17 |
| Zustand | ✅ 5.0.14 — tek store (`cartStore`), `persist` middleware |
| Supabase | ✅ `@supabase/supabase-js` 2.110 |
| Konva | ❌ Kurulu değil |

**Önerim:** MVP'yi JS'te yaz, eleman modelini JSDoc `@typedef` ile tiple. Canlı bir
sitede sırf editör için TS derleyicisi devreye almak build riskini boşuna artırır.
TS'e geçilecekse ayrı bir iş olarak, tüm proje birlikte.

## 1.2 Fiyat motoru — en kritik bulgu

Zincir şöyle:

```
POST /api/price  (allowlist'li cfg)
   └→ lib/live-pricing.js  serverKonfigPrice()      [server-only: node:fs]
        ├→ konfigPrice()      legacy/doğrulama       data/konfigurator.js
        ├→ computeCost()      saf maliyet motoru     lib/cost-engine.js
        └→ getLivePricing()   Supabase + JSON        lib/pricing-vars.js (60 sn cache)
```

**Motorun tanıdığı girdi modeli, stüdyonun üreteceğinden dar:**

| Stüdyo öğesi | Motorda karşılığı | Durum |
|---|---|---|
| Yazı (text) | `text` + `heightCm` + `fontId` | ✅ Birebir |
| Logo/görsel | `logo: {widthCm, heightCm, shape}` | ✅ Var |
| Yatay/dikey çubuk | `cubukLed: {lengthCm, heightCm}` | ✅ Var |
| Daire | `logo` + `shape:'circle'` | ✅ Eşlenebilir |
| **Yıldız** | — | ❌ Yok |
| **Zemin (tabela kasası)** | — | ❌ **Hiç yok** |
| Renk | — | ⚠️ Fiyatı etkilemiyor (RAL/krom boyama hariç) |
| Konum (x/y) | — | ⚠️ Fiyatı etkilemiyor |

Motor **harf/logo/çubuk** fiyatlıyor; **tabela zemini diye bir kalem yok**. Bu MVP'nin
en büyük mimari kararı: brief'in istediği fiyat kartı zemin türü ve ölçüsünü
gösterecek, ama zeminin bir fiyatı yok.

**Karar:** MVP'de motora dokunulmuyor. Eşlenebilenler eşlenir; zemin ve yıldız fiyat
kartında *"teklife dahil — ayrıca fiyatlanacak"* olarak işaretlenir. Zemin
fiyatlandırması ayrı ve küçük bir faz (Faz 6) — yeni gelir kalemi olduğu için doğru
yapılmalı, aceleye gelmemeli.

**Kullanılacak hazır mekanizma:** `addon` bayrağı. Motor zaten "ek ürün" mantığını
biliyor (`serverKonfigPrice(cfg, {addon:true})` → ambalaj/minimum/montaj/trafo tekrar
alınmaz). Stüdyoda birden fazla yazı bloğu olunca ilki ana kalem, diğerleri addon →
çift ücretlendirme olmaz.

## 1.3 Zustand deseni

Tek store var: `store/cartStore.js`, `create(persist(...))`, `localStorage` anahtarı
`rs-cart`. Seçiciler tek tek çağrılıyor (`useCartStore(s => s.addItem)`).

⚠️ **Çakışma riski:** `addItem` kalemleri `categorySlug|productSlug|detail` anahtarıyla
**birleştiriyor ve qty artırıyor**. İki farklı stüdyo tasarımı aynı anahtara düşerse tek
satırda toplanır. Tasarım id'si `detail`'e girmeli.

## 1.4 Supabase

Mevcut tablolar — **hepsi `kutuharf_` önekli** (kural): `kutuharf_anfragen`,
`kutuharf_extra_costs`, `kutuharf_orders`, `kutuharf_pricing_variables`,
`kutuharf_profiles`, `kutuharf_workshops`. Storage bucket: `uploads` (public), zaten
logo yüklemede kullanılıyor.

İki önemli gerçek:

1. **Anon istemci yazamaz.** Güvenlik kilidinden sonra tüm yazma işleri API
   rotalarından service key ile geçiyor. Yani tasarım kaydı istemciden Supabase'e
   değil, `/api/studio/design`'a gitmeli.
2. **Son müşteri girişi YOK.** `auth.users` yalnız Händler/admin/üretici için.
   Brief'teki `designs.user_id` karşılıksız. Çözüm: `user_id` nullable + `owner_token`
   (istemcide üretilen uuid, localStorage) + Händler girişliyse `haendler_id`.

Tablo adları brief'tekinden farklı olacak: `kutuharf_designs`,
`kutuharf_design_templates`, `kutuharf_quote_requests`.

## 1.5 Yeniden kullanılacaklar

- `data/konfigurator.js` → `KONFIG_FONTS` (68 font), **`KONFIG_COLORS`**
  (pleksi/krom/alu paletleri — renk paleti hazır), `KONFIG_LIMITS`, `normalizeLogo`,
  `normalizeCubukLed`
- `public/coefficients/*.json` + `public/glyphs/*.json` → gerçek glyph geometrisi;
  ileride tuvalde gerçek harf konturu çizmek için
- `FONT_PDF` haritası (KonfiguratorTest.jsx:131) → Konva'nın çizimden önce fontu
  yüklemesi için gerekli
- `utils/supabaseClient.js` (storage upload), `utils/rateLimit.js`,
  `LocaleProvider`/`useT` (3 dil), `SiteNav`/`SiteFooter`
- `/api/anfrage` → teklif rotasının doğrulama/rate-limit/storage-prefix deseni

---

# 2. Riskler

| # | Risk | Önlem |
|---|---|---|
| R1 | `KonfiguratorTest.jsx` **142 KB** — dokunmak çalışan siteyi bozar | Stüdyo tamamen ayrı rota. Bu dosyaya **tek satır** dokunulmayacak |
| R2 | Motor girdi modeli ≠ stüdyo modeli | Ayrı eşleme katmanı (`lib/studio/toPricingCfg.js`) + fiyatlanamayan öğeler için uyarı |
| R3 | **`/api/order` her kalemi sunucuda yeniden fiyatlıyor** | "Sepete ekle" MVP'de en zor parça. Önce **Kaydet + Teklif**, sepet Faz 6 |
| R4 | Konva + Next App Router SSR'da patlar (`canvas` modülü) | `dynamic(() => import(...), { ssr: false })`, sadece stüdyo rotasında |
| R5 | Konva ~150 KB gz — ana bundle şişer | Rota bazlı lazy load; diğer sayfalar etkilenmez |
| R6 | `/api/price` allowlist'i bilinmeyen alanı sessizce düşürür | Yeni cfg alanı gelirse allowlist'e eklenecek |
| R7 | Sepet anahtarı çakışması (1.3) | `detail` içine tasarım id'si |
| R8 | "Tahmini üretim süresi" için veri kaynağı yok | Basit kural (harf sayısı + boy) → yeni pricing değişkeni; Faz 3'te netleşecek |

---

# 3. Mimari Kararlar

**Konva mı, SVG mi?** — `react-konva`, ama şartla.

Konva sürükleme/boyutlandırma ergonomisini hazır veriyor (Transformer), 20 maddelik
MVP'yi en hızlı bitiren yol. Alternatif SVG+React daha hafif ve üretim için doğrudan
vektör çıktı verir — bir tabela firması için değerli. Bu yüzden: **eleman modeli
renderer'dan bağımsız tutulacak.** `elements[]` saf veri olacak, Konva sadece onu çizen
katman. İleride üretim için SVG/DXF çıkışı eklemek renderer değiştirmeyi
gerektirmeyecek.

**Ölçek modeli:** Tek doğruluk kaynağı **cm**. Tuval px'i türetilmiş değer
(`pxPerCm = canvasWidth / signWidthCm`). Zemin ölçüsü değişince öğelerin cm değerleri
sabit kalır, sadece ölçek değişir — brief'teki "oran güncellensin" maddesi bu şekilde
doğru çalışır.

**Fiyat akışı:** `elements` değişimi → 400 ms debounce → sadece **fiyata etki eden
alanların** hash'i değiştiyse (`x/y` değişimi fiyatı etkilemez, istek atılmaz) →
`POST /api/studio/price` → tek yanıtta tüm kalemler. Sürükleme sırasında hiç istek
gitmez.

---

# 4. Dosya Planı

**Yeni (mevcut hiçbir dosya değişmiyor):**

```
app/studio/page.js                        server page + metadata
app/api/studio/price/route.js             toplu fiyat (serverKonfigPrice sarmalayıcı)
app/api/studio/design/route.js            kaydet / yükle (service key)
app/api/studio/quote/route.js             teklif talebi
app/api/studio/templates/route.js         şablon listesi

components/studio/StudioClient.jsx        3 panel iskeleti + mobil çekmece
components/studio/StudioCanvas.jsx        Konva Stage (dynamic, ssr:false)
components/studio/nodes/{Text,Image,Shape}Node.jsx
components/studio/panels/ToolPanel.jsx    sol
components/studio/panels/PricePanel.jsx   sağ
components/studio/panels/TemplateBar.jsx
components/studio/controls/{ColorPicker,BackgroundPicker,ShapePicker}.jsx
components/studio/QuoteDialog.jsx

store/studioStore.js                      zustand + history
lib/studio/model.js                       eleman fabrikaları + JSDoc tipleri
lib/studio/toPricingCfg.js                tasarım → motor cfg (+ uyarılar)
lib/studio/geometry.js                    cm↔px, tuval sığdırma
data/studio-backgrounds.js                zemin türleri
data/studio-shapes.js                     yıldız/daire/çubuk tanımları
db/002_studio.sql                         3 tablo + RLS
```

**Değişecek (küçük, izole):**
- `data/i18n.js` — `studio.*` anahtarları (DE/TR/EN)
- `components/SiteNav.jsx` — stüdyo linki (tek satır)
- `package.json` — `konva` + `react-konva`

---

# 5. Fazlar

| Faz | Kapsam | Çıktı |
|---|---|---|
| **0** | Rota + Konva PoC: boş Stage, tek sürüklenebilir yazı, store yok | Build temiz, mevcut sayfalar bozulmamış, bundle ölçüldü |
| **1** | Store + eleman modeli + yazı/şekil/görsel ekle-taşı-boyutlandır-sil + undo/redo | MVP 5-15 + 20 |
| **2** | Zemin türü/ölçü/renk + renk paletleri + ışıklı anahtarı (görsel) | MVP 2-4, 16 |
| **3** | Fiyat eşleme + debounce + canlı fiyat kartı | MVP 17 |
| **4** | Supabase kayıt + önizleme görseli + teklif formu | MVP 18-19 |
| **5** | Şablonlar (DB'den) | Kafe/Restoran/Berber/… |
| **6** | *Ayrı iş:* zemin fiyatlandırması, sepete ekle, PDF | Brief'in ertelenen kısmı |

Her fazdan sonra: değişen dosyalar + test noktaları + `npm run test:motor` (8/8) +
build + `/api/price` regresyon kontrolü.

---

# 6. Murat'tan bekleyen 3 karar (BAŞLAMADAN ÖNCE)

1. **Zemin fiyatı:** MVP'de fiyatsız mı görünsün (*"teklifle netleşir"*), yoksa Faz
   3'te m² fiyatı verilip hemen fiyatlansın mı? Verilirse (alüminyum kasa / kompozit /
   düz panel €/m²) baştan doğru kurulur.
2. **Yıldız:** çevreleyen dikdörtgeni logo gibi mi fiyatlansın, yoksa *"teklif gerekli"*
   mi işaretlensin?
3. **Stüdyo mevcut konfigüratörün yerini mi alacak, yanında mı duracak?** Öneri:
   **yanında** (`/studio`) — mevcut akış çalışıyor ve para kazandırıyor, riske
   atılmamalı.

Bu üçü cevaplanınca **Faz 0**'dan başlanacak.
