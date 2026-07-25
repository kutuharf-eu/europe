-- KUTUHARF.EU — Tasarım Stüdyosu (Faz 4) şeması
-- Supabase SQL Editor'de çalıştır (projekt: kutuharf.eu direkt hesabı).
-- Tüm tablolar kutuharf_ önekli. Idempotent: tekrar çalıştırılabilir.
--
-- SAHİPLİK NOTU: Sitede son müşteri girişi YOK (auth.users yalnız Händler/admin/
-- üretici içindir). Bu yüzden tasarımın sahibi `owner_token` — istemcide üretilen,
-- localStorage'da saklanan rastgele bir anahtar. Händler girişliyse ayrıca
-- haendler_id yazılır.
-- ────────────────────────────────────────────────────────────────────────────

-- 1) TASARIMLAR — stüdyoda kaydedilen çalışmalar
--    design: eleman modeli + zemin + ürün seçimleri (lib/studio/model.js şeması)
--    preview_url: uploads bucket'ındaki PNG önizleme
create table if not exists kutuharf_designs (
  id           uuid primary key default gen_random_uuid(),
  owner_token  text not null,
  haendler_id  uuid references auth.users(id) on delete set null,
  title        text,
  design       jsonb not null,
  preview_url  text,
  price_total  numeric(10,2),          -- kayıt anındaki hesaplanan net toplam (bilgi amaçlı)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_kutuharf_designs_owner   on kutuharf_designs(owner_token);
create index if not exists idx_kutuharf_designs_created on kutuharf_designs(created_at desc);

-- 2) TEKLİF TALEPLERİ — stüdyodan gönderilen "Angebot anfordern"
--    Tasarım kaydı zorunlu değil (design_id null olabilirse de akışta hep dolu gelir).
create table if not exists kutuharf_quote_requests (
  id          uuid primary key default gen_random_uuid(),
  design_id   uuid references kutuharf_designs(id) on delete set null,
  owner_token text,
  name        text not null,
  firma       text,
  email       text not null,
  telefon     text,
  nachricht   text,
  price_total numeric(10,2),
  status      text not null default 'neu' check (status in ('neu','gesehen','beantwortet','erledigt')),
  created_at  timestamptz not null default now()
);

create index if not exists idx_kutuharf_quotes_status  on kutuharf_quote_requests(status);
create index if not exists idx_kutuharf_quotes_created on kutuharf_quote_requests(created_at desc);

-- 3) ŞABLONLAR (Faz 5'te doldurulacak — şimdiden ekli)
--    active=false olanlar listelenmez; sort küçükten büyüğe sıralanır.
create table if not exists kutuharf_design_templates (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  branche     text,                    -- Cafe, Restaurant, Friseur…
  design      jsonb not null,
  preview_url text,
  sort        int not null default 100,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists idx_kutuharf_templates_active on kutuharf_design_templates(active, sort);

-- 4) RLS — güvenlik kilidinden sonraki kural: anon İSTEMCİ YAZAMAZ/OKUYAMAZ.
--    Tüm erişim API rotalarından service key ile geçer (owner_token orada doğrulanır).
--    Şablonlar da API üzerinden servis edilir; policy eklenmez → yalnız service role.
alter table kutuharf_designs         enable row level security;
alter table kutuharf_quote_requests  enable row level security;
alter table kutuharf_design_templates enable row level security;

-- 5) updated_at tetikleyicisi (tasarım güncellemelerinde)
create or replace function kutuharf_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_kutuharf_designs_touch on kutuharf_designs;
create trigger trg_kutuharf_designs_touch
  before update on kutuharf_designs
  for each row execute function kutuharf_touch_updated_at();
