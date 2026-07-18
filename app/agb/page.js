import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'AGB | KUTUHARF',
  robots: { index: false, follow: false },
};

const H2 = 'm-0 text-xl font-bold';
const P = 'm-0 text-[15px] leading-relaxed text-textsec';

export default function AgbPage() {
  return (
    <div className="min-h-screen bg-white text-charcoal">
      <div className="h-2 bg-accent" />
      <SiteNav />
      <main className="px-12 py-16 max-sm:px-6">
        <div className="max-w-[720px] mx-auto flex flex-col gap-6">
          <h1 className="m-0 text-4xl font-extrabold">Allgemeine Geschäftsbedingungen (AGB)</h1>

          <section className="flex flex-col gap-1.5">
            <h2 className={H2}>§ 1 Geltungsbereich</h2>
            <p className={P}>
              Diese AGB gelten für alle Bestellungen über kutuharf.de (KUTUHARF) bei Mil Werbung Marketing,
              Inhaber Mustafa Mil, Gleiwitzer Weg 1, 31157 Sarstedt (nachfolgend „Anbieter"). Abweichende
              Bedingungen des Kunden werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung
              ausdrücklich schriftlich zu.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className={H2}>§ 2 Vertragsschluss</h2>
            <p className={P}>
              Die Darstellung der Produkte und des Konfigurators stellt kein rechtlich bindendes Angebot dar.
              Mit Absenden der Bestellung („Zahlungspflichtig bestellen") gibt der Kunde ein verbindliches
              Angebot ab. Der Vertrag kommt mit Zusendung der Auftragsbestätigung per E-Mail zustande. Die
              automatische Bestelleingangsbestätigung stellt noch keine Annahme dar. Für Buchstabenhöhen über
              50 cm erfolgt die Bestellung ausschließlich über eine individuelle Anfrage bzw. ein Angebot.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className={H2}>§ 3 Preise und Zahlung</h2>
            <p className={P}>
              Alle Preise sind Nettopreise zuzüglich der gesetzlichen Mehrwertsteuer (derzeit 19%) sowie ggf.
              Versandkosten. Die Zahlung erfolgt per Vorkasse/Überweisung; die Bankverbindung erhält der Kunde
              mit der Auftragsbestätigung. Die Produktion beginnt nach Zahlungseingang und Freigabe des
              Design-Entwurfs.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className={H2}>§ 4 Konfiguration, Design-Daten und Freigabe</h2>
            <p className={P}>
              Der Kunde erhält vor der Produktion einen Design-Entwurf mit exakten Maßen zur Freigabe;
              produziert wird erst nach dieser Freigabe. Für Fehler in der vom Kunden erstellten und
              freigegebenen Konfiguration bzw. in gelieferten Vorlagen (z.&nbsp;B. Rechtschreibfehler im
              Schriftzug, falsche Farb- oder Maßangaben, geringe Auflösung von Logodateien) übernimmt der
              Anbieter keine Haftung. Der optionale Datencheck umfasst die technische Prüfung gelieferter
              Dateien (Format, Farbmodus, Auflösung, Schriften), nicht die inhaltliche Prüfung.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className={H2}>§ 5 Lieferung</h2>
            <p className={P}>
              Angegebene Liefer- und Versandtermine sind voraussichtliche Termine. Die Lieferung erfolgt
              innerhalb Deutschlands. Bei Bestellungen mit Profi-Montage vor Ort wird der Termin individuell
              vereinbart.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className={H2}>§ 6 Widerrufsrecht</h2>
            <p className={P}>
              Ein Widerrufsrecht für Verbraucher besteht nicht bei Waren, die nach Kundenspezifikation
              angefertigt werden oder eindeutig auf die persönlichen Bedürfnisse zugeschnitten sind
              (§ 312g Abs. 2 Nr. 1 BGB). Dies betrifft insbesondere alle nach Maß gefertigten 3D-Buchstaben,
              Leuchtbuchstaben und Schriftzüge dieses Shops, die nach individueller Konfiguration
              (Text, Schriftart, Größe, Material, Farbe, Beleuchtung) hergestellt werden.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className={H2}>§ 7 Eigentumsvorbehalt</h2>
            <p className={P}>Die Ware bleibt bis zur vollständigen Bezahlung Eigentum des Anbieters.</p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className={H2}>§ 8 Gewährleistung und Haftung</h2>
            <p className={P}>
              Es gelten die gesetzlichen Gewährleistungsrechte. Geringfügige Farb- und Materialabweichungen
              zwischen Bildschirmdarstellung und fertigem Produkt (z.&nbsp;B. bei Acryl-, RAL- und
              Metalloberflächen) sind fertigungstechnisch bedingt und stellen keinen Mangel dar. Die im
              Konfigurator angezeigte Schildbreite ist eine schriftartabhängige Schätzung; maßgeblich sind
              die Maße des freigegebenen Design-Entwurfs. Der Anbieter haftet unbeschränkt bei Vorsatz und
              grober Fahrlässigkeit sowie bei Verletzung
              von Leben, Körper und Gesundheit; im Übrigen ist die Haftung auf den vertragstypisch
              vorhersehbaren Schaden begrenzt.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className={H2}>§ 9 Schlussbestimmungen</h2>
            <p className={P}>
              Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Ist der Kunde Kaufmann, ist
              Gerichtsstand der Sitz des Anbieters. Sollten einzelne Bestimmungen unwirksam sein, bleibt der
              Vertrag im Übrigen wirksam.
            </p>
          </section>

          <p className="m-0 text-[13px] text-textmut">Stand: Juli 2026</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
