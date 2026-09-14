import { describe, expect, it } from "vitest";
import { bruttoAusVorschau, preisZeilen, summeAus } from "@utils/paddleSumme";

/* Intl setzt vor das Währungszeichen ein geschütztes Leerzeichen. Verglichen
 * wird der Text, den der Leser sieht - nicht die Art des Leerzeichens. */
const n = <T,>(wert: T): T => JSON.parse(JSON.stringify(wert).replace(/\u00a0/g, " "));

/**
 * Die Übersicht neben dem eingebetteten Bezahlfenster ist eine Bedingung von
 * Paddle. Geprüft wird, dass sie aus Paddles Beträgen gelesen wird, brutto
 * zeigt wie die Kaufseite - und bei unvollständigen Daten lieber nichts sagt
 * als eine falsche Zahl.
 *
 * Die Beträge sind die des Testkaufs vom 14.09.2026: LIFETIME 99,90 € mit
 * 50 Prozent Rabatt. Paddle meldete netto 83,95 - 41,97, Steuer 7,97, gesamt
 * 49,95.
 */
const geladen = {
   name: "checkout.loaded",
   data: {
      currency_code: "EUR",
      items: [{
         price_name: "LIFETIME · every major version",
         product: { name: "VidiVerify" },
      }],
      totals: { subtotal: 83.95, discount: 41.97, tax: 7.97, total: 49.95 },
   },
};

const ohneRabatt = {
   name: "checkout.loaded",
   data: {
      ...geladen.data,
      totals: { subtotal: 83.95, discount: 0, tax: 15.95, total: 99.9 },
   },
};

describe("Bestellübersicht aus Paddle-Ereignissen", () => {
   it("liest Zahlbetrag, enthaltene Steuer und Posten", () => {
      const summe = summeAus(geladen, "de");
      expect(summe?.posten).toEqual([
         { name: "VidiVerify", variante: "LIFETIME · every major version" },
      ]);
      expect(n(summe?.gesamt)).toBe("49,95 €");
      expect(summe?.gesamtCent).toBe(4995);
      expect(n(summe?.steuer)).toBe("7,97 €");
      expect(summe?.rabatt).toBe(true);
   });

   it("zeigt brutto: Preis, Nachlass als Differenz, auf den Cent", () => {
      const summe = summeAus(geladen, "de")!;
      // Aus netto und Steuersatz hergeleitet käme 99,89 heraus - deshalb
      // zählt nur der Bruttopreis aus Paddles Vorschau.
      expect(n(preisZeilen(summe, 9990, "de"))).toEqual(
         { brutto: "99,90 €", nachlass: "49,95 €" });
   });

   it("braucht ohne Nachlass keine Vorschau", () => {
      const summe = summeAus(ohneRabatt, "de")!;
      expect(summe.rabatt).toBe(false);
      expect(n(preisZeilen(summe, null, "de"))).toEqual({ brutto: "99,90 €", nachlass: "" });
   });

   it("schätzt keinen Nachlass, wenn der Bruttopreis fehlt oder nicht passt", () => {
      const summe = summeAus(geladen, "de")!;
      expect(n(preisZeilen(summe, null, "de"))).toEqual({ brutto: "", nachlass: "" });
      expect(n(preisZeilen(summe, 4000, "de"))).toEqual({ brutto: "", nachlass: "" });
   });

   it("folgt auch checkout.updated", () => {
      expect(n(summeAus({ ...geladen, name: "checkout.updated" }, "en")?.gesamt))
         .toBe("€49.95");
   });

   it("ignoriert Ereignisse ohne Summen, statt die Übersicht zu leeren", () => {
      expect(summeAus({ name: "checkout.completed", data: geladen.data }, "de")).toBeNull();
      expect(summeAus({ name: "checkout.payment.selected", data: {} }, "de")).toBeNull();
      expect(summeAus(null, "de")).toBeNull();
   });

   it("macht aus einem fehlenden Betrag keine Null", () => {
      const ohne = structuredClone(geladen) as { name: string; data: Record<string, unknown> };
      delete (ohne.data.totals as Record<string, unknown>).tax;
      expect(summeAus(ohne, "de")).toBeNull();
   });

   it("verlangt mindestens einen Posten", () => {
      const leer = { ...geladen, data: { ...geladen.data, items: [] } };
      expect(summeAus(leer, "de")).toBeNull();
   });
});

describe("Bruttopreis aus Paddles Preisvorschau", () => {
   const antwort = { data: { details: { lineItems: [
      { price: { id: "pri_pro" }, totals: { total: "2990" } },
      { price: { id: "pri_life" }, totals: { total: "9990" } },
   ] } } };

   it("liest den Betrag der gewählten Preiskennung in Cent", () => {
      expect(bruttoAusVorschau(antwort, "pri_life")).toBe(9990);
      expect(bruttoAusVorschau(antwort, "pri_pro")).toBe(2990);
   });

   it("nimmt nur ganze Cent-Zeichenketten an", () => {
      expect(bruttoAusVorschau(antwort, "pri_fremd")).toBeNull();
      const dezimal = { data: { details: { lineItems: [
         { price: { id: "pri_life" }, totals: { total: 99.9 } },
      ] } } };
      expect(bruttoAusVorschau(dezimal, "pri_life")).toBeNull();
      expect(bruttoAusVorschau(null, "pri_life")).toBeNull();
   });
});
