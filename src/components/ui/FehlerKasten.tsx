/**
 * Der rote Hinweiskasten unter den Formularen - an einer Stelle.
 *
 * Kauffenster und Bestellanfrage trugen ihn bis zum 15.09.2026 je einmal,
 * zeichengleich abgeschrieben. Zwei Fassungen laufen genau so lange gleich,
 * bis jemand eine davon anfasst.
 *
 * Das Zeichen links ist kein Schmuck: Der Text allein ging unter, weil er
 * unter einem Formular steht, das der Kunde gerade gelesen hat, und weil Rot
 * auf dunklem Grund weniger schreit als auf hellem (Anwenderbefund
 * 15.09.2026). Der Kreis trägt eine eigene Füllung und einen eigenen Rand,
 * damit er auch dann noch als Zeichen lesbar bleibt, wenn die Schrift klein
 * gestellt ist.
 */
import { forwardRef, type ReactNode } from "react";

/* Dieselbe Farbfamilie wie der Kasten: ein Rot, das auf dem dunklen Grund
 * warnt, ohne zu leuchten. Die Werte stehen hier und nicht in den Fenstern -
 * wer den Ton ändert, ändert beide. */
const ROT_GRUND = "rgba(239,68,68,0.08)";
const ROT_RAND = "rgba(239,68,68,0.25)";
const ROT_ZEICHEN_GRUND = "rgba(239,68,68,0.16)";
const ROT_ZEICHEN_RAND = "rgba(239,68,68,0.45)";
const ROT_TEXT = "#fca5a5";

interface Eigenschaften {
   /** Fette Kopfzeile, etwa „Das hat nicht geklappt". */
   titel: string;
   /** Der Hinweis selbst. */
   children: ReactNode;
   /** Als `role="alert"` ankündigen - im Kauffenster ja, wo der Kunde
    *  gerade geklickt hat; in einem Formular, das den Kasten beim Tippen
    *  zeigt, wäre es Lärm. */
   alsAlert?: boolean;
   /** Abstand nach oben, wenn der Kasten nicht schon in einem Raster sitzt. */
   abstandOben?: number;
}

export const FehlerKasten = forwardRef<HTMLDivElement, Eigenschaften>(
   function FehlerKasten({ titel, children, alsAlert = false, abstandOben = 0 }, ref) {
      return (
         <div
            ref={ref}
            role={alsAlert ? "alert" : undefined}
            tabIndex={alsAlert ? -1 : undefined}
            style={{
               outline: "none",
               display: "flex", alignItems: "flex-start", gap: 10,
               marginTop: abstandOben, padding: "11px 14px", borderRadius: 8,
               background: ROT_GRUND,
               border: `1px solid ${ROT_RAND}`,
               color: ROT_TEXT, fontSize: 12.5,
            }}
         >
            <span
               aria-hidden="true"
               style={{
                  flex: "0 0 auto",
                  width: 20, height: 20, marginTop: 1,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "50%",
                  background: ROT_ZEICHEN_GRUND,
                  border: `1px solid ${ROT_ZEICHEN_RAND}`,
                  fontSize: 13, fontWeight: 700, lineHeight: 1,
               }}
            >
               !
            </span>
            {/* `minWidth: 0` lässt lange Wörter umbrechen, statt den Kasten
                aufzuziehen - eine Emailadresse im Hinweistext reicht dafür. */}
            <span style={{ minWidth: 0 }}>
               <strong style={{ display: "block", marginBottom: 3 }}>{titel}</strong>
               {children}
            </span>
         </div>
      );
   },
);
