import { Archivo } from 'next/font/google';
import './globals.css';
import { LocaleProvider } from '@/components/LocaleProvider';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-archivo',
});

export const metadata = {
  metadataBase: new URL('https://kutuharf.eu'),
  title: 'KUTUHARF — 3D-Buchstaben & Leuchtbuchstaben nach Maß',
  description:
    'LED-Leuchtbuchstaben, Profilbuchstaben und 3D-Buchstaben online konfigurieren — Sofortpreis, Angebot und Bestellung. Deutschlandweiter Versand.',
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={archivo.variable}>
      <body className="font-sans antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
