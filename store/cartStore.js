'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SHIPPING_COST, FREE_SHIPPING_FROM, VAT_RATE, DATENCHECK_PRICE } from '@/data/categories';

// Ein Warenkorb-Eintrag: { key, categorySlug, productSlug, name, detail, unitPrice, qty }
// detail = Variantenlabel oder Maßangabe; unitPrice = Netto-Listenpreis (ohne Händlerrabatt).
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      reseller: null, // { email, rate } — im Händlerportal gesetzt (bei KUTUHARF derzeit ungenutzt)

      addItem: (item) =>
        set((s) => {
          const key = `${item.categorySlug}|${item.productSlug}|${item.detail}`;
          const existing = s.items.find((i) => i.key === key);
          const items = existing
            ? s.items.map((i) => (i.key === key ? { ...i, qty: i.qty + (item.qty || 1) } : i))
            : [...s.items, { ...item, key, qty: item.qty || 1 }];
          return { items };
        }),
      // Ersetzt alle Positionen eines Produkts durch die gewählte Variante (Produktseiten-Flow)
      selectVariant: (item) =>
        set((s) => {
          const kept = s.items.filter(
            (i) => !(i.categorySlug === item.categorySlug && i.productSlug === item.productSlug)
          );
          const key = `${item.categorySlug}|${item.productSlug}|${item.detail}`;
          const old = s.items.find((i) => i.categorySlug === item.categorySlug && i.productSlug === item.productSlug);
          // Datei/Bemerkung/Datencheck der alten Auswahl übernehmen
          const carry = old ? { fileUrl: old.fileUrl, fileName: old.fileName, note: old.note, datencheck: old.datencheck } : {};
          return { items: [...kept, { ...item, ...carry, key, qty: item.qty || 1 }] };
        }),

      removeItem: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      // Datei, Bemerkung, Datencheck je Position
      setItemMeta: (key, patch) =>
        set((s) => ({ items: s.items.map((i) => (i.key === key ? { ...i, ...patch } : i)) })),
      setQty: (key, qty) =>
        set((s) => ({
          items: qty < 1 ? s.items.filter((i) => i.key !== key) : s.items.map((i) => (i.key === key ? { ...i, qty } : i)),
        })),
      clear: () => set({ items: [] }),
      setReseller: (reseller) => set({ reseller }),
    }),
    { name: 'rs-cart' }
  )
);

export const cartTotals = (items, resellerRate = 0) => {
  const datencheckCount = items.filter((i) => i.datencheck).length;
  const datencheckTotal = datencheckCount * DATENCHECK_PRICE;
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0) + datencheckTotal;
  const discount = subtotal * (resellerRate / 100);
  const afterDiscount = subtotal - discount;
  const shipping = items.length === 0 || afterDiscount >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
  const vat = (afterDiscount + shipping) * VAT_RATE;
  const total = afterDiscount + shipping + vat;
  return { subtotal, datencheckCount, datencheckTotal, discount, afterDiscount, shipping, vat, total };
};
