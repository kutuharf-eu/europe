// Sunucu tarafı Supabase istemcisi (service role) — yalnız API rotaları ve
// server modülleri import etmeli, İSTEMCİYE ASLA sızmamalı.
// Env yoksa null döner; arayanlar JSON varsayılanlarıyla devam eder.
import { createClient } from '@supabase/supabase-js';

let client; // module-level cache (undefined = henüz denenmedi)

export function supabaseServer() {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}
