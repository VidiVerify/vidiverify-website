/**
 * Texte der Bestellanfrage, DE und EN.
 *
 * Eigenständig und nicht in `src/i18n/locales/*.json`: Die Sprachdateien des
 * One-Pagers sind Website-Texte, das hier ist ein Bestellvorgang. Er wandert
 * womöglich noch, und dann soll er als Ganzes wandern. Die SPRACHE folgt
 * trotzdem dem Umschalter in der Nav — das entscheidet der Aufrufer.
 *
 * Die Erklärzeile zum Verhältnis PRO/LIFETIME ist im Preisplan als zwingend
 * gesetzt — überall dort, wo Preise stehen. Sie ist hier kein Beiwerk: Ohne
 * sie kann ein Käufer den Wert von LIFETIME nicht abschätzen und wählt im
 * Zweifel PRO.
 */

export type Sprache = "de" | "en";



const de = {
   titel: "Lizenz anfragen",
   untertitel: "Der persönliche Bestellweg — mit Rechnung und Überweisung.",

   vvidTitel: "Deine Installation",
   vvidFeld: "VV-ID",
   vvidHinweis: "Direkt aus VidiVerify.",
   vvidPlatzhalter: "VV-XXXXX",
   vvidFehler: "Die Kennung sieht aus wie VV- und fünf Zeichen, etwa VV-A7K2M.",

   wunschTitel: "Lizenztyp",
   preisHinweis:
      "Endkundenpreise inklusive Umsatzsteuer. Einmalzahlung, kein Abonnement.",

   freeTitel: "FREE",
   freePreis: "kostenlos",
   freeText:
      "Registrierung der kostenlosen Fassung. Läuft nicht ab, kostet nichts.",
   proTitel: "PRO",
   proText: "Alle PRO-Funktionen einer Hauptversion.",
   lifetimeTitel: "LIFETIME",
   lifetimeText:
      "Alle PRO-Funktionen aller Hauptversionen dieser Produktlinie.",

   rabattTitel: "Rabatt- oder Aktionscode",
   rabattPlatzhalter: "Code eingeben",
   rabattPruefen: "Einlösen",
   rabattGilt: "Eingelöst",
   rabattUnbekannt: "Ungültig",
   rabattAbgelaufen: "Abgelaufen",
   rabattAufgebraucht: "Ausgeschöpft",
   rabattNetz: "Prüfung fehlgeschlagen",
   statt: "statt",
   kontaktTitel: "Kontakt",
   anrede: "Anrede",
   anredeFehlt: "Bitte eine Anrede wählen.",
   botOffen: "Bitte die Sicherheitsabfrage darüber noch bestätigen.",
   herr: "Herr",
   frau: "Frau",
   vorname: "Vorname",
   nachname: "Nachname",
   email: "Email",
   emailHinweis: "Sie gehört zur Lizenz und steht im Schlüssel.",
   emailFehler: "Bitte eine Emailadresse angeben.",
   telefon: "Telefon",

   kundentyp: "Ich bestelle als",
   privat: "Privatperson",
   gewerblich: "Firma",

   anschriftTitel: "Rechnungsanschrift",
   strasse: "Strasse",
   hausnummer: "Nr.",
   plz: "PLZ",
   stadt: "Ort",
   land: "Land",
   steuernummer: "Steuernummer",
   ustid: "USt-IdNr.",

   infosTitel: "Anmerkung",
   infosPlatzhalter:
      "Rechnerwechsel, Rückfrage, alles, was wir wissen sollten.",

   datenschutz:
      "Deine Angaben verwenden wir ausschliesslich zur Bearbeitung dieser "
      + "Anfrage und zur Rechnungsstellung. Näheres in der",
   datenschutzLink: "Datenschutzerklärung",

   pflichtnote: "* Notwendige Angaben",
   absenden: "Anfrage senden",
   sendet: "wird gesendet …",

   turnstileFehltTitel: "Der Bot-Schutz ist noch nicht eingerichtet.",
   turnstileFehltText:
      "Diese Seite kann deshalb gerade keine Anfragen annehmen. Schreib uns "
      + "bitte an support@vidiverify.de — wir kümmern uns sofort darum.",

   dankeTitel: "Deine Anfrage ist da.",
   dankeText:
      "Wir melden uns per Email mit der Rechnung. **Den Schlüssel gibt es "
      + "nach dem Zahlungseingang** — danach Lizenzabruf direkt aus VidiVerify.",
   dankeFrei:
      "Wir melden uns per Email. Danach Lizenzabruf direkt aus VidiVerify.",
   zurueck: "Zurück zur Website",

   fehlerTitel: "Das hat nicht geklappt.",
   fehlerNetz:
      "Keine Verbindung. Prüf bitte dein Netz und versuch es noch einmal.",
   fehlerBremse:
      "Von deinem Anschluss kamen gerade viele Anfragen. Bitte warte eine "
      + "Minute.",
   fehlerBot:
      "Der Bot-Schutz hat nicht bestätigt. Lade die Seite neu und versuch es "
      + "noch einmal.",
   fehlerAllgemein:
      "Etwas ist schiefgegangen. Versuch es bitte noch einmal, oder schreib "
      + "uns an support@vidiverify.de.",
};

