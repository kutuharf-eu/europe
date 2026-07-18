import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'Datenschutzerklärung | KUTUHARF',
  robots: { index: false, follow: false },
};

const H2 = 'm-0 text-xl font-bold';
const P = 'm-0 text-[15px] leading-relaxed text-textsec';

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-white text-charcoal">
      <div className="h-2 bg-accent" />
      <SiteNav />
      <main className="px-12 py-16 max-sm:px-6">
        <div className="max-w-[720px] mx-auto flex flex-col gap-6">
          <h1 className="m-0 text-4xl font-extrabold">Datenschutzerklärung</h1>

          <section className="flex flex-col gap-1.5">
            <h2 className={H2}>1. Verantwortlicher</h2>
            <p className={P}>
              KUTUHARF — ein Angebot der Mil Werbung Marketing · Inhaber: Mustafa Mil ·
              Gleiwitzer Weg 1, 31157 Sarstedt · Telefon: +49 174 962 33 44 · E-Mail: info@kutuharf.eu
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className={H2}>2. Hosting</h2>
            <p className={P}>
              Diese Website wird bei Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, USA) gehostet.
              Beim Aufruf der Website verarbeitet Vercel technisch notwendige Daten (z.&nbsp;B. IP-Adresse,
              Datum und Uhrzeit des Zugriffs) in Server-Logfiles. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
              DSGVO (berechtigtes Interesse an einem sicheren und stabilen Betrieb).
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className={H2}>3. Anfrageformular und Bestellungen</h2>
            <p className={P}>
              Wenn Sie unser Anfrageformular nutzen oder eine Bestellung aufgeben, verarbeiten wir die von
              Ihnen angegebenen Daten (Name, ggf. Firma, Anschrift, E-Mail-Adresse, ggf. Telefonnummer,
              Ihre Konfiguration bzw. Nachricht sowie ggf. hochgeladene Dateien) zur Bearbeitung Ihrer
              Anfrage, zur Erstellung eines Angebots und zur Abwicklung des Vertrags. Rechtsgrundlage ist
              Art. 6 Abs. 1 lit. b DSGVO (Vertrag und vorvertragliche Maßnahmen). Die Daten werden in einer
              Datenbank der Supabase Inc. gespeichert (Serverstandort: Frankfurt am Main, Deutschland) und
              zusätzlich per E-Mail über den Dienst Resend an uns übermittelt. Die Daten werden gelöscht,
              sobald sie für die Bearbeitung nicht mehr erforderlich sind und keine gesetzlichen
              Aufbewahrungspflichten bestehen.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className={H2}>4. Cookies und Tracking</h2>
            <p className={P}>
              Diese Website verwendet keine Cookies zu Analyse- oder Marketingzwecken und setzt keine
              Tracking-Dienste ein. Es wird lediglich ein technisch notwendiges Cookie zur Speicherung
              Ihrer Sprachauswahl (Deutsch/Türkisch/Englisch) gesetzt. Rechtsgrundlage ist § 25 Abs. 2
              Nr. 2 TDDDG (unbedingt erforderlich).
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className={H2}>5. Ihre Rechte</h2>
            <p className={P}>
              Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung
              (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit
              (Art. 20 DSGVO) sowie Widerspruch gegen die Verarbeitung (Art. 21 DSGVO). Wenden Sie sich dazu
              an info@kutuharf.eu. Sie haben außerdem das Recht, sich bei einer
              Datenschutz-Aufsichtsbehörde zu beschweren.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
