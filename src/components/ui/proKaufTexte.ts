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
   rabattEntfernen: "Entfernen",
   /* `{wert}` wird im Fenster gefüllt: bei einem Prozentcode mit Satz UND
    * Betrag („50 % (-50,00 €)"), bei einem Festbetrag nur mit dem Betrag.
    * Der Kunde soll den Nachlass hier schon in Zahlen sehen und nicht erst
    * im Bezahlschritt (Anwenderwunsch 15.09.2026). */
   rabattGilt: "Code eingelöst - der Nachlass ist mit {wert} in deiner Bestellung enthalten.",
   /* Zwei Arten, auf die ein bekannter Code den Preis nicht senkt - und
    * beide sagen etwas anderes. „Eingelöst" steht in keiner von beiden: Was
    * nichts bewirkt, ist nicht eingelöst (Anwenderbefund 15.09.2026).
    *
    * 1. Der Code ist an die andere Lizenz gebunden - PRO-Code, LIFETIME
    *    gewählt. Hier hilft ein Wechsel der Wahl.
    * 2. Der Code gilt für diese Lizenz, sein Festpreis liegt aber auf dem
    *    Listenpreis (oder darüber). Dann ist nichts abzuziehen, und beim
    *    Zahlungsanbieter entsteht erst gar kein Nachlass
    *    (`festpreis_ohne_abzug`). */
   rabattNichtFuerWahl: "Dieser Code gilt nicht für die gewählte Lizenz.",
   rabattOhneAbzug: "Dieser Code senkt den Preis dieser Lizenz nicht.",
   rabattUnbekannt: "Diesen Code kennen wir nicht.",
   rabattAbgelaufen: "Dieser Code ist abgelaufen.",
   rabattAufgebraucht: "Dieser Code ist bereits ausgeschöpft.",
   rabattNetz: "Der Code liess sich gerade nicht prüfen.",
   rabattNurAnfrage: "Dieser Code gilt nur für die Bestellanfrage, nicht beim Onlinekauf.",
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
      + "nächsten Schritt.",

   anschriftTitel: "Rechnungsanschrift",
   firma: "Firmenname",
   erforderlich: "Erforderlich",
   fehlerEmail: "Diese Emailadresse sieht nicht vollständig aus.",
   fehlerLand: "Dieses Land kennen wir nicht. Bitte aus der Liste wählen.",
   landGesperrtKurz: "Kauf derzeit nicht möglich",
   landGesperrtTitel: "Aus diesem Land nimmt unser Zahlungsanbieter derzeit keine Bestellung an.",
   landGesperrtWeg:
      "Schick uns stattdessen eine Bestellanfrage - wir melden uns per Email "
      + "und finden einen Weg.",
   landGesperrtKarte:
      "Wer eine Karte ausserhalb dieser Länder nutzt, kauft hier ganz normal: "
      + "Massgeblich ist die Rechnungsanschrift der Karte.",
   landGesperrtTester:
      "Und solange die Tester-Aktion läuft, gibt es PRO für die gesamte "
      + "Hauptversion 1.x ganz ohne Zahlung - die Anmeldung steht in VidiVerify.",
   fehlerVorgang: "Der Kauf liess sich nicht vorbereiten. Bitte versuche es noch einmal.",
   fehlerBremse: "Zu viele Versuche in kurzer Zeit. Bitte warte eine Minute.",
   fehlerLifetimeVorhanden:
      "Für diese VV-ID ist LIFETIME bereits freigeschaltet. Ein weiterer Kauf "
      + "ist nicht nötig - VidiVerify holt die Lizenz beim Start von selbst.",
   fehlerProVorhanden:
      "Für diese VV-ID ist PRO dieser Hauptversion bereits freigeschaltet. "
      + "Möglich ist noch das Upgrade auf LIFETIME.",
   fehlerZahlungUnterwegs:
      "Für diese VV-ID ist gerade eine Zahlung eingegangen. Die Lizenz wird in "
      + "diesem Moment ausgestellt - bitte einen Augenblick warten und in "
      + "VidiVerify „Lizenz abrufen“ wählen.",
   fehlerVorgangOffen:
      "Für diese VV-ID ist noch ein Kaufvorgang offen, etwa eine gestellte "
      + "Rechnung. Bitte diesen zuerst abschliessen oder support@vidiverify.de "
      + "schreiben.",
   /* Der Worker hat gemerkt, dass zu dieser Installation etwas in der Ablage
    * liegt, konnte es aber nicht lesen. Im Zweifel wird nicht verkauft - die
    * Lage klärt sich meist binnen einer Minute von selbst. */
   fehlerStandUnklar:
      "Zu dieser Installation liegt bereits ein Eintrag vor, der sich gerade "
      + "nicht sicher lesen lässt. Bitte in einer Minute noch einmal "
      + "versuchen - oder support@vidiverify.de schreiben, wenn es bleibt.",
   /* Der Worker kann gerade nicht schreiben - im Free-Tarif ist das
    * Tageskontingent aufgebraucht (Befund K8, 18.09.2026). Er bricht ab, bevor
    * bei Paddle etwas entsteht; berechnet ist nichts. Kein Fehlerton: Das
    * Kontingent füllt sich um Mitternacht UTC von selbst wieder auf. */
   fehlerUeberlastet:
      "Gerade ist hier sehr viel los. Bitte in ein paar Stunden noch einmal "
      + "vorbeischauen - berechnet wurde nichts.",
   fehlerBot: "Die Sicherheitsabfrage ist fehlgeschlagen. Bitte versuche es noch einmal.",
   fehlerNetz: "Keine Verbindung. Bitte prüfe dein Netz und versuche es erneut.",
   botOffen: "Bitte bestätige kurz die Sicherheitsabfrage darüber und klicke dann erneut.",
   botStumm: "Die Sicherheitsprüfung hat nicht rechtzeitig geantwortet. Bitte versuche es in einem Moment noch einmal.",

   ablaufTitel: "So läuft es",
   ablauf1: "Du bezahlst im nächsten Schritt. Verkäufer ist unser Zahlungsanbieter Paddle.",
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

   kaufen: "Weiter zur Zahlung",
   kaufenLaeuft: "Zahlung wird vorbereitet",
   zurueck: "Schliessen",

   zahlenTitel: "Bezahlen",
   angabenAendern: "Angaben ändern",
   bestellungTitel: "Deine Bestellung",
   bestellungLaedt: "Betrag wird berechnet",
   bestellungHinweis:
      "Einmalzahlung, kein Abonnement. Verkäufer ist Paddle; Rechnung und "
      + "Zahlungsbestätigung kommen per Email.",
   nachlass: "Rabatt oder Nachlass",
   nachlassEnthalten: "berücksichtigt",
   steuer: "darin enthaltene Umsatzsteuer",
   gesamt: "Zahlbetrag",
   zahlungTitel: "Zahlung",

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
   rabattEntfernen: "Remove",
   rabattGilt: "Code applied - a discount of {wert} is included in your order.",
   rabattNichtFuerWahl: "This code does not apply to the selected licence.",
   rabattOhneAbzug: "This code does not lower the price of this licence.",
   rabattUnbekannt: "We do not know this code.",
   rabattAbgelaufen: "This code has expired.",
   rabattAufgebraucht: "This code is already used up.",
   rabattNetz: "The code could not be checked right now.",
   rabattNurAnfrage: "This code only applies to an order request, not to online purchase.",
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
      + "amount depends on your country and is shown in the next step.",

   anschriftTitel: "Billing address",
   firma: "Company name",
   erforderlich: "Required",
   fehlerEmail: "This email address does not look complete.",
   fehlerLand: "We do not recognise this country. Please pick one from the list.",
   landGesperrtKurz: "purchase not available",
   landGesperrtTitel: "Our payment provider currently cannot accept an order placed from this country.",
   landGesperrtWeg:
      "Send us an order request instead - we will reply by email and find a "
      + "way.",
   landGesperrtKarte:
      "If you use a card issued outside these countries, you can buy here as "
      + "usual: what counts is the billing address of that card.",
   landGesperrtTester:
      "And while the tester programme runs, PRO for the whole 1.x major "
      + "version is available with no payment at all - sign up inside "
      + "VidiVerify.",
   fehlerVorgang: "The purchase could not be prepared. Please try again.",
   fehlerBremse: "Too many attempts in a short time. Please wait a minute.",
   fehlerLifetimeVorhanden:
      "LIFETIME is already unlocked for this VV-ID. No further purchase is "
      + "needed - VidiVerify picks up the licence on its own at start.",
   fehlerProVorhanden:
      "PRO for this major version is already unlocked for this VV-ID. The "
      + "upgrade to LIFETIME is still available.",
   fehlerZahlungUnterwegs:
      "A payment for this VV-ID has just come in. The licence is being issued "
      + "right now - please wait a moment and choose \"Fetch licence\" in VidiVerify.",
   fehlerVorgangOffen:
      "There is still an open purchase for this VV-ID, such as an issued invoice. "
      + "Please complete it first or write to support@vidiverify.de.",
   fehlerStandUnklar:
      "There is already an entry for this installation that cannot be read "
      + "reliably right now. Please try again in a minute - or write to "
      + "support@vidiverify.de if it persists.",
   fehlerUeberlastet:
      "It's very busy here right now. Please come back in a few hours - "
      + "nothing has been charged.",
   fehlerBot: "The security check failed. Please try again.",
   fehlerNetz: "No connection. Please check your network and try again.",
   botOffen: "Please confirm the security check above, then click again.",
   botStumm: "The security check did not respond in time. Please try again in a moment.",

   ablaufTitel: "How it works",
   ablauf1: "You pay in the next step. The seller is our payment provider Paddle.",
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

   kaufen: "Continue to payment",
   kaufenLaeuft: "Preparing payment",
   zurueck: "Close",

   zahlenTitel: "Payment",
   angabenAendern: "Change details",
   bestellungTitel: "Your order",
   bestellungLaedt: "Calculating amount",
   bestellungHinweis:
      "One-time payment, no subscription. The seller is Paddle; invoice and "
      + "payment confirmation arrive by email.",
   nachlass: "Discount",
   nachlassEnthalten: "applied",
   steuer: "including VAT",
   gesamt: "Amount due",
   zahlungTitel: "Payment",

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
