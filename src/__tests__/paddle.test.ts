import { describe, expect, it } from "vitest";
import {
   PADDLE_TOKEN_SANDKASTEN, PREISE_SANDKASTEN,
   paddleAufbau, paddleUmgebung,
} from "@utils/paddle";

/**
 * Der Prüfgegenstand ist ein einziger Satz: **Auf der ausgelieferten Seite
 * darf nie der Sandkasten stehen.**
 *
 * Ein Sandkasten-Bezahlfenster auf `vidiverify.de` nimmt Bestellungen mit
 * Testkarten entgegen, meldet sie als abgeschlossen und lässt anschliessend
 * Lizenzen ausstellen, für die nie jemand gezahlt hat. Der Fehler fällt
 * niemandem auf, denn von aussen sieht der Vorgang vollständig aus.
 *
 * Der zweite Satz ist die Kehrseite: **Lieber gar kein Kaufknopf als der
 * falsche.** Solange der Wirkkatalog fehlt, liefert der Aufbau `null`.
 */
describe("Paddle-Aufbau", () => {
   it("bietet auf der Wirkdomain nichts an, solange der Wirktoken fehlt", () => {
      // Sobald PADDLE_TOKEN_LIVE gesetzt ist, muss dieser Fall auf den echten
      // Token prüfen - dann ist die Aussage nicht mehr „nichts", sondern
      // „nicht der Sandkasten".
      for (const host of ["vidiverify.de", "www.vidiverify.de", "vidiverify.com"]) {
         const aufbau = paddleAufbau(host);
         expect(aufbau === null || aufbau.umgebung === "production").toBe(true);
         expect(aufbau?.token).not.toBe(PADDLE_TOKEN_SANDKASTEN);
      }
   });

   it("nimmt beim Entwickeln den Sandkasten", () => {
      const aufbau = paddleAufbau("localhost");
      expect(aufbau?.token).toBe(PADDLE_TOKEN_SANDKASTEN);
      expect(aufbau?.umgebung).toBe("sandbox");
      expect(aufbau?.preise).toEqual(PREISE_SANDKASTEN);
   });

   it("liest die Umgebung aus dem Präfix des Tokens", () => {
      expect(paddleUmgebung("test_abc")).toBe("sandbox");
      expect(paddleUmgebung("live_abc")).toBe("production");
   });

   it("bietet ohne Preiskennungen keinen Kauf an", () => {
      // Ein Token ohne Katalog führte in ein Bezahlfenster ohne Ware.
      const aufbau = paddleAufbau("vidiverify.de");
      if (aufbau) {
         expect(aufbau.preise.pro).not.toBe("");
         expect(aufbau.preise.lifetime).not.toBe("");
      }
   });

   it("hält Sandkasten- und Wirkkennungen auseinander", () => {
      expect(PREISE_SANDKASTEN.pro).not.toBe(PREISE_SANDKASTEN.lifetime);
   });
});
