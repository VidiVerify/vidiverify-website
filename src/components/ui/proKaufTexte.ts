/**
 * Texte der Kaufseite, DE und EN.
 *
 * Eigenständig wie `lizenzAnfrageTexte.ts` und aus demselben Grund: Das hier
 * ist ein Kaufvorgang, keine Website-Sektion. Die SPRACHE folgt trotzdem dem
 * Umschalter in der Nav - das entscheidet der Aufrufer.
 *
 * Die Erklärzeile zum Verhältnis PRO/LIFETIME ist im Preisplan als zwingend
 * gesetzt. Sie steht hier, obwohl sie auch in der Preis-Sektion steht: Wer aus
 * der Anwendung kommt, hat die Sektion nie gesehen.
 */

export type Sprache = "de" | "en";

const de = {
   titel: "PRO freischalten",
   untertitel: "Kaufen, zurück ins Programm, fertig.",

   vvidTitel: "Deine Installation",
   vvidFeld: "VV-ID",
   vvidHinweis: "Steht in VidiVerify unter „Lizenz\".",
   vvidPlatzhalter: "VV-XXXXX",
   vvidFehler: "Die Kennung sieht aus wie VV- und fünf Zeichen, etwa VV-A7K2M.",
   vvidWarum: "Der Lizenzschlüssel wird an diese Kennung gebunden.",

   wahlTitel: "Lizenz",
   wahlTitelUpgrade: "Dein Upgrade",
   rabattPlatzhalter: "Rabatt- oder Aktionscode",
   rabattPruefen: "Einlösen",
   rabattGilt: "Code eingelöst - der Nachlass ist im Bezahlfenster enthalten.",
   rabattUnbekannt: "Diesen Code kennen wir nicht.",
   rabattAbgelaufen: "Dieser Code ist abgelaufen.",
   rabattAufgebraucht: "Dieser Code ist bereits ausgeschöpft.",
   rabattNetz: "Der Code liess sich gerade nicht prüfen.",
   statt: "statt",
   proTitel: "PRO",
   proText: "Alle PRO-Funktionen einer Hauptversion.",
   lifetimeTitel: "LIFETIME",
   lifetimeText: "Alle PRO-Funktionen aller Hauptversionen dieser Produktlinie.",
   erklaerzeile:
      "Eine neue PRO Hauptversion etwa jährlich, LIFETIME umfasst alle "
      + "Hauptversionen der Linie.",
   preisHinweis:
      "Endpreis einschliesslich Umsatzsteuer. Einmalzahlung, kein Abonnement. "
      + "Der endgültige Betrag richtet sich nach deinem Land und steht im "
      + "Bezahlfenster.",

   anschriftTitel: "Rechnungsanschrift",
   firma: "Firmenname",
   erforderlich: "Erforderlich",
   fehlerEmail: "Diese Emailadresse sieht nicht vollständig aus.",
   fehlerLand: "Dieses Land kennen wir nicht. Bitte aus der Liste wählen.",
   fehlerVorgang: "Der Kauf liess sich nicht vorbereiten. Bitte versuche es noch einmal.",
   fehlerBremse: "Zu viele Versuche in kurzer Zeit. Bitte warte eine Minute.",
   fehlerBot: "Die Sicherheitsabfrage ist fehlgeschlagen. Bitte versuche es noch einmal.",
   fehlerNetz: "Keine Verbindung. Bitte prüfe dein Netz und versuche es erneut.",
   botOffen: "Bitte die Sicherheitsabfrage darüber noch bestätigen.",

   ablaufTitel: "So läuft es",
   ablauf1: "Du kaufst im Bezahlfenster. Verkäufer ist unser Zahlungsanbieter Paddle.",
   ablauf2: "Rechnung und Zahlungsbestätigung kommen von Paddle per Email.",
   ablauf3:
      "Dein Lizenzschlüssel erscheint nach dem erfolgreichen Kauf hier im "
      + "Fenster - VidiVerify holt sich den Lizenzschlüssel automatisch beim "
      + "nächsten Start selbst.",

   rechtZeile1: "Es gelten unsere ",
   eulaLink: "Lizenzbedingungen",
   rechtZeile2: " und die ",
   datenschutzLink: "Datenschutzerklärung",
   rechtZeile3: ". Den Kaufvertrag schliesst du mit Paddle.",

   kaufen: "Kaufen",
   kaufenLaeuft: "Bezahlfenster öffnet",
   zurueck: "Schliessen",

   zuTitel: "Der Kauf ist noch nicht geöffnet",
   zuText:
      "Der Zahlungsweg wird gerade eingerichtet. Bis dahin läuft die "
      + "Bestellung persönlich - über die Lizenzanfrage, mit Rechnung und "
      + "Überweisung.",
   zuKnopf: "Zur Lizenzanfrage",

   fehlerTitel: "Das hat nicht geklappt",
   fehlerLaden: "Das Bezahlfenster liess sich nicht laden. Bitte versuche es noch einmal.",
   fehlerVvid: "Bitte trage zuerst deine VV-ID ein.",

   wartenTitel: "Danke für deinen Kauf",
   /* Vier Stufen, die mit der Wartezeit weiterrücken. Sie sind kein Zierrat:
      Eine Zeile, die sich nie ändert, sieht nach zwanzig Sekunden aus wie ein
      hängengebliebenes Fenster - und der Kunde hat gerade bezahlt. */
   warten1: "Wir holen deinen Lizenzschlüssel.",
   warten2: "Der Kauf ist bestätigt. Dein Lizenzschlüssel wird erzeugt und hinterlegt.",
   warten3: "Fast geschafft. Manchmal dauert es einen Moment länger.",
   warten4: "Wir fragen weiter nach. Es lohnt sich, noch kurz zu bleiben.",
   wartenRuhig:
      "Du kannst das Fenster offen lassen. Selbst wenn du es schliesst, holt "
      + "VidiVerify den Lizenzschlüssel beim nächsten Start von selbst.",
   fertigTitel: "Dein Lizenzschlüssel ist bereit",
   fertigText:
      "VidiVerify holt ihn beim nächsten Start von selbst. Du musst nichts "
      + "abtippen. Falls du ihn doch von Hand einsetzen willst, steht er hier:",
   kopieren: "Kopieren",
   kopiert: "Kopiert",
   dauertTitel: "Es dauert länger als erwartet",
   dauertText:
      "Der Kauf ist durch, der Lizenzschlüssel ist noch nicht da. Er kommt in "
      + "aller Regel binnen Minuten - starte VidiVerify später einfach neu. "
      + "Bleibt es dabei, melde dich mit deiner VV-ID bei uns.",
   nochmalPruefen: "Erneut nachsehen",
};

