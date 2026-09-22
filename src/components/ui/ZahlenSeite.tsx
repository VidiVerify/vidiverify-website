/**
 * Die Zielseite der verschickten Zahlungslinks.
 *
 * **Warum es sie gibt.** Ein Zahlungslink aus dem Dash ist nichts weiter als
 * eine Adresse mit `?_ptxn=<Vorgang>` daran. Welche Adresse das ist, legt der
 * Zahlungsanbieter im Konto fest („Default Payment Link"), und sie muss auf
 * eine **eigene Seite mit Paddle.js** zeigen: Die Bibliothek erkennt den
 * Parameter beim Start und öffnet das Bezahlfenster von selbst.
 *
 * Bis zum 22.09.2026 gab es diese Seite nicht. Der erste verschickte Link
 * zeigte deshalb ins Leere - die Kaufseite lädt Paddle.js erst, wenn ihr
 * eigenes Fenster offen ist, und ein Link auf sie hätte nur die Preistafel
 * gezeigt.
 *
 * **Was hier NICHT passiert:** kein Formular, keine Anschrift, keine VV-ID.
 * Der Vorgang trägt all das bereits; der Käufer trägt nur noch seine Zahlung
 * und seine Rechnungsanschrift ein, und zwar beim Anbieter. Genau deshalb
 * trägt dieser Weg auch dort, wo die Kaufseite nichts annimmt: Über das Land
 * entscheidet die Karte, nicht unser Formular.
 */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { paddleAufbau, paddleHorchen, paddleLaden } from "@utils/paddle";
import type { PaddleEreignis } from "@utils/paddle";
import { spracheAus } from "./proKaufTexte";
import { CYAN, GREEN, TEXT_PRIMARY, TEXT_SECONDARY } from "@/constants/theme";

/** Das Häkchen im Ring - gezeichnet, nicht als Zeichen gesetzt.
 *
 * Ein Sonderzeichen hinge an der Schrift des Besuchers und hätte weder Tiefe
 * noch Glanz. Der Verlauf und der weiche Schein darunter sind dieselbe
 * Handschrift wie die Statuskugeln in der Anwendung. */
function ErfolgsHaken() {
   return (
      <div style={{
         width: 96, height: 96, margin: "0 auto 18px",
         borderRadius: "50%", display: "grid", placeItems: "center",
         background: "radial-gradient(circle at 38% 32%,"
            + " rgba(34,197,94,0.30), rgba(34,197,94,0.06) 62%,"
            + " rgba(34,197,94,0) 72%)",
         boxShadow: "0 0 42px rgba(34,197,94,0.22)",
      }}>
         <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
            <defs>
               <linearGradient id="vv-haken-ring" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#16a34a" />
               </linearGradient>
            </defs>
            <circle cx="36" cy="36" r="32" fill="rgba(34,197,94,0.10)"
                    stroke="url(#vv-haken-ring)" strokeWidth="3" />
            {/* Der Glanzbogen oben - dieselbe Lichtquelle wie im Schein. */}
            <path d="M14 29a23 23 0 0 1 30-13" fill="none"
                  stroke="rgba(255,255,255,0.28)" strokeWidth="2.5"
                  strokeLinecap="round" />
            <path d="M23 37.5 32.5 47 50 27.5" fill="none" stroke={GREEN}
                  strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
         </svg>
      </div>
   );
}

type Zustand = "laeuft" | "bezahlt" | "ohne_vorgang" | "hier_nicht" | "gescheitert";

const TEXTE = {
   de: {
      titel: "Zahlung",
      laeuft: "Das Bezahlfenster wird geöffnet …",
      laeuftHinweis:
         "Öffnet es sich nicht von selbst, lade die Seite bitte neu.",
      bezahltTitel: "Danke - die Zahlung ist eingegangen.",
      bezahlt:
         "Deine Lizenz wird jetzt für deine Installation hinterlegt. Das "
         + "dauert in der Regel wenige Augenblicke.",
      bezahltSchritte:
         "Öffne VidiVerify und wähle „Lizenz abholen\". Erscheint sie noch "
         + "nicht, warte einen Moment und versuche es erneut.",
      bezahltBeleg:
         "Rechnung und Bestellbestätigung kommen per Email vom "
         + "Zahlungsanbieter.",
      ohneVorgang:
         "Dieser Adresse fehlt der Vorgang. Bitte rufe den Link aus unserer "
         + "Email unverändert auf - er endet auf eine Vorgangsnummer.",
      hierNicht:
         "Hier lässt sich gerade nicht bezahlen. Bitte melde dich bei uns, "
         + "dann schicken wir dir einen neuen Link.",
      gescheitert:
         "Das Bezahlfenster liess sich nicht laden. Bitte versuche es noch "
         + "einmal oder melde dich bei uns.",
      kontakt: "support@vidiverify.de",
   },
   en: {
      titel: "Payment",
      laeuft: "Opening the payment window …",
      laeuftHinweis: "If it does not open by itself, please reload the page.",
      bezahltTitel: "Thank you - your payment has come through.",
      bezahlt:
         "Your licence is being filed for your installation now. This usually "
         + "takes a few moments.",
      bezahltSchritte:
         "Open VidiVerify and choose \"Fetch licence\". If it is not there "
         + "yet, wait a moment and try again.",
      bezahltBeleg:
         "Invoice and order confirmation arrive by email from the payment "
         + "provider.",
      ohneVorgang:
         "This address is missing the transaction. Please open the link from "
         + "our email unchanged - it ends with a transaction number.",
      hierNicht:
         "Payment is not available here at the moment. Please get in touch "
         + "and we will send you a new link.",
      gescheitert:
         "The payment window could not be loaded. Please try again or get in "
         + "touch with us.",
      kontakt: "support@vidiverify.de",
   },
};

