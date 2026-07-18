// Kutu-Harf-Modul v2 — Ürün modeli tanımları (Brief §4).
// Malzeme kombinasyonları if/else ile YAZILMAZ: her model, yüzeyleri malzemelere
// bağlayan bildirimsel bir haritadır. Başlangıç varsayımı — her hücre ileride
// admin panelden değiştirilebilir olmalı.
//
// Surface: 'face' | 'side' | 'back' | 'diffuser'
// MaterialId: 'pleksi_oto' (kalınlık kuralı otomatik, §5.2) | 'krom' | 'alu'
//             | 'alu_yan_bant' (metre bazlı) | 'dekota' | 'raki_beyazi_8mm'
// lighting: 'none' | 'front' | 'back' | 'front_side' | 'side'
// extras:   'halo_ayak' | 'krom_boyama' (opsiyon — UI'da modele göre görünür)

export const PRODUCT_MODELS = [
  { id: 'isiksiz_pleksi', label: 'Işıksız pleksi',
    surfaces: { face: 'pleksi_oto', side: 'alu_yan_bant', back: 'dekota' },
    lighting: 'none', extras: [] },
  { id: 'isiksiz_krom', label: 'Işıksız krom',
    surfaces: { face: 'krom', side: 'krom', back: 'dekota' },
    lighting: 'none', extras: ['krom_boyama'] },
  { id: 'isiksiz_boyali_alu', label: 'Işıksız boyalı alüminyum',
    surfaces: { face: 'alu', side: 'alu_yan_bant', back: 'dekota' },
    lighting: 'none', extras: [] },
  { id: 'onden_isikli', label: 'Önden ışıklı',
    surfaces: { face: 'pleksi_oto', side: 'alu_yan_bant', back: 'dekota' },
    lighting: 'front', extras: [] },
  { id: 'halo', label: 'Arkadan ışıklı (halo)',
    surfaces: { face: 'krom', side: 'krom', back: 'raki_beyazi_8mm', diffuser: 'raki_beyazi_8mm' },
    lighting: 'back', extras: ['halo_ayak', 'krom_boyama'] },
  { id: 'onden_yandan_isikli', label: 'Önden + yandan ışıklı',
    surfaces: { face: 'pleksi_oto', side: 'pleksi_oto', back: 'dekota' },
    lighting: 'front_side', extras: [] },
  { id: 'yandan_isikli', label: 'Yandan ışıklı',
    surfaces: { face: 'krom', side: 'pleksi_oto', back: 'dekota' },
    lighting: 'side', extras: ['krom_boyama'] },
  { id: 'fileli', label: 'Fileli',
    surfaces: { face: 'pleksi_oto', side: 'alu_yan_bant', back: 'dekota' },
    lighting: 'front', extras: [] },
  { id: 'ters_tava', label: 'Ters tava',
    surfaces: { face: 'alu', side: 'alu' },
    lighting: 'back', extras: ['halo_ayak'] },
];

export const FONT_OPTIONS = [
  { id: 'anton', label: 'Anton — dar kalın' },
  { id: 'archivo', label: 'Archivo Black — geniş kalın' },
  { id: 'oswald', label: 'Oswald Bold — orta' },
];

export const LED_TYPES = [
  { id: 'samsung', label: 'Samsung', varKey: 'ledSamsung' },
  { id: 'standart', label: 'Standart', varKey: 'ledStandart' },
];

export const TRAFO_KADEMELER = [60, 100, 150, 200, 320];