const en: typeof de = {
   titel: "Unlock PRO",
   untertitel: "Buy, return to the app, done.",

   vvidTitel: "Your installation",
   vvidFeld: "VV-ID",
   vvidHinweis: "Shown in VidiVerify under „Licence\".",
   vvidPlatzhalter: "VV-XXXXX",
   vvidFehler: "The ID looks like VV- plus five characters, e.g. VV-A7K2M.",
   vvidWarum: "The licence key is bound to this ID.",

   wahlTitel: "Licence",
   wahlTitelUpgrade: "Your upgrade",
   rabattPlatzhalter: "Discount or promo code",
   rabattPruefen: "Apply",
   rabattGilt: "Code applied - the discount is included at checkout.",
   rabattUnbekannt: "We do not know this code.",
   rabattAbgelaufen: "This code has expired.",
   rabattAufgebraucht: "This code is already used up.",
   rabattNetz: "The code could not be checked right now.",
   statt: "was",
   proTitel: "PRO",
   proText: "All PRO features of one major version.",
   lifetimeTitel: "LIFETIME",
   lifetimeText: "All PRO features of every major version of this product line.",
   erklaerzeile:
      "A new PRO major version roughly once a year; LIFETIME covers every "
      + "major version of the line.",
   preisHinweis:
      "Final price including VAT. One-time payment, no subscription. The exact "
      + "amount depends on your country and is shown at checkout.",

   anschriftTitel: "Billing address",
   firma: "Company name",
   erforderlich: "Required",
   fehlerEmail: "This email address does not look complete.",
   fehlerLand: "We do not recognise this country. Please pick one from the list.",
   fehlerVorgang: "The purchase could not be prepared. Please try again.",
   fehlerBremse: "Too many attempts in a short time. Please wait a minute.",
   fehlerBot: "The security check failed. Please try again.",
   fehlerNetz: "No connection. Please check your network and try again.",
   botOffen: "Please confirm the security check above.",

   ablaufTitel: "How it works",
   ablauf1: "You pay at checkout. The seller is our payment provider Paddle.",
   ablauf2: "Invoice and payment confirmation come from Paddle by email.",
   ablauf3:
      "Your licence key appears here in this window after a successful "
      + "purchase - VidiVerify picks the licence key up automatically on its "
      + "next start.",

   rechtZeile1: "Our ",
   eulaLink: "licence terms",
   rechtZeile2: " and ",
   datenschutzLink: "privacy policy",
   rechtZeile3: " apply. The purchase contract is with Paddle.",

   kaufen: "Buy",
   kaufenLaeuft: "Opening checkout",
   zurueck: "Close",

   zuTitel: "Checkout is not open yet",
   zuText:
      "The payment route is being set up. Until then orders are handled "
      + "personally - through the licence request, with invoice and bank "
      + "transfer.",
   zuKnopf: "To the licence request",

   fehlerTitel: "That did not work",
   fehlerLaden: "The checkout could not be loaded. Please try again.",
   fehlerVvid: "Please enter your VV-ID first.",

   wartenTitel: "Thank you for your purchase",
   warten1: "Fetching your licence key.",
   warten2: "Payment confirmed. Your licence key is being issued and stored.",
   warten3: "Almost there. Sometimes this takes a moment longer.",
   warten4: "Still checking. It is worth staying a little longer.",
   wartenRuhig:
      "You can leave this window open. Even if you close it, VidiVerify picks "
      + "up the licence key on its next start.",
   fertigTitel: "Your licence key is ready",
   fertigText:
      "VidiVerify picks it up on its next start. There is nothing to type. If "
      + "you would rather enter the licence key by hand, here it is:",
   kopieren: "Copy",
   kopiert: "Copied",
   dauertTitel: "This is taking longer than expected",
   dauertText:
      "The payment went through, the licence key has not arrived yet. It "
      + "usually takes minutes - simply restart VidiVerify later. If it stays "
      + "this way, contact us with your VV-ID.",
   nochmalPruefen: "Check again",
};

export const TEXTE = { de, en };

export function spracheAus(code: string): Sprache {
   return code.toLowerCase().startsWith("de") ? "de" : "en";
}