export default function ZahlenSeite() {
   const { i18n } = useTranslation();
   const t = TEXTE[spracheAus(i18n.language)];
   /* Beides steht schon vor dem ersten Zeichnen fest - es hängt allein an der
    * Adresse und am Host. Im Effekt gesetzt, wären es zwei Durchläufe und der
    * Besucher sähe kurz „wird geöffnet", bevor die Absage kommt.
    *
    * Ohne Vorgang in der Adresse gibt es nichts zu öffnen; Paddle.js bliebe
    * stumm, und der Besucher stünde vor einer leeren Seite. */
   const [zustand, setZustand] = useState<Zustand>(() => {
      if (!new URLSearchParams(window.location.search).get("_ptxn")) {
         return "ohne_vorgang";
      }
      return paddleAufbau() ? "laeuft" : "hier_nicht";
   });

   useEffect(() => {
      if (zustand !== "laeuft") return;
      const aufbau = paddleAufbau();
      if (!aufbau) return;
      let abgemeldet = false;
      /* Auf den Abschluss horchen, BEVOR geladen wird - sonst käme die
       * Meldung womöglich vor dem Horcher an.
       *
       * Ohne das blieb hier nach der Zahlung Paddles eigenes Häkchen stehen
       * und dahinter unsere Zeile „Das Bezahlfenster wird geöffnet …". Wer
       * das Fenster schloss, stand vor einer Seite, die nichts von seiner
       * Zahlung wusste (Anwenderbefund im VM-Lauf 22.09.2026).
       *
       * Die Lizenz entsteht davon unabhängig im Worker, sobald der Anbieter
       * den Kauf serverseitig meldet. Deshalb sagt die Seite, was als
       * Nächstes zu tun ist, statt eine Lizenz zu behaupten, die sie nicht
       * gesehen hat. */
      paddleHorchen((ereignis: PaddleEreignis) => {
         if (ereignis?.name !== "checkout.completed") return;
         if (!abgemeldet) setZustand("bezahlt");
      });
      /* Geladen und eingerichtet - mehr ist nicht zu tun. Paddle.js liest den
       * Parameter beim Start selbst und legt das Bezahlfenster über die
       * Seite. Ein eigener `Checkout.open`-Aufruf ginge dem sogar vor und
       * wäre die fehleranfälligere Fassung. */
      paddleLaden(aufbau).catch(() => {
         if (!abgemeldet) setZustand("gescheitert");
      });
      return () => { abgemeldet = true; paddleHorchen(null); };
   }, [zustand]);

   const bezahlt = zustand === "bezahlt";
   const text = zustand === "laeuft" ? t.laeuft
      : bezahlt ? t.bezahlt
      : zustand === "ohne_vorgang" ? t.ohneVorgang
      : zustand === "hier_nicht" ? t.hierNicht
      : t.gescheitert;

   return (
      <main style={{
         minHeight: "60vh", display: "grid", placeItems: "center",
         padding: "80px 16px", textAlign: "center",
      }}>
         <div style={{
            maxWidth: 560, width: "100%",
            ...(bezahlt ? {
               padding: "34px 28px 30px", borderRadius: 18,
               background: "linear-gradient(180deg,"
                  + " rgba(34,197,94,0.07), rgba(255,255,255,0.02) 55%)",
               border: "1px solid rgba(34,197,94,0.22)",
               boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
            } : {}),
         }}>
            {bezahlt && <ErfolgsHaken />}
            <h1 style={{
               fontSize: bezahlt ? 23 : 20, fontWeight: 700,
               color: TEXT_PRIMARY, margin: 0, letterSpacing: "-0.01em",
            }}>
               {bezahlt ? t.bezahltTitel : t.titel}
            </h1>
            <p style={{
               marginTop: 12, fontSize: 14, color: TEXT_SECONDARY,
               lineHeight: 1.65,
            }}>
               {text}
            </p>
            {zustand === "laeuft" && (
               <p style={{ marginTop: 8, fontSize: 12.5, color: TEXT_SECONDARY }}>
                  {t.laeuftHinweis}
               </p>
            )}
            {bezahlt && (
               <>
                  {/* Der eine Satz, der zählt: was der Käufer JETZT tut. Die
                      Lizenz liegt im Worker, sobald der Anbieter den Kauf
                      serverseitig meldet - die Seite erfährt davon nichts. */}
                  <p style={{
                     marginTop: 16, padding: "12px 14px", borderRadius: 12,
                     background: "linear-gradient(180deg,"
                        + " rgba(106,172,204,0.13), rgba(106,172,204,0.05))",
                     border: `1px solid ${CYAN}33`,
                     boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                     fontSize: 13.5, color: TEXT_PRIMARY, lineHeight: 1.6,
                     textAlign: "left",
                  }}>
                     {t.bezahltSchritte}
                  </p>
                  <p style={{
                     marginTop: 10, fontSize: 12.5, color: TEXT_SECONDARY,
                  }}>
                     {t.bezahltBeleg}
                  </p>
               </>
            )}
            {zustand !== "laeuft" && !bezahlt && (
               <p style={{ marginTop: 8, fontSize: 12.5 }}>
                  <a href={`mailto:${t.kontakt}`} style={{ color: "#6aacCC" }}>
                     {t.kontakt}
                  </a>
               </p>
            )}
         </div>
      </main>
   );
}