const en: typeof de = {
   titel: "Request a licence",
   untertitel: "The personal ordering route — with an invoice and a bank transfer.",

   vvidTitel: "Your installation",
   vvidFeld: "VV-ID",
   vvidHinweis: "Straight from VidiVerify.",
   vvidPlatzhalter: "VV-XXXXX",
   vvidFehler: "The ID looks like VV- plus five characters, e.g. VV-A7K2M.",

   wunschTitel: "Licence type",
   preisHinweis: "Retail prices including VAT. One payment, no subscription.",

   freeTitel: "FREE",
   freePreis: "free of charge",
   freeText:
      "Registration of the free edition. It does not expire and costs nothing.",
   proTitel: "PRO",
   proText: "All PRO features of one major version.",
   lifetimeTitel: "LIFETIME",
   lifetimeText: "All PRO features of every major version of this product line.",

   rabattTitel: "Discount or promo code",
   rabattPlatzhalter: "Enter code",
   rabattPruefen: "Apply",
   rabattGilt: "Applied",
   rabattUnbekannt: "Invalid",
   rabattAbgelaufen: "Expired",
   rabattAufgebraucht: "Used up",
   rabattNetz: "Check failed",
   statt: "instead of",
   kontaktTitel: "Contact",
   anrede: "Title",
   anredeFehlt: "Please choose a form of address.",
   botOffen: "Please confirm the security check above.",
   herr: "Mr",
   frau: "Ms",
   vorname: "First name",
   nachname: "Last name",
   email: "Email",
   emailHinweis: "It belongs to the licence and is part of the key.",
   telefon: "Phone",
   emailFehler: "Please enter an email address.",

   kundentyp: "I am ordering as",
   privat: "a private person",
   gewerblich: "a company",

   anschriftTitel: "Billing address",
   strasse: "Street",
   hausnummer: "No.",
   plz: "Postcode",
   stadt: "City",
   land: "Country",
   steuernummer: "Tax number",
   ustid: "VAT ID",

   infosTitel: "Note",
   infosPlatzhalter: "New computer, a question, anything we should know.",

   datenschutz:
      "We use your details solely to process this request and to issue the "
      + "invoice. More in our",
   datenschutzLink: "privacy policy",

   pflichtnote: "* Required",
   absenden: "Send request",
   sendet: "sending …",

   turnstileFehltTitel: "Bot protection is not set up yet.",
   turnstileFehltText:
      "This page cannot accept requests right now. Please write to "
      + "support@vidiverify.de — we will take care of it immediately.",

   dankeTitel: "Your request has arrived.",
   dankeText:
      "We will get back to you by email with the invoice. **The key follows "
      + "once the payment has arrived** — then retrieve it straight from "
      + "VidiVerify.",
   dankeFrei:
      "We will get back to you by email. Then retrieve the licence straight "
      + "from VidiVerify.",
   zurueck: "Back to the website",

   fehlerTitel: "That did not work.",
   fehlerNetz: "No connection. Please check your network and try again.",
   fehlerBremse:
      "A lot of requests came from your connection just now. Please wait a "
      + "minute.",
   fehlerBot:
      "Bot protection did not confirm. Please reload the page and try again.",
   fehlerAllgemein:
      "Something went wrong. Please try again, or write to "
      + "support@vidiverify.de.",
};

export const TEXTE = { de, en };

/** Aus dem Sprachcode von i18next die Sprache dieser Texte. */
export function spracheAus(code: string): Sprache {
   return (code || "").toLowerCase().startsWith("de") ? "de" : "en";
}
