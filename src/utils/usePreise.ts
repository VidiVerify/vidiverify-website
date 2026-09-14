/**
 * Die Preise - vom Worker, nicht aus der Seite.
 *
 * Der Betrag stand zuletzt an drei Stellen: im Bestellfenster, in der
 * Preis-Sektion und im Worker, der die Anfrage entgegennimmt. Drei Stellen
 * laufen auseinander, und die dritte ist die, die am Ende auf der Rechnung
 * landet. Deshalb ist der Worker die Quelle und die Seite fragt ihn.
 *
 * **Der Rückfall zeigt immer den Listenpreis.** Wenn der Abruf scheitert,
 * steht der eingebaute Wert da - der ungerabattete. Ein Ausfall darf nie zu
 * einem zu niedrigen Preis führen; er darf höchstens einen Nachlass
 * verschweigen, den der Kunde dann erfragt.
 *
 * Gerechnet wird in Cent: 20 Prozent auf 29,90 sind in Fliesskomma nicht
 * sauber darstellbar, und ein halber Cent im Bestellvorgang ist ein Fehler,
 * den niemand erklären kann.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export const PREISE_RUECKFALL = { pro: 2990, lifetime: 9990 };

export interface RabattBefund {
   code: string;
   art: "prozent" | "festpreis";
   wert: number;
   gilt_fuer: string[];
   bemerkung: string | null;
}

export interface Preisstand {
   preise: { pro: number; lifetime: number };
   listenpreise: { pro: number; lifetime: number };
   rabatt: RabattBefund | null;
   /** Warum ein eingegebener Code nicht greift: unbekannt, abgelaufen,
    *  aufgebraucht - oder leer, wenn alles in Ordnung ist. */
   codeGrund: string;
   laeuft: boolean;
}

const LEER: Preisstand = {
   preise: PREISE_RUECKFALL,
   listenpreise: PREISE_RUECKFALL,
   rabatt: null,
   codeGrund: "",
   laeuft: false,
};

/** Cent als Preis, in der Schreibweise der jeweiligen Sprache. */
export function preisText(cent: number, sprache: "de" | "en"): string {
   return new Intl.NumberFormat(sprache === "de" ? "de-DE" : "en-IE", {
      style: "currency",
      currency: "EUR",
   }).format(cent / 100);
}

/**
 * Liefert den Preisstand, eine Funktion, mit der sich ein Rabattcode prüfen
 * lässt, und eine, die ihn wieder verwirft. Ohne Code wird einmal beim
 * Einhängen geladen.
 */
export function usePreise(aktiv = true, basis = "/api") {
   const [stand, setStand] = useState<Preisstand>(LEER);
   /* Nur die jüngste Abfrage darf den Stand setzen. Sonst käme eine Prüfung,
    * die noch unterwegs war, nach dem Entfernen des Codes zurück und setzte
    * den Nachlass wieder ein. */
   const abfrage = useRef(0);

   const holen = useCallback(async (code?: string) => {
      const nummer = ++abfrage.current;
      setStand((alt) => ({ ...alt, laeuft: true }));
      try {
         /* Die Basis kommt vom Aufrufer, damit die Kaufseite im Sandkasten
          * auch den Sandkasten fragt. Sonst prüfte sie einen Rabattcode gegen
          * den Wirk-Worker, wo er gar nicht existiert - und der Code sähe
          * ungültig aus, obwohl er richtig angelegt ist. */
         const adresse = basis + "/preise"
            + (code ? "?code=" + encodeURIComponent(code) : "");
         const antwort = await fetch(adresse);
         if (!antwort.ok) throw new Error(String(antwort.status));
         const daten = await antwort.json();
         if (nummer !== abfrage.current) return;
         setStand({
            preise: daten.preise || PREISE_RUECKFALL,
            listenpreise: daten.listenpreise || PREISE_RUECKFALL,
            rabatt: daten.rabatt || null,
            codeGrund: daten.code_grund || "",
            laeuft: false,
         });
      } catch {
         // Kein Netz, keine Route, kein Worker: Der Listenpreis steht, und der
         // Kunde kann bestellen. Ein Formular, das ohne Preisauskunft gar
         // nichts anzeigt, wäre der schlechtere Tausch.
         if (nummer !== abfrage.current) return;
         setStand({ ...LEER, codeGrund: code ? "netz" : "" });
      }
   }, [basis]);

   /* Einen eingelösten Code zurücknehmen (Anwenderbefund 14.09.2026).
    *
    * Vorher blieb ein einmal gültiger Nachlass stehen, auch wenn der Kunde
    * das Feld leerte oder einen anderen Code eintippte: Die Kacheln zeigten
    * den alten Rabattpreis, abgeschickt wurde aber der neue Feldinhalt.
    * Zurück geht es auf die Listenpreise, ohne Abfrage - die kennen wir
    * schon. */
   const verwerfen = useCallback(() => {
      ++abfrage.current;
      setStand((alt) => ({
         ...alt, preise: alt.listenpreise, rabatt: null, codeGrund: "", laeuft: false,
      }));
   }, []);

   useEffect(() => {
      if (aktiv) void holen();
   }, [aktiv, holen]);

   return { ...stand, pruefen: holen, verwerfen };
}
