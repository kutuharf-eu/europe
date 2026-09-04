-- KUTUHARF.EU — Fiyat tabloları
-- Bu iki tablonun şeması uzun süre HİÇBİR YERDE yazılı değildi: yalnız canlı
-- veritabanında vardı. 2026-09-04'te o veritabanına erişim kaybolunca şema da
-- kayboldu ve alanlar app/api/admin/pricing/route.js'ten geri çıkarıldı.
-- Bir daha olmasın diye buraya yazıldı. Idempotent: tekrar çalıştırılabilir.
--
-- ⚠ 2026-09-04 TAŞIMA: kutuharf artık KENDİ Supabase projesinde değil.
--   Tablolar kittelwerk projesinde (rtmddkhvhtdkekdzhopw) kutuharf_ önekiyle
--   yaşıyor — Wipello'nun wipello_ öneki gibi. Sebep: ücretsiz planda hesap
--   başına 2 aktif proje sınırı var ve ayrı projeler 7 günde bir duraklayıp
--   siteyi kırıyordu. O projenin keep-alive'ı zaten kurulu, kutuharf de
--   otomatik olarak ondan faydalanıyor.
-- ────────────────────────────────────────────────────────────────────────────

-- 1) FİYAT DEĞİŞKENLERİ — config/pricing.json varsayılanlarının üstüne yazan
--    admin override'ları. Panel yalnız bildiği anahtarları gönderir.
--    value jsonb: pricing.json değerleri sayı, dizi veya nesne olabiliyor.
--    value = null → "tanımsız" demek; motor bunu uyarı olarak ele alır.
create table if not exists kutuharf_pricing_variables (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz not null default now()
);

-- 2) EK MALİYET KALEMLERİ — boya, RGB, ambalaj kademesi vb. Admin tanımlar.
--    cost_type ve currency değerleri route.js'teki EXTRA_TYPES / CURRENCIES
--    dizileriyle BİREBİR aynı olmalı; orada değişirse buradaki check de değişmeli.
--    applies_* boş dizi = "her durumda geçerli".
create table if not exists kutuharf_extra_costs (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  cost_type            text not null default 'per_order'
                       check (cost_type in ('per_letter','per_m2','per_order','percent')),
  amount               numeric(12,4) not null default 0,
  currency             text not null default 'TRY'
                       check (currency in ('TRY','USD','EUR')),
  applies_lighting     text[] not null default '{}',
  applies_construction text[] not null default '{}',
  active               boolean not null default true,
  note                 text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists idx_kutuharf_extra_active on kutuharf_extra_costs(active, created_at);

-- RLS: ikisine de erişim YALNIZ service_role ile, API rotalarından.
-- İstemciye policy verilmiyor → anon/authenticated boş liste görür.
alter table kutuharf_pricing_variables enable row level security;
alter table kutuharf_extra_costs       enable row level security;

-- ────────────────────────────────────────────────────────────────────────────
-- NOT: db/001_roller.sql içinde `alter table kutuharf_orders ...` satırları var
-- ama o tablonun CREATE'i hiçbir dosyada yok ve mevcut kod onu HİÇ kullanmıyor
-- (kodda geçen tablolar: pricing_variables, extra_costs, profiles, designs,
-- design_templates, quote_requests). Taşımada o ALTER'lar bilerek atlandı.
