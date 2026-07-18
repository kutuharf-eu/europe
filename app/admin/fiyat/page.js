import AdminFiyatClient from '@/components/AdminFiyatClient';

// Admin fiyat paneli — indexlenmez, KUTUHARF_ADMIN_KEY ile korunur (API tarafında).
export const metadata = {
  title: 'Fiyat Yönetimi — KUTUHARF Admin',
  robots: { index: false, follow: false },
};

export default function AdminFiyatPage() {
  return <AdminFiyatClient />;
}
