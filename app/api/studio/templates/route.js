// KUTUHARF Stüdyo — hazır şablonlar.
// Öncelik DB'dedir: `kutuharf_design_templates` tablosunda aktif kayıt varsa onlar
// döner; tablo boşsa (veya Supabase yapılandırılmamışsa) koddaki varsayılanlar.
// Böylece stüdyo her durumda dolu açılır.
import { supabaseServer } from '@/utils/supabaseServer';
import { STUDIO_TEMPLATES } from '@/data/studio-templates';

// Şablonlar herkese açık ve nadiren değişir → CDN'de bir saat tutulabilir.
export const revalidate = 3600;

export async function GET() {
  const fallback = STUDIO_TEMPLATES.map((t) => ({
    slug: t.slug,
    title: t.title,
    branche: t.branche,
    design: t.design,
    preview_url: null,
  }));

  const sb = supabaseServer();
  if (!sb) return Response.json({ templates: fallback });

  try {
    const { data, error } = await sb
      .from('kutuharf_design_templates')
      .select('slug,title,branche,design,preview_url')
      .eq('active', true)
      .order('sort', { ascending: true });
    if (error) throw error;
    return Response.json({ templates: data?.length ? data : fallback });
  } catch (e) {
    console.error('[studio/templates] load failed:', e?.message || e);
    return Response.json({ templates: fallback });
  }
}
