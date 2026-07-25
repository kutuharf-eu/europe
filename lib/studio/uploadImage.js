'use client';

// Stüdyoya eklenen logo/görselin kalıcı yüklemesi.
// Eskiden yalnız tarayıcıdaki blob URL'i kullanılıyordu → tasarım kaydedilip
// yeniden açıldığında görsel kayboluyordu. Artık dosya uploads bucket'ına yüklenip
// modele kalıcı public URL yazılır (mevcut konfigüratörle aynı desen).

import { supabase } from '@/utils/supabaseClient';

export const IMAGE_LIMITS = {
  maxBytes: 5 * 1024 * 1024,
  // SVG kasıtlı olarak yok: public bucket'ta servis edilen script taşıyabilen format.
  types: ['image/png', 'image/jpeg', 'image/webp'],
};

/**
 * @param {File} file
 * @returns {Promise<string>} kalıcı public URL
 */
export async function uploadStudioImage(file) {
  if (!IMAGE_LIMITS.types.includes(file.type)) throw new Error('unsupported-type');
  if (file.size > IMAGE_LIMITS.maxBytes) throw new Error('too-large');

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-60);
  const path = `studio-images/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: false });
  if (error) throw error;

  return supabase.storage.from('uploads').getPublicUrl(path).data.publicUrl;
}
