/**
 * Die Bestellübersicht neben dem eingebetteten Bezahlfenster.
 *
 * Seit der Kauf inline läuft (14.09.2026), zeichnet Paddle nur noch das
 * Zahlungsformular. Posten, Beträge, Steuer und Währung muss die Seite selbst
 * zeigen - das ist Paddles Bedingung für die Inline-Einbindung. Die Werte
 * stammen aus den Ereignissen `checkout.loaded` und `checkout.updated`.
 *
 * **Brutto, nicht netto** (Anwenderwunsch 14.09.2026): Paddle meldet in den
 * Ereignissen Zwischensumme und Nachlass OHNE Steuer. Eine Übersicht
 * „83,95 € - 41,97 € + 7,97 €" widerspricht dem Preis, den der Kunde eben in
 * der Lizenzkachel gesehen hat (99,90 €). Gezeigt wird deshalb wie auf der
 * Kaufseite: Preis brutto, Rabatt oder Nachlass, Zahlbetrag, darin enthaltene
 * Umsatzsteuer.
 *
 * **Gerechnet wird trotzdem keine Steuer.** Ein Bruttopreis aus Nettobetrag
 * und hergeleitetem Steuersatz landet durch Rundung einen Cent daneben
 * (nachgerechnet: 99,89 statt 99,90). Der Bruttopreis kommt deshalb aus
 * Paddles Preisvorschau für Land und PLZ des Käufers, der Nachlass ist die
 * Differenz zweier Paddle-Beträge in Cent. Fehlt die Vorschau, steht der
 * Nachlass als „berücksichtigt" da statt als geschätzte Zahl.
 *
 * Reine Funktionen, damit der Prüfstand sie ohne Paddle.js prüfen kann
 * (`src/__tests__/paddleSumme.test.ts`).
 *
 * Plan: 05_DOKUMENTATION/PLANUNGEN/PRO Lizenzierungsmodul/
 *       2026-09-10_Paddle-Anbindung.md
 */

export interface SummePosten {
   name: string;
   variante: string;
}

export interface Summe {
   posten: SummePosten[];
   /** Der Zahlbetrag in Cent - Grundlage für die Differenz zum Bruttopreis. */
   gesamtCent: number;
   gesamt: string;
   /** Die im Zahlbetrag enthaltene Umsatzsteuer. */
   steuer: string;
   waehrung: string;
   /** Gilt ein Nachlass? Den Betrag liefert erst `preisZeilen`. */
   rabatt: boolean;
}

interface Betraege { subtotal?: unknown; tax?: unknown; total?: unknown; discount?: unknown }

/* Nur echte Zahlen. Paddle liefert die Beträge in den Ereignissen als Zahl in
 * der Hauptwährung (49.95 heisst 49,95 €). Ein fehlender Wert wird nicht zu
 * 0 - eine Übersicht mit „Steuer 0,00 €", die in Wahrheit nichts weiss, wäre
 * falsch und sähe richtig aus. */
function zahl(wert: unknown): number | null {
   return typeof wert === "number" && Number.isFinite(wert) ? wert : null;
}

function format(cent: number, waehrung: string, sprache: "de" | "en"): string {
   return new Intl.NumberFormat(sprache === "de" ? "de-DE" : "en-IE", {
      style: "currency", currency: waehrung,
   }).format(cent / 100);
}

/**
 * Liest die Übersicht aus einem Paddle-Ereignis - oder `null`, wenn das
 * Ereignis keine vollständigen Beträge trägt.
 *
 * `null` heisst: Die bisherige Übersicht bleibt stehen. Ein Ereignis ohne
 * Summen (etwa `checkout.payment.selected`) darf sie nicht leeren.
 */
export function summeAus(
   ereignis: { name?: string; data?: Record<string, unknown> } | null | undefined,
   sprache: "de" | "en",
): Summe | null {
   const name = ereignis?.name;
   if (name !== "checkout.loaded" && name !== "checkout.updated") return null;
   const daten = ereignis?.data;
   if (!daten) return null;

   const waehrung = typeof daten.currency_code === "string" ? daten.currency_code : "";
   const summen = (daten.totals || {}) as Betraege;
   const steuer = zahl(summen.tax);
   const gesamt = zahl(summen.total);
   if (!/^[A-Z]{3}$/.test(waehrung) || steuer === null || gesamt === null) return null;

   const roh = Array.isArray(daten.items) ? daten.items : [];
   const posten: SummePosten[] = [];
   for (const eintrag of roh as Array<Record<string, unknown>>) {
      const produkt = (eintrag?.product || {}) as { name?: unknown };
      if (typeof produkt.name !== "string") continue;
      posten.push({
         name: produkt.name,
         variante: typeof eintrag.price_name === "string" ? eintrag.price_name : "",
      });
   }
   // Ohne Posten fehlt die Beschreibung dessen, was gekauft wird - auch sie
   // gehört zu Paddles Bedingung.
   if (!posten.length) return null;

   const gesamtCent = Math.round(gesamt * 100);
   const rabatt = zahl(summen.discount);
   return {
      posten,
      gesamtCent,
      gesamt: format(gesamtCent, waehrung, sprache),
      steuer: format(Math.round(steuer * 100), waehrung, sprache),
      waehrung,
      rabatt: rabatt !== null && rabatt > 0,
   };
}

/**
 * Bruttopreis und Nachlass für die Anzeige.
 *
 * Ohne Nachlass IST der Zahlbetrag der Bruttopreis - dafür braucht es keine
 * Vorschau. Mit Nachlass zählt allein der Bruttopreis aus Paddles
 * Preisvorschau (`bruttoCent`); fehlt er oder passt er nicht (kleiner als der
 * Zahlbetrag), bleiben beide Felder leer, und die Oberfläche sagt nur, dass
 * ein Nachlass berücksichtigt ist.
 */
export function preisZeilen(
   summe: Summe, bruttoCent: number | null, sprache: "de" | "en",
): { brutto: string; nachlass: string } {
   if (!summe.rabatt) {
      return { brutto: summe.gesamt, nachlass: "" };
   }
   if (bruttoCent === null || !Number.isInteger(bruttoCent)
      || bruttoCent <= summe.gesamtCent) {
      return { brutto: "", nachlass: "" };
   }
   return {
      brutto: format(bruttoCent, summe.waehrung, sprache),
      nachlass: format(bruttoCent - summe.gesamtCent, summe.waehrung, sprache),
   };
}

/**
 * Den Bruttopreis aus einer Antwort von `Paddle.PricePreview` lesen.
 *
 * Die Vorschau liefert Beträge wie die API: als Zeichenkette in der kleinsten
 * Einheit („9990"). Alles andere gilt als unbekannt.
 */
export function bruttoAusVorschau(antwort: unknown, priceId: string): number | null {
   const posten = (antwort as {
      data?: { details?: { lineItems?: Array<{
         price?: { id?: string }; totals?: { total?: unknown };
      }> } };
   })?.data?.details?.lineItems || [];
   const treffer = posten.find((p) => p?.price?.id === priceId);
   const roh = treffer?.totals?.total;
   return typeof roh === "string" && /^\d+$/.test(roh) ? Number(roh) : null;
}
