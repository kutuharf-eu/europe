// Kutu-Harf-Modul v2 — Repository für Preisvariablen (Brief §2/§8).
// Varsayılanlar: config/pricing.json. Canlı değerler: Supabase
// `kutuharf_pricing_variables` (key/value) + `kutuharf_extra_costs` —
// restaurantspezial projesinde kutuharf_ önekiyle yaşar (17 Tem 2026 kararı).
// Supabase env yoksa/başarısızsa JSON varsayılanlarıyla çalışır.
import defaults from '@/config/pricing.json';
import { supabaseServer } from '@/utils/supabaseServer';

// Senkron varsayılanlar — /motor-test değişken paneli bunu kullanır.
export function getPricingVariables() {
  // Deep copy, damit UI-Overrides die importierten Defaults nie mutieren.
  return JSON.parse(JSON.stringify(defaults));
}

let cache = null; // { at, vars, extras }
const TTL_MS = 60_000;

// Canlı fiyat verisi (yalnız sunucu): varsayılanlar + Supabase override'ları.
// extras: aktif ek maliyet kalemleri (boya, RGB, ambalaj kademesi vb. — admin tanımlar).
export async function getLivePricing() {
  if (cache && Date.now() - cache.at < TTL_MS) return cache;
  const vars = getPricingVariables();
  let extras = [];
  const sb = supabaseServer();
  if (sb) {
    try {
      const [varsRes, extrasRes] = await Promise.all([
        sb.from('kutuharf_pricing_variables').select('key,value'),
        sb.from('kutuharf_extra_costs').select('*').eq('active', true),
      ]);
      if (varsRes.error) throw varsRes.error;
      for (const r of varsRes.data || []) vars[r.key] = r.value; // value=null → tanımsız (motor uyarır)
      extras = extrasRes.data || [];
    } catch (e) {
      // Supabase erişilemedi → JSON varsayılanları (site fiyatsız kalmaz, legacy devreye girer)
      console.error('[pricing-vars] Supabase okunamadı:', e?.message || e);
    }
  }
  cache = { at: Date.now(), vars, extras };
  return cache;
}

// Admin panel kaydettikten sonra çağırır — sonraki istek taze veriyi çeker.
export function invalidatePricingCache() {
  cache = null;
}
