'use client';

// Tasarım sahipliği. Sitede son müşteri girişi yok (auth.users yalnız Händler/admin/
// üretici için) → sahiplik, tarayıcıda üretilen rastgele bir anahtarla kurulur.
// Kaydedilen tasarım yalnız bu anahtarla geri yüklenebilir.

const KEY = 'kh-studio-owner';

export function ownerToken() {
  if (typeof window === 'undefined') return null;
  let token = null;
  try {
    token = window.localStorage.getItem(KEY);
  } catch {
    return null; // özel mod / kapalı depolama: kayıt özelliği devre dışı kalır
  }
  if (!token) {
    token =
      window.crypto?.randomUUID?.() ||
      `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
    try {
      window.localStorage.setItem(KEY, token);
    } catch {
      return null;
    }
  }
  return token;
}
