'use client';

// Renk paleti — gruplu swatch listesi. Paletler mevcut konfigüratörden gelir
// (KONFIG_COLORS: Acryl/Chrom, KONFIG_RAL: RAL tonları), yani stüdyoda seçilen renk
// üretimde karşılığı olan bir renktir.

export default function ColorPicker({ groups, value, onChange }) {
  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <div key={g.title}>
          <span className="mb-1.5 block text-[11px] uppercase tracking-wide text-white/35">
            {g.title}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {g.colors.map((c) => {
              const active = value?.toLowerCase() === c.hex.toLowerCase();
              return (
                <button
                  key={`${g.title}-${c.id}`}
                  type="button"
                  title={c.label}
                  aria-label={c.label}
                  aria-pressed={active}
                  onClick={() => onChange(c.hex)}
                  className={`h-7 w-7 rounded-md border transition ${
                    active
                      ? 'border-[#7cc4ff] ring-2 ring-[#7cc4ff]/40'
                      : 'border-white/20 hover:border-white/45'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
