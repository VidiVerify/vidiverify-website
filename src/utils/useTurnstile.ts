/**
 * Die Sicherheitsabfrage (Cloudflare Turnstile) für Kaufseite und
 * Bestellanfrage - an EINER Stelle.
 *
 * Beide Formulare trugen bis zum 15.09.2026 eine eigene Kopie, und beide
 * hatten dieselbe Lücke: Fehlte beim Klick das Token, kam „Bitte die
 * Sicherheitsabfrage darüber noch bestätigen" - über einem Widget, das mit
 * `interaction-only` im Regelfall gar nicht sichtbar ist. Der Kunde hatte
 * nichts zum Anklicken und kam nicht weiter (Anwenderbefund VM-Probe
 * 14.09.2026, nach einem Neuladen der Seite).
 *
 * Jetzt gilt:
 *
 * 1. **Ein fehlendes Token wird abgewartet, nicht gemeldet.** `tokenHolen()`
 *    liefert das vorhandene sofort, sonst wartet es auf das nächste und stösst
 *    die Prüfung einmal neu an, wenn sie hängt.
 * 2. **Gefragt wird nur, wenn Cloudflare wirklich fragt.** Dann ist das Widget
 *    sichtbar (`rueckfrage`), und nur dann ist der Hinweis „darüber bestätigen"
 *    wahr.
 * 3. **Das Widget wird beim Abbau entfernt**, nicht nur vergessen. Sonst legte
 *    ein Neuzeichnen (Schliessen und Öffnen, Sprachwechsel, Neuladen im
 *    Entwicklungsbetrieb) ein zweites Widget in denselben Rahmen, dessen Token
 *    nie ankam.
 */
import { useCallback, useEffect, useRef, useState } from "react";

declare global {
   interface Window {
      turnstile?: {
         render: (el: HTMLElement, o: Record<string, unknown>) => string;
         reset: (id?: string) => void;
         remove?: (id: string) => void;
      };
   }
}

/** Wie lange `tokenHolen` höchstens wartet. Cloudflare braucht im Regelfall
 *  unter zwei Sekunden; darüber hinaus hilft Warten dem Kunden nicht mehr. */
const WARTEZEIT_MS = 12000;

/** Nach dieser Zeit ohne Token wird die Prüfung einmal neu angestossen. */
const ANSTOSS_MS = 3000;

/* `abgebrochen`: Das Formular wurde geschlossen, während gewartet wurde. Der
 * Aufrufer tut dann NICHTS mehr - keine Meldung, kein Vorgang. Bis zum
 * 15.09.2026 lief ein Wartender nach dem Schliessen weiter; ein neues Widget
 * nach dem Wiederöffnen erfüllte ihn, und die Kaufseite legte ohne Klick eine
 * Transaktion an (Codex-Review). */
export type TokenErgebnis =
   | { token: string }
   | { token: ""; grund: "rueckfrage" | "stumm" | "abgebrochen" };

interface Wartender {
   weiter: (token: string) => void;
   abbrechen: () => void;
}

