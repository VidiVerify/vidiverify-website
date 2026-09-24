/**
 * Das Bezahlen als letzter Schritt IM Kauffenster - Paddle inline statt als
 * zweites Overlay darüber.
 *
 * **Warum inline** (entschieden 14.09.2026): Das Overlay lässt sich im
 * Paddle-Dashboard nur mit einer Markenfarbe versehen und legte sich als
 * fremdes Fenster über unser eigenes. Inline wird das Zahlungsformular ein
 * Rahmen in unserer Karte, und Schrift, Knöpfe, Felder, Rahmen und Rundungen
 * lassen sich unter Paddle > Checkout > Branded inline checkout einstellen.
 * Die Werte stehen in der Übergabeliste des Plans (8a), weil Sandkasten- und
 * Wirkkonto getrennte Dashboards haben.
 *
 * **Der Preis dafür:** Paddle zeichnet inline nur noch das Formular. Posten,
 * Zwischensumme, Steuer, Gesamt und Währung zeigt die Seite selbst - das ist
 * Paddles Bedingung. Die Werte kommen aus den Checkout-Ereignissen
 * (`@utils/paddleSumme`), der Rahmen samt Paddles Fusszeile bleibt vollständig
 * sichtbar.
 *
 * Plan: 05_DOKUMENTATION/PLANUNGEN/PRO Lizenzierungsmodul/
 *       2026-09-10_Paddle-Anbindung.md
 */
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { GREEN, TEXT_MUTED, TEXT_PRIMARY, TEXT_SECONDARY } from "@/constants/theme";
import { einbettung, paddleLaden, type PaddleAufbau } from "@utils/paddle";
import { bruttoAusVorschau, preisZeilen, type Summe } from "@utils/paddleSumme";
import type { TEXTE } from "./proKaufTexte";

/* Paddle sucht den Rahmen über den KLASSENNAMEN, nicht über eine Referenz.
 * Der Name ist deshalb eindeutig gewählt - ein zweites Element mit derselben
 * Klasse irgendwo auf der Seite bekäme sonst das Formular. */
const RAHMEN = "vv-paddle-rahmen";

interface Props {
   aufbau: PaddleAufbau;
   transactionId: string;
   sprache: "de" | "en";
   summe: Summe | null;
   /** Preiskennung, Ländercode und PLZ - für den Bruttopreis aus der Vorschau. */
   priceId: string;
   land: string;
   plz: string;
   /** Der Prozentsatz des eingelösten Codes - oder null bei einem Festpreis
    *  oder ohne Code. Er kommt aus der Codeprüfung des Workers, derselben
    *  Definition, aus der der Paddle-Discount angelegt wurde. */
   rabattProzent: number | null;
   t: (typeof TEXTE)["de"];
   onFehler: () => void;
}

