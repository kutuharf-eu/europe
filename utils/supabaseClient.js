'use client';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Ohne konfigurierte Env-Variablen (lokal, vor dem Supabase-Setup) ein No-Op-Stub,
// damit Konfigurator/Warenkorb ohne Backend laufen — Datei-Upload meldet dann einen Fehler.
const stub = {
  storage: {
    from: () => ({
      upload: async () => ({ error: new Error('Storage nicht konfiguriert') }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
};

export const supabase = url && key ? createClient(url, key) : stub;
