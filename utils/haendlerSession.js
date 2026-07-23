'use client';
// KUTUHARF — İstemci Händler oturumu yardımcıları. supabaseClient (anon) üzerinden
// Supabase Auth oturumunu okur. Token, fiyat/sipariş isteklerine Authorization
// başlığıyla eklenir; sunucu kimliği doğrular (utils/haendlerAuth). Oturum yoksa
// her şey anonim müşteri gibi çalışır — site davranışı DEĞİŞMEZ.
import { supabase } from '@/utils/supabaseClient';

// Geçerli erişim token'ı (yoksa null). Ağ/oturum hatası → null (güvenli düşüş).
export async function getAccessToken() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch {
    return null;
  }
}

// Fetch başlıklarına (varsa) Authorization ekler. base başlıkları korunur.
export async function withAuthHeaders(base = {}) {
  const token = await getAccessToken();
  return token ? { ...base, Authorization: `Bearer ${token}` } : base;
}