const ProKaufZahlung = ({
   aufbau, transactionId, sprache, summe, priceId, land, plz, rabattProzent, t,
   onFehler,
}: Props) => {
   /* Der Bruttopreis vor Nachlass, von Paddle für Land und PLZ des Käufers.
    *
    * Die Checkout-Ereignisse kennen ihn nicht - sie melden netto. Gefragt wird
    * nur bei einem Nachlass: Ohne ihn ist der Zahlbetrag der Bruttopreis. Und
    * in der Währung der Transaktion, sonst verglichen wir Euro mit Franken.
    */
   const [bruttoCent, setBruttoCent] = useState<number | null>(null);
   const waehrung = summe?.waehrung || "";
   const mitRabatt = Boolean(summe?.rabatt);
   useEffect(() => {
      if (!mitRabatt || !waehrung) return;
      let aktiv = true;
      paddleLaden(aufbau)
         .then(() => window.Paddle?.PricePreview?.({
            items: [{ priceId, quantity: 1 }],
            address: { countryCode: land, postalCode: plz },
            currencyCode: waehrung,
         }))
         .then((antwort) => { if (aktiv) setBruttoCent(bruttoAusVorschau(antwort, priceId)); })
         // Ohne Vorschau steht der Nachlass als „berücksichtigt" da. Eine
         // geschätzte Zahl wäre die schlechtere Auskunft.
         .catch(() => { if (aktiv) setBruttoCent(null); });
      return () => { aktiv = false; };
   }, [aufbau, priceId, land, plz, waehrung, mitRabatt]);

   const zeilen = summe ? preisZeilen(summe, bruttoCent, sprache) : null;

   /* Öffnen, sobald der Rahmen im Dokument steht - vorher fände Paddle kein
    * Ziel. Schliessen beim Aushängen: Wer zurück zu den Angaben geht, soll
    * kein halb geladenes Formular im Hintergrund stehen lassen.
    */
   useEffect(() => {
      let aktiv = true;
      paddleLaden(aufbau).then(() => {
         if (!aktiv) return;
         window.Paddle?.Checkout.open({
            transactionId,
            settings: einbettung(RAHMEN, sprache),
         });
      }).catch(() => { if (aktiv) onFehler(); });
      return () => {
         aktiv = false;
         window.Paddle?.Checkout.close?.();
      };
   }, [aufbau, transactionId, sprache, onFehler]);

   return (
      <div>
         <p style={rubrik}>{t.bestellungTitel}</p>
         {/* Die Übersicht hat von Anfang an ihre Höhe. Solange Paddle die
             Beträge noch nicht gemeldet hat, stehen dort Platzhalter - sonst
             spränge das Formular darunter nach unten, sobald sie eintreffen. */}
         <div style={{
            padding: "12px 14px", borderRadius: 12,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(106,172,204,0.16)",
         }}>
            {/* Dieselbe Reihenfolge wie auf einer Rechnung mit Endpreisen:
                Preis brutto, Rabatt oder Nachlass, Zahlbetrag, darin
                enthaltene Umsatzsteuer (Anwenderwunsch 14.09.2026). */}
            {(summe?.posten || [{ name: t.bestellungLaedt, variante: "" }])
               .map((posten, i) => (
                  <div key={i} style={{ ...zeile, marginBottom: 10 }}>
                     <span style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY }}>
                           {posten.name}
                        </span>
                        {posten.variante && (
                           <span style={{ display: "block", fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>
                              {posten.variante}
                           </span>
                        )}
                     </span>
                     {/* Der Preis steht beim ersten Posten - es gibt je Kauf
                         genau einen. */}
                     <span style={{ fontSize: 13, color: TEXT_PRIMARY }}>
                        {i === 0 ? zeilen?.brutto : ""}
                     </span>
                  </div>
               ))}
            {summe?.rabatt && (
               <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8 }}>
                  {/* Grün und fett, mit dem Prozentsatz dahinter: Hier
                      sieht der Käufer, was er spart (Anwenderwunsch
                      14.09.2026). Der Satz steht nur bei einem Prozentcode -
                      aus einem Festpreis zurückgerechnet käme eine krumme
                      Zahl heraus, die niemand vergeben hat. */}
                  <div style={{ ...zeile, marginBottom: 4 }}>
                     <span style={{ fontSize: 12, color: TEXT_SECONDARY }}>
                        {t.nachlass}
                        {rabattProzent !== null && (
                           <span style={{ color: GREEN, fontWeight: 800, marginLeft: 6 }}>
                              {new Intl.NumberFormat(sprache === "de" ? "de-DE" : "en-IE", {
                                 style: "percent", maximumFractionDigits: 2,
                              }).format(rabattProzent / 100)}
                           </span>
                        )}
                     </span>
                     <span style={{ fontSize: 12.5, color: GREEN, fontWeight: 800 }}>
                        {zeilen?.nachlass ? `- ${zeilen.nachlass}` : t.nachlassEnthalten}
                     </span>
                  </div>
               </div>
            )}
            <div style={{
               ...zeile, borderTop: "1px solid rgba(255,255,255,0.06)",
               marginTop: 6, paddingTop: 8,
            }}>
               <span style={{ fontSize: 13, fontWeight: 800, color: TEXT_PRIMARY }}>
                  {t.gesamt}{summe ? ` (${summe.waehrung})` : ""}
               </span>
               <motion.span
                  key={summe?.gesamt || "leer"}
                  initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}
                  style={{ fontSize: 15, fontWeight: 800, color: TEXT_PRIMARY }}
               >
                  {summe?.gesamt || " "}
               </motion.span>
            </div>
            <div style={{ marginTop: 4 }}>
               <Betrag titel={t.steuer} wert={summe?.steuer} />
            </div>
         </div>
         <p style={{ ...hinweis, marginTop: 8 }}>{t.bestellungHinweis}</p>

         <p style={{ ...rubrik, marginTop: 22 }}>{t.zahlungTitel}</p>
         <div className={RAHMEN} style={{ minHeight: 450 }} />
      </div>
   );
};

function Betrag({ titel, wert, farbe }: { titel: string; wert?: string; farbe?: string }) {
   return (
      <div style={{ ...zeile, marginBottom: 4 }}>
         <span style={{ fontSize: 12, color: TEXT_SECONDARY }}>{titel}</span>
         <span style={{ fontSize: 12, color: farbe || TEXT_SECONDARY }}>{wert || " "}</span>
      </div>
   );
}

const zeile: React.CSSProperties = {
   display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12,
};

const rubrik: React.CSSProperties = {
   fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase",
   letterSpacing: "0.08em", fontWeight: 700, margin: "0 0 10px",
};

const hinweis: React.CSSProperties = {
   fontSize: 11.5, color: TEXT_MUTED, lineHeight: 1.55, margin: 0,
};

export default ProKaufZahlung;
