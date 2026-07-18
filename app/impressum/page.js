import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'Impressum | KUTUHARF',
  robots: { index: false, follow: false },
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-white text-charcoal">
      <div className="h-2 bg-accent" />
      <SiteNav />
      <main className="px-12 py-16 max-sm:px-6">
        <div className="max-w-[720px] mx-auto flex flex-col gap-6">
          <h1 className="m-0 text-4xl font-extrabold">Impressum</h1>

          <section className="flex flex-col gap-1.5">
            <h2 className="m-0 text-xl font-bold">Angaben gemäß § 5 TMG</h2>
            <p className="m-0 text-[15px] leading-relaxed text-textsec">
              KUTUHARF — ein Angebot der Mil Werbung Marketing
              <br />
              Gleiwitzer Weg 1
              <br />
              31157 Sarstedt
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className="m-0 text-xl font-bold">Kontakt</h2>
            <p className="m-0 text-[15px] leading-relaxed text-textsec">
              Telefon: +49 174 962 33 44
              <br />
              E-Mail: info@kutuharf.eu
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className="m-0 text-xl font-bold">Vertreten durch</h2>
            <p className="m-0 text-[15px] leading-relaxed text-textsec">Inhaber: Mustafa Mil</p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className="m-0 text-xl font-bold">Umsatzsteuer-ID</h2>
            <p className="m-0 text-[15px] leading-relaxed text-textsec">
              Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE449674592
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className="m-0 text-xl font-bold">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p className="m-0 text-[15px] leading-relaxed text-textsec">Mil Werbung Marketing, Anschrift wie oben.</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
