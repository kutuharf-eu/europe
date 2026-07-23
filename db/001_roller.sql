-- KUTUHARF.EU — Rol Sistemi (B2B + Üretici) · Faz 1 şeması
-- Supabase SQL Editor'de çalıştır (projekt: kutuharf.eu direkt hesabı).
-- Tüm tablolar kutuharf_ önekli. Idempotent: tekrar çalıştırılabilir.
-- ────────────────────────────────────────────────────────────────────────────

-- 1) ATÖLYELER (üretim birimleri) — Ana Atölye + taşeronlar
--    Ana Atölye konvansiyonu: profil.workshop_id = NULL (ayrı satır gerekmez),
--    taşeronlar burada birer satır. is_ana bilgi amaçlı (Ana Atölye'yi de kayıt
--    olarak tutmak istenirse). name taşeron kaydı onaylanınca admin tarafından verilir.
create table if not exists kutuharf_workshops (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  is_ana      boolean not null default false,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 2) PROFİLLER — auth.users'a bağlı rol + durum
--    role: haendler | uretici | admin
--    status: pending | approved | rejected  (haendler self-signup → pending)
--    haendler_tier: 'cok' | 'az'  (yalnız haendler; marj kademesini belirler — MÜŞTERİYE GÖSTERİLMEZ)
--    workshop_id: yalnız uretici. NULL = Ana Atölye (tüm siparişler), uuid = taşeron (yalnız atanan)
create table if not exists kutuharf_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null check (role in ('haendler','uretici','admin')),
  status        text not null default 'pending' check (status in ('pending','approved','rejected')),
  firma         text,
  ust_id        text,           -- USt-IdNr (AB vergi no) — haendler zorunlu
  telefon       text,
  haendler_tier text check (haendler_tier in ('cok','az')),
  workshop_id   uuid references kutuharf_workshops(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_kutuharf_profiles_role   on kutuharf_profiles(role);
create index if not exists idx_kutuharf_profiles_status on kutuharf_profiles(status);

-- 3) SİPARİŞE atölye ataması (üretici akışı, Faz 4'te kullanılacak — şimdiden ekli)
alter table kutuharf_orders add column if not exists workshop_id uuid references kutuharf_workshops(id) on delete set null;
alter table kutuharf_orders add column if not exists haendler_id uuid references kutuharf_profiles(id) on delete set null;
alter table kutuharf_orders add column if not exists price_tier  text;   -- hangi marj kademesiyle satıldı (standart/haendler_cok/...)

-- ────────────────────────────────────────────────────────────────────────────
-- RLS — hepsi kapalı başlar; erişim yalnız aşağıdaki policy'lerle.
-- Sunucu (service_role) RLS'i baypas eder → API rotaları her şeyi yönetir.
-- Bu policy'ler yalnız İSTEMCİ (anon/authenticated) erişimini sınırlar.
alter table kutuharf_profiles  enable row level security;
alter table kutuharf_workshops enable row level security;

-- Kullanıcı yalnız KENDİ profilini okuyabilir (fiyat kademesini istemci göremez —
-- API zaten service_role ile çözüyor; bu policy Mein Konto/profil ekranı için).
drop policy if exists "own profile read" on kutuharf_profiles;
create policy "own profile read" on kutuharf_profiles
  for select using (auth.uid() = id);

-- Kayıt sırasında kendi profil satırını oluşturabilir (yalnız kendi id'siyle,
-- rol haendler, durum pending — terfi/onay yalnız service_role ile admin API'sinden).
drop policy if exists "self signup profile" on kutuharf_profiles;
create policy "self signup profile" on kutuharf_profiles
  for insert with check (
    auth.uid() = id and role = 'haendler' and status = 'pending'
  );

-- Atölye adını yalnız o atölyenin üreticisi okuyabilir (kendi panel başlığı için).
drop policy if exists "own workshop read" on kutuharf_workshops;
create policy "own workshop read" on kutuharf_workshops
  for select using (
    exists (select 1 from kutuharf_profiles p
            where p.id = auth.uid() and p.workshop_id = kutuharf_workshops.id)
  );

-- ────────────────────────────────────────────────────────────────────────────
-- NOT (kod tarafı, DB değil): marj kademeleri kutuharf_pricing_variables.marj
-- objesine eklenecek → { rekabetci, standart, premium, haendler_cok, haendler_az }.
-- Değerleri admin panelinden Murat girer. Hedef sıralama (küçük→büyük marj):
--   rekabetci < haendler_cok < haendler_az < standart < premium