export function useTurnstile(aktiv: boolean, sitekey: string, sprache: string) {
   const rahmenRef = useRef<HTMLDivElement>(null);
   const widgetRef = useRef<string | null>(null);
   const tokenRef = useRef("");
   const rueckfrageRef = useRef(false);
   const wartende = useRef<Wartender[]>([]);
   const [rueckfrage, setRueckfrage] = useState(false);

   const tokenSetzen = useCallback((token: string) => {
      tokenRef.current = token;
      if (token) {
         const liste = wartende.current;
         wartende.current = [];
         liste.forEach((w) => w.weiter(token));
      }
   }, []);

   const rueckfrageSetzen = useCallback((an: boolean) => {
      rueckfrageRef.current = an;
      setRueckfrage(an);
      // Die Rückfrage steht meist unterhalb des sichtbaren Bereichs. Wer
      // gerade wartet, soll sie sehen, statt einen Knopf ohne Wirkung vor sich
      // zu haben.
      if (an && wartende.current.length) {
         window.setTimeout(() => rahmenRef.current?.scrollIntoView({
            behavior: "smooth", block: "center",
         }), 50);
      }
   }, []);

   useEffect(() => {
      if (!aktiv || !sitekey) return;
      let abgebaut = false;
      const zeichnen = () => {
         if (abgebaut || !window.turnstile || !rahmenRef.current || widgetRef.current) return;
         widgetRef.current = window.turnstile.render(rahmenRef.current, {
            sitekey,
            theme: "dark",
            size: "flexible",
            // Zeigt sich nur, wenn tatsächlich eine Rückfrage nötig ist.
            appearance: "interaction-only",
            language: sprache,
            callback: (token: string) => { rueckfrageSetzen(false); tokenSetzen(token); },
            /* Beide räumen auch den Rückfrage-Vermerk ab.
             *
             * Cloudflare meldet `error-callback` für Netz- und
             * Challengefehler - und zwar OHNE vorher
             * `after-interactive-callback` zu schicken. Ohne die Bereinigung
             * bliebe `rueckfrageRef` dauerhaft auf „offen", und seit
             * `tokenHolen` bei offener Rückfrage sofort antwortet, meldete
             * jeder weitere Klick eine Rückfrage, die es gar nicht gibt: Das
             * Fenster wäre zu, bis es jemand neu öffnet (Codex-Review
             * 16.09.2026, Ablauf ausgeführt). */
            "expired-callback": () => { rueckfrageSetzen(false); tokenSetzen(""); },
            "error-callback": () => { rueckfrageSetzen(false); tokenSetzen(""); },
            "before-interactive-callback": () => rueckfrageSetzen(true),
            "after-interactive-callback": () => rueckfrageSetzen(false),
         });
      };
      if (window.turnstile) {
         zeichnen();
      } else {
         const vorhanden = document.querySelector<HTMLScriptElement>(
            "script[data-turnstile]");
         if (vorhanden) {
            vorhanden.addEventListener("load", zeichnen, { once: true });
         } else {
            const skript = document.createElement("script");
            skript.src =
               "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
            skript.async = true;
            skript.dataset.turnstile = "1";
            skript.addEventListener("load", zeichnen, { once: true });
            document.head.appendChild(skript);
         }
      }
      return () => {
         abgebaut = true;
         const id = widgetRef.current;
         widgetRef.current = null;
         if (id) {
            try { window.turnstile?.remove?.(id); } catch { /* schon weg */ }
         }
         // Wer noch wartet, bekommt eine Absage - kein Wartender überlebt
         // das Formular, das ihn angelegt hat.
         const offen = wartende.current;
         wartende.current = [];
         offen.forEach((w) => w.abbrechen());
         tokenSetzen("");
         rueckfrageSetzen(false);
      };
   }, [aktiv, sitekey, sprache, tokenSetzen, rueckfrageSetzen]);

   /** Ein Token besorgen: das vorhandene, sonst das nächste. */
   const tokenHolen = useCallback((): Promise<TokenErgebnis> => {
      if (!sitekey) return Promise.resolve({ token: "", grund: "stumm" });
      if (tokenRef.current) return Promise.resolve({ token: tokenRef.current });
      /* Steht die Rückfrage schon offen, wird NICHT gewartet.
       *
       * Warten hilft nur gegen eine Prüfung, die von selbst fertig wird. Eine
       * sichtbare Rückfrage wird das nie: Ohne den Klick des Kunden kommt kein
       * Token, und nach zwölf Sekunden stünde dieselbe Meldung da wie sofort.
       * Für den Kunden sind das keine zwölf Sekunden Geduld, sondern eine
       * Schaltfläche, die hängt (Anwenderbefund 15.09.2026, VM-Probe: „das
       * dauert etwa 15 s"). */
      if (rueckfrageRef.current) {
         return Promise.resolve({ token: "", grund: "rueckfrage" });
      }
      return new Promise((fertig) => {
         let erledigt = false;
         const ende = (ergebnis: TokenErgebnis) => {
            if (erledigt) return;
            erledigt = true;
            window.clearTimeout(anstoss);
            window.clearTimeout(schluss);
            wartende.current = wartende.current.filter((w) => w !== eintrag);
            fertig(ergebnis);
         };
         const eintrag: Wartender = {
            weiter: (token: string) => ende({ token }),
            abbrechen: () => ende({ token: "", grund: "abgebrochen" }),
         };
         wartende.current.push(eintrag);
         // Hängt die Prüfung, einmal neu anstossen - aber nie mitten in eine
         // Rückfrage hinein, die der Kunde gerade beantwortet.
         const anstoss = window.setTimeout(() => {
            if (!rueckfrageRef.current && widgetRef.current) {
               try { window.turnstile?.reset(widgetRef.current); } catch { /* egal */ }
            }
         }, ANSTOSS_MS);
         const schluss = window.setTimeout(() => ende({
            token: "", grund: rueckfrageRef.current ? "rueckfrage" : "stumm",
         }), WARTEZEIT_MS);
      });
   }, [sitekey]);

   /** Nach dem Absenden: Ein Token gilt nur einmal, das nächste wird geholt. */
   const verbraucht = useCallback(() => {
      tokenSetzen("");
      if (widgetRef.current) {
         try { window.turnstile?.reset(widgetRef.current); } catch { /* egal */ }
      }
   }, [tokenSetzen]);

   return { rahmenRef, rueckfrage, tokenHolen, verbraucht };
}
