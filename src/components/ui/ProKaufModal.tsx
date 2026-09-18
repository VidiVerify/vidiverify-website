/**
 * Die Kaufseite - der Zahlungsweg über Paddle, als Overlay über der Website.
 *
 * **Warum es diese Seite überhaupt gibt** (Konzeption 3a, 07.09.2026): Nicht
 * als Zwischenstation aus Höflichkeit, sondern weil sie vier Dinge trägt, die
 * das Bezahlfenster nicht kann. Die VV-ID kommt nur über `customData` in die
 * Transaktion - eine fertige Checkout-Adresse kennt kein solches Feld, und
 * ohne VV-ID landet nach dem Kauf nichts in der Ablage. Die Wahl zwischen PRO
 * und LIFETIME samt der im Preisplan zwingend gesetzten Erklärzeile bekommt
 * man im Bezahlfenster nicht unter. Die Paddle-Freigabe prüft die Kaufseite
 * als Teil des Prüfgegenstands. Und der Grund, der alle überwiegt:
 * **Änderbarkeit.** Die installierte Anwendung zeigt für immer auf die
 * Adresse, die beim Bauen im Code stand - stünde dort ein Paddle-Link, wäre
 * ein Anbieterwechsel ein Programm-Update, und jede Bestandsversion bliebe auf
 * einem toten Link stehen. `vidiverify.de/pro` ist eine Weiche, die uns gehört.
 *
 * **DIE RECHNUNGSANSCHRIFT ERHEBEN WIR SELBST** (entschieden 10.09.2026, nach
 * der ersten echten Testrechnung). Die erste Fassung reichte nur die VV-ID
 * durch und überliess Paddle alles Weitere - das war schlanker und hatte einen
 * Preis, den erst die Rechnung zeigte: Paddles Checkout fragt Email, Land und
 * PLZ ab, einen Personennamen nie. Die Rechnung des Kunden trug keinen
 * Empfänger, und in unserer Ablage stand nichts als eine Emailadresse. Also
 * legt jetzt der Worker Kunde, Anschrift und Firma bei Paddle an
 * (`POST /api/paddle/vorgang`) und gibt eine fertige Transaktion zurück; das
 * Bezahlfenster wird nur noch damit geöffnet.
 *
 * Zahlungsdaten bleiben davon unberührt - die sieht ausschliesslich Paddle.
 *
 * Plan: 05_DOKUMENTATION/PLANUNGEN/PRO Lizenzierungsmodul/
 *       2026-09-10_Paddle-Anbindung.md
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { X, ShoppingCart, Check, Copy } from "lucide-react";
import ProBadge from "./ProBadge";
import { FehlerKasten } from "./FehlerKasten";
import {
   CYAN, GREEN, TEXT_MUTED, TEXT_PRIMARY, TEXT_SECONDARY,
} from "@/constants/theme";
import { spracheAus, TEXTE } from "./proKaufTexte";
/* Die Feldbeschriftungen kommen aus der Bestellanfrage - dieselben Felder,
 * dieselben Wörter, eine Quelle. Zwei Fassungen derselben Anschriftsmaske
 * laufen auseinander, sobald jemand eine davon anfasst. */
import { TEXTE as ANFRAGE_TEXTE } from "./lizenzAnfrageTexte";
import { preisText, usePreise } from "@utils/usePreise";
import { useFensterStapel } from "@utils/useFensterStapel";
import { turnstileSchluessel } from "@utils/turnstile";
import { useTurnstile } from "@utils/useTurnstile";
import { kennungLesen } from "@utils/adresse";
import { laenderCode, laenderNamen } from "@utils/laender";
import {
   paddleAufbau, paddleHorchen, paddleLaden,
   type PaddleAufbau, type PaddleEreignis,
} from "@utils/paddle";
import { summeAus, type Summe } from "@utils/paddleSumme";
import { nachsperreGilt, nachsperreSetzen } from "@utils/kaufNachsperre";
import { tokenPasst } from "@utils/lizenzToken";
import ProKaufZahlung from "./ProKaufZahlung";
import KnopfText from "./KnopfText";

const VVID_RE = /^VV-[0-9A-Z]{5}$/;

/* Dieselbe Emailpruefung wie im Worker und in der Bestellanfrage: ein @, davor
 * und danach etwas, und in der Domain ein Punkt mit einer Endung aus
 * mindestens zwei Buchstaben. Bewusst strenger als `<input type="email">`, das
 * `max@muster` durchlaesst - fuer eine Rechnung ist das keine Adresse. */
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

const AMBER = "#f59e0b";

type Wahl = "pro" | "lifetime";
/* „zahlen" ist seit dem 14.09.2026 ein eigener Schritt IM Fenster: Paddle
 * läuft inline, nicht mehr als zweites Overlay darüber (`ProKaufZahlung`). */
type Phase = "wahl" | "zahlen" | "warten" | "fertig" | "dauert";

/* Wie lange die Erfolgsansicht auf die Lizenz wartet.
 *
 * Der Webhook trifft binnen Sekunden ein; 90 Sekunden sind grosszügig. Was
 * danach kommt, ist bewusst KEINE Fehlermeldung: Der Kauf ist durch, das Geld
 * ist weg, und „Fehler" wäre an dieser Stelle die falscheste aller Auskünfte.
 * Die Anwendung holt die Lizenz beim nächsten Start ohnehin von selbst.
 */
const WARTEN_MS = 90_000;
const TAKT_MS = 2_500;

interface Props {
   open: boolean;
   onClose: () => void;
}

