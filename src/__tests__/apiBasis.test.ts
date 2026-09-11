import { describe, expect, it } from "vitest";
import { apiBasis, SANDKASTEN_BASIS, WIRK_BASIS } from "@utils/apiBasis";

/**
 * Der Prüfgegenstand sind zwei Sätze, und beide haben einen Preis, wenn sie
 * nicht gelten:
 *
 * 1. **Auf der ausgelieferten Seite spricht nichts mit dem Sandkasten.** Sonst
 *    ginge eine echte Bestellung in eine Testablage, die niemand ansieht.
 * 2. **Beim Entwickeln spricht nichts mit dem Wirkbetrieb.** Genau das war der
 *    Fall: Testanfragen landeten zwischen den echten Bestellungen, und ein im
 *    Sandkasten angelegter Rabattcode galt als unbekannt.
 */
describe("API-Basis", () => {
   it("nimmt auf der Wirkdomain den Wirk-Worker", () => {
      for (const host of ["vidiverify.de", "www.vidiverify.de", "vidiverify.com"]) {
         expect(apiBasis(host)).toBe(WIRK_BASIS);
      }
   });

   it("nimmt beim Entwickeln den Sandkasten", () => {
      for (const host of ["localhost", "127.0.0.1", "dev.local"]) {
         expect(apiBasis(host)).toBe(SANDKASTEN_BASIS);
      }
   });

   it("hält beide Pfade auseinander", () => {
      expect(SANDKASTEN_BASIS).not.toBe(WIRK_BASIS);
   });
});