const ProKaufModal = ({ open, onClose }: Props) => {
   const { i18n } = useTranslation();
   const sprache = spracheAus(i18n.language || "de");
   const t = TEXTE[sprache];
   const ta = ANFRAGE_TEXTE[sprache];

   // Kennung und Version über `@utils/adresse`: Beide werden gleich nach dem
   // Laden aus der Adresse entfernt, und `appVersion` wird bei JEDEM Rendern
   // neu gebildet - direkt aus der Adresse gelesen stünde hier ab dem zweiten
   // Rendern nichts mehr, und der Kauf liefe ohne Versionsangabe
   // (Sicherheitsprüfung 11.09.2026, Befund 3).
   const [vvid, setVvid] = useState(kennungLesen().vvid);
   const appVersion = kennungLesen().version;

   /* Beim Upgrade steht nur LIFETIME zur Wahl - dieselbe Regel wie im
    * Anfrageformular (`LizenzAnfrageModal`). Die Anwendung hängt
    * `nur=lifetime` an, wenn PRO bereits läuft. Bis zum 14.09.2026 las nur das
    * Formular den Parameter; die Kaufseite zeigte PRO vorgewählt, also genau
    * das, was der Kunde schon hat (Befund VM-Probe). Einmal beim Laden
    * gelesen: `nur` bleibt zwar in der Adresse stehen (`@utils/adresse`), aber
    * die Wahl soll nicht an einem späteren Adresswechsel hängen. */
   const [nurLifetime] = useState(
      () => new URLSearchParams(window.location.search).get("nur") === "lifetime");
   const [wahl, setWahl] = useState<Wahl>(nurLifetime ? "lifetime" : "pro");
   const [vvidFehler, setVvidFehler] = useState(false);

   /* Die Rechnungsanschrift.
    *
    * Wir erheben sie selbst, seit der Kauf über eine vom Worker angelegte
    * Transaktion läuft - anders bekommt Paddle den Namen nicht. Die
    * Datenschutzerklärung bildet das ab; verarbeitet wird nur, was auf die
    * Rechnung gehört.
    */
   const [anrede, setAnrede] = useState("");
   const [vorname, setVorname] = useState("");
   const [nachname, setNachname] = useState("");
   const [email, setEmail] = useState("");
   const [strasse, setStrasse] = useState("");
   const [hausnummer, setHausnummer] = useState("");
   const [plz, setPlz] = useState("");
   const [stadt, setStadt] = useState("");
   const [land, setLand] = useState("");
   const [kundentyp, setKundentyp] = useState<"privat" | "gewerblich">("privat");
   const [firma, setFirma] = useState("");
   const [ustid, setUstid] = useState("");
   const [feldFehler, setFeldFehler] = useState("");
   /* Welche Pflichtfelder leer sind. Sammelliste statt Einzelmeldung: Wer drei
    * Felder vergessen hat, soll sie alle auf einmal sehen und nicht dreimal
    * hintereinander abgewiesen werden. */
   const [leer, setLeer] = useState<string[]>([]);

   const [phase, setPhase] = useState<Phase>("wahl");
   const [token, setToken] = useState("");
   const [kopiert, setKopiert] = useState(false);
   const [fehler, setFehler] = useState("");
   const [laeuft, setLaeuft] = useState(false);

   const [aufbau, setAufbau] = useState<PaddleAufbau | null>(null);
   useEffect(() => { setAufbau(paddleAufbau()); }, []);

   /* Die Transaktion des Zahlungsschritts und ihre Übersicht. Beide gelten
    * nur für diesen Schritt: Wer zurück zu den Angaben geht, bekommt beim
    * nächsten Weiter einen neuen Vorgang - Anschrift oder Lizenz können sich
    * inzwischen geändert haben. */
   const [transaktion, setTransaktion] = useState("");
   const [summe, setSumme] = useState<Summe | null>(null);
   const inhaltRef = useRef<HTMLDivElement>(null);
   const fehlerRef = useRef<HTMLDivElement>(null);

   /* Eine Meldung wird angesteuert, nicht nur eingeblendet.
    *
    * Der Kasten steht unter der Rechnungsanschrift und damit ausserhalb des
    * sichtbaren Bereichs, sobald jemand oben auf „Weiter" klickt. Der Kunde sah
    * nichts passieren und musste suchen, ob überhaupt etwas geschehen ist
    * (Anwenderbefund 14.09.2026, Meldung zur vorhandenen Lizenz). Dasselbe
    * Verfahren wie in der Bestellanfrage; der Fokus sorgt zusätzlich dafür,
    * dass ein Screenreader die Meldung vorliest. */
   useEffect(() => {
      if (!fehler) return;
      const kasten = fehlerRef.current;
      kasten?.scrollIntoView({ behavior: "smooth", block: "center" });
      kasten?.focus({ preventScroll: true });
   }, [fehler]);

   const sitekey = turnstileSchluessel();

   /* Die Sicherheitsabfrage. Die Abwehr steht hier nicht aus Gewohnheit:
    * Hinter dem Knopf entstehen Kunde, Anschrift und Transaktion bei einem
    * fremden Dienst. Wie sie mit einem fehlenden Token umgeht, steht in
    * `useTurnstile`. */
   const { rahmenRef: turnstileRef, tokenHolen, verbraucht } =
      useTurnstile(open, sitekey, sprache);

   /* Wie weit die Warteanzeige fortgeschritten ist.
    *
    * Die Schwellen sind nicht geraten: Der Webhook trifft in aller Regel
    * binnen weniger Sekunden ein, alles darüber ist bereits die Ausnahme, und
    * je länger es dauert, desto mehr braucht der Kunde die Auskunft, dass hier
    * noch jemand arbeitet.
    */
   const [wartestufe, setWartestufe] = useState(0);
   useEffect(() => {
      if (phase !== "warten") { setWartestufe(0); return; }
      const start = Date.now();
      const takt = window.setInterval(() => {
         const s = (Date.now() - start) / 1000;
         setWartestufe(s > 45 ? 3 : s > 20 ? 2 : s > 8 ? 1 : 0);
      }, 1000);
      return () => window.clearInterval(takt);
   }, [phase]);

   /* Die Preise. Zwei Quellen, und das ist kein Versehen.
    *
    * Verbindlich ist, was im Bezahlfenster steht - dort rechnet Paddle die
    * Steuer des Käuferlandes. Deshalb fragen wir zuerst Paddle selbst
    * (`PricePreview`, ortsbezogen). Nur wenn das scheitert, steht der
    * Listenpreis aus dem Worker da: Er ist der richtige Wert für Deutschland
    * und nie zu niedrig. Eine Kaufseite ganz ohne Preis wäre der schlechtere
    * Tausch.
    */
   const { preise, listenpreise, rabatt, codeGrund, laeuft: preisLaeuft,
           codeLaeuft, pruefen, verwerfen }
      = usePreise(open, aufbau?.basis || "/api", "kauf");
   const [rabattcode, setRabattcode] = useState("");

   /* Was der Code für DIESE Wahl wert ist - in Zahlen, nicht als Zusage.
    *
    * Der Nachlass wird aus den beiden Preisen gebildet und nicht aus dem
    * Prozentsatz gerechnet: Gerundet wird beim Anbieter, und ein selbst
    * gerechneter Betrag läge irgendwann einen Cent daneben. Ist er null,
    * gilt der Code für die andere Lizenz - dann sagt die Zeile das, statt
    * einen Nachlass zu behaupten, den der Preis nicht zeigt. */
   const nachlassCent = Math.max(0, listenpreise[wahl] - preise[wahl]);
   const rabattWert = rabatt && rabatt.art === "prozent"
      ? `${rabatt.wert} % (-${preisText(nachlassCent, sprache)})`
      : `-${preisText(nachlassCent, sprache)}`;

   /* Der Nachlass gilt nur für den Code, der im Feld steht. Wer ihn ändert
    * oder löscht, sieht sofort wieder den Listenpreis - sonst stünde ein
    * Rabattpreis in der Kachel, während der neue Feldinhalt abgeschickt wird
    * (Anwenderbefund 14.09.2026). */
   const codeAendern = (wert: string) => {
      setRabattcode(wert);
      // Auch während einer laufenden Prüfung: Sonst traefe deren Antwort
      // auf ein Feld, das längst etwas anderes zeigt - die Kacheln nennten
      // dann einen Rabatt, den der Kauf nicht mitschickt (Codex-Review
      // Runde 2, 16.09.2026, am Hook ausgeführt).
      if ((rabatt || codeLaeuft)
          && wert.trim().toUpperCase() !== (rabatt ? rabatt.code : "")) verwerfen();
   };
   const codeEntfernen = () => {
      setRabattcode("");
      verwerfen();
   };
   const [paddlePreise, setPaddlePreise] = useState<Record<Wahl, string>>(
      { pro: "", lifetime: "" });

   /* Welcher Preis in der Kachel steht.
    *
    * Mit gültigem Code gewinnt UNSER gerechneter Preis: Paddles Vorschau
    * kennt den Rabatt nicht, sie fragt nur nach dem Listenpreis. Ohne Code
    * gewinnt Paddle, weil dort die Steuer des Käuferlandes eingerechnet ist.
    * Verbindlich ist in beiden Fällen, was das Bezahlfenster zeigt.
    */
   const anzeigePreis = (welche: Wahl) =>
      (rabatt ? preisText(preise[welche], sprache) : "")
      || paddlePreise[welche] || preisText(preise[welche], sprache);

   /** Der durchgestrichene Listenpreis - nur, wenn der Code hier greift. */
   const stattPreis = (welche: Wahl) =>
      rabatt && preise[welche] !== listenpreise[welche]
         ? t.statt + " " + preisText(listenpreise[welche], sprache)
         : "";

   /* Schliessen heisst: zurück auf die Website, nicht zurück auf die
    * Kaufansicht.
    *
    * Drei Dinge gehören dazu, und alle drei fehlten zunächst
    * (Anwenderbefund 10.09.2026):
    *
    * 1. **Die Adresszeile wird aufgeräumt.** Ohne das bleibt
    *    `?vvid=…&ver=…#pro` stehen - ein Neuladen öffnete das Kauffenster
    *    erneut, und die Gerätekennung stünde dauerhaft sichtbar in der
    *    Adresse und im Verlauf des Browsers.
    * 2. **Der Blick geht auf die Seite.** Wer aus der Anwendung kam, hat die
    *    Website nie gesehen; hinter dem Fenster steht sie ab dem
    *    Seitenanfang.
    * 3. **Ein erledigter Kauf bleibt nicht als Zustand liegen.** Nach dem
    *    Schliessen steht das Fenster wieder auf der Wahl - sonst begrüsst es
    *    beim nächsten Öffnen mit einem Lizenzschlüssel von vorgestern statt
    *    mit der Frage, was gekauft werden soll. Der Schlüssel geht dabei
    *    nicht verloren: Er liegt bei der Abholstelle, und die Anwendung holt
    *    ihn beim nächsten Start.
    */
   /* Ein Klick auf „Weiter" ist ein LAUF mit Nummer. Schliessen beendet ihn:
    * Kein Wartender auf die Sicherheitsabfrage und keine laufende Anfrage darf
    * danach noch Oberfläche oder Paddle verändern - vorher legte ein alter
    * Klick nach dem Wiederöffnen eine Transaktion an, ohne dass jemand
    * geklickt hatte (Codex-Review 15.09.2026). */
   const laufRef = useRef(0);
   const abbruchSteuerung = useRef<AbortController | null>(null);

   const schliessen = useCallback(() => {
      onClose();
      laufRef.current += 1;
      abbruchSteuerung.current?.abort();
      setLaeuft(false);
      setFehler("");
      try {
         window.history.replaceState(null, "", window.location.pathname);
      } catch {
         // Ein Browser, der das verweigert, ist kein Grund, das Fenster
         // offen zu lassen.
      }
      window.setTimeout(() => {
         window.scrollTo({ top: 0, behavior: "smooth" });
         setPhase("wahl");
         setToken("");
         setTransaktion("");
         setSumme(null);
      }, 260);
   }, [onClose]);

   useFensterStapel(open, schliessen);

   /* Der Abruf der fertigen Lizenz.
    *
    * Er läuft gegen die Adresse aus dem Aufbau, nicht fest gegen `/api`: Ein
    * Testkauf im Sandkasten landet in der Sandkasten-Ablage, und eine
    * Erfolgsansicht, die beim Wirk-Worker nachsähe, wartete auf eine Lizenz,
    * die woanders längst liegt.
    */
   /* Beim Upgrade liegt bei der Abholstelle schon das alte PRO-Token, und die
    * erste Antwort kam damit sofort (Befund K1, 18.09.2026). Fertig ist erst
    * ein Token mit dem gekauften Typ - bis dahin wird weiter gewartet. */
   const abbruch = useRef(false);
   const holen = useCallback(async (kennung: string, adresse: string, gekauft: Wahl) => {
      const bis = Date.now() + WARTEN_MS;
      while (!abbruch.current && Date.now() < bis) {
         try {
            // `ohne_vermerk`: Diese Seite ZEIGT den Schlüssel nur. Den
            // Abholvermerk, den das Dash als „in Benutzung" liest, setzt
            // allein die Anwendung (Worker seit 15.09.2026).
            const antwort = await fetch(
               `${adresse}?vvid=${encodeURIComponent(kennung)}&ohne_vermerk=1`);
            if (antwort.ok) {
               const daten = await antwort.json();
               if (daten && daten.token && tokenPasst(String(daten.token), gekauft)) {
                  setToken(String(daten.token));
                  setPhase("fertig");
                  return;
               }
            }
         } catch {
            // Kein Netz, ein Aussetzer: Der Kauf ist davon unberührt, und der
            // nächste Versuch kommt in wenigen Sekunden.
         }
         await new Promise((weiter) => setTimeout(weiter, TAKT_MS));
      }
      if (!abbruch.current) setPhase("dauert");
   }, []);

   useEffect(() => () => { abbruch.current = true; }, []);

   /* Paddle laden, sobald das Fenster offen ist - und die Preise holen.
    *
    * Nicht schon beim Bauen der Seite: Das Skript gehört zum Kaufvorgang, und
    * wer die Website nur liest, soll es nicht mitladen.
    */
   useEffect(() => {
      if (!open || !aufbau) return;
      let gilt = true;
      void (async () => {
         try {
            await paddleLaden(aufbau);
            if (!gilt || !window.Paddle?.PricePreview) return;
            const antwort = await window.Paddle.PricePreview({
               items: [
                  { priceId: aufbau.preise.pro, quantity: 1 },
                  { priceId: aufbau.preise.lifetime, quantity: 1 },
               ],
            }) as {
               data?: { details?: { lineItems?: Array<{
                  price?: { id?: string };
                  formattedTotals?: { total?: string };
               }> } };
            };
            const posten = antwort?.data?.details?.lineItems || [];
            const gefunden: Record<Wahl, string> = { pro: "", lifetime: "" };
            for (const eintrag of posten) {
               const betrag = eintrag?.formattedTotals?.total || "";
               if (!betrag) continue;
               if (eintrag?.price?.id === aufbau.preise.pro) gefunden.pro = betrag;
               if (eintrag?.price?.id === aufbau.preise.lifetime) gefunden.lifetime = betrag;
            }
            if (gilt && (gefunden.pro || gefunden.lifetime)) setPaddlePreise(gefunden);
         } catch {
            // Der Listenpreis steht ohnehin da. Eine Kaufseite, die wegen
            // einer Preisauskunft nichts anzeigt, wäre der schlechtere Tausch.
         }
      })();
      return () => { gilt = false; };
   }, [open, aufbau]);

   /* Auf den Abschluss horchen.
    *
    * `checkout.completed` ist die einzige Meldung, die hier etwas auslöst.
    * Sie sagt, dass die Zahlung durch ist - die Lizenz entsteht davon
    * unabhängig im Worker, sobald Paddle den Kauf serverseitig meldet. Genau
    * deshalb wird jetzt gewartet und nicht behauptet.
    */
   useEffect(() => {
      if (!open || !aufbau) return;
      paddleHorchen((ereignis: PaddleEreignis) => {
         // Die Übersicht neben dem Formular folgt Paddles Beträgen. Ereignisse
         // ohne Summen lassen sie stehen (`summeAus` liefert dann null).
         const neu = summeAus(ereignis, sprache);
         if (neu) setSumme(neu);
         if (ereignis?.name !== "checkout.completed") return;
         // Zuerst die Nachsperre: Ab jetzt öffnet kein Tab dieses Browsers
         // für zehn Minuten ein zweites Bezahlformular derselben Lizenz.
         nachsperreSetzen(vvid, wahl);
         abbruch.current = false;
         setPhase("warten");
         void holen(vvid.trim().toUpperCase(), aufbau.lizenzAbruf, wahl);
      });
      return () => paddleHorchen(null);
   }, [open, aufbau, vvid, wahl, holen, sprache]);

   /* Jeder Schritt beginnt oben. Wer die Anschrift unten ausgefüllt hat und
    * weiterklickt, stünde sonst mitten im Zahlungsformular. */
   useEffect(() => {
      inhaltRef.current?.scrollTo({ top: 0 });
   }, [phase]);

   /* Zurück zu den Angaben: Die Transaktion wird verworfen, und die
    * Sicherheitsabfrage muss neu bestätigt werden - ihr Token ist beim
    * Anlegen des Vorgangs verbraucht worden. */
   const zurueckZuAngaben = useCallback(() => {
      setPhase("wahl");
      setTransaktion("");
      setSumme(null);
      verbraucht();
   }, [verbraucht]);

   const zahlungGescheitert = useCallback(() => {
      zurueckZuAngaben();
      setFehler(t.fehlerLaden);
   }, [zurueckZuAngaben, t.fehlerLaden]);

   /* Kaufen heisst jetzt: erst den Vorgang, dann das Bezahlfenster.
    *
    * Der Grund ist die Rechnung. Paddles Checkout erhebt Email, Land und PLZ -
    * einen Personennamen nie, und `Checkout.open()` kennt nicht einmal ein
    * Feld dafür. Die erste echte Testrechnung trug deshalb keinen Empfänger,
    * und in unserer Ablage stand nichts als eine Emailadresse
    * (Anwenderbefund 10.09.2026). Jetzt legt der Worker Kunde, Anschrift und
    * Firma bei Paddle an und gibt eine fertige Transaktion zurück; das
    * Bezahlfenster wird nur noch damit geöffnet.
    *
    * **Posten und Preis stehen dann fest.** Sie kommen aus der Transaktion und
    * nicht mehr aus dem Browser - der Mengenwähler entfällt dabei von selbst.
    */
   const kaufen = async () => {
      const kennung = vvid.trim().toUpperCase();
      setFehler("");
      setVvidFehler(false);
      setFeldFehler("");
      setLeer([]);

      if (!VVID_RE.test(kennung)) {
         setVvidFehler(true);
         setFehler(t.fehlerVvid);
         return;
      }
      /* Eben bezahlt, in diesem oder einem anderen Tab: Kein zweiter Vorgang,
       * und die Meldung ist dieselbe, die der Worker in dem Fall schickt. Der
       * Worker sperrt ohnehin - hier geht nur keine Anfrage erst hinaus. */
      if (nachsperreGilt(kennung, wahl)) {
         setFehler(t.fehlerZahlungUnterwegs);
         return;
      }
      /* Alle Felder sind Pflicht - sie stehen auf der Rechnung.
       *
       * Ausgenommen ist allein die USt-IdNr: Es gibt Firmen ohne, und ein
       * Pflichtfeld, das mancher nicht ausfuellen kann, hielte ihn vom Kauf ab.
       */
      const offen = ([
         ["anrede", anrede], ["vorname", vorname], ["nachname", nachname],
         ["email", email], ["strasse", strasse], ["hausnummer", hausnummer],
         ["plz", plz], ["stadt", stadt], ["land", land],
         ...(kundentyp === "gewerblich" ? [["firma", firma] as const] : []),
      ] as const).filter(([, wert]) => !String(wert).trim()).map(([name]) => name);
      if (offen.length) {
         setLeer(offen);
         setFeldFehler("pflicht");
         return;
      }
      setLeer([]);
      if (!EMAIL_RE.test(email.trim())) { setFeldFehler("email"); setLeer(["email"]); return; }
      const landCode = laenderCode(land, sprache);
      if (!landCode) { setFeldFehler("land"); setLeer(["land"]); return; }
      if (!aufbau) return;

      setLaeuft(true);
      const lauf = ++laufRef.current;
      /* Das Token wird abgewartet, statt beim Fehlen gleich zu melden - siehe
       * `useTurnstile`. Gemeldet wird nur, was der Kunde auch sehen kann: eine
       * echte Rückfrage oder eine Prüfung, die gar nicht antwortet. */
      const bot = await tokenHolen();
      if (lauf !== laufRef.current) return;
      if (!bot.token) {
         setLaeuft(false);
         if ("grund" in bot && bot.grund !== "abgebrochen") {
            setFehler(bot.grund === "rueckfrage" ? t.botOffen : t.botStumm);
         }
         return;
      }
      const steuerung = new AbortController();
      abbruchSteuerung.current = steuerung;
      try {
         const antwort = await fetch(aufbau.vorgangAnlegen, {
            method: "POST",
            signal: steuerung.signal,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
               vv_id: kennung,
               app_version: appVersion,
               lizenzwunsch: wahl,
               anrede, vorname: vorname.trim(), nachname: nachname.trim(),
               email: email.trim(),
               strasse: strasse.trim(), hausnummer: hausnummer.trim(),
               plz: plz.trim(), stadt: stadt.trim(),
               // Der Code, nicht der Name: Paddle bestimmt daraus den
               // Steuerort.
               land: landCode,
               kundentyp,
               firma: kundentyp === "gewerblich" ? firma.trim() : "",
               ustid: kundentyp === "gewerblich" ? ustid.trim() : "",
               // Der Code wird im Worker ERNEUT geprüft und dort in die
               // Paddle-Kennung übersetzt. Was der Browser hier mitschickt,
               // ist ein Wunsch, keine Zusage.
               /* Gesendet wird der GEPRÜFTE Code, und nur wenn er noch im
                * Feld steht. Der blosse Wahrheitswert von `rabatt` genügt
                * nicht: Wer während einer laufenden Prüfung den Code ändert,
                * schickte sonst den neuen Feldinhalt mit dem Befund des alten
                * (Codex-Review 16.09.2026, am Hook ausgeführt). */
               rabattcode: rabatt && rabatt.code === rabattcode.trim().toUpperCase()
                  ? rabatt.code : "",
               turnstile: bot.token,
            }),
         });
         // Ein Token gilt nur einmal, ob der Vorgang entsteht oder nicht. Das
         // nächste wird gleich geholt - für einen zweiten Versuch oder für
         // „Angaben ändern".
         verbraucht();
         const daten = await antwort.json().catch(() => ({}));
         if (lauf !== laufRef.current) return;
         if (!antwort.ok || !daten.transaction_id) {
            setFehler(String(daten.error || "").startsWith("turnstile")
               ? t.fehlerBot
               : antwort.status === 429 ? t.fehlerBremse
               // Die Installation hat das Gewünschte schon (Worker prüft
               // seit 14.09.2026). Kein Fehler im eigentlichen Sinn - der
               // Kunde soll wissen, dass er nicht zweimal zahlen muss.
               : daten.error === "schon_lizenziert"
                  ? (daten.grund === "lifetime_vorhanden"
                     ? t.fehlerLifetimeVorhanden : t.fehlerProVorhanden)
               // Ein zweites Fenster hat gerade bezahlt, der Webhook ist
               // noch unterwegs (Worker seit 15.09.2026).
               : daten.error === "zahlung_unterwegs" ? t.fehlerZahlungUnterwegs
               : daten.error === "vorgang_offen" ? t.fehlerVorgangOffen
               // Zu dieser Installation liegt etwas in der Ablage, das sich
               // gerade nicht lesen lässt. Der Worker verkauft dann nicht
               // (Umbau 15.09.2026 gegen den Doppelkauf).
               : daten.error === "stand_unklar" ? t.fehlerStandUnklar
               // Tageskontingent des Workers leer (K8, 18.09.2026).
               : daten.error === "ueberlastet" ? t.fehlerUeberlastet
               : t.fehlerVorgang);
            return;
         }

         // Das Formular öffnet `ProKaufZahlung`, sobald sein Rahmen steht.
         setSumme(null);
         setTransaktion(String(daten.transaction_id));
         setPhase("zahlen");
      } catch {
         if (lauf === laufRef.current) setFehler(t.fehlerNetz);
      } finally {
         if (lauf === laufRef.current) setLaeuft(false);
      }
   };

   const kopieren = () => {
      void navigator.clipboard?.writeText(token);
      setKopiert(true);
      window.setTimeout(() => setKopiert(false), 2000);
   };

   return (
      <AnimatePresence>
         {open && (
            <>
               <motion.div
                  key="pro-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={schliessen}
                  style={{
                     position: "fixed", inset: 0, zIndex: 1000,
                     background: "rgba(6,7,18,0.82)",
                     backdropFilter: "blur(14px)",
                     WebkitBackdropFilter: "blur(14px)",
                  }}
               />

               <motion.div
                  key="pro-modal"
                  initial={{ opacity: 0, y: 32, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.97 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                     position: "fixed", inset: 0, zIndex: 1001,
                     display: "flex", alignItems: "center", justifyContent: "center",
                     padding: "24px 16px",
                     pointerEvents: "none",
                  }}
               >
                  <div style={{
                     width: "100%", maxWidth: 620, maxHeight: "88vh",
                     display: "flex", flexDirection: "column",
                     background: "rgba(14,16,36,0.97)",
                     border: "1px solid rgba(106,172,204,0.18)",
                     borderRadius: 20,
                     boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(106,172,204,0.06)",
                     pointerEvents: "auto",
                     overflow: "hidden",
                  }}>
                     {/* ── Kopf ── */}
                     <div style={{
                        padding: "22px 28px 20px",
                        borderBottom: "1px solid rgba(106,172,204,0.12)",
                        display: "flex", alignItems: "flex-start", gap: 14,
                        flexShrink: 0,
                        background: "rgba(106,172,204,0.03)",
                     }}>
                        <div style={{
                           width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                           background: "rgba(106,172,204,0.08)",
                           border: "1px solid rgba(106,172,204,0.2)",
                           display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                           <ShoppingCart size={18} color={CYAN} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                           <p style={{
                              fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase",
                              letterSpacing: "0.08em", fontWeight: 600, margin: 0,
                              lineHeight: 1.4, display: "flex", alignItems: "center", gap: 7,
                           }}>
                              VidiVerify <ProBadge />
                           </p>
                           <h2 style={{
                              fontSize: 16, fontWeight: 800, color: TEXT_PRIMARY, margin: "4px 0 0",
                           }}>
                              {phase === "fertig" ? t.fertigTitel
                                 : phase === "zahlen" ? t.zahlenTitel
                                 : phase === "warten" ? t.wartenTitel
                                 : phase === "dauert" ? t.dauertTitel
                                 : t.titel}
                           </h2>
                           <p style={{ fontSize: 11.5, color: TEXT_MUTED, margin: "4px 0 0", lineHeight: 1.5 }}>
                              {phase === "wahl" ? t.untertitel : ""}
                           </p>
                        </div>
                        <button
                           onClick={schliessen}
                           aria-label="schliessen"
                           style={{
                              flexShrink: 0, width: 32, height: 32, borderRadius: 8,
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", color: TEXT_MUTED,
                           }}
                        >
                           <X size={15} />
                        </button>
                     </div>

                     {/* ── Inhalt ── */}
                     <div
                        ref={inhaltRef}
                        data-lenis-prevent
                        onWheel={(e) => e.stopPropagation()}
                        style={{ padding: "22px 28px", overflowY: "auto", flex: 1 }}
                     >
                        {/* Kein Aufbau heisst: hier kann nicht gekauft werden.
                            Das ist der ehrliche Zustand, solange der
                            Wirkkatalog fehlt - und besser als ein Knopf, der
                            in den Sandkasten führte und eine Bestellung
                            entgegennähme, die niemandem etwas berechnet. */}
                        {!aufbau ? (
                           <div>
                              <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY, margin: 0 }}>
                                 {t.zuTitel}
                              </h3>
                              <p style={{ fontSize: 12.5, color: TEXT_SECONDARY, lineHeight: 1.6, marginTop: 8 }}>
                                 {t.zuText}
                              </p>
                              <a href="#lizenz-anfrage" style={{
                                 display: "inline-block", marginTop: 14,
                                 padding: "8px 18px", borderRadius: 10,
                                 background: "rgba(106,172,204,0.08)",
                                 border: "1px solid rgba(106,172,204,0.2)",
                                 fontSize: 12, fontWeight: 600, color: CYAN,
                              }}>
                                 {t.zuKnopf}
                              </a>
                           </div>
                        ) : phase === "fertig" ? (
                           <div>
                              {/* Der Augenblick, auf den gewartet wurde. Er
                                  darf sichtbar sein: Nach dreissig Sekunden
                                  Ring ist ein stiller Textwechsel zu wenig
                                  Antwort für einen bezahlten Kauf. */}
                              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                                 <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 15 }}
                                    style={{
                                       width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                                       background: "rgba(34,197,94,0.12)",
                                       border: `1px solid ${GREEN}`,
                                       display: "flex", alignItems: "center", justifyContent: "center",
                                    }}
                                 >
                                    <Check size={16} color={GREEN} />
                                 </motion.div>
                                 <span style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>
                                    {t.fertigTitel}
                                 </span>
                              </div>
                              <p style={{ fontSize: 12.5, color: TEXT_SECONDARY, lineHeight: 1.6, margin: 0 }}>
                                 {t.fertigText}
                              </p>
                              <div style={{
                                 marginTop: 12, padding: "12px 14px", borderRadius: 10,
                                 background: "rgba(0,0,0,0.35)",
                                 border: "1px solid rgba(106,172,204,0.16)",
                                 fontFamily: "JetBrains Mono, ui-monospace, monospace",
                                 fontSize: 11, color: TEXT_SECONDARY,
                                 wordBreak: "break-all", lineHeight: 1.6,
                              }}>
                                 {token}
                              </div>
                              <button type="button" onClick={kopieren} style={{
                                 marginTop: 10, padding: "7px 14px", borderRadius: 8,
                                 background: "rgba(255,255,255,0.04)",
                                 border: "1px solid rgba(255,255,255,0.1)",
                                 color: kopiert ? GREEN : TEXT_PRIMARY,
                                 fontSize: 12, fontFamily: "inherit", cursor: "pointer",
                                 display: "inline-flex", alignItems: "center", gap: 6,
                              }}>
                                 {kopiert ? <Check size={13} /> : <Copy size={13} />}
                                 {kopiert ? t.kopiert : t.kopieren}
                              </button>
                           </div>
                        ) : phase === "warten" ? (
                           <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                              {/* Der laufende Ring. Er zeigt keine Dauer an -
                                  die kennt niemand -, sondern nur, dass hier
                                  jemand arbeitet. Genau das ist die Frage des
                                  Kunden, der eben bezahlt hat. */}
                              <motion.div
                                 animate={{ rotate: 360 }}
                                 transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                                 style={{
                                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                                    border: "2px solid rgba(106,172,204,0.16)",
                                    borderTopColor: CYAN,
                                 }}
                              />
                              <div style={{ minWidth: 0 }}>
                                 {/* Die Zeile wechselt mit der Wartezeit. Ein
                                     Text, der zwanzig Sekunden lang derselbe
                                     bleibt, liest sich wie ein hängendes
                                     Fenster. */}
                                 <AnimatePresence mode="wait">
                                    <motion.p
                                       key={wartestufe}
                                       initial={{ opacity: 0, y: 6 }}
                                       animate={{ opacity: 1, y: 0 }}
                                       exit={{ opacity: 0, y: -6 }}
                                       transition={{ duration: 0.25 }}
                                       style={{
                                          fontSize: 12.5, color: TEXT_SECONDARY,
                                          lineHeight: 1.6, margin: 0,
                                       }}
                                    >
                                       {[t.warten1, t.warten2, t.warten3, t.warten4][wartestufe]}
                                    </motion.p>
                                 </AnimatePresence>
                                 <p style={{ ...hinweis, marginTop: 8 }}>{t.wartenRuhig}</p>
                              </div>
                           </div>
                        ) : phase === "dauert" ? (
                           <div>
                              <p style={{ fontSize: 12.5, color: TEXT_SECONDARY, lineHeight: 1.6, margin: 0 }}>
                                 {t.dauertText}
                              </p>
                              <button type="button" onClick={() => {
                                 abbruch.current = false;
                                 setPhase("warten");
                                 void holen(vvid.trim().toUpperCase(), aufbau.lizenzAbruf, wahl);
                              }} style={{
                                 marginTop: 12, padding: "7px 14px", borderRadius: 8,
                                 background: "rgba(255,255,255,0.04)",
                                 border: "1px solid rgba(255,255,255,0.1)",
                                 color: TEXT_PRIMARY, fontSize: 12,
                                 fontFamily: "inherit", cursor: "pointer",
                              }}>
                                 {t.nochmalPruefen}
                              </button>
                           </div>
                        ) : (
                           <>
                           {/* Die Angaben bleiben beim Zahlungsschritt
                               eingehängt und werden nur verborgen. Sonst
                               verschwände mit ihnen das Turnstile-Widget,
                               und nach „Angaben ändern" liesse sich die
                               Sicherheitsabfrage nicht mehr bestätigen. */}
                           {phase === "zahlen" && transaktion && (
                              <ProKaufZahlung
                                 aufbau={aufbau} transactionId={transaktion}
                                 sprache={sprache} summe={summe} t={t}
                                 priceId={aufbau.preise[wahl]}
                                 land={laenderCode(land, sprache) || ""}
                                 plz={plz.trim()}
                                 rabattProzent={rabatt?.art === "prozent"
                                    && rabatt.gilt_fuer.includes(wahl) ? rabatt.wert : null}
                                 onFehler={zahlungGescheitert} />
                           )}
                           <div hidden={phase === "zahlen"}>
                              {/* ── Die Installation ── */}
                              <p style={rubrik}>{t.vvidTitel}</p>
                              <label htmlFor="pro-vvid" style={beschriftung}>
                                 {t.vvidFeld}
                              </label>
                              <input
                                 id="pro-vvid"
                                 value={vvid}
                                 onChange={(e) => {
                                    setVvid(e.target.value.toUpperCase());
                                    setVvidFehler(false);
                                 }}
                                 maxLength={8}
                                 placeholder={t.vvidPlatzhalter}
                                 style={{
                                    width: "100%", padding: "9px 12px", borderRadius: 8,
                                    background: "rgba(255,255,255,0.03)",
                                    border: `1px solid ${vvidFehler
                                       ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
                                    color: TEXT_PRIMARY, fontSize: 13,
                                    fontFamily: "JetBrains Mono, ui-monospace, monospace",
                                    letterSpacing: "0.08em",
                                 }}
                              />
                              <p style={{ ...hinweis, marginTop: 6 }}>
                                 {vvidFehler ? t.vvidFehler : t.vvidWarum}
                              </p>

                              {/* ── Die Wahl ── */}
                              <p style={{ ...rubrik, marginTop: 22 }}>{t.wahlTitel}</p>
                              <div style={{
                                 display: "grid", gap: 10,
                                 gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                              }}>
                                 {!nurLifetime && (
                                    <Kachel gewaehlt={wahl === "pro"} onClick={() => setWahl("pro")}
                                            titel={t.proTitel} preis={anzeigePreis("pro")}
                                            statt={stattPreis("pro")}
                                            text={t.proText} farbe={CYAN} />
                                 )}
                                 <Kachel gewaehlt={wahl === "lifetime"} onClick={() => setWahl("lifetime")}
                                         titel={t.lifetimeTitel} preis={anzeigePreis("lifetime")}
                                         statt={stattPreis("lifetime")}
                                         text={t.lifetimeText} farbe={AMBER} />
                              </div>
                              {/* Die Erklärzeile ist im Preisplan zwingend
                                  gesetzt. Ohne sie kann ein Käufer den Wert
                                  von LIFETIME nicht abschätzen und wählt im
                                  Zweifel PRO. */}
                              {/* Der Rabattcode. Er ändert die ANZEIGE; was
                                  berechnet wird, entscheidet der Worker beim
                                  Anlegen des Vorgangs erneut - und Paddle
                                  rechnet es aus. Ein Preis aus einem Browser
                                  ist keine Grundlage für eine Rechnung. */}
                              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                                 <input
                                    id="pro-rabatt"
                                    value={rabattcode}
                                    onChange={(e) => codeAendern(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => {
                                       // Return prüft den Code, statt den
                                       // halben Kauf abzuschicken.
                                       if (e.key === "Enter") {
                                          e.preventDefault();
                                          if (rabattcode && !rabatt) void pruefen(rabattcode);
                                       }
                                    }}
                                    maxLength={32}
                                    placeholder={t.rabattPlatzhalter}
                                    style={{
                                       flex: 1, minWidth: 0, padding: "9px 12px",
                                       borderRadius: 8,
                                       background: "rgba(255,255,255,0.03)",
                                       border: "1px solid rgba(255,255,255,0.1)",
                                       color: TEXT_PRIMARY, fontSize: 12.5,
                                       fontFamily: "JetBrains Mono, ui-monospace, monospace",
                                       letterSpacing: "0.06em",
                                    }}
                                 />
                                 {/* Ein eingelöster Code wird hier auch wieder
                                     herausgenommen: Derselbe Knopf heisst dann
                                     „Entfernen". */}
                                 <button
                                    type="button"
                                    onClick={() => rabatt ? codeEntfernen() : void pruefen(rabattcode)}
                                    disabled={!rabatt && (!rabattcode || preisLaeuft)}
                                    style={{
                                       padding: "9px 16px", borderRadius: 8,
                                       border: "1px solid rgba(255,255,255,0.12)",
                                       background: "rgba(255,255,255,0.04)",
                                       color: rabattcode ? TEXT_PRIMARY : TEXT_MUTED,
                                       fontSize: 12.5, fontFamily: "inherit",
                                       cursor: rabatt || rabattcode ? "pointer" : "not-allowed",
                                       display: "inline-grid",
                                    }}
                                 >
                                    <KnopfText an={!rabatt} text={t.rabattPruefen} />
                                    <KnopfText an={!!rabatt} text={t.rabattEntfernen} />
                                 </button>
                              </div>
                              {/* Auch diese Zeile ist immer da und im Regelfall
                                  leer. Erschiene sie erst beim Einloesen,
                                  ruckte das ganze Fenster in dem Moment, in
                                  dem der Kunde auf die Preise schaut. */}
                              <p aria-live="polite" style={{
                                 ...hinweis, marginTop: 8, minHeight: 17,
                                 /* Grün nur, wenn der Preis wirklich sinkt.
                                    Ein Code, der für die andere Lizenz gilt,
                                    ist keine gute Nachricht - er sieht sonst
                                    aus wie eine. */
                                 color: rabatt && nachlassCent > 0 ? GREEN
                                    : rabatt ? AMBER : "#fca5a5",
                              }}>
                                 {rabatt ? (nachlassCent > 0
                                       ? t.rabattGilt.replace("{wert}", rabattWert)
                                       : rabatt.gilt_fuer.includes(wahl)
                                          ? t.rabattOhneAbzug
                                          : t.rabattNichtFuerWahl)
                                    : !codeGrund ? "\u00a0"
                                    : codeGrund === "abgelaufen" ? t.rabattAbgelaufen
                                    : codeGrund === "aufgebraucht" ? t.rabattAufgebraucht
                                    : codeGrund === "netz" ? t.rabattNetz
                                    : codeGrund === "nur_anfrage" ? t.rabattNurAnfrage
                                    : t.rabattUnbekannt}
                              </p>

                              <p style={{ ...hinweis, marginTop: 10 }}>{t.erklaerzeile}</p>
                              <p style={{ ...hinweis, marginTop: 6 }}>{t.preisHinweis}</p>

                              {/* ── Die Rechnungsanschrift ──
                                  Sie steht hier, seit der Worker die
                                  Transaktion anlegt: Anders bekommt Paddle den
                                  Namen des Käufers nie zu sehen, und die
                                  Rechnung bliebe ohne Empfänger. */}
                              <p style={{ ...rubrik, marginTop: 22 }}>{t.anschriftTitel}</p>

                              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                                 {(["privat", "gewerblich"] as const).map((art) => (
                                    <button
                                       key={art}
                                       type="button"
                                       onClick={() => setKundentyp(art)}
                                       style={{
                                          flex: 1, padding: "8px 12px", borderRadius: 8,
                                          background: kundentyp === art
                                             ? "rgba(106,172,204,0.12)" : "rgba(255,255,255,0.02)",
                                          border: `1px solid ${kundentyp === art
                                             ? CYAN : "rgba(255,255,255,0.08)"}`,
                                          color: kundentyp === art ? CYAN : TEXT_SECONDARY,
                                          fontSize: 12, fontFamily: "inherit", cursor: "pointer",
                                       }}
                                    >
                                       {art === "privat" ? ta.privat : ta.gewerblich}
                                    </button>
                                 ))}
                              </div>

                              {kundentyp === "gewerblich" && (
                                 <Zeile>
                                    <Eingabe id="pro-firma" titel={t.firma} pflicht
                                             wert={firma} setzen={setFirma} max={120}
                                             fehler={leer.includes("firma")} />
                                    <Eingabe id="pro-ustid" titel={ta.ustid}
                                             wert={ustid} setzen={setUstid} max={32} />
                                 </Zeile>
                              )}

                              <Zeile spalten="150px 1fr 1fr">
                                 {/* Zwei Knoepfe statt eines Textfeldes - wie in
                                     der Bestellanfrage. Eine Anrede tippt
                                     niemand, er waehlt sie. */}
                                 <div style={{ minWidth: 0 }}>
                                    <span style={beschriftung}>{ta.anrede} <Stern /></span>
                                    <div style={{ display: "flex", gap: 6 }}>
                                       {[ta.herr, ta.frau].map((wert) => (
                                          <button
                                             key={wert}
                                             type="button"
                                             onClick={() => {
                                                setAnrede(wert);
                                                setLeer((l) => l.filter((n) => n !== "anrede"));
                                             }}
                                             style={{
                                                flex: 1, padding: "9px 0", borderRadius: 8,
                                                textAlign: "center", cursor: "pointer",
                                                fontSize: 12.5, fontFamily: "inherit",
                                                border: `1px solid ${anrede === wert ? CYAN
                                                   : (leer.includes("anrede") && !anrede)
                                                      ? "rgba(239,68,68,0.5)"
                                                   : "rgba(255,255,255,0.1)"}`,
                                                background: anrede === wert
                                                   ? "rgba(106,172,204,0.10)"
                                                   : "rgba(255,255,255,0.03)",
                                                color: anrede === wert ? TEXT_PRIMARY : TEXT_MUTED,
                                             }}
                                          >
                                             {wert}
                                          </button>
                                       ))}
                                    </div>
                                 </div>
                                 <Eingabe id="pro-vorname" titel={ta.vorname} pflicht
                                          wert={vorname} setzen={setVorname} max={80}
                                          fehler={leer.includes("vorname")} />
                                 <Eingabe id="pro-nachname" titel={ta.nachname} pflicht
                                          wert={nachname} setzen={setNachname} max={80}
                                          fehler={leer.includes("nachname")} />
                              </Zeile>

                              <Zeile>
                                 <Eingabe id="pro-email" titel={ta.email} pflicht
                                          wert={email} setzen={setEmail} max={254}
                                          fehler={leer.includes("email")}
                                          fehlerImmer={feldFehler === "email"} />
                              </Zeile>

                              <Zeile spalten="1fr 90px">
                                 <Eingabe id="pro-strasse" titel={ta.strasse} pflicht
                                          wert={strasse} setzen={setStrasse} max={120}
                                          fehler={leer.includes("strasse")} />
                                 <Eingabe id="pro-hausnummer" titel={ta.hausnummer} pflicht
                                          wert={hausnummer} setzen={setHausnummer} max={20}
                                          fehler={leer.includes("hausnummer")} />
                              </Zeile>

                              <Zeile spalten="110px 1fr 1fr">
                                 <Eingabe id="pro-plz" titel={ta.plz} pflicht
                                          wert={plz} setzen={setPlz} max={16}
                                          fehler={leer.includes("plz")} />
                                 <Eingabe id="pro-stadt" titel={ta.stadt} pflicht
                                          wert={stadt} setzen={setStadt} max={80}
                                          fehler={leer.includes("stadt")} />
                                 <Eingabe id="pro-land" titel={ta.land} pflicht
                                          wert={land} setzen={setLand} max={64}
                                          liste="pro-laender"
                                          fehler={leer.includes("land")}
                                          fehlerImmer={feldFehler === "land"} />
                              </Zeile>
                              {/* Angeboten, nicht vorgeschrieben - wie in der
                                  Bestellanfrage. Aus dem Namen wird beim
                                  Absenden der Ländercode; erkennt ihn niemand,
                                  sagt das Feld es, statt zu raten. */}
                              <datalist id="pro-laender">
                                 {laenderNamen(sprache).map((name) => (
                                    <option key={name} value={name} />
                                 ))}
                              </datalist>

                              {/* Diese Zeile steht IMMER - sonst schoebe sie
                                  beim ersten Fehler das halbe Fenster nach
                                  unten. Im Regelfall erklaert sie die
                                  Sternchen; wo eine Eingabe wirklich nicht
                                  zu lesen ist, sagt sie das an derselben
                                  Stelle. */}
                              <p style={{
                                 ...hinweis, marginTop: 8, minHeight: 17,
                                 color: (feldFehler === "email" || feldFehler === "land")
                                    ? "#fca5a5" : TEXT_MUTED,
                              }}>
                                 {feldFehler === "email" ? t.fehlerEmail
                                    : feldFehler === "land" ? t.fehlerLand
                                    : <><Stern /> {t.erforderlich}</>}
                              </p>

                              <div ref={turnstileRef} style={{ minHeight: 4, marginTop: 12 }} />

                              {/* ── Der Ablauf ── */}
                              <p style={{ ...rubrik, marginTop: 22 }}>{t.ablaufTitel}</p>
                              <ul style={{
                                 margin: 0, padding: 0, listStyle: "none",
                                 display: "grid", gap: 6,
                                 fontSize: 12, color: TEXT_SECONDARY, lineHeight: 1.55,
                              }}>
                                 {[t.ablauf1, t.ablauf2, t.ablauf3].map((zeile) => (
                                    <li key={zeile} style={{ display: "flex", gap: 9 }}>
                                       <span aria-hidden style={{
                                          width: 5, height: 5, borderRadius: "50%",
                                          background: AMBER, flexShrink: 0, marginTop: 6,
                                       }} />
                                       <span>{zeile}</span>
                                    </li>
                                 ))}
                              </ul>

                              {/* ── Die Erklärung ── */}
                              {/* KEINE Widerrufserklärung an dieser Stelle
                                  (entschieden 10.09.2026). Verkäufer ist
                                  Paddle, und eine Erklärung zum Erlöschen des
                                  Widerrufsrechts wirkt gegenüber dem
                                  Verkäufer. Ein Kästchen bei uns hätte den
                                  Anschein erweckt, hier werde etwas
                                  Wirksames erklärt - und den Kauf um einen
                                  Klick verlängert, der nichts bewirkt. */}
                              <p style={{ ...hinweis, marginTop: 20 }}>
                                 {t.rechtZeile1}
                                 <a href="#eula" style={{ color: CYAN }}>{t.eulaLink}</a>
                                 {t.rechtZeile2}
                                 <a href="#datenschutz" style={{ color: CYAN }}>{t.datenschutzLink}</a>
                                 {t.rechtZeile3}
                              </p>

                              {fehler && (
                                 <FehlerKasten ref={fehlerRef} titel={t.fehlerTitel}
                                               alsAlert abstandOben={14}>
                                    {fehler}
                                 </FehlerKasten>
                              )}
                           </div>
                           </>
                        )}
                     </div>

                     {/* ── Fussleiste ── */}
                     <div style={{
                        padding: "14px 28px",
                        borderTop: "1px solid rgba(106,172,204,0.1)",
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between",
                        flexShrink: 0,
                        background: "rgba(106,172,204,0.02)",
                     }}>
                        <span style={{
                           display: "inline-flex", alignItems: "center", gap: 6,
                           padding: "4px 10px 4px 6px", borderRadius: 999,
                           background: "rgba(106,172,204,0.07)",
                           border: "1px solid rgba(106,172,204,0.16)",
                        }}>
                           <span style={{
                              width: 18, height: 18, borderRadius: "50%",
                              background: `linear-gradient(135deg, ${CYAN}, #4a7da0)`,
                              display: "inline-flex", alignItems: "center",
                              justifyContent: "center",
                              fontSize: 9, fontWeight: 900, color: "#fff",
                              flexShrink: 0,
                           }}>V</span>
                           <span style={{ fontSize: 11, fontWeight: 600, color: CYAN }}>
                              VidiVerify-Team
                           </span>
                           <span style={{ width: 1, height: 10, background: "rgba(106,172,204,0.25)" }} />
                           <span style={{ fontSize: 11, color: TEXT_MUTED }}>Gera</span>
                        </span>

                        {aufbau && phase === "zahlen" ? (
                           /* Bezahlt wird im Formular selbst - dessen Knopf
                              ist der einzige Kaufknopf. Hier steht nur der
                              Weg zurück. */
                           <motion.button
                              onClick={zurueckZuAngaben}
                              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                              style={{
                                 padding: "7px 18px", borderRadius: 10,
                                 background: "rgba(106,172,204,0.08)",
                                 border: "1px solid rgba(106,172,204,0.2)",
                                 fontSize: 12, fontWeight: 600, color: CYAN,
                                 cursor: "pointer", fontFamily: "inherit",
                              }}
                           >
                              {t.angabenAendern}
                           </motion.button>
                        ) : aufbau && phase === "wahl" ? (
                           <motion.button
                              onClick={() => void kaufen()}
                              /* Siehe Bestellanfrage: Eine laufende Codeprüfung
                                 hält den Kauf kurz auf, damit der geprüfte Code
                                 auch mitgeht. */
                              disabled={laeuft || codeLaeuft}
                              whileHover={{ scale: laeuft ? 1 : 1.04 }}
                              whileTap={{ scale: laeuft ? 1 : 0.97 }}
                              style={{
                                 padding: "8px 20px", borderRadius: 10,
                                 background: laeuft ? "rgba(106,172,204,0.08)" : CYAN,
                                 border: "1px solid rgba(106,172,204,0.3)",
                                 fontSize: 12.5, fontWeight: 700,
                                 color: laeuft ? CYAN : "#08111a",
                                 cursor: laeuft ? "wait" : "pointer",
                                 fontFamily: "inherit",
                              }}
                           >
                              {laeuft ? t.kaufenLaeuft : t.kaufen}
                           </motion.button>
                        ) : (
                           <motion.button
                              onClick={schliessen}
                              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                              style={{
                                 padding: "7px 18px", borderRadius: 10,
                                 background: "rgba(106,172,204,0.08)",
                                 border: "1px solid rgba(106,172,204,0.2)",
                                 fontSize: 12, fontWeight: 600, color: CYAN,
                                 cursor: "pointer", fontFamily: "inherit",
                              }}
                           >
                              {t.zurueck}
                           </motion.button>
                        )}
                     </div>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>
   );
};

const rubrik: React.CSSProperties = {
   fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase",
   letterSpacing: "0.08em", fontWeight: 700, margin: "0 0 10px",
};

const beschriftung: React.CSSProperties = {
   display: "block", fontSize: 11, color: TEXT_MUTED, marginBottom: 5,
};

const hinweis: React.CSSProperties = {
   fontSize: 11.5, color: TEXT_MUTED, lineHeight: 1.55, margin: 0,
};

/** Eine Zeile aus Feldern. Ohne Angabe zwei gleich breite Spalten. */
function Zeile({ children, spalten = "1fr" }: {
   children: React.ReactNode; spalten?: string;
}) {
   return (
      <div style={{
         display: "grid", gap: 8, gridTemplateColumns: spalten, marginBottom: 10,
      }}>
         {children}
      </div>
   );
}

/** Die Pflichtmarke. Gold, weil sie eine Auszeichnung ist und keine Warnung. */
function Stern() {
   return <span style={{ color: AMBER, fontWeight: 700 }}>*</span>;
}

function Eingabe({ id, titel, wert, setzen, max, pflicht, fehler, fehlerImmer,
                  liste }: {
   id: string; titel: string; wert: string; setzen: (v: string) => void;
   max: number; pflicht?: boolean; fehler?: boolean; fehlerImmer?: boolean;
   liste?: string;
}) {
   /* Der rote Rahmen verschwindet, sobald etwas drinsteht.
    *
    * Er hing bis zum 11.09.2026 an der Liste der leeren Felder, und die wurde
    * nur beim Absenden neu gebildet: Wer die Anschrift danach ausfuellte,
    * sah weiter rote Rahmen um lauter gefuellte Felder (Anwenderbefund). Ein
    * Rahmen, der nicht mehr stimmt, ist schlimmer als keiner - er erzieht
    * dazu, ihn zu uebersehen.
    */
   /* Zwei Sorten Fehler, und sie verhalten sich verschieden.
    *
    * Ein leeres Pflichtfeld hoert auf, falsch zu sein, sobald etwas drinsteht
    * - der Rahmen geht beim Tippen weg. Eine unvollstaendige Emailadresse
    * oder ein Land, das wir nicht kennen, sind dagegen GEFUELLT und trotzdem
    * falsch; dort bliebe der Rahmen sonst nur, bis der erste Buchstabe
    * nachkommt, und die Meldung stuende ohne Bezug da.
    */
   const zeigtFehler = fehlerImmer || (Boolean(fehler) && !wert.trim());
   return (
      <div style={{ minWidth: 0 }}>
         <label htmlFor={id} style={beschriftung}>
            {titel}{pflicht ? <> <Stern /></> : null}
         </label>
         <input
            id={id}
            value={wert}
            list={liste}
            maxLength={max}
            onChange={(e) => setzen(e.target.value)}
            style={{
               width: "100%", padding: "9px 12px", borderRadius: 8,
               background: "rgba(255,255,255,0.03)",
               border: `1px solid ${zeigtFehler
                  ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
               color: TEXT_PRIMARY, fontSize: 12.5, fontFamily: "inherit",
            }}
         />
      </div>
   );
}

function Kachel({ gewaehlt, onClick, titel, preis, statt, text, farbe }: {
   gewaehlt: boolean; onClick: () => void;
   titel: string; preis: string; statt?: string; text: string; farbe: string;
}) {
   return (
      <button type="button" onClick={onClick} style={{
         textAlign: "left", padding: 14, borderRadius: 12, cursor: "pointer",
         display: "flex", flexDirection: "column", alignItems: "stretch",
         background: gewaehlt ? `${farbe}12` : "rgba(255,255,255,0.02)",
         border: `1px solid ${gewaehlt ? farbe : "rgba(255,255,255,0.08)"}`,
         color: TEXT_PRIMARY, fontFamily: "inherit",
      }}>
         <div style={{
            display: "flex", alignItems: "baseline",
            justifyContent: "space-between", gap: 8,
         }}>
            <span style={{ fontWeight: 700, letterSpacing: "0.04em", fontSize: 13 }}>
               {titel}
            </span>
            <span style={{ color: farbe, fontSize: 12.5, fontWeight: 700 }}>{preis}</span>
         </div>
         {/* Die Zeile steht IMMER, auch ohne Rabatt - dann leer und
             unsichtbar. Erschiene sie erst mit einem gültigen Code, wüchse
             die Karte in dem Moment um eine Zeile, und die Kacheln stünden
             verschieden hoch. Ein Preisnachlass darf die Seite nicht in
             Bewegung versetzen. */}
         <span aria-hidden={!statt} style={{
            fontSize: 11, color: TEXT_MUTED, textDecoration: "line-through",
            display: "block", marginTop: 3, textAlign: "right",
            lineHeight: "14px", minHeight: 14,
            visibility: statt ? "visible" : "hidden",
         }}>
            {statt || " "}
         </span>
         <p style={{ ...hinweis, marginTop: 7 }}>{text}</p>
      </button>
   );
}

export default ProKaufModal;
